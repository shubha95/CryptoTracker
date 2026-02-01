/**
 * Main App Component
 */

import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, AppState, AppStateStatus } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TickerScreen } from '../presentation/screens/TickerScreen';
import { useTickerStore } from '../store/useTickerStore';

function App() {
  const { connect, disconnect, isConnected } = useTickerStore();

  /**
   * Handle app lifecycle changes
   */

  useEffect(() => { 
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {

          // App came to foreground - reconnect if needed
          if (!isConnected) {
            connect();
          }
        } else if (nextAppState === 'background' || nextAppState === 'inactive') {

          // App went to background - disconnect to save battery
          if (isConnected) {
            disconnect();
          }
        }
      }
    );

    // Cleanup on unmount
    return () => {
      subscription.remove();
    };
  }, [connect, disconnect, isConnected]);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#8d94a4" />
      <TickerScreen />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
