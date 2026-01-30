import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { ISheetColumn, SheetColumnType } from '@/domain/sheets/interfaces/ISheetColumn';
import { Task } from '@/types/task-types';
import { Lock, Diamond, FolderTree } from 'lucide-react';
import { formatDate, formatDuration } from '@/utils/formatUtils';
import { resolveTimeUnitKey } from '@/utils/TimeUnitMapper';
import { useTaskEstimation } from '@/hooks/task/useTaskEstimation';
import { useAppStore } from '@/store/appStore';
import { CalendarMathService } from '@/domain/services/CalendarMathService';
import { CalendarPreferences } from '@/types/Master_Functionality_Catalog';

/**
 * Хук для получения полных колонок TaskSheet (Лист задач)
 * Включает иконки для вех, суммарных задач и блокировку редактирования
 */
export const useTaskSheetFullColumns = (): ISheetColumn<Task>[] => {
  const { t } = useTranslation();
  const { getFormattedName, formatValue } = useTaskEstimation();
  const { preferences } = useAppStore();
  
  const calendarPrefs: CalendarPreferences = (preferences as unknown as { calendar: CalendarPreferences }).calendar || {
    hoursPerDay: 8, hoursPerWeek: 40, daysPerMonth: 20
  };

  return useMemo<ISheetColumn<Task>[]>(() => [
    { id: 'id', field: 'id', title: t('sheets.id'), width: 60,
      type: SheetColumnType.TEXT, editable: false, visible: true, sortable: true, resizable: true },
    {
      id: 'name', field: 'name', title: t('sheets.name'), width: 280,
      type: SheetColumnType.TEXT, editable: true, visible: true, sortable: true, resizable: true,
      formatter: (val, row) => (
        <div style={{ paddingLeft: `${(row.level - 1) * 20}px` }} className="flex items-center gap-1">
          {row.level > 1 && <span className="text-slate-300 text-lg">↳</span>}
          {row.milestone && <Diamond className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
          {row.summary && <FolderTree className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />}
          <span className={row.summary ? 'font-bold text-slate-900' : ''}>{getFormattedName(row)}</span>
        </div>
      )
    },
    {
      id: 'duration', field: 'duration', width: 100,
      title: `${t('sheets.duration')} (${i18next.t(`units.${resolveTimeUnitKey((preferences as unknown as { schedule?: { durationEnteredIn?: number } }).schedule?.durationEnteredIn)}`)})`,
      type: SheetColumnType.DURATION, editable: false, visible: true, sortable: true, resizable: true,
      valueGetter: (row) => CalendarMathService.calculateDuration(
        new Date(row.startDate), new Date(row.endDate),
        (preferences as unknown as { schedule?: { durationEnteredIn?: string } }).schedule?.durationEnteredIn || 'days', calendarPrefs
      ),
      formatter: (val, row) => formatValue(formatDuration(val), row)
    },
    {
      id: 'progress', field: 'progress', title: t('sheets.progress'), width: 120,
      type: SheetColumnType.PERCENT, editable: (row) => !row.milestone && !row.summary,
      visible: true, sortable: true, resizable: true,
      formatter: (val, row) => {
        if (row.milestone) {
          return val >= 0.5 
            ? <span className="text-green-600">✅ {t('sheets.milestone_completed')}</span>
            : <span className="text-slate-500">⬜ {t('sheets.milestone_pending')}</span>;
        }
        if (row.summary) {
          return <span className="flex items-center gap-1 text-slate-600">
            <Lock className="w-3 h-3" />{Math.round((val || 0) * 100)}%
          </span>;
        }
        return `${Math.round((val || 0) * 100)}%`;
      }
    },
    { id: 'startDate', field: 'startDate', title: t('sheets.start'), width: 110,
      type: SheetColumnType.DATE, editable: (row: Task) => !row.summary,
      visible: true, sortable: true, resizable: true, formatter: (val) => formatDate(val) },
    { id: 'endDate', field: 'endDate', title: t('sheets.finish'), width: 110,
      type: SheetColumnType.DATE, editable: (row: Task) => !row.summary,
      visible: true, sortable: true, resizable: true, formatter: (val) => formatDate(val) },
    {
      id: 'predecessors', field: 'predecessors', title: t('sheets.predecessors'), width: 150,
      type: SheetColumnType.TEXT, editable: true, visible: true, sortable: true, resizable: true,
      valueGetter: (row) => Array.isArray(row.predecessors) && row.predecessors.length > 0 
        ? Number(row.predecessors[0]) || 0 : row.predecessors,
      formatter: (val) => Array.isArray(val) ? val.join(', ') : val
    }
  ], [t, preferences, getFormattedName, formatValue, calendarPrefs]);
};
