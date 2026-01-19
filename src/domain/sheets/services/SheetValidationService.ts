import { SheetColumnType } from '../interfaces/ISheetColumn';
import { IValidationResult } from '../interfaces/IValidation';
import { ProgressValidator } from './validators/ProgressValidator';
import { DateValidator } from './validators/DateValidator';

/**
 * Сервис валидации данных таблицы.
 * Реализует паттерн Strategy для выбора нужного валидатора.
 */
export class SheetValidationService {
  private progressValidator = new ProgressValidator();
  private dateValidator = new DateValidator();

  /**
   * Выполняет валидацию значения в зависимости от типа колонки
   */
  public validate(value: any, type: SheetColumnType, field: string, row?: any): IValidationResult {
    switch (type) {
      case SheetColumnType.PERCENT:
        return this.progressValidator.validate(value);
      
      case SheetColumnType.DATE:
        const otherDateField = field === 'startDate' ? 'endDate' : 'startDate';
        return this.dateValidator.validate(value, {
          field,
          otherDate: row ? row[otherDateField] : undefined
        });

      default:
        return { isValid: true };
    }
  }
}

