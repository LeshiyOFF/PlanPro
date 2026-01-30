import React, { useMemo, forwardRef } from 'react';
import { ProfessionalSheet, ProfessionalSheetHandle } from './ProfessionalSheet';
import { ISheetColumn, SheetColumnType } from '@/domain/sheets/interfaces/ISheetColumn';
import { Resource } from '@/types/resource-types';
import { useContextMenu } from '@/presentation/contextmenu/providers/ContextMenuProvider';
import { ContextMenuType } from '@/domain/contextmenu/ContextMenuType';
import { formatCurrency, formatRate, formatCalendarName } from '@/utils/formatUtils';
import { useUserPreferences } from '@/components/userpreferences/hooks/useUserPreferences';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { useProjectStore } from '@/store/projectStore';
import { CalendarTemplateService } from '@/domain/calendar/services/CalendarTemplateService';
import { SafeTooltip } from '@/components/ui/Tooltip';
import { CalendarPreview } from '@/components/calendar/CalendarPreview';

interface ResourceSheetProps {
  resources: Resource[];
  onResourceUpdate: (resourceId: string, updates: Partial<Resource>) => void;
  onDeleteResources?: (resourceIds: string[]) => void;
  className?: string;
}

/**
 * ResourceSheet - Специализированная таблица ресурсов на базе профессионального движка.
 */
export const ResourceSheet = forwardRef<ProfessionalSheetHandle, ResourceSheetProps>(({
  resources,
  onResourceUpdate,
  onDeleteResources,
  className = ''
}, ref) => {
  const { t } = useTranslation();
  const { showMenu } = useContextMenu();
  const { preferences } = useUserPreferences();
  const { calendars } = useProjectStore();

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
      tooltip: t('sheets.type_tooltip'),
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
      ],
      // Stage 8.17: Локализованное отображение типа
      formatter: (val) => {
        const typeKey = String(val).toLowerCase();
        return t(`sheets.${typeKey}`) || val;
      }
    },
    {
      id: 'materialLabel',
      field: 'materialLabel',
      title: t('sheets.material_label'),
      tooltip: t('sheets.material_label_tooltip'),
      width: 80,
      type: SheetColumnType.TEXT,
      // Редактируемо только для материалов
      editable: (row: Resource) => row.type === 'Material',
      visible: true,
      sortable: true,
      resizable: true,
      formatter: (val, row) => row.type === 'Material' ? (val || '') : '-'
    },
    {
      id: 'maxUnits',
      field: 'maxUnits',
      title: t('sheets.max_units'),
      tooltip: t('sheets.max_units_tooltip'),
      width: 100,
      type: SheetColumnType.NUMBER, // Меняем на NUMBER для гибкости
      // Блокируем для затратных ресурсов
      editable: (row: Resource) => row.type !== 'Cost',
      visible: true,
      sortable: true,
      resizable: true,
      // Эталонный стандарт: расчет значения для поиска
      valueGetter: (row) => row.type === 'Work' ? (Number(row.maxUnits) || 0) * 100 : row.maxUnits,
      // Stage 8.17: Умное форматирование единиц
      formatter: (val, row) => {
        if (row.type === 'Cost') return <span className="text-slate-400">-</span>;
        if (row.type === 'Work') return `${Math.round(Number(val))}%`;
        // Для материалов: число + метка
        return `${val || 0} ${row.materialLabel || ''}`.trim();
      }
    },
    {
      id: 'standardRate',
      field: 'standardRate',
      title: t('sheets.std_rate'),
      tooltip: t('sheets.std_rate_tooltip'),
      width: 120,
      type: SheetColumnType.NUMBER,
      editable: true,
      visible: true,
      sortable: true,
      resizable: true,
      // Эталонный стандарт: возвращаем чистое число для поиска
      valueGetter: (row) => row.standardRate,
      // Stage 8.19: Умное форматирование ставки в зависимости от типа и ед.изм.
      formatter: (val, row) => {
        const amount = Number(val) || 0;
        if (row.type === 'Cost') {
          return formatCurrency(amount); // Для затрат - просто сумма
        }
        if (row.type === 'Material') {
          // Для материалов - цена / единица (кг, литр, шт)
          const label = row.materialLabel ? ` / ${row.materialLabel}` : '';
          return `${formatCurrency(amount)}${label}`;
        }
        // Для людей - стандартный формат (например, /ч)
        return formatRate(amount);
      }
    },
    {
      id: 'calendarId',
      field: 'calendarId',
      title: t('preferences.default_calendar'),
      tooltip: t('sheets.calendar_tooltip'),
      width: 200,
      type: SheetColumnType.SELECT,
      // Календарь нужен только для людей/оборудования (Work)
      editable: (row: Resource) => row.type === 'Work',
      visible: true,
      sortable: true,
      resizable: true,
      options: calendars.map(cal => {
        const dynamicDesc = CalendarTemplateService.getInstance().generateShortDescription(cal);
        return {
          label: `${cal.name} (${dynamicDesc})`,
          value: cal.id
        };
      }),
      formatter: (val, row) => {
        if (row.type !== 'Work') return <span className="text-slate-400">-</span>;
        const calendar = calendars.find(c => c.id === val);
        
        if (!calendar) {
          return <span className="text-muted-foreground">{formatCalendarName(val as string)}</span>;
        }

        return (
          <SafeTooltip 
            content={<CalendarPreview calendar={calendar} />}
            side="right"
            align="start"
          >
            <span className="cursor-help underline decoration-dotted decoration-slate-300">
              {calendar.name}
            </span>
          </SafeTooltip>
        );
      }
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
  ], [preferences.general.currency, preferences.general.language, preferences.general.dateFormat, preferences.schedule?.workUnit, t, calendars]);

  const handleDataChange = (rowId: string, field: string, value: any) => {
    let finalValue = value;
    const row = resources.find(r => r.id === rowId);
    
    if (field === 'maxUnits' && row) {
      // Для людей 100% = 1.0, для материалов 10 = 10
      if (row.type === 'Work') {
        // Если введено "100" или "100%", переводим в 1.0
        const numeric = parseFloat(String(value).replace('%', ''));
        finalValue = numeric / 100;
      } else {
        finalValue = parseFloat(value);
      }
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
        type: 'resource',
        onDelete: async (r: any) => {
          if (onDeleteResources) {
            onDeleteResources([r.id]);
          }
        }
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
        ref={ref}
        data={resources}
        columns={columns}
        rowIdField="id"
        onDataChange={handleDataChange}
        onContextMenu={handleContextMenu}
        onDeleteRows={onDeleteResources}
      />
    </div>
  );
});


