import React from 'react';
import {StatusBar, View, ActivityIndicator, StyleSheet} from 'react-native';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {store, persistor} from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';
import useOfflineSync from './src/hooks/useOfflineSync';
import {COLORS} from './src/utils/constants';

/**
 * Mounts global hooks that need access to the Redux context (must live
 * inside <Provider>, hence this small wrapper rather than putting the
 * hook call directly in App).
 */
const AppContent = () => {
  useOfflineSync();
  return <AppNavigator />;
};

const PersistLoading = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={COLORS.text} />
  </View>
);

const App = () => {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <Provider store={store}>
        <PersistGate loading={<PersistLoading />} persistor={persistor}>
          <AppContent />
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
