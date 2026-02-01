/**
 * Контекст для валидации дат
 */
export interface DateValidationContext {
  field: string;
  otherDate?: Date | string;
}
