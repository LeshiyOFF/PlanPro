/**
 * Результат валидации данных ячейки
 */
export interface IValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Интерфейс для валидаторов ячеек
 */
export interface ISheetValidator {
  validate(value: any, context?: any): IValidationResult;
}


