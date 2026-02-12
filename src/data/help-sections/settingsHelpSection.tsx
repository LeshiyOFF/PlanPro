import React from 'react'
import { TFunction } from 'i18next'
import { IHelpSection } from '@/types/help'
import { Settings, CalendarClock, BarChart, Globe, Calendar, DollarSign, Palette, Clock, CalendarDays, Ruler, ArrowLeftRight } from 'lucide-react'

/**
 * Контент справки для секции SETTINGS (Настройки)
 */
export const getSettingsHelpSection = (t: TFunction): IHelpSection => ({
  title: t('help.settings.title', 'Настройки'),
  subtitle: t('help.settings.subtitle', 'Конфигурация приложения'),
  icon: <Settings size={24} />,
  blocks: [
    {
      title: t('help.settings.general.title', 'Общие'),
      icon: <Settings size={20} />,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      content: (
        <div className="space-y-2">
          <p className="flex items-center gap-2"><Globe size={16} className="flex-shrink-0" /> {t('help.settings.general.language', 'Язык интерфейса')}</p>
          <p className="flex items-center gap-2"><Calendar size={16} className="flex-shrink-0" /> {t('help.settings.general.dateFormat', 'Формат дат и времени')}</p>
          <p className="flex items-center gap-2"><DollarSign size={16} className="flex-shrink-0" /> {t('help.settings.general.currency', 'Валюта')}</p>
          <p className="flex items-center gap-2"><Palette size={16} className="flex-shrink-0" /> {t('help.settings.general.theme', 'Тема оформления')}</p>
        </div>
      ),
    },
    {
      title: t('help.settings.scheduling.title', 'Планирование'),
      icon: <CalendarClock size={20} />,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      content: (
        <div className="space-y-2">
          <p className="flex items-center gap-2"><Clock size={16} className="flex-shrink-0" /> {t('help.settings.scheduling.hoursPerDay', 'Часы в рабочем дне')}</p>
          <p className="flex items-center gap-2"><CalendarDays size={16} className="flex-shrink-0" /> {t('help.settings.scheduling.daysPerWeek', 'Дни в рабочей неделе')}</p>
          <div className="mt-2 p-2 bg-slate-50 rounded-lg text-xs">
            <p className="font-semibold">{t('help.settings.scheduling.rules', 'Правила планирования:')}</p>
            <ul className="list-disc pl-4 space-y-1 mt-1">
              <li><strong>Fixed Duration:</strong> {t('help.settings.scheduling.fixedDuration', 'Фиксированная длительность')}</li>
              <li><strong>Fixed Units:</strong> {t('help.settings.scheduling.fixedUnits', 'Фиксированная загрузка ресурса')}</li>
              <li><strong>Fixed Work:</strong> {t('help.settings.scheduling.fixedWork', 'Фиксированный объём работы')}</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: t('help.settings.gantt.title', 'Диаграмма Ганта'),
      icon: <BarChart size={20} />,
      iconColor: 'text-violet-600',
      iconBg: 'bg-violet-50',
      content: (
        <div className="space-y-2">
          <p className="flex items-center gap-2"><Palette size={16} className="flex-shrink-0" /> {t('help.settings.gantt.colorModes', 'Режимы раскраски (единый цвет, радуга, по статусу)')}</p>
          <p className="flex items-center gap-2"><Ruler size={16} className="flex-shrink-0" /> {t('help.settings.gantt.rowHeight', 'Высота строк')}</p>
          <p className="flex items-center gap-2"><ArrowLeftRight size={16} className="flex-shrink-0" /> {t('help.settings.gantt.arrows', 'Отображение стрелок зависимостей')}</p>
          <p className="flex items-center gap-2"><Calendar size={16} className="flex-shrink-0" /> {t('help.settings.gantt.weekends', 'Подсветка выходных дней')}</p>
        </div>
      ),
    },
  ],
})
