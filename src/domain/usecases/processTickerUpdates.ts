/**
 * Use Case: Process Ticker Updates
 * 
 * Business Logic Layer - handles the core logic of processing incoming ticker data.
 * 
 * RESPONSIBILITY:
 * - Validate incoming data
 * - Apply business rules
 * - Determine if an update should be processed
 * 
 * WHY SEPARATE USECASE:
 * - Keeps business logic independent of infrastructure (WebSocket) and presentation (UI)
 * - Makes testing easier - can test business logic in isolation
 * - Follows Single Responsibility Principle
 * - Enables reusability across different presentation layers (mobile, web, etc.)
 */

import { Ticker, BinanceTickerData, mapBinanceDataToTicker } from '../models/Ticker';

export interface ProcessTickerResult {
  isValid: boolean;
  ticker?: Ticker;
  error?: string;
}

/**
 * Validates and processes raw ticker data from WebSocket
 */
export function processTickerUpdate(rawData: any): ProcessTickerResult {
  // Validate message structure
  if (!rawData || typeof rawData !== 'object') {
    return {
      isValid: false,
      error: 'Invalid data format',
    };
  }

  // Only process ticker events (ignore subscription confirmations, etc.)
  if (rawData.e !== '24hrTicker') {
    return {
      isValid: false,
      error: 'Not a ticker event',
    };
  }

  // Validate required fields
  const requiredFields = ['s', 'c', 'p', 'P', 'h', 'l', 'v', 'E'];
  const missingFields = requiredFields.filter(field => !(field in rawData));
  
  if (missingFields.length > 0) {
    return {
      isValid: false,
      error: `Missing required fields: ${missingFields.join(', ')}`,
    };
  }

  // Transform to domain model
  try {
    const ticker = mapBinanceDataToTicker(rawData as BinanceTickerData);
    
    // Business rule: Validate price is positive
    if (ticker.currentPrice <= 0) {
      return {
        isValid: false,
        error: 'Invalid price value',
      };
    }

    return {
      isValid: true,
      ticker,
    };
  } catch (error) {
    return {
      isValid: false,
      error: `Processing error: ${error}`,
    };
  }
}

/**
 * Determines if a price change is significant enough to trigger UI update
 * 
 * WHY: Could add business rules like:
 * - Only update if price change > 0.01%
 * - Only update if time since last update > X ms
 * 
 * Currently returns true for all updates, but this gives us flexibility
 * to add filtering logic in the future without changing other layers.
 */
export function shouldUpdateUI(ticker: Ticker): boolean {
  // Business rule: Always update (could add threshold logic here)
  return true;
}
