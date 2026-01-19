import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { ProfessionalSheet } from './ProfessionalSheet';
import { ISheetColumn, SheetColumnType } from '@/domain/sheets/interfaces/ISheetColumn';
import { Task } from '@/types/task-types';
import { Lock, Link2, AlertCircle } from 'lucide-react';
import { formatDate, formatDuration } from '@/utils/formatUtils';
import { useTaskEstimation } from '@/hooks/task/useTaskEstimation';
import { useAppStore } from '@/store/appStore';
import { CalendarMathService } from '@/domain/services/CalendarMathService';
import { CalendarPreferences } from '@/types/Master_Functionality_Catalog';

interface TaskSheetProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onContextMenu?: (event: React.MouseEvent, task: Task) => void;
  onRowSelect?: (task: Task) => void;
  onDeleteTasks?: (taskIds: string[]) => void;
  disabledTaskIds?: string[];
  className?: string;
  variant?: 'compact' | 'full';
}

/**
 * TaskSheet - Специализированная таблица задач.
 */
export const TaskSheet: React.FC<TaskSheetProps> = ({
  tasks,
  onTaskUpdate,
  onContextMenu,
  onRowSelect,
  onDeleteTasks,
  disabledTaskIds = [],
  className = '',
  variant = 'full'
}) => {
  const { t } = useTranslation();
  const { getFormattedName, formatValue } = useTaskEstimation();
  
  const { preferences } = useAppStore();
  const calendarPrefs: CalendarPreferences = (preferences as any).calendar || {
    hoursPerDay: 8,
    hoursPerWeek: 40,
    daysPerMonth: 20
  };

  const columns = useMemo<ISheetColumn<Task>[]>(() => {
    if (variant === 'compact') {
      return [
        {
          id: 'id',
          field: 'id',
          title: t('sheets.id'),
          width: 45,
          type: SheetColumnType.TEXT,
          editable: false,
          visible: true,
          sortable: true,
          resizable: true,
          formatter: (val, row) => {
            const isDisabled = disabledTaskIds.includes(row.id);
            return (
              <div className="flex items-center gap-1">
                {isDisabled ? (
                   <div className="flex items-center">
                     <Lock size={10} className="text-slate-400" />
                   </div>
                ) : (
                  <span className="text-[10px] font-mono text-slate-400">{val}</span>
                )}
              </div>
            );
          }
        },
        {
          id: 'task',
          field: 'name',
          title: t('sheets.task_info'),
          width: 215,
          type: SheetColumnType.TEXT,
          editable: true,
          visible: true,
          sortable: true,
          resizable: true,
          formatter: (val, row) => (
            <div className="flex flex-col py-0.5 leading-none overflow-hidden select-none" style={{ paddingLeft: `${(row.level - 1) * 12}px` }}>
              <div className="font-bold text-[11px] truncate text-slate-700 mb-1">
                {row.level > 1 && <span className="text-slate-300 mr-1">↳</span>}
                {getFormattedName(row)}
              </div>
              <div className="text-[9px] text-slate-400 flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-primary font-bold bg-primary/10 px-1 rounded-sm">
                  {Math.round((row.progress || 0) * 100)}%
                </span>
                <span className="text-slate-300">|</span>
                <span className="flex items-center gap-0.5">
                  {formatDate(row.startDate)}
                  <span className="text-slate-300">→</span>
                  {formatDate(row.endDate)}
                </span>
                {row.predecessors && row.predecessors.length > 0 && (
                  <>
                    <span className="text-slate-300">|</span>
                    <span className="text-amber-600 font-medium">🔗 {row.predecessors.join(',')}</span>
                  </>
                )}
              </div>
            </div>
          )
        }
      ];
    }

    // Полный вариант для вкладки Task Sheet
    return [
      {
        id: 'id',
        field: 'id',
        title: t('sheets.id'),
        width: 60,
        type: SheetColumnType.TEXT,
        editable: false,
        visible: true,
        sortable: true,
        resizable: true
      },
      {
        id: 'name',
        field: 'name',
        title: t('sheets.name'),
        width: 250,
        type: SheetColumnType.TEXT,
        editable: true,
        visible: true,
        sortable: true,
        resizable: true,
        formatter: (val, row) => (
          <div style={{ paddingLeft: `${(row.level - 1) * 20}px` }} className="flex items-center">
            {row.level > 1 && <span className="text-slate-300 mr-2 text-lg">↳</span>}
            <span className={row.level === 1 ? 'font-bold' : ''}>{getFormattedName(row)}</span>
          </div>
        )
      },
      {
        id: 'duration',
        field: 'duration',
        title: `${t('sheets.duration')} (${i18next.t(`units.${(preferences as any).schedule?.durationEnteredIn || 'days'}`)})`,
        width: 100,
        type: SheetColumnType.TEXT,
        editable: false,
        visible: true,
        sortable: false,
        resizable: true,
        formatter: (_, row) => {
          const duration = CalendarMathService.calculateDuration(
            new Date(row.startDate),
            new Date(row.endDate),
            (preferences as any).schedule?.durationEnteredIn || 'days',
            calendarPrefs
          );
          return formatValue(formatDuration(duration), row);
        }
      },
      {
        id: 'progress',
        field: 'progress',
        title: t('sheets.progress'),
        width: 100,
        type: SheetColumnType.PERCENT,
        editable: true,
        visible: true,
        sortable: true,
        resizable: true,
        formatter: (val) => `${Math.round((val || 0) * 100)}%`
      },
      {
        id: 'startDate',
        field: 'startDate',
        title: t('sheets.start'),
        width: 110,
        type: SheetColumnType.DATE,
        // Блокировка редактирования для Summary Tasks (Stage 7.19)
        editable: (row: Task) => !row.summary,
        visible: true,
        sortable: true,
        resizable: true,
        formatter: (val) => formatDate(val)
      },
      {
        id: 'endDate',
        field: 'endDate',
        title: t('sheets.finish'),
        width: 110,
        type: SheetColumnType.DATE,
        // Блокировка редактирования для Summary Tasks (Stage 7.19)
        editable: (row: Task) => !row.summary,
        visible: true,
        sortable: true,
        resizable: true,
        formatter: (val) => formatDate(val)
      },
      {
        id: 'predecessors',
        field: 'predecessors',
        title: t('sheets.predecessors'),
        width: 150,
        type: SheetColumnType.TEXT,
        editable: true,
        visible: true,
        sortable: false,
        resizable: true,
        formatter: (val) => Array.isArray(val) ? val.join(', ') : val
      }
    ];
  }, [variant, t, disabledTaskIds, preferences.general?.dateFormat, preferences.general?.language, getFormattedName, formatValue]);

  const handleDataChange = (rowId: string, field: string, value: any) => {
    let finalValue = value;
    if (field === 'progress' && typeof value === 'string') {
      finalValue = parseFloat(value) / 100;
    } else if (field === 'predecessors' && typeof value === 'string') {
      finalValue = value.split(',').map(s => s.trim()).filter(s => s !== '');
    } else if ((field === 'startDate' || field === 'endDate') && value) {
      // Нормализация даты при вводе из таблицы (Stage 7.18)
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        if (field === 'startDate') {
          date.setHours(0, 0, 0, 0);
        } else {
          // Для даты окончания ставим конец дня, чтобы захватить весь рабочий день
          date.setHours(23, 59, 59, 999);
        }
        finalValue = date;
      }
    }
    onTaskUpdate(rowId, { [field]: finalValue });
  };

  return (
    <div className={`h-full flex flex-col bg-white overflow-hidden ${className}`}>
      <ProfessionalSheet<Task>
        data={tasks}
        columns={columns}
        rowIdField="id"
        onDataChange={handleDataChange}
        onContextMenu={onContextMenu}
        onRowSelect={onRowSelect}
        onDeleteRows={onDeleteTasks}
        disabledRowIds={disabledTaskIds}
        className="border-none rounded-none"
      />
    </div>
  );
};

