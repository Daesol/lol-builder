export class RateLimit {
  private requests: number[] = [];
  private limit: number;
  private interval: number;

  constructor(limit = 20, interval = 1000) {
    this.limit = limit;
    this.interval = interval;
  }

  async wait(): Promise<void> {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.interval);
    
    if (this.requests.length >= this.limit) {
      const oldestRequest = this.requests[0];
      const waitTime = this.interval - (now - oldestRequest);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.requests.push(now);
  }
}

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
