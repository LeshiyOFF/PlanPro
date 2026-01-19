/**
 * Ошибка лаунчера Java с расширенным контекстом
 */
export class JavaLauncherError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context: string,
    public readonly suggestions: string[]
  ) {
    super(message);
    this.name = 'JavaLauncherError';
    Object.setPrototypeOf(this, JavaLauncherError.prototype);
  }
}

