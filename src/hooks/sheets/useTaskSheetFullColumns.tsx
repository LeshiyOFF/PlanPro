import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'
import { ISheetColumn, SheetColumnType } from '@/domain/sheets/interfaces/ISheetColumn'
import { Task } from '@/store/project/interfaces'
import { Lock, Diamond, FolderTree } from 'lucide-react'
import { formatDate, formatDuration } from '@/utils/formatUtils'
import { resolveTimeUnitKey } from '@/utils/TimeUnitMapper'
import { useTaskEstimation } from '@/hooks/task/useTaskEstimation'
import { useAppStore } from '@/store/appStore'
import { CalendarMathService } from '@/domain/services/CalendarMathService'
import { CalendarPreferences } from '@/types/Master_Functionality_Catalog'

/**
 * Хук для получения полных колонок TaskSheet (Лист задач)
 * Включает иконки для вех, суммарных задач и блокировку редактирования
 */
export const useTaskSheetFullColumns = (): ISheetColumn<Task>[] => {
  const { t } = useTranslation()
  const { getFormattedName, formatValue } = useTaskEstimation()
  const { preferences } = useAppStore()

  const preferencesWithCalendar = preferences as { calendar?: CalendarPreferences }
  const calendarPrefs: CalendarPreferences = preferencesWithCalendar.calendar || {
    hoursPerDay: 8, hoursPerWeek: 40, daysPerMonth: 20,
  }

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
      title: `${t('sheets.duration')} (${i18next.t(`units.${resolveTimeUnitKey((preferences as { schedule?: { durationEnteredIn?: number } }).schedule?.durationEnteredIn)}`)})`,
      type: SheetColumnType.DURATION, editable: false, visible: true, sortable: true, resizable: true,
      valueGetter: (row) => {
        const duration = CalendarMathService.calculateDuration(
          new Date(row.startDate), new Date(row.endDate),
          ((preferences as { schedule?: { durationEnteredIn?: number } }).schedule?.durationEnteredIn === 1 ? 'days' : 'hours') as 'days' | 'hours', calendarPrefs,
        )
        return { value: duration.value, unit: duration.unit as 'days' | 'hours' | 'minutes', formatted: formatDuration(duration) }
      },
      formatter: (val, row) => formatValue(typeof val === 'object' && val !== null && 'formatted' in val ? (val as { formatted: string }).formatted : String(val ?? ''), row),
    },
    {
      id: 'progress', field: 'progress', title: t('sheets.progress'), width: 120,
      type: SheetColumnType.PERCENT, editable: (row) => !row.isMilestone && !row.isSummary,
      visible: true, sortable: true, resizable: true,
      formatter: (val, row) => {
        if (row.isMilestone) {
          const numVal = typeof val === 'number' ? val : (typeof val === 'object' && val !== null && 'value' in val ? (val as { value: number }).value : 0)
          return numVal >= 0.5
            ? <span className="text-green-600">✅ {t('sheets.milestone_completed')}</span>
            : <span className="text-slate-500">⬜ {t('sheets.milestone_pending')}</span>
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
  ], [t, preferences, getFormattedName, formatValue, calendarPrefs])
}
