import React, { useMemo, forwardRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ProfessionalSheet, ProfessionalSheetHandle } from './ProfessionalSheet';
import { ISheetColumn, SheetColumnType } from '@/domain/sheets/interfaces/ISheetColumn';
import { IResourceUsage } from '@/domain/sheets/entities/IResourceUsage';
import { useContextMenu } from '@/presentation/contextmenu/providers/ContextMenuProvider';
import { ContextMenuType } from '@/domain/contextmenu/ContextMenuType';

interface ResourceUsageSheetProps {
  data: IResourceUsage[];
  onUpdate?: (id: string, field: string, value: unknown) => void;
  onRowClick?: (row: IResourceUsage) => void;
  onDeleteResource?: (resourceId: string) => void;
  className?: string;
}

/** Интерфейс для цели контекстного меню ресурса */
interface ResourceContextTarget extends IResourceUsage {
  type: 'resource';
  onDelete?: (target: IResourceUsage) => Promise<void>;
}

/**
 * ResourceUsageSheet - Специализированная таблица использования ресурсов.
 * Отображает загрузку ресурсов с цветовой индикацией перегрузки.
 */
export const ResourceUsageSheet = forwardRef<ProfessionalSheetHandle, ResourceUsageSheetProps>(({
  data,
  onUpdate,
  onRowClick,
  onDeleteResource,
  className = ''
}, ref) => {
  const { t } = useTranslation();
  const { showMenu } = useContextMenu();

  const columns = useMemo<ISheetColumn<IResourceUsage>[]>(() => [
    {
      id: 'resourceName', field: 'resourceName', title: t('sheets.resource_name'),
      width: 200, type: SheetColumnType.TEXT, editable: true, visible: true, sortable: true, resizable: true
    },
    {
      id: 'assignedPercent', field: 'assignedPercent', title: t('sheets.assigned'),
      width: 120, type: SheetColumnType.PERCENT, editable: false, visible: true, sortable: true, resizable: true,
      formatter: (val) => {
        const percent = Math.round((val || 0) * 100);
        const isOverloaded = val > 1;
        return <span className={isOverloaded ? 'text-red-600 font-bold' : ''}>{percent}%</span>;
      }
    },
    {
      id: 'availablePercent', field: 'availablePercent', title: t('sheets.available'),
      width: 120, type: SheetColumnType.PERCENT, editable: false, visible: true, sortable: true, resizable: true,
      formatter: (val) => {
        const percent = Math.round((val || 0) * 100);
        return <span className={percent === 0 ? 'text-slate-400' : 'text-green-600'}>{percent}%</span>;
      }
    },
    {
      id: 'status', field: 'status', title: t('sheets.status'),
      width: 130, type: SheetColumnType.TEXT, editable: false, visible: true, sortable: true, resizable: true,
      formatter: (val, row) => {
        const isOverloaded = row.assignedPercent > 1;
        const isBusy = row.assignedPercent === 1;
        const colorClass = isOverloaded ? 'text-red-600' : isBusy ? 'text-amber-600' : 'text-green-600';
        return <span className={colorClass}>{val}</span>;
      }
    },
    {
      id: 'workload', field: 'workload', title: t('sheets.workload'),
      width: 120, type: SheetColumnType.TEXT, editable: false, visible: true, sortable: true, resizable: true,
      formatter: (val, row) => {
        const isOverloaded = row.assignedPercent > 1;
        return <span className={isOverloaded ? 'text-red-600 font-medium' : 'text-slate-600'}>{val}</span>;
      }
    }
  ], [t]);

  const handleContextMenu = useCallback((event: React.MouseEvent, row: IResourceUsage) => {
    event.preventDefault();
    
    const target: ResourceContextTarget = {
      ...row,
      type: 'resource',
      onDelete: onDeleteResource 
        ? async (r: IResourceUsage) => onDeleteResource(r.id) 
        : undefined
    };
    
    showMenu(ContextMenuType.RESOURCE, {
      target,
      position: { 
        x: event.clientX, 
        y: event.clientY 
      }
    });
  }, [showMenu, onDeleteResource]);

  return (
    <div className={`flex flex-col h-full overflow-hidden ${className}`}>
      <ProfessionalSheet<IResourceUsage>
        ref={ref}
        data={data}
        columns={columns}
        rowIdField="id"
        onDataChange={onUpdate}
        onContextMenu={handleContextMenu}
        onRowSelect={onRowClick}
      />
    </div>
  );
});

ResourceUsageSheet.displayName = 'ResourceUsageSheet';


