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
    private cooldown = false;
  
    private readonly shortTermLimit = 18; // Slightly lower to provide a buffer
    private readonly shortTermWindow = 1000; // 1 second
    private readonly longTermLimit = 95; // Slightly lower to provide a buffer
    private readonly longTermWindow = 120000; // 2 minutes
  
    private tokenBucket = this.shortTermLimit;
    private lastRefillTime = Date.now();
  
    private maxRetries = 3;
    private retryDelay = 1000; // 1 second
    private backoffMultiplier = 2;
  
    private log = (message: string) => console.log(`[RateLimit] ${message}`);
  
    constructor() {
      // Refill tokens periodically
      setInterval(() => this.refillTokens(), this.shortTermWindow / this.shortTermLimit);
    }
  
    private refillTokens(): void {
      const now = Date.now();
      const elapsedTime = now - this.lastRefillTime;
      const tokensToAdd = Math.floor(elapsedTime / (this.shortTermWindow / this.shortTermLimit));
      this.tokenBucket = Math.min(this.shortTermLimit, this.tokenBucket + tokensToAdd);
      this.lastRefillTime = now;
    }
  
    private async delay(ms: number): Promise<void> {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  
    private async processQueue(): Promise<void> {
      if (this.processing || this.cooldown) return;
      this.processing = true;
  
      while (this.queue.length > 0) {
        const now = Date.now();
        if (this.tokenBucket <= 0) {
          await this.delay(this.shortTermWindow / this.shortTermLimit);
          continue;
        }
  
        const currentRequest = this.queue[0];
        if (!currentRequest) {
          continue;
        }
  
        try {
          this.tokenBucket--;
          const result = await currentRequest.request();
          currentRequest.resolve(result);
          this.queue.shift(); // Remove the request only after successful completion
          this.retryDelay = 1000; // Reset retry delay after success
        } catch (error: any) {
          this.log(`Request failed: ${error.message}`);
  
          if (error.response?.status === 429) {
            // Rate limited: use Retry-After header if available
            const retryAfter = parseInt(error.response.headers["retry-after"] || "1", 10);
            this.log(`Rate limit hit. Pausing for ${retryAfter} seconds.`);
            await this.handleCooldown(retryAfter * 1000);
          } else if (currentRequest.retries < this.maxRetries) {
            // Retry with exponential backoff
            currentRequest.retries++;
            this.queue.shift();
            this.queue.push(currentRequest);
            this.log(`Retrying request (${currentRequest.retries}/${this.maxRetries}) after ${this.retryDelay}ms.`);
            await this.delay(this.retryDelay);
            this.retryDelay *= this.backoffMultiplier;
          } else {
            currentRequest.reject(new Error("Maximum retries exceeded"));
            this.queue.shift();
          }
        }
  
        // Small delay between processing requests
        await this.delay(50);
      }
  
      this.processing = false;
    }
  
    private async handleCooldown(ms: number): Promise<void> {
      this.cooldown = true;
      await this.delay(ms);
      this.cooldown = false;
      this.tokenBucket = this.shortTermLimit; // Reset token bucket after cooldown
    }
  
    async enqueue<T>(request: () => Promise<T>): Promise<T> {
      return new Promise((resolve, reject) => {
        const queuedRequest: QueuedRequest<T> = {
          request,
          retries: 0,
          resolve,
          reject,
        };
  
        this.queue.push(queuedRequest as QueuedRequest<unknown>);
        this.processQueue().catch(error => {
          this.log(`Error processing queue: ${error.message}`);
        });
      });
    }
  
    // Helper method to check current queue size
    getQueueSize(): number {
      return this.queue.length;
    }
  
    // Helper method to get current token count
    getAvailableTokens(): number {
      return this.tokenBucket;
    }
  }
  