import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  RefreshControl,
  Platform,
  Share,
  Alert,
} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import {useDispatch, useStore} from 'react-redux';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import ReelItem from '../components/ReelItem';
import Loader from '../components/Loader';
import ErrorView from '../components/ErrorView';
import useReels from '../hooks/useReels';
import {
  toggleLikeOptimistic,
  revertLike,
  markReelWatched,
} from '../redux/reelsSlice';
import {enqueueAction} from '../redux/syncSlice';
import {runOfflineSync} from '../services/OfflineSyncService';
import {checkIsOnline} from '../services/NetworkService';
import {toggleLike as toggleLikeApi} from '../api/likeApi';
import {generateLocalId} from '../utils/helpers';
import {COLORS, SCREEN_HEIGHT} from '../utils/constants';
import {logDebug} from '../utils/logger';

const VIEWABILITY_CONFIG = {
  itemVisiblePercentThreshold: 80,
};

const ReelsScreen = () => {
  const dispatch = useDispatch();
  const store = useStore();
  const {
    reels,
    nextCursor,
    isOffline,
    isLoading,
    isRefreshing,
    isLoadingMore,
    status,
    error,
    hasLoadedOnce,
    refresh,
    fetchMore,
    retry,
  } = useReels();

  const [activeIndex, setActiveIndex] = useState(0);
  const listExtraData = useMemo(
    () => ({activeIndex, isOffline}),
    [activeIndex, isOffline],
  );

  useEffect(() => {
    const activeReel = reels[activeIndex];
    if (!activeReel?.id) {
      return;
    }
    dispatch(markReelWatched({postId: activeReel.id}));
    logDebug('ReelsScreen', 'marked reel watched', {
      id: activeReel.id,
      activeIndex,
    });
  }, [activeIndex, dispatch, reels]);

  useEffect(() => {
    logDebug('ReelsScreen', 'state changed', {
      reelCount: reels.length,
      nextCursor,
      status,
      isOffline,
      hasLoadedOnce,
      error,
      firstReel: reels.length
        ? {
            id: reels[0].id,
            username: reels[0].username,
            videoUrl: reels[0].videoUrl,
            localVideoUrl: reels[0].localVideoUrl,
            hasVideoUrl: Boolean(reels[0].videoUrl),
            hasLocalVideoUrl: Boolean(reels[0].localVideoUrl),
          }
        : null,
      lastReel: reels.length
        ? {
            id: reels[reels.length - 1].id,
            username: reels[reels.length - 1].username,
          }
        : null,
    });
  }, [error, hasLoadedOnce, isOffline, nextCursor, reels, status]);

  const onViewableItemsChanged = useRef(({viewableItems}) => {
    if (viewableItems?.length) {
      setActiveIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const handleMomentumScrollEnd = useCallback(
    event => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const maxIndex = Math.max(0, reels.length - 1);
      const nextIndex = Math.min(
        maxIndex,
        Math.max(0, Math.round(offsetY / SCREEN_HEIGHT)),
      );
      setActiveIndex(nextIndex);
      logDebug('ReelsScreen', 'scroll settled', {offsetY, nextIndex});
    },
    [reels.length],
  );

  
  const handleLikeToggle = useCallback(
    async postId => {
      const reel = reels.find(r => r.id === postId);
      if (!reel) return;

      const previousIsLiked = reel.isLiked;
      const previousLikeCount = reel.likeCount;

      dispatch(toggleLikeOptimistic({postId}));

      const online = await checkIsOnline();

      if (!online) {
        dispatch(
          enqueueAction({
            id: generateLocalId(),
            postId,
            action: previousIsLiked ? 'unlike' : 'like',
            timestamp: Date.now(),
          }),
        );
        return;
      }

      try {
        await toggleLikeApi(postId);
      } catch (err) {
        
        if (err?.isNetworkError) {
          dispatch(
            enqueueAction({
              id: generateLocalId(),
              postId,
              action: previousIsLiked ? 'unlike' : 'like',
              timestamp: Date.now(),
            }),
          );
          return;
        }
        dispatch(revertLike({postId, previousIsLiked, previousLikeCount}));
      }
    },
    [dispatch, reels],
  );

  const handleSharePress = useCallback(async reel => {
    try {
      await Share.share({
        message: reel.caption
          ? `${reel.caption}\n${reel.videoUrl}`
          : reel.videoUrl,
        url: reel.videoUrl,
        title: reel.username ? `${reel.username}'s reel` : 'Reel',
      });
    } catch (err) {
      logDebug('ReelsScreen', 'share failed', {message: err?.message});
    }
  }, []);

  const handleMorePress = useCallback(reel => {
    Alert.alert('Reel options', reel.username || 'Reel', [
      {text: 'Cancel', style: 'cancel'},
    ]);
  }, []);

  const handleRefresh = useCallback(async () => {
    await refresh();
    runOfflineSync(store);
  }, [refresh, store]);

  const handleEndReached = useCallback(() => {
    logDebug('ReelsScreen', 'end reached', {
      reelCount: reels.length,
      nextCursor,
      status,
    });
    fetchMore();
  }, [fetchMore, nextCursor, reels.length, status]);

  const renderItem = useCallback(
    ({item, index}) => (
      <ReelItem
        reel={item}
        isActive={index === activeIndex}
        isVisible={Math.abs(index - activeIndex) <= 1}
        onLikeToggle={handleLikeToggle}
        onSharePress={handleSharePress}
        onMorePress={handleMorePress}
        isOffline={isOffline}
      />
    ),
    [activeIndex, handleLikeToggle, handleSharePress, handleMorePress, isOffline],
  );

  const keyExtractor = useCallback(item => item.id, []);

  

  if (isLoading) {
    logDebug('ReelsScreen', 'render loading');
    return <Loader />;
  }

  if (error && !hasLoadedOnce) {
    logDebug('ReelsScreen', 'render error', {error});
    return <ErrorView variant="error" message={error} onRetry={retry} />;
  }

  if (!reels.length) {
    logDebug('ReelsScreen', 'render empty', {
      status,
      hasLoadedOnce,
      isOffline,
    });
    return <ErrorView variant="empty" onRetry={retry} />;
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <View style={styles.container}>
        <FlashList
          data={reels}
          extraData={listExtraData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          estimatedItemSize={SCREEN_HEIGHT}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={VIEWABILITY_CONFIG}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          onScrollEndDrag={handleMomentumScrollEnd}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.6}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.text}
            />
          }
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.footerLoader}>
                <Text style={styles.footerText}>Loading more reels...</Text>
              </View>
            ) : null
          }
        />

        {isOffline && (
          <View style={styles.offlineBanner} pointerEvents="none">
            <Text style={styles.offlineText}>
              You're offline - showing saved reels
            </Text>
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  footerLoader: {
    height: SCREEN_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  offlineBanner: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 24,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: 'center',
  },
  offlineText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ReelsScreen;
