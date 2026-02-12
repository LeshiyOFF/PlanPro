import React from 'react'
import { TFunction } from 'i18next'
import { IHelpSection } from '@/types/help'
import { Users, AlertTriangle, Table } from 'lucide-react'

/**
 * Контент справки для секции RESOURCE_USAGE (Загрузка ресурсов)
 */
export const getResourceUsageHelpSection = (t: TFunction): IHelpSection => ({
  title: t('help.resourceUsage.title', 'Загрузка ресурсов'),
  subtitle: t('help.resourceUsage.subtitle', 'Анализ занятости ресурсов'),
  icon: <Users size={24} />,
  blocks: [
    {
      title: t('help.resourceUsage.columns.title', 'Колонки таблицы'),
      icon: <Table size={20} />,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      content: (
        <div className="space-y-2">
          <ul className="list-disc pl-4 space-y-1 text-sm">
            <li><strong>{t('help.resourceUsage.columns.name', 'Название ресурса')}</strong> — {t('help.resourceUsage.columns.nameDesc', 'Имя сотрудника или материала')}</li>
            <li><strong>{t('help.resourceUsage.columns.assigned', 'Назначено')}</strong> — {t('help.resourceUsage.columns.assignedDesc', 'Суммарный процент загрузки ресурса')}</li>
            <li><strong>{t('help.resourceUsage.columns.available', 'Доступно')}</strong> — {t('help.resourceUsage.columns.availableDesc', 'Свободная ёмкость ресурса')}</li>
            <li><strong>{t('help.resourceUsage.columns.status', 'Статус')}</strong> — {t('help.resourceUsage.columns.statusDesc', 'Свободен / Занят / Перегружен')}</li>
            <li><strong>{t('help.resourceUsage.columns.workload', 'Нагрузка')}</strong> — {t('help.resourceUsage.columns.workloadDesc', 'Детализация загрузки')}</li>
          </ul>
        </div>
      ),
    },
    {
      title: t('help.resourceUsage.overallocation.title', 'Перегрузка ресурсов'),
      icon: <AlertTriangle size={20} />,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-50',
      content: (
        <div className="space-y-2">
          <p>{t('help.resourceUsage.overallocation.desc', 'Перегрузка возникает, когда суммарная загрузка ресурса превышает 100%.')}</p>
          <p><strong className="text-red-600">{t('help.resourceUsage.overallocation.indicator', 'Красным цветом')}</strong> {t('help.resourceUsage.overallocation.indicatorDesc', 'выделяются перегруженные ресурсы.')}</p>
          <div className="mt-2 p-2 bg-emerald-50 rounded-lg text-xs">
            <p className="font-semibold">{t('help.resourceUsage.overallocation.fix', 'Как исправить:')}</p>
            <p className="mt-1">{t('help.resourceUsage.overallocation.solution', 'Перераспределите процент занятости ресурсов на задачах или назначьте дополнительных исполнителей.')}</p>
          </div>
        </div>
      ),
    },
  ],
})
