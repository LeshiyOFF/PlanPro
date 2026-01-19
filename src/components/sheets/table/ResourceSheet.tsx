import React, { useMemo } from 'react';
import { ProfessionalSheet } from './ProfessionalSheet';
import { ISheetColumn, SheetColumnType } from '@/domain/sheets/interfaces/ISheetColumn';
import { Resource } from '@/types/resource-types';
import { useContextMenu } from '@/presentation/contextmenu/providers/ContextMenuProvider';
import { ContextMenuType } from '@/domain/contextmenu/ContextMenuType';
import { formatCurrency, formatRate, formatCalendarName } from '@/utils/formatUtils';
import { useUserPreferences } from '@/components/userpreferences/hooks/useUserPreferences';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

interface ResourceSheetProps {
  resources: Resource[];
  onResourceUpdate: (resourceId: string, updates: Partial<Resource>) => void;
  className?: string;
}

/**
 * ResourceSheet - Специализированная таблица ресурсов на базе профессионального движка.
 */
export const ResourceSheet: React.FC<ResourceSheetProps> = ({
  resources,
  onResourceUpdate,
  className = ''
}) => {
  const { t } = useTranslation();
  const { showMenu } = useContextMenu();
  const { preferences } = useUserPreferences();

  const columns = useMemo<ISheetColumn<Resource>[]>(() => [
    {
      id: 'name',
      field: 'name',
      title: t('sheets.resource_name'),
      width: 200,
      type: SheetColumnType.TEXT,
      editable: true,
      visible: true,
      sortable: true,
      resizable: true
    },
    {
      id: 'type',
      field: 'type',
      title: t('sheets.type'),
      width: 100,
      type: SheetColumnType.SELECT,
      editable: true,
      visible: true,
      sortable: true,
      resizable: true,
      options: [
        { label: t('sheets.work'), value: 'Work' },
        { label: t('sheets.material'), value: 'Material' },
        { label: t('sheets.cost'), value: 'Cost' }
      ]
    },
    {
      id: 'maxUnits',
      field: 'maxUnits',
      title: t('sheets.max_units'),
      width: 100,
      type: SheetColumnType.PERCENT,
      editable: true,
      visible: true,
      sortable: true,
      resizable: true,
      formatter: (val) => `${Math.round((val || 0) * 100)}%`
    },
    {
      id: 'standardRate',
      field: 'standardRate',
      title: `${t('sheets.std_rate')} (${i18next.t(`units.${(preferences as any).schedule?.workUnit || 'hours'}`)})`,
      width: 120,
      type: SheetColumnType.NUMBER,
      editable: true,
      visible: true,
      sortable: true,
      resizable: true,
      formatter: (val) => formatRate(Number(val))
    },
    {
      id: 'calendarId',
      field: 'calendarId',
      title: t('preferences.default_calendar'),
      width: 150,
      type: SheetColumnType.SELECT,
      editable: true,
      visible: true,
      sortable: true,
      resizable: true,
      options: [
        { label: t('calendars.standard'), value: 'Standard' },
        { label: t('calendars.night_shift'), value: 'Night Shift' },
        { label: t('calendars.24_hours'), value: '24 Hours' }
      ],
      formatter: (val) => formatCalendarName(val as string)
    },
    {
      id: 'group',
      field: 'group',
      title: t('sheets.group'),
      width: 150,
      type: SheetColumnType.TEXT,
      editable: true,
      visible: true,
      sortable: true,
      resizable: true
    }
  ], [preferences.general.currency, preferences.general.language, preferences.general.dateFormat, preferences.schedule?.workUnit, t]);

  const handleDataChange = (rowId: string, field: string, value: any) => {
    let finalValue = value;
    if (field === 'maxUnits') {
      finalValue = parseFloat(value) / 100;
      if (isNaN(finalValue)) return;
    } else if (field === 'standardRate') {
      finalValue = parseFloat(value);
      if (isNaN(finalValue)) return;
    }
    
    onResourceUpdate(rowId, { [field]: finalValue });
  };

  const handleContextMenu = (event: React.MouseEvent, row: Resource) => {
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
      <ProfessionalSheet<Resource>
        data={resources}
        columns={columns}
        rowIdField="id"
        onDataChange={handleDataChange}
        onContextMenu={handleContextMenu}
      />
    </div>
  );
};

