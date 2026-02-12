import React from 'react'
import { TFunction } from 'i18next'
import { IHelpSection } from '@/types/help'
import { Calendar, Move, MousePointer2, Ruler, AlertTriangle } from 'lucide-react'

/**
 * Контент справки для секции CALENDAR (Календарный вид)
 */
export const getCalendarHelpSection = (t: TFunction): IHelpSection => ({
  title: t('help.calendar.title', 'Календарный вид'),
  subtitle: t('help.calendar.subtitle', 'Задачи на календарной сетке'),
  icon: <Calendar size={24} />,
  blocks: [
    {
      title: t('help.calendar.visualization.title', 'Визуализация'),
      icon: <Calendar size={20} />,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      content: (
        <div className="space-y-2">
          <p>{t('help.calendar.visualization.monthly', 'Классический месячный календарь')}</p>
          <p>{t('help.calendar.visualization.tasks', 'Задачи отображаются как полоски на датах')}</p>
          <p>{t('help.calendar.visualization.colors', 'Цвет полосок соответствует цвету задачи')}</p>
        </div>
      ),
    },
    {
      title: t('help.calendar.dragDrop.title', 'Drag & Drop'),
      icon: <Move size={20} />,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      content: (
        <div className="space-y-2">
          <p><MousePointer2 size={14} className="inline-block mr-1 mb-0.5" /> {t('help.calendar.dragDrop.move', 'Перетаскивание задач на другие даты мышью')}</p>
          <p><Ruler size={14} className="inline-block mr-1 mb-0.5" /> {t('help.calendar.dragDrop.duration', 'Длительность задачи сохраняется при перемещении')}</p>
          <p className="text-amber-600 text-xs font-medium"><AlertTriangle size={14} className="inline-block mr-1 mb-0.5" /> {t('help.calendar.dragDrop.conflict', 'При конфликте с зависимостями появится предупреждающий диалог')}</p>
        </div>
      ),
    },
  ],
})
