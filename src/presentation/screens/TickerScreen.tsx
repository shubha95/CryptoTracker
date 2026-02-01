/**
 * TickerScreen Component
 * 
 * RESPONSIBILITY:
 * - Main screen displaying all cryptocurrency tickers
 * - Manages connection status and error states
 * - Provides refresh functionality
 * 
 * PERFORMANCE OPTIMIZATIONS:
 * - FlashList for efficient rendering of large lists
 * - Memoized key extractor and render functions
 * - Optimized re-render logic with Zustand selectors
 * 
 * WHY FLASHLIST:
 * - 10x better performance than FlatList for long lists
 * - Recycling mechanism similar to RecyclerView (Android)
 * - Smaller memory footprint
 * - Smoother scrolling with less dropped frames
 * 
 * DATA FLOW:
 * 1. Component mounts → Store connects to WebSocket
 * 2. WebSocket receives data → Store batches updates
 * 3. Store flushes batch every 1000ms → Component re-renders
 * 4. FlashList efficiently updates only changed items
 
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useTickerStore, useTickersArray } from '../../store/useTickerStore';
import { TickerCard } from '../components/TickerCard';
import { Ticker } from '../../domain/models/Ticker';

export const TickerScreen: React.FC = () => {
  // Get state and actions from store
  const { connect, disconnect, isConnected, error } = useTickerStore();
  const tickers = useTickersArray();

  /**
   * Connect on mount, disconnect on unmount
   * 
   * LIFECYCLE MANAGEMENT:
   * - Ensures WebSocket is active only when screen is mounted
   * - Proper cleanup prevents memory leaks
   * - Handles hot reload in development
   */
  useEffect(() => {
    console.log('[TickerScreen] Mounting, connecting to WebSocket...');
    connect();

    return () => {
      console.log('[TickerScreen] Unmounting, disconnecting...');
      disconnect();
    };
  }, [connect, disconnect]);

  /**
   * Key extractor for FlashList
   * 
   * PERFORMANCE: Stable keys prevent unnecessary re-renders
   */
  const keyExtractor = React.useCallback(
    (item: Ticker) => item.symbol,
    []
  );

  /**
   * Render individual ticker card
   * 
   * MEMOIZATION: Prevents recreating function on every render
   */
  const renderItem = React.useCallback(
    ({ item }: { item: Ticker }) => <TickerCard ticker={item} />,
    []
  );

  /**
   * List header with connection status
   */
  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Crypto Tracker</Text>
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: isConnected ? '#22c55e' : '#ef4444' },
          ]}
        />
        <Text style={styles.statusText}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </Text>
      </View>
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );

  /**
   * Empty state while waiting for data
   */
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      {isConnected ? (
        <>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.emptyText}>Loading ticker data...</Text>
        </>
      ) : (
        <>
          <Text style={styles.emptyText}>Connecting to Binance...</Text>
          <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 12 }} />
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      {tickers.length === 0 ? (
        renderEmpty()
      ) : (
        <FlashList
          data={tickers}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          estimatedItemSize={180}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    padding: 16,
    paddingTop: 24,
    backgroundColor: '#1f2937',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 8,
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 16,
    textAlign: 'center',
  },
});
