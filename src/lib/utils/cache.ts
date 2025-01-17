export class RateLimit {
  private timestamps: number[] = [];
  private readonly shortTermLimit = 20; // requests
  private readonly shortTermWindow = 1000; // 1 second in ms
  private readonly longTermLimit = 100; // requests
  private readonly longTermWindow = 120000; // 2 minutes in ms

  async waitForAvailability(): Promise<void> {
    const now = Date.now();
    this.timestamps = this.timestamps.filter(
      time => now - time < this.longTermWindow
    );

    // Check long-term rate limit
    if (this.timestamps.length >= this.longTermLimit) {
      const oldestTimestamp = this.timestamps[0];
      const waitTime = this.longTermWindow - (now - oldestTimestamp);
      console.warn(`Long-term rate limit reached. Waiting ${waitTime}ms before next request`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    // Check short-term rate limit
    const recentTimestamps = this.timestamps.filter(
      time => now - time < this.shortTermWindow
    );
    if (recentTimestamps.length >= this.shortTermLimit) {
      const oldestRecentTimestamp = recentTimestamps[0];
      const waitTime = this.shortTermWindow - (now - oldestRecentTimestamp);
      console.warn(`Short-term rate limit reached. Waiting ${waitTime}ms before next request`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.timestamps.push(now);
    
    // Log current usage
    const currentShortTermUsage = recentTimestamps.length + 1;
    const currentLongTermUsage = this.timestamps.length;
    console.log(`Rate limit status: ${currentShortTermUsage}/${this.shortTermLimit} (short-term), ${currentLongTermUsage}/${this.longTermLimit} (long-term)`);
  }

  getCurrentUsage(): { shortTerm: number; longTerm: number } {
    const now = Date.now();
    const recentTimestamps = this.timestamps.filter(
      time => now - time < this.shortTermWindow
    );
    return {
      shortTerm: recentTimestamps.length,
      longTerm: this.timestamps.length
    };
  }
}

// Create and export a single instance
export const rateLimit = new RateLimit();

export class Cache<T> {
  private cache: Map<string, { value: T; timestamp: number }> = new Map();
  private ttl: number;

  constructor(ttlSeconds = 300) {
    this.ttl = ttlSeconds * 1000;
  }

  set(key: string, value: T): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  clear(): void {
    this.cache.clear();
  }
}
