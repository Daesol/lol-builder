export class RateLimitError extends Error {
  retryAfter: number;
  
  constructor(retryAfter: number) {
    super('Rate limit exceeded');
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
} 