import React from 'react'
import { TFunction } from 'i18next'
import { IHelpSection } from '@/types/help'
import { Briefcase, UserPlus, MousePointerClick, Percent, Edit, Calendar } from 'lucide-react'

/**
 * Контент справки для секции TASK_USAGE (Использование задач)
 */
export const getTaskUsageHelpSection = (t: TFunction): IHelpSection => ({
  title: t('help.taskUsage.title', 'Использование задач'),
  subtitle: t('help.taskUsage.subtitle', 'Назначение ресурсов на задачи'),
  icon: <Briefcase size={24} />,
  blocks: [
    {
      title: t('help.taskUsage.purpose.title', 'Назначение'),
      icon: <Briefcase size={20} />,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      content: (
        <div className="space-y-2">
          <p>{t('help.taskUsage.purpose.desc', 'Таблица задач с возможностью назначения ресурсов.')}</p>
          <p>{t('help.taskUsage.purpose.main', 'Основной функционал — распределение ресурсов по задачам и указание процента занятости каждого ресурса на конкретной задаче.')}</p>
        </div>
      ),
    },
    {
      title: t('help.taskUsage.resources.title', 'Работа с ресурсами'),
      icon: <UserPlus size={20} />,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      content: (
        <div className="space-y-2">
          <p className="flex items-center gap-2"><MousePointerClick size={16} className="flex-shrink-0" /> {t('help.taskUsage.resources.assign', 'Клик на колонку "Ресурсы" открывает диалог назначения')}</p>
          <p className="flex items-center gap-2"><Percent size={16} className="flex-shrink-0" /> {t('help.taskUsage.resources.percent', 'Указание процента занятости каждого назначенного ресурса')}</p>
          <p className="flex items-center gap-2"><Edit size={16} className="flex-shrink-0" /> {t('help.taskUsage.resources.progress', 'Редактирование прогресса выполнения задачи')}</p>
          <p className="flex items-center gap-2"><Calendar size={16} className="flex-shrink-0" /> {t('help.taskUsage.resources.dates', 'Изменение дат начала и окончания (для обычных задач)')}</p>
        </div>
      ),
    },
  ],
})
