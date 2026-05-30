export class CircuitBreaker {
  private failures = 0;
  private openedAt: number | null = null;

  constructor(
    private readonly failureThreshold: number,
    private readonly cooldownMs: number,
  ) {}

  async execute<T>(action: () => Promise<T>, fallback: () => T): Promise<T> {
    if (this.isOpen()) {
      return fallback();
    }
    try {
      const result = await action();
      this.reset();
      return result;
    } catch {
      this.recordFailure();
      return fallback();
    }
  }

  private isOpen(): boolean {
    if (this.openedAt === null) {
      return false;
    }
    if (Date.now() - this.openedAt >= this.cooldownMs) {
      this.openedAt = null;
      this.failures = 0;
      return false;
    }
    return true;
  }

  private recordFailure(): void {
    this.failures += 1;
    if (this.failures >= this.failureThreshold) {
      this.openedAt = Date.now();
    }
  }

  private reset(): void {
    this.failures = 0;
    this.openedAt = null;
  }
}
