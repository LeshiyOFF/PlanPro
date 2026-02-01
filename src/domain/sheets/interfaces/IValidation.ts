import { CellValue } from '@/types/sheet/CellValueTypes';
import type { JsonObject } from '@/types/json-types';

/**
 * Результат валидации данных ячейки
 */
export interface IValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Контекст валидации
 */
export type ValidationContext = Record<string, JsonObject>;

/**
 * Интерфейс для валидаторов ячеек
 */
export interface ISheetValidator {
  validate(value: CellValue, context?: ValidationContext): IValidationResult;
}
