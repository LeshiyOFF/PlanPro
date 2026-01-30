import { ISheetColumn, SheetColumnType } from '../interfaces/ISheetColumn';
import { formatDate } from '@/utils/formatUtils';

/**
 * Сервис для извлечения и форматирования значений ячеек для поиска и сортировки.
 */
export class SheetValueService {
  /**
   * Возвращает текстовое представление значения для фильтрации.
   */
  public static getFilterableValue(item: any, column: ISheetColumn): string {
    // 1. Пытаемся получить значение через valueGetter, иначе через field
    const rawValue = column.valueGetter ? column.valueGetter(item) : item[column.field as string];
    
    if (rawValue === null || rawValue === undefined) return '';

    let displayText = '';

    // 2. Если есть форматер, используем его для получения того, что видит пользователь
    if (column.formatter) {
      try {
        const formatted = column.formatter(rawValue, item);
        displayText = this.extractTextFromFormatted(formatted);
      } catch (e) {
        console.warn(`Filtering: Failed to format value for column ${column.id}`, e);
        displayText = String(rawValue);
      }
    } else {
      // Стандартная логика по типам если нет форматера
      switch (column.type) {
        case SheetColumnType.DATE:
          displayText = formatDate(rawValue);
          break;
        case SheetColumnType.PERCENT:
          displayText = `${Math.round((Number(rawValue) || 0) * 100)}%`;
          break;
        case SheetColumnType.SELECT:
          if (column.options) {
            const option = column.options.find(o => o.value === rawValue);
            displayText = option ? option.label : String(rawValue);
          } else {
            displayText = String(rawValue);
          }
          break;
        default:
          displayText = String(rawValue);
      }
    }

    // 3. НОРМАЛИЗАЦИЯ ДЛЯ ПОИСКА (Эталонный стандарт)
    // Убираем неразрывные пробелы (\u00A0) и любые лишние пробелы
    const normalized = displayText.replace(/[\u00A0\s]+/g, ' ').trim();
    
    // Для числовых полей, валют и длительности добавляем в строку поиска "чистое" число без пробелов,
    // чтобы поиск по "1000" находил "1 000 ₽"
    if (column.type === SheetColumnType.NUMBER || column.type === SheetColumnType.PERCENT || column.type === SheetColumnType.DURATION) {
      // Извлекаем только цифры и точку/запятую из сырого значения
      const pureNumber = String(rawValue).replace(/[^\d.,]/g, '');
      return `${normalized} | ${pureNumber}`;
    }

    return normalized;
  }

  /**
   * Возвращает значение для сравнения при сортировке.
   */
  public static getSortableValue(item: any, column: ISheetColumn): any {
    const value = column.valueGetter ? column.valueGetter(item) : item[column.field as string];

    if (value === null || value === undefined) {
      return column.type === SheetColumnType.NUMBER || column.type === SheetColumnType.PERCENT || column.type === SheetColumnType.DURATION 
        ? -Infinity 
        : '';
    }

    switch (column.type) {
      case SheetColumnType.DATE:
        return value instanceof Date ? value.getTime() : new Date(value).getTime();
      case SheetColumnType.NUMBER:
      case SheetColumnType.PERCENT:
        return Number(value);
      case SheetColumnType.DURATION:
        // Если значение - объект длительности, берем его числовое представление
        if (value && typeof value === 'object' && 'value' in value) {
          return value.value;
        }
        return Number(value);
      default:
        return String(value).toLowerCase();
    }
  }

  /**
   * Вспомогательная функция для извлечения чистого текста из React-элементов.
   */
  private static extractTextFromFormatted(value: any): string {
    if (value === null || value === undefined || typeof value === 'boolean') return '';
    if (typeof value === 'string' || typeof value === 'number') return String(value);
    
    if (Array.isArray(value)) {
      return value.map(v => this.extractTextFromFormatted(v)).join('');
    }

    if (value && typeof value === 'object' && value.props && 'children' in value.props) {
      return this.extractTextFromFormatted(value.props.children);
    }

    return String(value);
  }
}
