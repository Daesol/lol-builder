// src/lib/rateLimit.ts

type QueuedRequest<T> = {
    request: () => Promise<T>;
    retries: number;
    resolve: (value: T) => void;
    reject: (error: Error) => void;
  };
  
  export class RateLimit {
    private queue: QueuedRequest<unknown>[] = [];
    private processing = false;
    private requestCount = 0;
    private lastReset = Date.now();
    private retryDelay = 1000; // Start with 1 second
    private maxRetries = 3;
  
    private readonly shortTermLimit = 20;
    private readonly shortTermWindow = 1000; // 1 second
    private readonly longTermLimit = 100;
    private readonly longTermWindow = 120000; // 2 minutes
    private readonly backoffMultiplier = 2;
  
    constructor() {
      // Reset request count periodically for long-term rate limit
      setInterval(() => {
        const now = Date.now();
        if (now - this.lastReset >= this.longTermWindow) {
          this.requestCount = 0;
          this.lastReset = now;
        }
      }, this.longTermWindow);
    }
  
    private async delay(ms: number): Promise<void> {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  
    private async processQueue(): Promise<void> {
      if (this.processing) return;
      this.processing = true;
  
      while (this.queue.length > 0) {
        const now = Date.now();
        const timeSinceReset = now - this.lastReset;
  
        // Check short-term rate limit
        if (timeSinceReset >= this.shortTermWindow) {
          this.requestCount = 0;
          this.lastReset = now;
        }
  
        if (this.requestCount >= this.shortTermLimit) {
          await this.delay(this.shortTermWindow - timeSinceReset + 100); // Add small buffer
          continue;
        }
  
        const currentRequest = this.queue[0];
        if (!currentRequest) {
          continue;
        }
  
        try {
          this.requestCount++;
          const result = await currentRequest.request();
          currentRequest.resolve(result);
          this.queue.shift(); // Remove the request only after successful completion
          this.retryDelay = 1000; // Reset retry delay after success
        } catch (error) {
          console.error('Rate limited request failed:', error);
          
          if (currentRequest.retries < this.maxRetries) {
            // If we can retry, move to the end of the queue with incremented retry count
            currentRequest.retries++;
            this.queue.shift();
            this.queue.push(currentRequest);
            
            // Exponential backoff
            await this.delay(this.retryDelay);
            this.retryDelay *= this.backoffMultiplier;
          } else {
            // If we're out of retries, reject and remove from queue
            currentRequest.reject(new Error('Maximum retries exceeded'));
            this.queue.shift();
          }
        }
  
        // Add a small delay between requests
        await this.delay(50);
      }
  
      this.processing = false;
    }
  
    async enqueue<T>(request: () => Promise<T>): Promise<T> {
      return new Promise((resolve, reject) => {
        const queuedRequest: QueuedRequest<T> = {
          request,
          retries: 0,
          resolve,
          reject
        };
        
        this.queue.push(queuedRequest as QueuedRequest<unknown>);
        this.processQueue().catch(error => {
          console.error('Error processing queue:', error);
        });
      });
    }
  
    // Helper method to check current queue size
    getQueueSize(): number {
      return this.queue.length;
    }
  
    // Helper method to get current request count
    getRequestCount(): number {
      return this.requestCount;
    }
  }