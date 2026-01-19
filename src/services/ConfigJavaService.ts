import { BaseJavaService } from './BaseJavaService';
import { convertDateFnsToJava } from '@/utils/DateFormatConverter';
import type { ConfigurationUpdateRequest } from '@/types/api/request-types';
import type {
  DataResponse,
  ConfigurationResponse,
  ApiStatusResponse
} from '@/types/api/response-types';

/**
 * Сервис для управления конфигурацией и системными операциями Java-ядра.
 * Выделен в отдельный класс согласно принципу Single Responsibility.
 */
export class ConfigJavaService extends BaseJavaService {
  /**
   * Обновление конфигурации приложения в Java-ядре
   * Автоматически конвертирует формат даты из date-fns в SimpleDateFormat
   */
  public async updateConfiguration(
    config: ConfigurationUpdateRequest,
    silent: boolean = false
  ): Promise<DataResponse<ConfigurationResponse>> {
    const convertedConfig = this.convertConfigFormats(config);
    return await this.executeApiCommand('config.update', [convertedConfig], silent);
  }

  /**
   * Конвертирует форматы дат в конфигурации перед отправкой в Java
   */
  private convertConfigFormats(config: ConfigurationUpdateRequest): ConfigurationUpdateRequest {
    if (!config) {
      return config;
    }

    const converted = { ...config };

    // Конвертируем dateFormat в general
    if (converted.general?.dateFormat) {
      converted.general = {
        ...converted.general,
        dateFormat: convertDateFnsToJava(converted.general.dateFormat)
      };
    }

    // Конвертируем timeFormat в general (если требуется)
    if (converted.general?.timeFormat) {
      converted.general = {
        ...converted.general,
        timeFormat: convertDateFnsToJava(converted.general.timeFormat)
      };
    }

    return converted;
  }

  /**
   * Проверка доступности Java API
   */
  public async ping(): Promise<boolean> {
    try {
      await this.executeApiCommand('ping', [], true);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Получение версии Java API
   */
  public async getVersion(): Promise<string> {
    try {
      const data = await this.executeApiCommand('version', [], true);
      return (typeof data === 'string' ? data : (data as { version?: string })?.version) || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Получение статуса Java API
   */
  public async getApiStatus(): Promise<DataResponse<ApiStatusResponse>> {
    return await this.executeApiCommand('status');
  }
}

