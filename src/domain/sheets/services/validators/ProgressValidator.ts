import { ISheetValidator, IValidationResult } from '../../interfaces/IValidation';

/**
 * Валидатор прогресса (от 0 до 1 или от 0% до 100%)
 */
export class ProgressValidator implements ISheetValidator {
  public validate(value: any): IValidationResult {
    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) {
      return { isValid: false, errorMessage: 'Введите числовое значение' };
    }

    if (numValue < 0 || numValue > 100) {
      return { isValid: false, errorMessage: 'Процент должен быть от 0 до 100' };
    }

    return { isValid: true };
  }
}

