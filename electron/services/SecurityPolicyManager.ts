import { session } from 'electron';

/**
 * Менеджер политик безопасности приложения.
 * Отвечает за настройку Content Security Policy (CSP).
 * Соответствует SOLID: Single Responsibility Principle.
 */
export class SecurityPolicyManager {
  /**
   * Настройка CSP для всех сессий приложения
   */
  public static configureSecurityHeaders(): void {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [this.getCspPolicy()]
        }
      });
    });
  }

  /**
   * Формирование строки политики CSP.
   * Ограничивает источники скриптов, стилей и соединений.
   */
  private static getCspPolicy(): string {
    const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
    
    // В режиме разработки разрешаем localhost для Vite/React DevTools
    const connectSrc = isDev 
      ? "default-src 'self'; connect-src 'self' http://localhost:* ws://localhost:*;" 
      : "default-src 'self'; connect-src 'self' http://localhost:*;";

    return `
      ${connectSrc}
      script-src 'self' ${isDev ? "'unsafe-eval' 'unsafe-inline'" : ""};
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' data:;
      font-src 'self' https://fonts.gstatic.com;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
    `.replace(/\s+/g, ' ').trim();
  }
}

