import {configureStore, combineReducers} from '@reduxjs/toolkit';
import {createTransform, persistStore, persistReducer} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import reelsReducer from './reelsSlice';
import syncReducer from './syncSlice';
import {normalizeReels} from '../utils/reelNormalizer';
import {PAGE_LIMIT} from '../utils/constants';

const pruneWatchedReels = (watchedReels = {}, cachedReels = []) => {
  const cachedIds = new Set(cachedReels.map(reel => reel.id));
  return Object.fromEntries(
    Object.entries(watchedReels).filter(([postId]) => cachedIds.has(postId)),
  );
};

const reelsTransform = createTransform(
  inboundState => {
    const cachedReels = normalizeReels(inboundState?.reels).slice(
      0,
      PAGE_LIMIT,
    );

    return {
      ...inboundState,
      reels: cachedReels,
      watchedReels: pruneWatchedReels(inboundState?.watchedReels, cachedReels),
    };
  },
  outboundState => ({
    ...outboundState,
    reels: normalizeReels(outboundState?.reels),
  }),
  {whitelist: ['reels']},
);

const reelsPersistConfig = {
  key: 'reels',
  storage: AsyncStorage,
  whitelist: ['reels', 'nextCursor', 'hasLoadedOnce', 'watchedReels'],
  transforms: [reelsTransform],
};

const syncPersistConfig = {
  key: 'sync',
  storage: AsyncStorage,
  whitelist: ['pendingActions', 'lastSyncTime'],
};

const rootReducer = combineReducers({
  reels: persistReducer(reelsPersistConfig, reelsReducer),
  sync: persistReducer(syncPersistConfig, syncReducer),
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/REGISTER',
        ],
      },
    }),
});

export const persistor = persistStore(store);

export default store;
