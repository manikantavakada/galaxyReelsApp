import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {fetchReels as fetchReelsApi} from '../api/reelsApi';
import {mergeUniqueById} from '../utils/helpers';
import {logDebug, logError} from '../utils/logger';
import {normalizeReels} from '../utils/reelNormalizer';

export const loadReels = createAsyncThunk(
  'reels/loadReels',
  async ({cursor = '', isRefresh = false} = {}, {rejectWithValue}) => {
    logDebug('ReelsThunk', 'loadReels start', {cursor, isRefresh});
    try {
      const data = await fetchReelsApi(cursor);
      logDebug('ReelsThunk', 'loadReels success', {
        receivedCount: Array.isArray(data?.reels) ? data.reels.length : null,
        nextCursor: data?.nextCursor,
        isRefresh,
      });
      return {...data, isRefresh};
    } catch (error) {
      logError('ReelsThunk', 'loadReels failed', error);
      return rejectWithValue(error?.message || 'Failed to load reels');
    }
  },
);

const initialState = {
  reels: [],
  nextCursor: null,
  watchedReels: {},
  status: 'idle', // idle | loading | refreshing | loadingMore | succeeded | failed
  error: null,
  isOffline: false,
  hasLoadedOnce: false,
};

const preserveLocalVideoUrls = (existingReels = [], incomingReels = []) => {
  const safeExistingReels = Array.isArray(existingReels) ? existingReels : [];
  const safeIncomingReels = normalizeReels(incomingReels);
  const localUrlById = new Map(
    safeExistingReels
      .filter(reel => reel.id && reel.localVideoUrl)
      .map(reel => [reel.id, reel.localVideoUrl]),
  );

  return safeIncomingReels.map(reel => ({
    ...reel,
    localVideoUrl: reel.localVideoUrl || localUrlById.get(reel.id) || '',
  }));
};

const reelsSlice = createSlice({
  name: 'reels',
  initialState,
  reducers: {
    setOfflineStatus(state, action) {
      state.isOffline = action.payload;
    },
    hydrateFromCache(state, action) {
      const {reels = [], nextCursor = null} = action.payload || {};
      const normalizedReels = normalizeReels(reels);
      if (normalizedReels.length) {
        state.reels = normalizedReels;
        state.nextCursor = nextCursor;
        state.hasLoadedOnce = true;
      }
    },
    toggleLikeOptimistic(state, action) {
      const {postId} = action.payload;
      const reel = state.reels.find(r => r.id === postId);
      if (!reel) return;
      reel.isLiked = !reel.isLiked;
      reel.likeCount = reel.isLiked
        ? reel.likeCount + 1
        : Math.max(0, reel.likeCount - 1);
    },
    setLikeState(state, action) {
      const {postId, isLiked, likeCount} = action.payload;
      const reel = state.reels.find(r => r.id === postId);
      if (!reel) return;
      reel.isLiked = isLiked;
      if (typeof likeCount === 'number') {
        reel.likeCount = likeCount;
      }
    },
    revertLike(state, action) {
      const {postId, previousIsLiked, previousLikeCount} = action.payload;
      const reel = state.reels.find(r => r.id === postId);
      if (!reel) return;
      reel.isLiked = previousIsLiked;
      reel.likeCount = previousLikeCount;
    },
    markReelWatched(state, action) {
      const {postId, watchedAt = Date.now()} = action.payload;
      state.watchedReels[postId] = watchedAt;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadReels.pending, (state, action) => {
        const {cursor, isRefresh} = action.meta.arg || {};
        logDebug('ReelsSlice', 'pending', {cursor, isRefresh});
        if (isRefresh) {
          state.status = 'refreshing';
        } else if (cursor) {
          state.status = 'loadingMore';
        } else {
          state.status = 'loading';
        }
        state.error = null;
      })
      .addCase(loadReels.fulfilled, (state, action) => {
        const {reels, nextCursor, isRefresh} = action.payload || {};
        const existingReels = Array.isArray(state.reels) ? state.reels : [];
        const reelsWithLocalUrls = preserveLocalVideoUrls(existingReels, reels);
        logDebug('ReelsSlice', 'fulfilled before store update', {
          incomingCount: Array.isArray(reels) ? reels.length : null,
          existingCount: existingReels.length,
          isRefresh,
          nextCursor,
          firstIncoming: Array.isArray(reels) && reels.length ? reels[0] : null,
        });
        if (isRefresh || !existingReels.length) {
          state.reels = reelsWithLocalUrls;
        } else {
          state.reels = mergeUniqueById(existingReels, reelsWithLocalUrls);
        }
        state.nextCursor = nextCursor;
        state.status = 'succeeded';
        state.hasLoadedOnce = true;
        state.isOffline = false;
        logDebug('ReelsSlice', 'fulfilled after store update', {
          storedCount: state.reels.length,
          nextCursor: state.nextCursor,
          status: state.status,
        });
      })
      .addCase(loadReels.rejected, (state, action) => {
        logDebug('ReelsSlice', 'rejected', {
          error: action.payload,
          existingCount: state.reels.length,
        });
        state.status = 'failed';
        state.error = action.payload || 'Something went wrong';
        // If we already have cached reels, treat this as "offline mode"
        // rather than a hard error screen.
        if (state.reels.length) {
          state.isOffline = true;
        }
      });
  },
});

export const {
  setOfflineStatus,
  hydrateFromCache,
  toggleLikeOptimistic,
  setLikeState,
  revertLike,
  markReelWatched,
} = reelsSlice.actions;

export default reelsSlice.reducer;
