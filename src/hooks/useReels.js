import {useCallback, useEffect, useMemo, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {loadReels, setOfflineStatus} from '../redux/reelsSlice';
import {checkIsOnline} from '../services/NetworkService';
import {hasMissingVideoUrls} from '../utils/reelNormalizer';
import {logDebug} from '../utils/logger';
import {PAGE_LIMIT} from '../utils/constants';


export const useReels = () => {
  const dispatch = useDispatch();
  const {
    reels: rawReels,
    nextCursor,
    status,
    error,
    isOffline,
    hasLoadedOnce,
  } =
    useSelector(state => state.reels);
  const reels = useMemo(
    () => (Array.isArray(rawReels) ? rawReels : []),
    [rawReels],
  );

  const isFetchingMoreRef = useRef(false);

  const fetchInitial = useCallback(async () => {
    const online = await checkIsOnline();
    if (!online) {
      dispatch(setOfflineStatus(true));
      return;
    }
    dispatch(loadReels({cursor: '', isRefresh: false}));
  }, [dispatch]);

  const refresh = useCallback(async () => {
    const online = await checkIsOnline();
    if (!online) {
      dispatch(setOfflineStatus(true));
      return;
    }
    dispatch(loadReels({cursor: '', isRefresh: true}));
  }, [dispatch]);

  const fetchMore = useCallback(async () => {
    if (isFetchingMoreRef.current) return;
    if (!nextCursor) return;
    if (status === 'loadingMore' || status === 'loading') return;

    const online = await checkIsOnline();
    if (!online) return; // silently skip pagination while offline

    isFetchingMoreRef.current = true;
    try {
      await dispatch(loadReels({cursor: nextCursor, isRefresh: false}));
    } finally {
      isFetchingMoreRef.current = false;
    }
  }, [dispatch, nextCursor, status]);

  useEffect(() => {
    if (
      !hasLoadedOnce ||
      (!reels.length && status === 'idle') ||
      (status === 'idle' && reels.length > 0 && reels.length < PAGE_LIMIT)
    ) {
      logDebug('useReels', 'initial feed missing; fetching reels', {
        hasLoadedOnce,
        reelCount: reels.length,
        status,
      });
      fetchInitial();
      return;
    }

    if (reels.length && hasMissingVideoUrls(reels)) {
      logDebug('useReels', 'cached reels missing video URLs; refreshing feed', {
        reelCount: reels.length,
        firstReelId: reels[0]?.id,
      });
      fetchInitial();
    }
  }, [fetchInitial, hasLoadedOnce, reels, status]);

  return {
    reels,
    nextCursor,
    status,
    error,
    isOffline,
    hasLoadedOnce,
    isLoading:
      status === 'loading' ||
      (!hasLoadedOnce && !reels.length && status === 'idle' && !isOffline),
    isRefreshing: status === 'refreshing',
    isLoadingMore: status === 'loadingMore',
    refresh,
    fetchMore,
    retry: fetchInitial,
  };
};

export default useReels;
