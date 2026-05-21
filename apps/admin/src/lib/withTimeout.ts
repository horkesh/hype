export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

export function withTimeout<T>(
  promise: PromiseLike<T>,
  ms: number,
  label: string,
): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new TimeoutError(
              `Zahtjev "${label}" je istekao nakon ${ms / 1000}s. Vaša sesija je možda istekla — odjavite se i prijavite ponovo.`,
            ),
          ),
        ms,
      ),
    ),
  ]);
}
