/**
 * Централизованный экспорт всех утилит проекта.
 * Позволяет импортировать через: import { groupBy, generateDialogId } from '@/utils'
 * 
 * @module utils
 */

// Array utilities
export { groupBy, partition, uniqueBy, compact } from './array-utils'

// ID generation utilities
export {
  generateUniqueId,
  generateElementId,
  generateSubscriptionId,
  generateDialogId,
  generateMenuId,
  generateRuleId,
  generateMappingId,
} from './id-utils'

// Existing utilities (for reference, actual exports may vary)
export { logger } from './logger'
export { ColorUtils } from './ColorUtils'
export { cn } from './cn'
