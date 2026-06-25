import {toggleLike} from '../api/likeApi';
import {checkIsOnline} from './NetworkService';
import {
  removeAction,
  incrementRetry,
  dropAction,
  setSyncing,
  setLastSyncTime,
} from '../redux/syncSlice';
import {setLikeState} from '../redux/reelsSlice';
import {SYNC_RETRY_LIMIT} from '../utils/constants';
import {logDebug} from '../utils/logger';

let isSyncRunning = false;


export const runOfflineSync = async ({getState, dispatch}) => {
  if (isSyncRunning) return;

  const online = await checkIsOnline();
  if (!online) return;

  const {pendingActions} = getState().sync;
  if (!pendingActions.length) {
    return;
  }

  isSyncRunning = true;
  dispatch(setSyncing(true));
  logDebug('OfflineSync', 'sync started', {
    pendingCount: pendingActions.length,
  });

  try {
    
    const sorted = [...pendingActions].sort(
      (a, b) => a.timestamp - b.timestamp,
    );

    for (const action of sorted) {
      try {
        const result = await toggleLike(action.postId);
        logDebug('OfflineSync', 'like action synced', {
          postId: action.postId,
          action: action.action,
        });

        dispatch(
          setLikeState({
            postId: action.postId,
            isLiked:
              typeof result?.isLiked === 'boolean'
                ? result.isLiked
                : action.action === 'like',
            likeCount: result?.likeCount,
          }),
        );

        dispatch(removeAction({id: action.id}));
      } catch (err) {
        const nextRetryCount = (action.retryCount || 0) + 1;
        if (nextRetryCount >= SYNC_RETRY_LIMIT) {
          console.warn(
            `[OfflineSync] Dropping action ${action.id} after ${nextRetryCount} failed attempts`,
            err,
          );
          dispatch(dropAction({id: action.id}));
        } else {
          dispatch(incrementRetry({id: action.id}));
        }
        
        if (err?.isNetworkError) {
          break;
        }
      }
    }

    dispatch(setLastSyncTime(Date.now()));
  } finally {
    isSyncRunning = false;
    dispatch(setSyncing(false));
  }
};

export default runOfflineSync;
