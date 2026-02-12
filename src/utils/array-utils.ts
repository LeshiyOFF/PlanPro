/**
 * Утилиты для работы с массивами.
 * Устраняет дублирование СЛОЖНОЙ логики обработки массивов.
 * 
 * ВАЖНО: Не создаём wrapper'ы для простых операций вроде .length > 0
 * (это overengineering). Фокус на реально повторяющихся паттернах.
 * 
 * Следует принципам SOLID:
 * - Single Responsibility: каждая функция делает одно дело
 * - Open/Closed: расширяемые через generics
 * 
 * @module array-utils
 * @version 1.0.0
 */

/**
 * Группирует массив по ключу.
 * Устраняет дублирование reduce-логики (~10+ использований в проекте).
 * 
 * @example
 * // Группировка задач по статусу
 * const tasksByStatus = groupBy(tasks, t => t.status)
 * // { 'active': [...], 'completed': [...], 'pending': [...] }
 * 
 * @example
 * // Группировка ресурсов по типу
 * const resourcesByType = groupBy(resources, r => r.type)
 * 
 * @param arr - Массив для группировки
 * @param keyFn - Функция для извлечения ключа группировки
 * @returns Объект с группами, где ключ - результат keyFn
 */
export function groupBy<T, K extends string | number>(
  arr: T[],
  keyFn: (item: T) => K,
): Record<K, T[]> {
  return arr.reduce(
    (acc, item) => {
      const key = keyFn(item)
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(item)
      return acc
    },
    {} as Record<K, T[]>,
  )
}

/**
 * Разделяет массив на 2 группы по условию.
 * Полезно для разделения на "валидные/невалидные", "критичные/обычные" и т.д.
 * 
 * @returns [truthyItems, falsyItems]
 * 
 * @example
 * const [critical, normal] = partition(tasks, t => t.critical)
 * const [valid, invalid] = partition(data, item => validate(item))
 * 
 * @param arr - Массив для разделения
 * @param predicate - Функция условия (true = первая группа, false = вторая)
 * @returns Кортеж из двух массивов [truthy, falsy]
 */
export function partition<T>(
  arr: T[],
  predicate: (item: T) => boolean,
): [T[], T[]] {
  const truthy: T[] = []
  const falsy: T[] = []
  
  for (const item of arr) {
    if (predicate(item)) {
      truthy.push(item)
    } else {
      falsy.push(item)
    }
  }
  
  return [truthy, falsy]
}

/**
 * Удаляет дубликаты по ключу.
 * Устраняет дублирование Set-логики (~5 использований в проекте).
 * 
 * @example
 * // Удаление задач с дублирующимися ID
 * const uniqueTasks = uniqueBy(tasks, t => t.id)
 * 
 * @example
 * // Удаление связей с одинаковыми from-to парами
 * const uniqueLinks = uniqueBy(links, l => `${l.from}-${l.to}`)
 * 
 * @param arr - Массив с возможными дубликатами
 * @param keyFn - Функция для извлечения ключа уникальности
 * @returns Массив без дубликатов (первое вхождение сохраняется)
 */
export function uniqueBy<T, K>(arr: T[], keyFn: (item: T) => K): T[] {
  const seen = new Set<K>()
  return arr.filter((item) => {
    const key = keyFn(item)
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

/**
 * Удаляет falsy значения (null, undefined, false, 0, '').
 * Альтернатива .filter(Boolean), но с правильной типизацией TypeScript.
 * 
 * @example
 * const numbers = compact([1, null, 2, undefined, 3, 0, 4])
 * // [1, 2, 3, 4]
 * 
 * @example
 * const names = compact(['Alice', '', 'Bob', null, 'Charlie'])
 * // ['Alice', 'Bob', 'Charlie']
 * 
 * @param arr - Массив с возможными falsy значениями
 * @returns Массив только с truthy значениями (тип корректно сужен)
 */
export function compact<T>(
  arr: (T | null | undefined | false | 0 | '')[]
): T[] {
  return arr.filter((item): item is T => Boolean(item))
}
