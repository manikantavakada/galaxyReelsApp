import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  pendingActions: [], // { id, postId, action: 'like'|'unlike', timestamp, retryCount }
  isSyncing: false,
  lastSyncTime: null,
};

const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    enqueueAction(state, action) {
      const {postId, action: actionType, timestamp, id} = action.payload;
      state.pendingActions = state.pendingActions.filter(
        a => a.postId !== postId,
      );
      state.pendingActions.push({
        id,
        postId,
        action: actionType,
        timestamp,
        retryCount: 0,
      });
    },
    removeAction(state, action) {
      const {id} = action.payload;
      state.pendingActions = state.pendingActions.filter(a => a.id !== id);
    },
    incrementRetry(state, action) {
      const {id} = action.payload;
      const item = state.pendingActions.find(a => a.id === id);
      if (item) item.retryCount += 1;
    },
    dropAction(state, action) {
      const {id} = action.payload;
      state.pendingActions = state.pendingActions.filter(a => a.id !== id);
    },
    setSyncing(state, action) {
      state.isSyncing = action.payload;
    },
    setLastSyncTime(state, action) {
      state.lastSyncTime = action.payload;
    },
    hydratePendingActions(state, action) {
      state.pendingActions = action.payload || [];
    },
  },
});

export const {
  enqueueAction,
  removeAction,
  incrementRetry,
  dropAction,
  setSyncing,
  setLastSyncTime,
  hydratePendingActions,
} = syncSlice.actions;

export default syncSlice.reducer;
