class RateLimiter {
  private queue: Promise<any> = Promise.resolve();

  add<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.queue.then(operation);
    this.queue = result.catch(() => {});
    return result;
  }
}

export const rateLimiter = new RateLimiter(); 