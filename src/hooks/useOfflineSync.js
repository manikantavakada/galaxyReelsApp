import {useEffect, useRef} from 'react';
import {useDispatch, useStore} from 'react-redux';
import {subscribeToNetworkChanges} from '../services/NetworkService';
import {loadReels, setOfflineStatus} from '../redux/reelsSlice';
import {runOfflineSync} from '../services/OfflineSyncService';
import {SYNC_INTERVAL_MS} from '../utils/constants';


export const useOfflineSync = () => {
  const dispatch = useDispatch();
  const store = useStore();
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    const unsubscribe = subscribeToNetworkChanges(isOnline => {
      dispatch(setOfflineStatus(!isOnline));

      if (isOnline && wasOfflineRef.current) {
        runOfflineSync(store).finally(() => {
          dispatch(loadReels({cursor: '', isRefresh: true}));
        });
      }
      wasOfflineRef.current = !isOnline;
    });

    
    runOfflineSync(store);

    const interval = setInterval(() => {
      runOfflineSync(store);
    }, SYNC_INTERVAL_MS);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
    
  }, []);
};

export default useOfflineSync;
