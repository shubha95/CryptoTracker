/**
 * Binance WebSocket Client
 * 
 * RESPONSIBILITY:
 * - Manages WebSocket connection lifecycle
 * - Handles subscriptions to crypto pairs
 * - Implements automatic reconnection with exponential backoff
 * - Emits data to subscribers
 * 
 * ARCHITECTURE DECISION:
 * - Uses Observer pattern for data distribution
 * - Separates connection management from business logic
 * - Implements clean error handling and logging
 * 
 * WHY THIS DESIGN:
 * - Infrastructure concerns isolated from domain/presentation
 * - Reconnection logic is testable and reusable
 * - Event-driven architecture allows multiple consumers
 * - Resource management (connection cleanup) is centralized
 */

import { ReconnectPolicy } from './ReconnectPolicy';

export type TickerCallback = (data: any) => void;
export type ErrorCallback = (error: Error) => void;
export type ConnectionCallback = (status: 'connected' | 'disconnected') => void;

export interface BinanceWSConfig {
  url: string;
  symbols: string[];
  onTicker: TickerCallback;
  onError?: ErrorCallback;
  onConnectionChange?: ConnectionCallback;
}

export class BinanceWS {
  private ws: WebSocket | null = null;
  private config: BinanceWSConfig;
  private reconnectPolicy: ReconnectPolicy;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private isIntentionallyClosed: boolean = false;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private lastMessageTime: number = Date.now();

  // Connection health check interval (30 seconds)
  private readonly HEARTBEAT_INTERVAL = 30000;
  // Consider connection stale if no message in 60 seconds
  private readonly STALE_THRESHOLD = 60000;

  constructor(config: BinanceWSConfig) {
    this.config = config;
    this.reconnectPolicy = new ReconnectPolicy();
  }

  /**
   * Establish WebSocket connection
   * 
   * PUBLIC API: Called by application to start connection
   */
  connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('[BinanceWS] Already connected');
      return;
    }

    this.isIntentionallyClosed = false;
    this.connectWebSocket();
  }

  /**
   * Internal connection logic
   */
  private connectWebSocket(): void {
    try {
      console.log('[BinanceWS] Connecting to Binance WebSocket...');
      
      this.ws = new WebSocket(this.config.url);

      this.ws.onopen = () => {
        console.log('[BinanceWS] Connected successfully');
        this.onOpen();
      };

      this.ws.onmessage = (event) => {
        this.onMessage(event);
      };

      this.ws.onerror = (event) => {
        this.onError(event);
      };

      this.ws.onclose = (event) => {
        this.onClose(event);
      };

    } catch (error) {
      console.error('[BinanceWS] Connection error:', error);
      this.handleReconnection();
    }
  }

  /**
   * Handle successful connection
   */
  private onOpen(): void {
    // Reset reconnection policy on successful connection
    this.reconnectPolicy.reset();
    
    // Subscribe to ticker streams
    this.subscribe();
    
    // Start heartbeat monitoring
    this.startHeartbeat();
    
    // Notify connection status
    this.config.onConnectionChange?.(('connected'));
  }

  /**
   * Subscribe to cryptocurrency pairs
   */
  private subscribe(): void {
    const subscriptionMessage = {
      method: 'SUBSCRIBE',
      params: this.config.symbols.map(symbol => `${symbol.toLowerCase()}@ticker`),
      id: 1,
    };

    console.log('[BinanceWS] Subscribing to:', subscriptionMessage.params);
    this.ws?.send(JSON.stringify(subscriptionMessage));
  }

  /**
   * Handle incoming messages
   */
  private onMessage(event: any): void {
    this.lastMessageTime = Date.now();

    try {
      const data = JSON.parse(event.data);
      
      // Ignore subscription confirmation messages
      if (data.result === null && data.id === 1) {
        console.log('[BinanceWS] Subscription confirmed');
        return;
      }

      // Forward ticker data to callback
      if (data.e === '24hrTicker') {
        this.config.onTicker(data);
      }
    } catch (error) {
      console.error('[BinanceWS] Message parsing error:', error);
    }
  }

  /**
   * Handle WebSocket errors
   */
  private onError(event: Event): void {
    const error = new Error('WebSocket error occurred');
    console.error('[BinanceWS] Error:', error);
    this.config.onError?.(error);
  }

  /**
   * Handle connection closure
   */
  private onClose(event: any): void {
    console.log('[BinanceWS] Connection closed:', event.code, event.reason);
    
    this.stopHeartbeat();
    this.config.onConnectionChange?.('disconnected');

    // Only attempt reconnection if not intentionally closed
    if (!this.isIntentionallyClosed) {
      this.handleReconnection();
    }
  }

  /**
   * Handle reconnection with exponential backoff
   * 
   * CRITICAL PRODUCTION LOGIC:
   * - Prevents connection storms
   * - Implements smart retry strategy
   * - Respects maximum attempts
   */
  private handleReconnection(): void {
    if (!this.reconnectPolicy.canRetry()) {
      const error = new Error('Maximum reconnection attempts reached');
      console.error('[BinanceWS]', error.message);
      this.config.onError?.(error);
      return;
    }

    const delay = this.reconnectPolicy.getNextDelay();
    console.log(
      `[BinanceWS] Reconnecting in ${delay}ms (attempt ${this.reconnectPolicy.getAttemptCount()})...`
    );

    this.reconnectTimeout = setTimeout(() => {
      this.connectWebSocket();
    }, delay);
  }

  /**
   * Start heartbeat monitoring
   * 
   * WHY: Detects stale connections that appear open but aren't receiving data
   * Binance doesn't send ping/pong, so we monitor message frequency
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      const timeSinceLastMessage = Date.now() - this.lastMessageTime;
      
      if (timeSinceLastMessage > this.STALE_THRESHOLD) {
        console.warn('[BinanceWS] Connection appears stale, reconnecting...');
        this.reconnect();
      }
    }, this.HEARTBEAT_INTERVAL);
  }

  /**
   * Stop heartbeat monitoring
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Manually trigger reconnection
   */
  private reconnect(): void {
    this.disconnect();
    this.connect();
  }

  /**
   * Disconnect WebSocket
   * 
   * PUBLIC API: Called by application to close connection
   */
  disconnect(): void {
    console.log('[BinanceWS] Disconnecting...');
    
    this.isIntentionallyClosed = true;
    this.stopHeartbeat();
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
  }

  /**
   * Get current connection status
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Update subscribed symbols (unsubscribe old, subscribe new)
   */
  updateSubscriptions(newSymbols: string[]): void {
    if (!this.isConnected()) {
      console.warn('[BinanceWS] Cannot update subscriptions while disconnected');
      return;
    }

    // Unsubscribe from old symbols
    const unsubscribeMessage = {
      method: 'UNSUBSCRIBE',
      params: this.config.symbols.map(symbol => `${symbol.toLowerCase()}@ticker`),
      id: 2,
    };
    this.ws?.send(JSON.stringify(unsubscribeMessage));

    // Update config and subscribe to new symbols
    this.config.symbols = newSymbols;
    this.subscribe();
  }
}
