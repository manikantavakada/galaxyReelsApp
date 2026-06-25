import NetInfo from '@react-native-community/netinfo';


export const subscribeToNetworkChanges = callback => {
  const unsubscribe = NetInfo.addEventListener(state => {
    const isOnline =
      !!state.isConnected && state.isInternetReachable !== false;
    callback(isOnline);
  });
  return unsubscribe;
};

export const checkIsOnline = async () => {
  const state = await NetInfo.fetch();
  return !!state.isConnected && state.isInternetReachable !== false;
};

export default {
  subscribeToNetworkChanges,
  checkIsOnline,
};
