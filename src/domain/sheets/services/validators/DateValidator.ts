import { ISheetValidator, IValidationResult, ValidationContext } from '../../interfaces/IValidation';
import { CellValue } from '@/types/sheet/CellValueTypes';
import { DateValidationContext } from './DateValidationContext';

/**
 * Валидатор дат. Проверяет корректность формата и логическую последовательность.
 */
export class DateValidator implements ISheetValidator {
  public validate(value: CellValue, context?: ValidationContext): IValidationResult {
    const date = new Date(value as string | Date);

    if (isNaN(date.getTime())) {
      return { isValid: false, errorMessage: 'Некорректный формат даты' };
    }

    const ctx = context as DateValidationContext | undefined;
    if (ctx?.otherDate) {
      const other = new Date(ctx.otherDate);
      if (!isNaN(other.getTime())) {
        if (ctx.field === 'startDate' && date > other) {
          return {
            isValid: false,
            errorMessage: 'Начало не может быть позже окончания'
          };
        }
        if (ctx.field === 'endDate' && date < other) {
          return {
            isValid: false,
            errorMessage: 'Окончание не может быть раньше начала'
          };
        }
      }
    }

    return { isValid: true };
  }
}
