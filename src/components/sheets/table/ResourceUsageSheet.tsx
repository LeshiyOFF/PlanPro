import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ProfessionalSheet } from './ProfessionalSheet';
import { ISheetColumn, SheetColumnType } from '@/domain/sheets/interfaces/ISheetColumn';
import { IResourceUsage } from '@/domain/sheets/entities/IResourceUsage';
import { useContextMenu } from '@/presentation/contextmenu/providers/ContextMenuProvider';
import { ContextMenuType } from '@/domain/contextmenu/ContextMenuType';
import { useUserPreferences } from '@/components/userpreferences/hooks/useUserPreferences';

interface ResourceUsageSheetProps {
  data: IResourceUsage[];
  onUpdate?: (id: string, field: string, value: any) => void;
  onRowClick?: (row: IResourceUsage) => void;
  className?: string;
}

/**
 * ResourceUsageSheet - Специализированная таблица использования ресурсов.
 */
export const ResourceUsageSheet: React.FC<ResourceUsageSheetProps> = ({
  data,
  onUpdate,
  onRowClick,
  className = ''
}) => {
  const { t } = useTranslation();
  const { showMenu } = useContextMenu();
  const { preferences } = useUserPreferences();

  const columns = useMemo<ISheetColumn<IResourceUsage>[]>(() => [
    {
      id: 'resourceName',
      field: 'resourceName',
      title: t('sheets.resource_name'),
      width: 200,
      type: SheetColumnType.TEXT,
      editable: true,
      visible: true,
      sortable: true,
      resizable: true
    },
    {
      id: 'assignedPercent',
      field: 'assignedPercent',
      title: t('sheets.assigned'),
      width: 120,
      type: SheetColumnType.PERCENT,
      editable: true,
      visible: true,
      sortable: true,
      resizable: true,
      formatter: (val) => `${Math.round((val || 0) * 100)}%`
    },
    {
      id: 'availablePercent',
      field: 'availablePercent',
      title: t('sheets.available'),
      width: 120,
      type: SheetColumnType.PERCENT,
      editable: true,
      visible: true,
      sortable: true,
      resizable: true,
      formatter: (val) => `${Math.round((val || 0) * 100)}%`
    },
    {
      id: 'status',
      field: 'status',
      title: t('sheets.status'),
      width: 120,
      type: SheetColumnType.TEXT,
      editable: false,
      visible: true,
      sortable: true,
      resizable: true
    },
    {
      id: 'workload',
      field: 'workload',
      title: t('sheets.workload'),
      width: 120,
      type: SheetColumnType.TEXT,
      editable: false,
      visible: true,
      sortable: true,
      resizable: true
    }
  ], [t, preferences.general.language, preferences.general.dateFormat]);

  const handleContextMenu = (event: React.MouseEvent, row: IResourceUsage) => {
    event.preventDefault();
    showMenu(ContextMenuType.RESOURCE, {
      target: {
        ...row,
        type: 'resource'
      },
      position: { 
        x: event.clientX, 
        y: event.clientY 
      }
    });
  };

  return (
    <div className={`flex flex-col h-full overflow-hidden ${className}`}>
      <ProfessionalSheet<IResourceUsage>
        data={data}
        columns={columns}
        rowIdField="id"
        onDataChange={onUpdate}
        onContextMenu={handleContextMenu}
        onRowSelect={onRowClick}
      />
    </div>
  );
};


