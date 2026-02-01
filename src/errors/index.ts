/**
 * Центральный экспорт всех типов ошибок
 * Следует принципу DRY и обеспечивает единый импорт ошибок
 */

export { ValidationException } from './ValidationError';
export type {
  CaughtError
} from './CaughtError';
export {
  isCaughtError,
  toCaughtError,
  getCaughtErrorMessage as getErrorMessage
} from './CaughtError';
