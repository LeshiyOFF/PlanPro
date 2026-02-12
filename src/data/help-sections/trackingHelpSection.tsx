import React from 'react'
import { TFunction } from 'i18next'
import { IHelpSection } from '@/types/help'
import { GitCompare, Lock } from 'lucide-react'

/**
 * Контент справки для секции TRACKING (Отслеживание).
 * Только режим мониторинга: назначение представления и список заблокированных действий.
 */
export const getTrackingHelpSection = (t: TFunction): IHelpSection => ({
  title: t('help.tracking.title', 'Отслеживание'),
  subtitle: t('help.tracking.subtitle', 'Режим только для чтения'),
  icon: <GitCompare size={24} />,
  blocks: [
    {
      title: t('help.tracking.readonly.title', 'Режим мониторинга'),
      icon: <Lock size={20} />,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
      content: (
        <div className="space-y-2">
          <p>{t('help.tracking.readonly.purpose', 'Данное представление предназначено исключительно для визуального отслеживания прогресса и анализа отклонений от базового плана.')}</p>
          <p><strong>{t('help.tracking.readonly.blocked', 'Заблокировано:')}</strong></p>
          <ul className="list-disc pl-4 space-y-1 text-sm">
            <li>{t('help.tracking.readonly.noDrag', 'Изменение дат через перетаскивание')}</li>
            <li>{t('help.tracking.readonly.noProgress', 'Изменение прогресса выполнения')}</li>
            <li>{t('help.tracking.readonly.noEdit', 'Редактирование через контекстное меню')}</li>
          </ul>
          <p className="text-xs italic text-emerald-600">{t('help.tracking.readonly.hint', 'Для внесения изменений используйте основную диаграмму Ганта')}</p>
        </div>
      ),
    },
  ],
})
