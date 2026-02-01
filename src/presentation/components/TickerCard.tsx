/**
 * TickerCard Component
 * 
 * RESPONSIBILITY:
 * - Display individual cryptocurrency ticker information
 * - Animate price changes with color feedback
 * - Provide visual feedback for up/down movements
 * 
 * ANIMATION STRATEGY:
 * - Green flash on price increase
 * - Red flash on price decrease
 * - Smooth transitions using React Native Reanimated
 * 
 * WHY REANIMATED:
 * - Runs animations on UI thread (not JS thread)
 * - 60 FPS performance guaranteed
 * - Doesn't block JavaScript execution
 * - Industry standard for React Native animations
 * 
 * PERFORMANCE CONSIDERATIONS:
 * - useMemo to prevent unnecessary recalculations
 * - Separate animated components to isolate re-renders
 * - Optimized useEffect dependencies
 */

import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ticker } from '../../domain/models/Ticker';

interface TickerCardProps {
  ticker: Ticker;
}

export const TickerCard: React.FC<TickerCardProps> = ({ ticker }) => {
  // Shared value for background color animation
  const backgroundColor = useSharedValue(0);
  
  // Track previous price to detect changes
  const prevPrice = React.useRef<number>(ticker.currentPrice);

  /**
   * Detect price changes and trigger animation
   * 
   * LOGIC:
   * - Compare current price with previous price
   * - Set backgroundColor: 1 for green (up), -1 for red (down)
   * - Animate back to 0 (transparent) over 500ms
   * 
   * TIMING: 500ms provides noticeable feedback without being distracting
   */
  useEffect(() => {
    const currentPrice = ticker.currentPrice;
    const lastPrice = prevPrice.current;

    if (currentPrice > lastPrice) {
      // Price increased - flash green
      backgroundColor.value = 1;
      backgroundColor.value = withTiming(0, {
        duration: 500,
        easing: Easing.out(Easing.ease),
      });
    } else if (currentPrice < lastPrice) {
      // Price decreased - flash red
      backgroundColor.value = -1;
      backgroundColor.value = withTiming(0, {
        duration: 500,
        easing: Easing.out(Easing.ease),
      });
    }

    prevPrice.current = currentPrice;
  }, [ticker.currentPrice, backgroundColor]);

  /**
   * Animated style for background color
   * 
   * INTERPOLATION:
   * - backgroundColor = 1  → Green (rgba(0, 255, 0, 0.2))
   * - backgroundColor = 0  → Transparent
   * - backgroundColor = -1 → Red (rgba(255, 0, 0, 0.2))
   */
  const animatedStyle = useAnimatedStyle(() => {
    let bgColor = 'transparent';
    
    if (backgroundColor.value > 0) {
      const opacity = backgroundColor.value * 0.2; // Max 20% opacity
      bgColor = `rgba(34, 197, 94, ${opacity})`; // Green
    } else if (backgroundColor.value < 0) {
      const opacity = Math.abs(backgroundColor.value) * 0.2;
      bgColor = `rgba(239, 68, 68, ${opacity})`; // Red
    }

    return { backgroundColor: bgColor };
  });

  /**
   * Format price with appropriate decimal places
   */
  const formattedPrice = useMemo(() => {
    return ticker.currentPrice.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    });
  }, [ticker.currentPrice]);

  /**
   * Format percentage with sign
   */
  const formattedPercent = useMemo(() => {
    const sign = ticker.priceChangePercent >= 0 ? '+' : '';
    return `${sign}${ticker.priceChangePercent.toFixed(2)}%`;
  }, [ticker.priceChangePercent]);

  /**
   * Color for price change indicator
   */
  const changeColor = ticker.priceChangePercent >= 0 ? '#22c55e' : '#ef4444';

  /**
   * Extract base currency (e.g., "BTC" from "BTCUSDT")
   */
  const baseCurrency = ticker.symbol.replace('USDT', '');

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.header}>
        <Text style={styles.symbol}>{baseCurrency}/USDT</Text>
        <Text style={[styles.change, { color: changeColor }]}>
          {formattedPercent}
        </Text>
      </View>

      <Text style={styles.price}>${formattedPrice}</Text>

      <View style={styles.footer}>
        <View style={styles.stat}>
          <Text style={styles.label}>24h High</Text>
          <Text style={styles.value}>
            ${ticker.highPrice.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 8,
            })}
          </Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.label}>24h Low</Text>
          <Text style={styles.value}>
            ${ticker.lowPrice.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 8,
            })}
          </Text>
        </View>
      </View>

      <View style={styles.volumeContainer}>
        <Text style={styles.label}>24h Volume</Text>
        <Text style={styles.value}>
          {(ticker.volume / 1000000).toFixed(2)}M {baseCurrency}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  symbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f9fafb',
  },
  change: {
    fontSize: 16,
    fontWeight: '600',
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  stat: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    color: '#e5e7eb',
    fontWeight: '500',
  },
  volumeContainer: {
    marginTop: 8,
  },
});
