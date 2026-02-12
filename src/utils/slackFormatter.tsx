import React from 'react'
import i18next from 'i18next'

/**
 * Утилита форматирования резерва времени (slack) задач.
 * VB.6: Поддержка отрицательных значений (просрочка) с визуальной индикацией.
 * 
 * Clean Architecture: Utility (Infrastructure Layer)
 * SOLID: Single Responsibility - форматирование slack values
 * 
 * @version 1.0 - VB.6 Negative Slack Support
 */

export interface SlackFormattedValue {
  days: number;
  isNegative: boolean;
  isZero: boolean;
  formatted: string;
}

/**
 * Форматирует значение резерва времени (slack) из дней в читаемую строку.
 * 
 * @param slackInDays резерв времени в днях (может быть отрицательным)
 * @returns объект с форматированными данными
 */
export function formatSlack(slackInDays: number | undefined | null): SlackFormattedValue {
  if (slackInDays === undefined || slackInDays === null) {
    return {
      days: 0,
      isNegative: false,
      isZero: true,
      formatted: '—',
    }
  }

  const days = Math.round(slackInDays)
  const isNegative = days < 0
  const isZero = days === 0
  const absDays = Math.abs(days)
  
  const daysLabel = i18next.t('gantt.days', { defaultValue: 'дн.' })
  
  if (isZero) {
    return { days: 0, isNegative: false, isZero: true, formatted: `0 ${daysLabel}` }
  }
  
  const sign = isNegative ? '−' : '+'
  const formatted = `${sign}${absDays} ${daysLabel}`
  
  return { days, isNegative, isZero, formatted }
}

/**
 * Опции рендеринга slack для расширенной поддержки CPM-MS.10.
 */
export interface RenderSlackOptions {
  isCritical?: boolean;
  isSummary?: boolean;
  minChildSlack?: number;
}

/**
 * Рендерит JSX элемент для отображения резерва времени с цветовой индикацией.
 * VB.6: Отрицательные значения выделяются красным, положительные - синим.
 * CPM-MS.10: Для summary задач показывает minChildSlack с пометкой (min).
 * 
 * @param slackInDays резерв времени в днях
 * @param isCriticalOrOptions флаг критического пути или объект опций
 * @returns JSX элемент с форматированным slack
 */
export function renderSlack(
  slackInDays: number | undefined | null,
  isCriticalOrOptions: boolean | RenderSlackOptions = false
): React.ReactElement {
  const options: RenderSlackOptions = typeof isCriticalOrOptions === 'boolean' 
    ? { isCritical: isCriticalOrOptions }
    : isCriticalOrOptions
  
  const { isCritical = false, isSummary = false, minChildSlack } = options
  
  // CPM-MS.10: Для summary задач показываем minChildSlack вместо totalSlack
  if (isSummary) {
    return renderSummarySlack(minChildSlack)
  }
  
  const { isNegative, isZero, formatted } = formatSlack(slackInDays)
  
  if (isCritical || isZero) {
    return <span className="text-slate-400 font-medium">{formatted}</span>
  }
  
  const colorClass = isNegative ? 'text-red-600' : 'text-blue-600'
  
  return <span className={`font-semibold ${colorClass}`}>{formatted}</span>
}

/**
 * CPM-MS.10: Рендерит slack для summary задач с пометкой (min).
 * По стандарту MS Project slack summary бессмысленен, показываем min(children.slack).
 */
function renderSummarySlack(minChildSlack: number | undefined): React.ReactElement {
  if (minChildSlack === undefined || minChildSlack === null) {
    return <span className="text-slate-400 font-medium" title="Нет данных о дочерних задачах">—</span>
  }
  
  const { isNegative, formatted } = formatSlack(minChildSlack)
  const colorClass = isNegative ? 'text-red-600' : 'text-slate-500'
  
  return (
    <span className={`font-medium ${colorClass}`} title="Минимальный резерв среди дочерних задач">
      {formatted} <span className="text-slate-400 text-xs">(min)</span>
    </span>
  )
}

export default { formatSlack, renderSlack }
