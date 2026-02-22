/**
 * Main App Component
 */

import React, { useEffect, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  AppState,
  AppStateStatus,
  View,
  Button,
  Platform,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { TickerScreen } from '../presentation/screens/TickerScreen';
import { DeviceDetailsView } from '../presentation/components/DeviceDetailsView';
import { useTickerStore } from '../store/useTickerStore';

function App() {
  const { connect, disconnect, isConnected } = useTickerStore();
  const [showDeviceDetails, setShowDeviceDetails] = useState(false);

  /**
   * Handle app lifecycle changes
   */

  // useEffect(() => {
  //   const subscription = AppState.addEventListener(
  //     'change',
  //     (nextAppState: AppStateStatus) => {
  //       if (nextAppState === 'active') {
  //         // App came to foreground - reconnect if needed
  //         if (!isConnected) {
  //           connect();
  //         }
  //       } else if (nextAppState === 'background' || nextAppState === 'inactive') {
  //         // App went to background - disconnect to save battery
  //         if (isConnected) {
  //           disconnect();
  //         }
  //       }
  //     }
  //   );

  //   // Cleanup on unmount
  //   return () => {
  //     subscription.remove();
  //   };
  // }, [connect, disconnect, isConnected]);

  // Android native view: device details + close button back to JS
  if (showDeviceDetails && Platform.OS === 'android') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1d24" />
        <DeviceDetailsView onClose={() => setShowDeviceDetails(false)} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#8d94a4" />
      {Platform.OS === 'android' && (
        <View style={styles.deviceDetailsButton}>
          <Button
            title="Device details (native)"
            onPress={() => setShowDeviceDetails(true)}
            color="#8d94a4"
          />
        </View>
      )}
      {/* <TickerScreen /> */}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  deviceDetailsButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: '#5a5f6e',
  },
});

export default App;
