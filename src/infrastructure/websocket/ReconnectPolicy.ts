/**
 * Reconnection Policy with Exponential Backoff
 * 
 * RESPONSIBILITY:
 * - Manages reconnection attempts with exponential backoff
 * - Prevents connection storms that could overwhelm the server
 * - Implements jitter to avoid thundering herd problem
 * 
 * WHY EXPONENTIAL BACKOFF:
 * - Reduces server load during outages
 * - Increases success probability by giving server time to recover
 * - Industry standard for resilient network connections
 * 
 */

export interface ReconnectConfig {
  initialDelay: number;    // Initial delay in ms (e.g., 1000)
  maxDelay: number;        // Maximum delay in ms (e.g., 30000)
  multiplier: number;      // Exponential multiplier (e.g., 2)
  maxAttempts: number;     // Max reconnection attempts (e.g., 10)
  jitter: boolean;         // Add random jitter to prevent thundering herd
}

export class ReconnectPolicy {
  private config: ReconnectConfig;
  private currentAttempt: number = 0;
  private currentDelay: number;

  constructor(config: Partial<ReconnectConfig> = {}) {
    // Default configuration based on industry best practices
    this.config = {
      initialDelay: config.initialDelay ?? 1000,        // 1 second
      maxDelay: config.maxDelay ?? 30000,               // 30 seconds
      multiplier: config.multiplier ?? 2,                // Double each time
      maxAttempts: config.maxAttempts ?? 10,            // 10 attempts
      jitter: config.jitter ?? true,                     // Enable jitter
    };

    this.currentDelay = this.config.initialDelay;
  }

  /**
   * Get the next reconnection delay
   * Formula: delay = min(initialDelay * (multiplier ^ attempt), maxDelay)
   * With jitter: delay = delay * (0.5 + random(0, 0.5))

   */
  getNextDelay(): number {
    if (this.currentAttempt >= this.config.maxAttempts) {
      throw new Error('Maximum reconnection attempts reached');
    }

    // Calculate exponential delay
    let delay = this.config.initialDelay * Math.pow(
      this.config.multiplier,
      this.currentAttempt
    );

    // Cap at maximum delay
    delay = Math.min(delay, this.config.maxDelay);

    // Add jitter (randomness between 50% and 100% of calculated delay)
    if (this.config.jitter) {
      const jitterFactor = 0.5 + Math.random() * 0.5;
      delay = delay * jitterFactor;
    }

    this.currentAttempt++;
    this.currentDelay = delay;

    return Math.floor(delay);
  }

  /**
   * Check if we can still attempt reconnection
   */
  canRetry(): boolean {
    return this.currentAttempt < this.config.maxAttempts;
  }

  /**
   * Reset the policy after successful connection
   */
  reset(): void {
    this.currentAttempt = 0;
    this.currentDelay = this.config.initialDelay;
  }

  /**
   * Get current attempt number
   */
  getAttemptCount(): number {
    return this.currentAttempt;
  }

  /**
   * Get current delay value
   */
  getCurrentDelay(): number {
    return this.currentDelay;
  }
}
