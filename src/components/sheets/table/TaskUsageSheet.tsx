import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { ProfessionalSheet } from './ProfessionalSheet';
import { ISheetColumn, SheetColumnType } from '@/domain/sheets/interfaces/ISheetColumn';
import { ITaskUsage } from '@/domain/sheets/entities/ITaskUsage';
import { useContextMenu } from '@/presentation/contextmenu/providers/ContextMenuProvider';
import { ContextMenuType } from '@/domain/contextmenu/ContextMenuType';
import { formatDate, formatDuration } from '@/utils/formatUtils';
import { useUserPreferences } from '@/components/userpreferences/hooks/useUserPreferences';
import { useAppStore } from '@/store/appStore';

interface TaskUsageSheetProps {
  data: ITaskUsage[];
  onUpdate?: (id: string, field: string, value: any) => void;
  className?: string;
}

/**
 * TaskUsageSheet - Специализированная таблица использования задач.
 */
export const TaskUsageSheet: React.FC<TaskUsageSheetProps> = ({
  data,
  onUpdate,
  className = ''
}) => {
  const { t } = useTranslation();
  const { showMenu } = useContextMenu();
  const { preferences } = useUserPreferences();

  const columns = useMemo<ISheetColumn<ITaskUsage>[]>(() => [
    {
      id: 'taskName',
      field: 'taskName',
      title: t('sheets.name'),
      width: 250,
      type: SheetColumnType.TEXT,
      editable: true,
      visible: true,
      sortable: true,
      resizable: true
    },
    {
      id: 'startDate',
      field: 'startDate',
      title: t('sheets.start'),
      width: 120,
      type: SheetColumnType.DATE,
      editable: true,
      visible: true,
      sortable: true,
      resizable: true,
      formatter: (val) => formatDate(val)
    },
    {
      id: 'endDate',
      field: 'endDate',
      title: t('sheets.finish'),
      width: 120,
      type: SheetColumnType.DATE,
      editable: true,
      visible: true,
      sortable: true,
      resizable: true,
      formatter: (val) => formatDate(val)
    },
    {
      id: 'duration',
      field: 'duration',
      title: `${t('sheets.duration')} (${i18next.t(`units.${(preferences as any).schedule?.durationEnteredIn || 'days'}`)})`,
      width: 100,
      type: SheetColumnType.DURATION,
      editable: false,
      visible: true,
      sortable: true,
      resizable: true,
      // Усиленная защита от всех типов некорректных данных (Stage 7.19)
      formatter: (val) => {
        // Строгая проверка на отсутствие значения
        if (val === undefined || val === null || val === '') {
          return '0 ' + i18next.t(`units.days`);
        }
        // Если уже строка, вернуть как есть (из ITaskUsage)
        if (typeof val === 'string') return val;
        // Если объект Duration, проверить наличие value
        if (typeof val === 'object' && (val.value === undefined || val.value === null)) {
          return '0 ' + i18next.t(`units.days`);
        }
        // Иначе форматируем (formatDuration уже имеет встроенную защиту)
        return formatDuration(val);
      }
    },
    {
      id: 'percentComplete',
      field: 'percentComplete',
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
      id: 'resources',
      field: 'resources',
      title: t('sheets.resources'),
      width: 200,
      type: SheetColumnType.TEXT,
      editable: false,
      visible: true,
      sortable: false,
      resizable: true
    }
  ], [t, preferences.general.language, preferences.general.dateFormat, preferences.schedule?.durationEnteredIn]);

  const handleContextMenu = (event: React.MouseEvent, row: ITaskUsage) => {
    event.preventDefault();
    showMenu(ContextMenuType.TASK, {
      target: {
        ...row,
        type: 'task'
      },
      position: { 
        x: event.clientX, 
        y: event.clientY 
      }
    });
  };

  return (
    <div className={`flex flex-col h-full overflow-hidden ${className}`}>
      <ProfessionalSheet<ITaskUsage>
        data={data}
        columns={columns}
        rowIdField="id"
        onDataChange={onUpdate}
        onContextMenu={handleContextMenu}
      />
    </div>
  );
};

