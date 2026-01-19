import { ISheetValidator, IValidationResult } from '../../interfaces/IValidation';

/**
 * Валидатор дат. Проверяет корректность формата и логическую последовательность.
 */
export class DateValidator implements ISheetValidator {
  /**
   * @param value Значение для валидации
   * @param context Ожидается { field: string, otherDate: Date }
   */
  public validate(value: any, context?: { field: string, otherDate?: Date | string }): IValidationResult {
    const date = new Date(value);
    
    if (isNaN(date.getTime())) {
      return { isValid: false, errorMessage: 'Некорректный формат даты' };
    }

    if (context?.otherDate) {
      const other = new Date(context.otherDate);
      if (!isNaN(other.getTime())) {
        if (context.field === 'startDate' && date > other) {
          return { isValid: false, errorMessage: 'Начало не может быть позже окончания' };
        }
        if (context.field === 'endDate' && date < other) {
          return { isValid: false, errorMessage: 'Окончание не может быть раньше начала' };
        }
      }
    }

    return { isValid: true };
  }
}


