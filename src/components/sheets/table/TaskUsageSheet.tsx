import React, { useMemo, forwardRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { ProfessionalSheet, type ProfessionalSheetHandle } from './ProfessionalSheet';
import { ISheetColumn, SheetColumnType } from '@/domain/sheets/interfaces/ISheetColumn';
import { ITaskUsage } from '@/domain/sheets/entities/ITaskUsage';
import { CellValue } from '@/types/sheet/CellValueTypes';
import { useContextMenu } from '@/presentation/contextmenu/providers/ContextMenuProvider';
import { ContextMenuType } from '@/domain/contextmenu/ContextMenuType';
import { formatDate, formatDuration } from '@/utils/formatUtils';
import { resolveTimeUnitKey } from '@/utils/TimeUnitMapper';
import { useUserPreferences } from '@/components/userpreferences/hooks/useUserPreferences';
import { ResourceSelectPopup } from '../popups/ResourceSelectPopup';
import { Resource } from '@/types/resource-types';
import { ResourceAssignment } from '@/store/project/interfaces';
import { Lock, Diamond, FolderTree } from 'lucide-react';
import type { JsonValue } from '@/types/json-types';
import type { ContextMenuTarget } from '@/domain/contextmenu/entities/ContextMenu';

/** Тип строки для ProfessionalSheet */
type TaskUsageRow = ITaskUsage & Record<string, JsonValue>;

/** Тип значения при обновлении ячейки: примитив или массив назначений ресурсов */
type TaskUsageUpdateValue = CellValue | ResourceAssignment[];

interface TaskUsageSheetProps {
  data: ITaskUsage[];
  resources: Resource[];
  onUpdate?: (id: string, field: string, value: TaskUsageUpdateValue) => void;
  onDeleteTask?: (taskId: string) => void;
  onShowTaskProperties?: (taskId: string) => void;
  className?: string;
}

/**
 * TaskUsageSheet - Таблица использования задач с иерархией и выбором ресурсов
 */
export const TaskUsageSheet = forwardRef<ProfessionalSheetHandle, TaskUsageSheetProps>(({
  data, resources, onUpdate, onDeleteTask, onShowTaskProperties, className = ''
}, ref) => {
  const { t } = useTranslation();
  const { showMenu } = useContextMenu();
  const { preferences } = useUserPreferences();

  const [resourcePopupOpen, setResourcePopupOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskName, setEditingTaskName] = useState<string>('');
  const [editingAssignments, setEditingAssignments] = useState<ResourceAssignment[]>([]);

  const handleResourceEdit = useCallback((row: TaskUsageRow, _columnId: string) => {
    setEditingTaskId(row.id);
    setEditingTaskName(row.taskName);
    setEditingAssignments(row.resourceAssignments || []);
    setResourcePopupOpen(true);
  }, []);

  const handleResourceSave = useCallback((assignments: ResourceAssignment[]) => {
    if (editingTaskId && onUpdate) {
      onUpdate(editingTaskId, 'resourceAssignments', assignments);
    }
  }, [editingTaskId, onUpdate]);

  // Извлекаем примитивные значения для стабильных зависимостей useMemo
  const durationUnit = preferences.schedule?.durationEnteredIn;
  
  const toDateOrEmpty = (val: CellValue): string => {
    if (val == null) return '';
    if (typeof val === 'string' || typeof val === 'number' || val instanceof Date) {
      return formatDate(val);
    }
    return '';
  };

  const toDurationOrEmpty = (val: CellValue): string => {
    if (val == null) return formatDuration(null);
    if (typeof val === 'number') return formatDuration(val);
    if (typeof val === 'object' && val !== null && 'value' in val && typeof (val as { value: number }).value === 'number') {
      return formatDuration((val as { value: number; unit: string }).value);
    }
    return formatDuration(null);
  };

  const columns = useMemo<ISheetColumn<TaskUsageRow>[]>(() => [
    {
      id: 'taskName', field: 'taskName', title: t('sheets.name'), width: 280,
      type: SheetColumnType.TEXT, editable: true, visible: true, sortable: true, resizable: true,
      formatter: (val, row) => (
        <div style={{ paddingLeft: `${(row.level - 1) * 20}px` }} className="flex items-center gap-1">
          {row.level > 1 && <span className="text-slate-300 text-lg">↳</span>}
          {row.milestone && <Diamond className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
          {row.summary && <FolderTree className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />}
          <span className={row.summary ? 'font-bold text-slate-900' : ''}>{String(val ?? '')}</span>
        </div>
      )
    },
    { id: 'startDate', field: 'startDate', title: t('sheets.start'), width: 110,
      type: SheetColumnType.DATE, editable: (row) => !row.summary, visible: true,
      sortable: true, resizable: true, formatter: (val) => toDateOrEmpty(val) },
    { id: 'endDate', field: 'endDate', title: t('sheets.finish'), width: 110,
      type: SheetColumnType.DATE, editable: (row) => !row.summary, visible: true,
      sortable: true, resizable: true, formatter: (val) => toDateOrEmpty(val) },
    { 
      id: 'duration', field: 'duration', width: 100,
      title: `${t('sheets.duration')} (${i18next.t(`units.${resolveTimeUnitKey(durationUnit)}`)})`,
      type: SheetColumnType.TEXT, editable: false, visible: true, sortable: true, resizable: true,
      formatter: (val) => toDurationOrEmpty(val)
    },
    {
      id: 'percentComplete', field: 'percentComplete', title: t('sheets.progress'), width: 120,
      type: SheetColumnType.PERCENT, editable: (row) => !row.milestone && !row.summary,
      visible: true, sortable: true, resizable: true,
      formatter: (val, row) => {
        const num = Number(val ?? 0);
        if (row.milestone) {
          return num >= 0.5
            ? <span className="text-green-600">✅ {t('sheets.milestone_completed')}</span>
            : <span className="text-slate-500">⬜ {t('sheets.milestone_pending')}</span>;
        }
        if (row.summary) {
          return <span className="flex items-center gap-1 text-slate-600">
            <Lock className="w-3 h-3" />{Math.round(num * 100)}%
          </span>;
        }
        return `${Math.round(num * 100)}%`;
      }
    },
    {
      id: 'resources', field: 'resources', title: t('sheets.resources'), width: 180,
      type: SheetColumnType.TEXT, editable: false, visible: true, sortable: false, resizable: true,
      onCustomEdit: handleResourceEdit,
      formatter: (val) => <span className="text-primary cursor-pointer hover:underline">{String(val ?? '')}</span>
    }
  ], [t, durationUnit, handleResourceEdit]);

  const handleContextMenu = (event: React.MouseEvent, row: TaskUsageRow) => {
    event.preventDefault();
    showMenu(ContextMenuType.TASK, {
      target: {
        ...row,
        type: 'task',
        onDelete: onDeleteTask ? async (target: ITaskUsage) => onDeleteTask(target.id) : undefined,
        onShowProperties: onShowTaskProperties ? async (target: ITaskUsage) => onShowTaskProperties(target.id) : undefined
      } as ContextMenuTarget,
      position: { x: event.clientX, y: event.clientY }
    });
  };

  const sheetData = data as TaskUsageRow[];

  return (
    <div className={`flex flex-col h-full overflow-hidden ${className}`}>
      <ProfessionalSheet<TaskUsageRow>
        ref={ref} data={sheetData} columns={columns} rowIdField="id"
        onDataChange={onUpdate}
        onContextMenu={handleContextMenu}
      />
      <ResourceSelectPopup
        isOpen={resourcePopupOpen} onClose={() => setResourcePopupOpen(false)}
        resources={resources} assignments={editingAssignments}
        onSave={handleResourceSave} taskName={editingTaskName}
      />
    </div>
  );
});

TaskUsageSheet.displayName = 'TaskUsageSheet';
