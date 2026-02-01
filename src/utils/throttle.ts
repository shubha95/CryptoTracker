/**
 * Throttle Utility
 * 
 * RESPONSIBILITY:
 * - Limits function execution rate
 * - Ensures function is called at most once per specified interval
 * 
 * USE CASE IN THIS APP:
 * - WebSocket sends data every 250-500ms
 * - UI should update only once per 1000ms
 * - This throttle ensures we don't trigger unnecessary re-renders
 * 
 * WHY THROTTLE (NOT DEBOUNCE):
 * - Debounce: Waits for inactivity, then fires once
 * - Throttle: Fires at regular intervals while active
 * 
 * For live price updates, throttle is better because:
 * - We want regular updates, not just when data stops
 * - Users expect to see prices changing at predictable intervals
 * - Prevents UI thrashing while maintaining perceived real-time updates

/**
 * Creates a throttled function that only invokes the provided function
 * at most once per specified time period.
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastExecution = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;

  return function throttled(...args: Parameters<T>) {
    const now = Date.now();
    const timeSinceLastExecution = now - lastExecution;

    // Store the latest arguments
    lastArgs = args;

    // If enough time has passed, execute immediately
    if (timeSinceLastExecution >= delay) {
      lastExecution = now;
      func(...args);
      
      // Clear any pending scheduled execution
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    } else if (!timeoutId) {
      // Schedule execution for remaining time
      const remainingTime = delay - timeSinceLastExecution;
      
      timeoutId = setTimeout(() => {
        lastExecution = Date.now();
        if (lastArgs) {
          func(...lastArgs);
        }
        timeoutId = null;
        lastArgs = null;
      }, remainingTime);
    }
  };
}

/**
 * Creates a batched throttle function that collects all calls
 * and invokes the callback with accumulated data at intervals
 * 
 * PERFECT FOR OUR USE CASE:
 * - Collects all ticker updates in a batch
 * - Processes batch once per interval
 * - Reduces render cycles from ~4/sec to 1/sec
 * 
 * @param callback - Function to call with batched data
 * @param delay - Batch interval in milliseconds
 * @returns Function to add items to the batch
 */
export function batchedThrottle<T>(
  callback: (batch: T[]) => void,
  delay: number
): (item: T) => void {
  let batch: T[] = [];
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function addToBatch(item: T) {
    batch.push(item);

    // If no timeout is scheduled, schedule one
    if (!timeoutId) {
      timeoutId = setTimeout(() => {
        if (batch.length > 0) {
          callback([...batch]); // Pass copy to avoid mutation
          batch = [];
        }
        timeoutId = null;
      }, delay);
    }
  };
}

/**
 * Utility to measure time between function calls
 * Useful for debugging and performance monitoring
 */
export function measureCallRate(label: string): () => void {
  let lastCall = Date.now();
  let callCount = 0;
  let totalInterval = 0;

  return () => {
    const now = Date.now();
    const interval = now - lastCall;
    callCount++;
    totalInterval += interval;

    console.log(
      `[${label}] Call #${callCount} | Interval: ${interval}ms | Avg: ${Math.round(totalInterval / callCount)}ms`
    );

    lastCall = now;
  };
}
