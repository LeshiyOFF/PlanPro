import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'
import { ISheetColumn, SheetColumnType } from '@/domain/sheets/interfaces/ISheetColumn'
import { Task } from '@/store/project/interfaces'
import { Lock, Diamond, FolderTree, Check, X } from 'lucide-react'
import { formatDate, formatDuration } from '@/utils/formatUtils'
import { resolveTimeUnitKey } from '@/utils/TimeUnitMapper'
import { useTaskEstimation } from '@/hooks/task/useTaskEstimation'
import { useUserPreferences } from '@/components/userpreferences/hooks/useUserPreferences'
import { CalendarMathService } from '@/domain/services/CalendarMathService'
import { CalendarPreferences } from '@/types/Master_Functionality_Catalog'
import type { Duration } from '@/types/Master_Functionality_Catalog'
import { renderSlack } from '@/utils/slackFormatter'

/** Колбэк обновления прогресса (для вех — переключение выполнен/не выполнен) */
export type OnProgressUpdate = (taskId: string, progress: number) => void

/**
 * Хук для получения полных колонок TaskSheet (Лист задач)
 * Включает иконки для вех, чекбокс для отметки выполнения, суммарные задачи.
 * Настройки берутся из UserPreferencesService для немедленного отражения смены единицы длительности.
 */
export const useTaskSheetFullColumns = (onProgressUpdate?: OnProgressUpdate): ISheetColumn<Task>[] => {
  const { t } = useTranslation()
  const { getFormattedName, formatValue } = useTaskEstimation()
  const { preferences } = useUserPreferences()

  const preferencesWithCalendar = preferences as { calendar?: CalendarPreferences; schedule?: { durationEnteredIn?: number } }
  const calendarPrefs: CalendarPreferences = preferencesWithCalendar.calendar ?? {
    hoursPerDay: 8, hoursPerWeek: 40, daysPerMonth: 20,
  }
  const durationUnitKey = resolveTimeUnitKey(preferencesWithCalendar.schedule?.durationEnteredIn) as Duration['unit']

  return useMemo<ISheetColumn<Task>[]>(() => [
    { id: 'id', field: 'id', title: t('sheets.id'), width: 60,
      type: SheetColumnType.TEXT, editable: false, visible: true, sortable: true, resizable: true },
    {
      id: 'name', field: 'name', title: t('sheets.name'), width: 280,
      type: SheetColumnType.TEXT, editable: true, visible: true, sortable: true, resizable: true,
      formatter: (_val, row) => (
        <div style={{ paddingLeft: `${(row.level - 1) * 20}px` }} className="flex items-center gap-1">
          {row.level > 1 && <span className="text-slate-300 text-lg">↳</span>}
          {row.isMilestone && <Diamond className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
          {row.isSummary && <FolderTree className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />}
          <span className={row.isSummary ? 'font-bold text-slate-900' : ''}>{getFormattedName(row)}</span>
        </div>
      ),
    },
    {
      id: 'duration', field: 'duration', width: 100,
      title: `${t('sheets.duration')} (${i18next.t(`units.${durationUnitKey}`)})`,
      type: SheetColumnType.DURATION,
      // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Колонка теперь редактируемая (кроме суммарных задач)
      editable: (row: Task) => !row.isSummary && !row.isMilestone,
      visible: true, sortable: true, resizable: true,
      valueGetter: (row) => {
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Используем task.duration если есть, иначе вычисляем из дат
        // Это обеспечивает корректную синхронизацию с Java Core для CPM расчётов
        let durationValue: number
        
        if (row.duration != null && row.duration > 0) {
          // Приоритет 1: Используем сохранённое значение duration (синхронизировано с Java)
          durationValue = row.duration
        } else {
          // Fallback: Вычисляем из дат (для совместимости со старыми данными)
          const calculated = CalendarMathService.calculateDuration(
            new Date(row.startDate), new Date(row.endDate), 'days', calendarPrefs,
          )
          durationValue = calculated.value
        }
        
        // Конвертируем в выбранные единицы если нужно
        const duration = durationUnitKey === 'days' 
          ? { value: durationValue, unit: durationUnitKey }
          : CalendarMathService.convertDuration({ value: durationValue, unit: 'days' }, durationUnitKey, calendarPrefs)
        
        return { value: Math.round(duration.value * 100) / 100, unit: duration.unit, formatted: formatDuration(duration) }
      },
      formatter: (val, row) => formatValue(typeof val === 'object' && val !== null && 'formatted' in val ? (val as { formatted: string }).formatted : String(val ?? ''), row),
    },
    {
      id: 'progress', field: 'progress', title: t('sheets.progress'), width: 120,
      type: SheetColumnType.PERCENT, editable: (row) => !row.isSummary,
      visible: true, sortable: true, resizable: true,
      formatter: (val, row) => {
        if (row.isMilestone) {
          const numVal = typeof val === 'number' ? val : (typeof val === 'object' && val !== null && 'value' in val ? (val as { value: number }).value : 0)
          return numVal >= 0.5
            ? <span className="flex items-center gap-1.5 text-green-600"><Check className="w-4 h-4 flex-shrink-0" />{t('sheets.milestone_completed')}</span>
            : <span className="flex items-center gap-1.5 text-slate-500"><X className="w-4 h-4 flex-shrink-0" />{t('sheets.milestone_pending')}</span>
        }
        if (row.isSummary) {
          const pct = typeof val === 'number' ? val : 0
          return <span className="flex items-center gap-1 text-slate-600">
            <Lock className="w-3 h-3" />{Math.round(pct * 100)}%
          </span>
        }
        const pct = typeof val === 'number' ? val : 0
        return `${Math.round(pct * 100)}%`
      },
    },
    { id: 'startDate', field: 'startDate', title: t('sheets.start'), width: 110,
      type: SheetColumnType.DATE, editable: (row: Task) => !row.isSummary,
      visible: true, sortable: true, resizable: true, formatter: (val) => formatDate(val as string | number | Date) },
    { id: 'endDate', field: 'endDate', title: t('sheets.finish'), width: 110,
      type: SheetColumnType.DATE, editable: (row: Task) => !row.isSummary,
      visible: true, sortable: true, resizable: true, formatter: (val) => formatDate(val as string | number | Date) },
    {
      id: 'predecessors', field: 'predecessors', title: t('sheets.predecessors'), width: 150,
      type: SheetColumnType.TEXT, editable: true, visible: true, sortable: true, resizable: true,
      valueGetter: (row): string => Array.isArray(row.predecessors) && row.predecessors.length > 0
        ? (row.predecessors[0] ?? '') as string : (row.predecessors ?? []).join(', '),
      formatter: (val): string => typeof val === 'string' ? val : String(val ?? ''),
    },
    {
      id: 'totalSlack',
      field: 'totalSlack',
      title: t('sheets.total_slack', { defaultValue: 'Резерв' }),
      width: 100,
      type: SheetColumnType.NUMBER,
      editable: false,
      visible: true,
      sortable: true,
      resizable: true,
      // CPM-MS.10: Для summary показываем minChildSlack, для leaf — totalSlack
      formatter: (val, row) => renderSlack(
        typeof val === 'number' ? val : null,
        {
          isCritical: row.isCritical ?? false,
          isSummary: row.isSummary ?? false,
          minChildSlack: row.minChildSlack,
        }
      ),
    },
  ], [t, preferences, getFormattedName, formatValue, calendarPrefs, durationUnitKey, onProgressUpdate])
}
