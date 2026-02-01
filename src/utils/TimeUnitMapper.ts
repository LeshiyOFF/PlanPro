/**
 * Маппинг числовых TimeUnit (из Java API) в строковые ключи локализации
 *
 * Используется для корректного отображения единиц времени в UI
 */
const TIME_UNIT_MAP: Record<number, string> = {
  3: 'minutes',
  4: 'hours',
  5: 'days',
  6: 'weeks',
  7: 'months',
}

/**
 * Преобразует числовой или строковый код TimeUnit в строку для локализации
 *
 * @param unit - Код единицы времени (число или строка)
 * @returns Строковый ключ для i18n (например, 'days', 'hours')
 *
 * @example
 * resolveTimeUnitKey(5)      // 'days'
 * resolveTimeUnitKey('5')    // 'days'
 * resolveTimeUnitKey('days') // 'days'
 * resolveTimeUnitKey(undefined) // 'days'
 */
export const resolveTimeUnitKey = (unit: number | string | undefined): string => {
  if (typeof unit === 'number') {
    return TIME_UNIT_MAP[unit] || 'days'
  }

  if (typeof unit === 'string') {
    const parsed = parseInt(unit, 10)
    if (!isNaN(parsed) && TIME_UNIT_MAP[parsed]) {
      return TIME_UNIT_MAP[parsed]
    }
    return unit
  }

  return 'days'
}
