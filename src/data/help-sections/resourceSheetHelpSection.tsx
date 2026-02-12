import React from 'react'
import { TFunction } from 'i18next'
import { IHelpSection } from '@/types/help'
import { Users, Table, CalendarDays } from 'lucide-react'

/**
 * Контент справки для секции RESOURCE_SHEET (Таблица ресурсов)
 */
export const getResourceSheetHelpSection = (t: TFunction): IHelpSection => ({
  title: t('help.resourceSheet.title', 'Таблица ресурсов'),
  subtitle: t('help.resourceSheet.subtitle', 'Управление ресурсами проекта'),
  icon: <Users size={24} />,
  blocks: [
    {
      title: t('help.resourceSheet.types.title', 'Типы ресурсов'),
      icon: <Users size={20} />,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      content: (
        <div className="space-y-2">
          <p><strong>{t('help.resourceSheet.types.work', 'Труд')}</strong> — {t('help.resourceSheet.types.workDesc', 'Люди, специалисты, исполнители')}</p>
          <p><strong>{t('help.resourceSheet.types.material', 'Материал')}</strong> — {t('help.resourceSheet.types.materialDesc', 'Расходные материалы, комплектующие')}</p>
          <p><strong>{t('help.resourceSheet.types.cost', 'Затраты')}</strong> — {t('help.resourceSheet.types.costDesc', 'Фиксированные расходы (аренда, лицензии)')}</p>
        </div>
      ),
    },
    {
      title: t('help.resourceSheet.columns.title', 'Колонки таблицы'),
      icon: <Table size={20} />,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      content: (
        <div className="space-y-2">
          <ul className="list-disc pl-4 space-y-1 text-sm">
            <li><strong>{t('help.resourceSheet.columns.name', 'Название')}</strong> — {t('help.resourceSheet.columns.nameDesc', 'Имя ресурса')}</li>
            <li><strong>{t('help.resourceSheet.columns.type', 'Тип')}</strong> — {t('help.resourceSheet.columns.typeDesc', 'Труд / Материал / Затраты')}</li>
            <li><strong>{t('help.resourceSheet.columns.unit', 'Единица измерения')}</strong> — {t('help.resourceSheet.columns.unitDesc', 'Для материалов (шт, кг, м³)')}</li>
            <li><strong>{t('help.resourceSheet.columns.maxUnits', 'Макс. единиц')}</strong> — {t('help.resourceSheet.columns.maxUnitsDesc', 'Доступность в % или количество')}</li>
            <li><strong>{t('help.resourceSheet.columns.rate', 'Станд. ставка')}</strong> — {t('help.resourceSheet.columns.rateDesc', 'Стоимость часа или единицы')}</li>
            <li><strong>{t('help.resourceSheet.columns.calendar', 'Календарь')}</strong> — {t('help.resourceSheet.columns.calendarDesc', 'Рабочий календарь (для трудовых)')}</li>
            <li><strong>{t('help.resourceSheet.columns.group', 'Группа')}</strong> — {t('help.resourceSheet.columns.groupDesc', 'Категория ресурса')}</li>
          </ul>
        </div>
      ),
    },
    {
      title: t('help.resourceSheet.calendars.title', 'Рабочие календари'),
      icon: <CalendarDays size={20} />,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
      content: (
        <div className="space-y-2">
          <p>{t('help.resourceSheet.calendars.personal', 'Каждый трудовой ресурс может иметь свой рабочий календарь')}</p>
          <p><strong>{t('help.resourceSheet.calendars.default', 'По умолчанию:')}</strong> {t('help.resourceSheet.calendars.defaultDesc', '8 часов в день, 5 дней в неделю')}</p>
          <p className="text-xs italic text-slate-500">{t('help.resourceSheet.calendars.note', 'Календарь влияет на расчёт длительности задач')}</p>
        </div>
      ),
    },
  ],
})
