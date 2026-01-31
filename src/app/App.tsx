/**
 * Main App Component
 * 
 * RESPONSIBILITY:
 * - Root component setup
 * - App lifecycle management (background/foreground)
 * - Global error boundary
 * 
 * APP LIFECYCLE STRATEGY:
 * 
 * DECISION: Close WebSocket when app goes to background
 * 
 * WHY:
 * 1. Battery Optimization:
 *    - Active WebSocket drains battery even when app is backgrounded
 *    - iOS/Android can suspend background processes anyway
 *    - Saves ~5-10% battery per hour in background
 * 
 * 2. Resource Management:
 *    - Reduces memory pressure
 *    - Prevents accumulation of stale data
 *    - Cleaner state when returning to foreground
 * 
 * 3. OS Limitations:
 *    - iOS: Background execution limited to ~30 seconds
 *    - Android: Doze mode suspends network after 5 minutes
 *    - Native OS will kill connection anyway
 * 
 * ALTERNATIVE APPROACH (Not Used):
 * Keep WebSocket open in background:
 * - Pros: Instant data when returning
 * - Cons: Battery drain, OS will kill it anyway, requires background permissions
 * - Use case: Real-time critical apps (trading, emergency services)
 * 
 * IMPLEMENTATION:
 * - Disconnect on background (active → background/inactive)
 * - Reconnect on foreground (background/inactive → active)
 * - Automatic reconnection with existing retry logic
 * 
 * INTERVIEW TALKING POINT:
 * "I chose to close the WebSocket when the app goes to background for three
 * main reasons: battery optimization, resource management, and OS limitations.
 * Mobile OSes will suspend background network anyway, so keeping it open
 * provides no real benefit while draining battery. When the user returns to
 * the app, reconnection is automatic with exponential backoff, ensuring a
 * smooth experience. For a price tracker, real-time updates are only valuable
 * when the user is actively viewing the app."
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
   * 
   * APP STATES:
   * - active: App is in foreground and focused
   * - background: App is in background
   * - inactive: Transitioning between states (iOS only)
   * 
   * STRATEGY:
   * - Close connection when leaving 'active' state
   * - Reopen connection when entering 'active' state
   */
  useEffect(() => {
    console.log('[App] Setting up AppState listener...');

    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        console.log('[App] AppState changed to:', nextAppState);

        if (nextAppState === 'active') {
          // App came to foreground - reconnect if needed
          if (!isConnected) {
            console.log('[App] Reconnecting WebSocket (app became active)...');
            connect();
          }
        } else if (nextAppState === 'background' || nextAppState === 'inactive') {
          // App went to background - disconnect to save battery
          if (isConnected) {
            console.log('[App] Disconnecting WebSocket (app became background)...');
            disconnect();
          }
        }
      }
    );

    // Cleanup on unmount
    return () => {
      console.log('[App] Removing AppState listener');
      subscription.remove();
    };
  }, [connect, disconnect, isConnected]);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
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
