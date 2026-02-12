import React from 'react'
import { TFunction } from 'i18next'
import { IHelpSection } from '@/types/help'
import { Table } from 'lucide-react'

/**
 * Контент справки для секции TASK_SHEET (Таблица задач)
 */
export const getTaskSheetHelpSection = (t: TFunction): IHelpSection => ({
  title: t('help.taskSheet.title', 'Таблица задач'),
  subtitle: t('help.taskSheet.subtitle', 'Табличное представление задач проекта'),
  icon: <Table size={24} />,
  blocks: [
    {
      title: t('help.taskSheet.columns.title', 'Колонки таблицы'),
      icon: <Table size={20} />,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      content: (
        <div className="space-y-2">
          <ul className="list-disc pl-4 space-y-1 text-sm">
            <li><strong>{t('help.taskSheet.columns.id', 'ID')}</strong> — {t('help.taskSheet.columns.idDesc', 'Уникальный идентификатор задачи')}</li>
            <li><strong>{t('help.taskSheet.columns.name', 'Название')}</strong> — {t('help.taskSheet.columns.nameDesc', 'Наименование задачи (двойной клик → свойства)')}</li>
            <li><strong>{t('help.taskSheet.columns.duration', 'Длительность')}</strong> — {t('help.taskSheet.columns.durationDesc', 'Продолжительность выполнения')}</li>
            <li><strong>{t('help.taskSheet.columns.progress', 'Прогресс')}</strong> — {t('help.taskSheet.columns.progressDesc', 'Процент выполнения (0-100%)')}</li>
            <li><strong>{t('help.taskSheet.columns.start', 'Начало')}</strong> — {t('help.taskSheet.columns.startDesc', 'Дата начала задачи')}</li>
            <li><strong>{t('help.taskSheet.columns.finish', 'Окончание')}</strong> — {t('help.taskSheet.columns.finishDesc', 'Дата завершения задачи')}</li>
            <li><strong>{t('help.taskSheet.columns.slack', 'Резерв')}</strong> — {t('help.taskSheet.columns.slackDesc', 'Запас времени до критического пути')}</li>
          </ul>
        </div>
      ),
    },
  ],
})
