// src/lib/rateLimit.ts

type QueuedRequest<T> = () => Promise<T>;

export class RateLimit {
  private queue: QueuedRequest<unknown>[] = [];
  private processing = false;
  private requestCount = 0;
  private lastReset = Date.now();

  private readonly shortTermLimit = 20;
  private readonly shortTermWindow = 1000; // 1 second
  private readonly longTermLimit = 100;
  private readonly longTermWindow = 120000; // 2 minutes

  private async processQueue(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceReset = now - this.lastReset;

      if (timeSinceReset >= this.shortTermWindow) {
        this.requestCount = 0;
        this.lastReset = now;
      }

      if (this.requestCount >= this.shortTermLimit) {
        await new Promise(resolve => 
          setTimeout(resolve, this.shortTermWindow - timeSinceReset)
        );
        continue;
      }

      const request = this.queue.shift();
      if (request) {
        this.requestCount++;
        try {
          await request();
        } catch (error) {
          console.error('Rate limited request failed:', error);
        }
      }
    }

    this.processing = false;
  }

  async enqueue<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processQueue();
    });
  }
}