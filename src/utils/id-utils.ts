/**
 * Унифицированная генерация ID для UI-элементов и временных сущностей.
 * 
 * ВАЖНО: НЕ использовать для domain-сущностей (tasks, resources) —
 * для них есть специализированные генераторы:
 * - TaskIdGenerator для задач
 * - ResourceIdGenerator для ресурсов
 * - AssignmentIdGenerator для назначений
 * - BaselineIdGenerator для baseline'ов
 * 
 * Следует принципам SOLID:
 * - Single Responsibility: генерация уникальных ID
 * - Open/Closed: легко добавлять новые типы ID
 * 
 * Безопасность:
 * - Использует crypto.randomUUID для криптографически стойкой уникальности
 * - Fallback на Date.now + random для старых браузеров (но это маловероятно)
 * 
 * @module id-utils
 * @version 1.0.0
 */

/**
 * Генерирует уникальный ID с префиксом.
 * Использует crypto.randomUUID если доступен (современные браузеры),
 * иначе fallback на Date.now + random (для совместимости).
 * 
 * @example
 * generateUniqueId('dialog') // "dialog-550e8400-e29b-41d4-a716-446655440000"
 * generateUniqueId('cache')  // "cache-6ba7b810-9dad-11d1-80b4-00c04fd430c8"
 * 
 * @param prefix - Префикс для идентификации типа ID
 * @returns Уникальный ID в формате: prefix-uuid
 */
export function generateUniqueId(prefix: string): string {
  const unique =
    crypto.randomUUID?.() ??
    `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  return `${prefix}-${unique}`
}

/**
 * Генерирует ID для UI-элементов (buttons, panels, etc).
 * 
 * @example
 * const buttonId = generateElementId('button')
 * const panelId = generateElementId('panel')
 * 
 * @param elementType - Тип UI-элемента
 * @returns Уникальный ID для элемента
 */
export function generateElementId(elementType: string): string {
  return generateUniqueId(elementType)
}

/**
 * Генерирует ID для подписок (event subscribers).
 * Критично для EventDispatcher - предотвращает memory leaks.
 * 
 * @example
 * const subscriptionId = generateSubscriptionId()
 * // "sub-550e8400-e29b-41d4-a716-446655440000"
 * 
 * @returns Уникальный ID подписки
 */
export function generateSubscriptionId(): string {
  return generateUniqueId('sub')
}

/**
 * Генерирует ID для диалогов.
 * Критично для DialogService - предотвращает коллизии при быстром открытии.
 * 
 * @example
 * const dialogId = generateDialogId()
 * // "dialog-6ba7b810-9dad-11d1-80b4-00c04fd430c8"
 * 
 * @returns Уникальный ID диалога
 */
export function generateDialogId(): string {
  return generateUniqueId('dialog')
}

/**
 * Генерирует ID для пунктов меню (контекстное меню, главное меню).
 * 
 * @example
 * const menuId = generateMenuId()
 * // "menu-7c9e6679-7425-40de-944b-e07fc1f90ae7"
 * 
 * @returns Уникальный ID пункта меню
 */
export function generateMenuId(): string {
  return generateUniqueId('menu')
}

/**
 * Генерирует ID для правил (hotkey rules, notification rules, validation rules).
 * 
 * @example
 * const ruleId = generateRuleId()
 * // "rule-3c4e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a"
 * 
 * @returns Уникальный ID правила
 */
export function generateRuleId(): string {
  return generateUniqueId('rule')
}

/**
 * Генерирует ID для маппингов (resource mapping, field mapping, column mapping).
 * 
 * @example
 * const mappingId = generateMappingId()
 * // "mapping-9e8d7c6b-5a4f-3e2d-1c0b-9a8f7e6d5c4b"
 * 
 * @returns Уникальный ID маппинга
 */
export function generateMappingId(): string {
  return generateUniqueId('mapping')
}
