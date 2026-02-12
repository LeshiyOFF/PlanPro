import React from 'react'
import { TFunction } from 'i18next'
import { IHelpSection } from '@/types/help'
import { FolderTree } from 'lucide-react'

/**
 * Контент справки для секции WBS (Декомпозиция работ)
 */
export const getWbsHelpSection = (t: TFunction): IHelpSection => ({
  title: t('help.wbs.title', 'Декомпозиция работ'),
  subtitle: t('help.wbs.subtitle', 'Иерархическая структура проекта'),
  icon: <FolderTree size={24} />,
  blocks: [
    {
      title: t('help.wbs.hierarchy.title', 'Структура проекта'),
      icon: <FolderTree size={20} />,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      content: (
        <div className="space-y-2">
          <p>{t('help.wbs.hierarchy.desc', 'WBS (Work Breakdown Structure) — это наглядное представление иерархии задач в виде дерева.')}</p>
          <p>{t('help.wbs.hierarchy.purpose', 'Позволяет видеть структуру проекта, группировку задач по этапам и уровни вложенности.')}</p>
          <p><strong>{t('help.wbs.hierarchy.wbsCode', 'Нумерация WBS:')}</strong> {t('help.wbs.hierarchy.wbsCodeDesc', 'Автоматическая нумерация (1.2.3)')}</p>
          <p>{t('help.wbs.hierarchy.collapse', 'Сворачивание/разворачивание веток для удобной навигации по проекту')}</p>
        </div>
      ),
    },
  ],
})
