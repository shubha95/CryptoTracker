/**
 * Domain Model: Ticker
 * 
 * Represents a cryptocurrency ticker with real-time price information.
 * This is a pure domain model with no external dependencies.
 * 
 * Design Decision: We keep only essential fields to minimize memory footprint
 * since we're dealing with high-frequency updates (250-500ms).
 */

export interface Ticker {
  symbol: string;              // e.g., "BTCUSDT"
  currentPrice: number;         // Current market price
  priceChange: number;          // 24h price change
  priceChangePercent: number;   // 24h price change percentage
  highPrice: number;            // 24h high price
  lowPrice: number;             // 24h low price
  volume: number;               // 24h trading volume
  lastUpdateTime: number;       // Timestamp of last update
}

/**
 * Raw data structure from Binance WebSocket
 * Maps directly to the incoming JSON payload
 */
export interface BinanceTickerData {
  e: string;      // Event type
  E: number;      // Event time
  s: string;      // Symbol
  c: string;      // Current price
  p: string;      // Price change
  P: string;      // Price change percent
  h: string;      // High price
  l: string;      // Low price
  v: string;      // Volume
}

/**
 * Transforms raw Binance data into our domain model
 * 
 * WHY: Separates infrastructure concerns from domain logic.
 * The domain should not know about external data formats.
 * 
 * @param data - Raw Binance WebSocket data
 * @returns Normalized Ticker domain model
 */
export function mapBinanceDataToTicker(data: BinanceTickerData): Ticker {
  return {
    symbol: data.s,
    currentPrice: parseFloat(data.c),
    priceChange: parseFloat(data.p),
    priceChangePercent: parseFloat(data.P),
    highPrice: parseFloat(data.h),
    lowPrice: parseFloat(data.l),
    volume: parseFloat(data.v),
    lastUpdateTime: data.E,
  };
}
