import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {TapGestureHandler} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';
import VideoPlayer from './VideoPlayer';
import ActionButtons from './ActionButtons';
import {HeartIcon, PauseIcon, PlayIcon} from './Icons';
import {COLORS} from '../utils/constants';
import {pickPlayableVideoUrl} from '../utils/reelNormalizer';

const {width, height} = Dimensions.get('window');


const ReelItem = React.memo(
  ({
    reel,
    isActive,
    isVisible,
    onLikeToggle,
    onSharePress,
    onMorePress,
    isOffline,
  }) => {
    const heartScale = useSharedValue(0);
    const heartOpacity = useSharedValue(0);
    const playbackIconScale = useSharedValue(0);
    const playbackIconOpacity = useSharedValue(0);
    const [isManuallyPaused, setIsManuallyPaused] = useState(false);
    const doubleTapRef = useRef();

    useEffect(() => {
      if (isActive) {
        setIsManuallyPaused(false);
      }
    }, [isActive, reel.id]);

    const triggerHeartBurst = useCallback(() => {
      heartScale.value = 0;
      heartOpacity.value = 1;
      heartScale.value = withSequence(
        withSpring(1.2, {damping: 8}),
        withSpring(1, {damping: 10}),
      );
      heartOpacity.value = withTiming(0, {duration: 600});
    }, [heartScale, heartOpacity]);

    const handleDoubleTap = useCallback(() => {
      if (!reel.isLiked) {
        onLikeToggle(reel.id);
      }
      triggerHeartBurst();
    }, [reel.id, reel.isLiked, onLikeToggle, triggerHeartBurst]);

    const handleSingleTap = useCallback(() => {
      setIsManuallyPaused(prev => {
        const nextPaused = !prev;
        playbackIconScale.value = 0.85;
        playbackIconOpacity.value = 1;
        playbackIconScale.value = withSpring(1, {damping: 10});
        playbackIconOpacity.value = withTiming(0, {duration: 800});
        return nextPaused;
      });
    }, [playbackIconOpacity, playbackIconScale]);

    const heartStyle = useAnimatedStyle(() => ({
      opacity: heartOpacity.value,
      transform: [{scale: heartScale.value}],
    }));

    const playbackIconStyle = useAnimatedStyle(() => ({
      opacity: playbackIconOpacity.value,
      transform: [{scale: playbackIconScale.value}],
    }));

    const shouldPlay = isActive && !isManuallyPaused;
    const videoUri = pickPlayableVideoUrl(reel, isOffline);

    return (
      <View style={styles.container}>
        <TapGestureHandler
          ref={doubleTapRef}
          numberOfTaps={2}
          onActivated={handleDoubleTap}>
          <TapGestureHandler
            numberOfTaps={1}
            waitFor={doubleTapRef}
            onActivated={handleSingleTap}>
            <View style={styles.tapArea}>
              <VideoPlayer
                uri={videoUri}
                isActive={shouldPlay}
                isVisible={isVisible}
              />

              <Animated.View style={[styles.heartBurst, heartStyle]}>
                <HeartIcon filled />
              </Animated.View>

              <Animated.View style={[styles.playbackOverlay, playbackIconStyle]}>
                {isManuallyPaused ? <PauseIcon /> : <PlayIcon />}
              </Animated.View>
            </View>
          </TapGestureHandler>
        </TapGestureHandler>

        <View style={styles.bottomInfo} pointerEvents="box-none">
          <View style={styles.profileRow}>
            {reel.profileImageUrl ? (
              <FastImage
                source={{uri: reel.profileImageUrl}}
                style={styles.avatar}
                defaultSource={undefined}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarFallbackText}>
                  {(reel.username || 'U').slice(0, 1).toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={styles.username}>{reel.username}</Text>
          </View>

          {!!reel.caption && (
            <Text style={styles.caption} numberOfLines={2}>
              {reel.caption}
            </Text>
          )}

          {!!reel.hashtags?.length && (
            <Text style={styles.hashtags} numberOfLines={1}>
              {reel.hashtags.map(tag => `#${tag}`).join(' ')}
            </Text>
          )}

          {!!reel.musicTitle && (
            <View style={styles.musicRow}>
              <Text style={styles.musicIcon}>Music</Text>
              <Text style={styles.musicTitle} numberOfLines={1}>
                {reel.musicTitle}
              </Text>
            </View>
          )}
        </View>

        <ActionButtons
          isLiked={reel.isLiked}
          likeCount={reel.likeCount}
          onLikePress={() => onLikeToggle(reel.id)}
          onSharePress={() => onSharePress(reel)}
          onMorePress={() => onMorePress(reel)}
        />
      </View>
    );
  },
  (prev, next) =>
    prev.reel.id === next.reel.id &&
    prev.reel.isLiked === next.reel.isLiked &&
    prev.reel.likeCount === next.reel.likeCount &&
    prev.isActive === next.isActive &&
    prev.isVisible === next.isVisible &&
    prev.isOffline === next.isOffline &&
    prev.reel.videoUrl === next.reel.videoUrl &&
    prev.reel.localVideoUrl === next.reel.localVideoUrl,
);

const styles = StyleSheet.create({
  container: {
    width,
    height,
    backgroundColor: COLORS.background,
  },
  tapArea: {
    width,
    height,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartBurst: {
    position: 'absolute',
    transform: [{scale: 2.2}],
  },
  playbackOverlay: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 36,
    left: 16,
    right: 88,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.text,
    backgroundColor: COLORS.surface,
    marginRight: 10,
  },
  avatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.text,
    backgroundColor: COLORS.surface,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },
  username: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
  },
  caption: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 19,
    marginBottom: 6,
  },
  hashtags: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  musicRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  musicIcon: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    marginRight: 6,
  },
  musicTitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    flexShrink: 1,
  },
});

export default ReelItem;
