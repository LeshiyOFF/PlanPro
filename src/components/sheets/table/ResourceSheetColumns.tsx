import { ISheetColumn, SheetColumnType } from '@/domain/sheets/interfaces/ISheetColumn';
import { Resource } from '@/types/resource-types';
import { formatCurrency, formatRate, formatCalendarName } from '@/utils/formatUtils';
import { IWorkCalendar } from '@/domain/calendar/interfaces/IWorkCalendar';
import { CalendarTemplateService } from '@/domain/calendar/services/CalendarTemplateService';
import { SafeTooltip } from '@/components/ui/tooltip';
import { CalendarPreview } from '@/components/calendar/CalendarPreview';

/**
 * Функция для создания колонок таблицы ресурсов
 */
export function createResourceColumns(
  t: (key: string) => string,
  calendars: IWorkCalendar[]
): ISheetColumn<Resource>[] {
  return [
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
      formatter: (val, _row) => {
        const typeKey = String(val).toLowerCase();
        return t(`sheets.${typeKey}`) || String(val);
      }
    },
    {
      id: 'materialLabel',
      field: 'materialLabel',
      title: t('sheets.material_label'),
      tooltip: t('sheets.material_label_tooltip'),
      width: 80,
      type: SheetColumnType.TEXT,
      editable: (row: Resource) => row.type === 'Material',
      visible: true,
      sortable: true,
      resizable: true,
      formatter: (val, row) => (row.type === 'Material' ? String(val ?? '') : '-')
    },
    {
      id: 'maxUnits',
      field: 'maxUnits',
      title: t('sheets.max_units'),
      tooltip: t('sheets.max_units_tooltip'),
      width: 100,
      type: SheetColumnType.NUMBER,
      editable: (row: Resource) => row.type !== 'Cost',
      visible: true,
      sortable: true,
      resizable: true,
      valueGetter: (row) =>
        row.type === 'Work' ? (Number(row.maxUnits) || 0) * 100 : row.maxUnits,
      formatter: (val, row) => {
        if (row.type === 'Cost') return <span className="text-slate-400">-</span>;
        if (row.type === 'Work') return `${Math.round(Number(val))}%`;
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
      valueGetter: (row) => row.standardRate,
      formatter: (val, row) => {
        const amount = Number(val) || 0;
        if (row.type === 'Cost') return formatCurrency(amount);
        if (row.type === 'Material') {
          const label = row.materialLabel ? ` / ${row.materialLabel}` : '';
          return `${formatCurrency(amount)}${label}`;
        }
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
      editable: (row: Resource) => row.type === 'Work',
      visible: true,
      sortable: true,
      resizable: true,
      options: calendars.map((cal) => {
        const dynamicDesc =
          CalendarTemplateService.getInstance().generateShortDescription(cal);
        return {
          label: `${cal.name} (${dynamicDesc})`,
          value: cal.id
        };
      }),
      formatter: (val, row) => {
        if (row.type !== 'Work') return <span className="text-slate-400">-</span>;
        const calendar = calendars.find((c) => c.id === val);

        if (!calendar) {
          return (
            <span className="text-muted-foreground">
              {formatCalendarName(val as string)}
            </span>
          );
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
  ];
}
