import type { JavaCommandArgs } from '../types/JavaCommandArgs';
import type { JsonValue } from '../types/JsonValue';

/**
 * API клиент для взаимодействия с Java backend
 * Отвечает только за выполнение HTTP запросов к Java API
 */
export class JavaApiClient {
  private readonly baseUrl: string
  private readonly timeout: number

  constructor(port: number, timeout: number = 30000) {
    this.baseUrl = `http://127.0.0.1:${port}`
    this.timeout = timeout
  }

  /**
   * Выполнение HTTP запроса к Java API с поддержкой повторных попыток (Retry).
   */
  public async makeRequest<T = JsonValue>(command: string, args: JavaCommandArgs = []): Promise<T> {
    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 300;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        return (await this.executeRequest(command, args)) as T;
      } catch (error) {
        lastError = error as Error;
        const isNetworkError = lastError.message.includes('fetch failed') || 
                               lastError.message.includes('aborted');
        
        if (isNetworkError && attempt < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * attempt));
          continue;
        }
        throw lastError;
      }
    }
  }

  /**
   * Внутренний метод для выполнения "сырого" запроса.
   */
  private async executeRequest<T = JsonValue>(command: string, args: JavaCommandArgs = []): Promise<T> {
    const url = `${this.baseUrl}/api/${command}`
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ command, args }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorBody = await this.tryParseErrorBody(response)
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}${
            errorBody ? ` - ${errorBody}` : ''
          }`
        )
      }

      const rawText = await response.text()
      try {
        return JSON.parse(rawText) as T
      } catch (e) {
        console.error('JSON Parse Error. Raw body:', rawText)
        throw new Error(`Invalid JSON response from Java API for command ${command}: ${(e as Error).message}`)
      }
    } catch (error) {
      const errorMessage = (error as Error).message;

      if (!errorMessage.includes('fetch failed')) {
        console.error('API request failed:', {
          command,
          args,
          error: errorMessage,
          url: `${this.baseUrl}/api/${command}`
        });
      }
      throw error
    }
  }

  /**
   * Попытка парсинга тела ошибки
   */
  private async tryParseErrorBody(response: Response): Promise<string | null> {
    try {
      const text = await response.text()
      return text.length > 0 ? text : null
    } catch {
      return null
    }
  }

  /**
   * Проверка доступности Java API через Health Check эндпоинт.
   * Реализует логику ожидания готовности (Health Check).
   */
  public async waitForReady(timeoutMs: number = 30000, intervalMs: number = 1000): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      const isConnected = await this.checkConnection();
      if (isConnected) {
        console.log(`✅ Java API is ready at ${this.baseUrl}`);
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
    
    return false;
  }

  /**
   * Проверка доступности Java API через health endpoint.
   * Использует легковесный /api/health вместо /api/projects для быстрой проверки.
   */
  public async checkConnection(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const response = await fetch(`${this.baseUrl}/api/health`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      // Детальное логирование для диагностики
      const errorMessage = (error as Error).message;
      if (!errorMessage.includes('aborted')) {
        console.warn(`[JavaApiClient] Health check failed: ${errorMessage}`);
      }
      return false;
    }
  }
}