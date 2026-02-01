/**
 * ProgressFormatter - Утилита для единообразного форматирования процентов
 *
 * Решает проблему IEEE 754 floating-point precision:
 * - 28 / 100 = 0.2800000000000000266... (артефакт)
 * - 0.28 * 100 = 28.000000000000004 (артефакт)
 *
 * Принцип: округление применяется только при ОТОБРАЖЕНИИ и ФИНАЛИЗАЦИИ,
 * чтобы избежать накопления ошибок при многократных операциях.
 *
 * @module utils/ProgressFormatter
 * @version 1.0.0
 */

/**
 * Конвертирует дробное значение (0-1) в целые проценты (0-100)
 * с устранением IEEE 754 артефактов
 *
 * @param fraction - Дробное значение (0.28)
 * @returns Целое число процентов (28)
 *
 * @example
 * toPercent(0.28) // => 28
 * toPercent(0.2800000000000000266) // => 28
 */
export const toPercent = (fraction: number): number => {
  return Math.round(fraction * 100)
}

/**
 * Конвертирует проценты (0-100) в дробное значение (0-1)
 * с нормализацией для устранения IEEE 754 артефактов
 *
 * @param percent - Значение в процентах (28)
 * @returns Нормализованное дробное значение (0.28)
 *
 * @example
 * toFraction(28) // => 0.28
 * toFraction(28.5) // => 0.29 (округление до целого процента)
 */
export const toFraction = (percent: number): number => {
  // Сначала округляем до целого процента, затем делим
  const roundedPercent = Math.round(percent)
  // Используем целочисленное деление для минимизации ошибок
  return roundedPercent / 100
}

/**
 * Форматирует дробное значение для отображения в UI
 *
 * @param fraction - Дробное значение (0.28)
 * @param showSymbol - Добавлять символ % (по умолчанию true)
 * @returns Отформатированная строка ("28%" или "28")
 *
 * @example
 * formatProgress(0.28) // => "28%"
 * formatProgress(0.28, false) // => "28"
 */
export const formatProgress = (fraction: number, showSymbol = true): string => {
  const percent = toPercent(fraction)
  return showSymbol ? `${percent}%` : String(percent)
}

/**
 * Нормализует дробное значение прогресса, устраняя IEEE 754 артефакты
 * Используется перед сохранением в Store или отправкой на сервер
 *
 * @param fraction - Исходное дробное значение
 * @returns Нормализованное значение без артефактов
 *
 * @example
 * normalizeFraction(0.2800000000000000266) // => 0.28
 * normalizeFraction(0.2899999999999999911) // => 0.29
 */
export const normalizeFraction = (fraction: number): number => {
  // Ограничиваем диапазон 0-1
  const clamped = Math.max(0, Math.min(1, fraction))
  // Округляем до 2 знаков после запятой через целочисленную арифметику
  return Math.round(clamped * 100) / 100
}

/**
 * Проверяет, является ли значение валидным прогрессом
 *
 * @param value - Проверяемое значение
 * @returns true если значение в диапазоне 0-1
 */
export const isValidProgress = (value: number): boolean => {
  return typeof value === 'number' &&
         !isNaN(value) &&
         isFinite(value) &&
         value >= 0 &&
         value <= 1
}

/**
 * Безопасно парсит строковый ввод процентов
 *
 * @param input - Строка ввода ("28", "28%", "28.5")
 * @returns Нормализованное дробное значение или null при ошибке
 *
 * @example
 * parsePercentInput("28") // => 0.28
 * parsePercentInput("28%") // => 0.28
 * parsePercentInput("abc") // => null
 */
export const parsePercentInput = (input: string): number | null => {
  // Удаляем символ % и пробелы
  const cleaned = input.replace(/%/g, '').trim()
  const parsed = parseFloat(cleaned)

  if (isNaN(parsed)) {
    return null
  }

  // Ограничиваем диапазон 0-100 и конвертируем в дробь
  const clamped = Math.max(0, Math.min(100, parsed))
  return toFraction(clamped)
}
