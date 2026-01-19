import { UserPreferencesService } from '@/components/userpreferences/services/UserPreferencesService';

/**
 * Сервис для форматирования валюты в соответствии с настройками пользователя.
 * Следует принципу Single Responsibility.
 */
export class CurrencyFormatter {
  /**
   * Форматирует число как валюту, используя текущие настройки пользователя.
   * @param amount Сумма для форматирования
   * @returns Отформатированная строка валюты
   */
  public static format(amount: number): string {
    const prefs = UserPreferencesService.getInstance().getGeneralPreferences();
    const locale = prefs.language || 'ru-RU';
    const currency = prefs.currency || 'RUB';

    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
      }).format(amount);
    } catch (e) {
      // Fallback при некорректных настройках
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
      }).format(amount);
    }
  }
}
