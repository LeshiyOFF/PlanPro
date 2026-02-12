import React from 'react'
import { useTranslation } from 'react-i18next'
import { AlertCircle } from 'lucide-react'

interface ScheduleModeInfoProps {
  canSetDeadline: boolean;
}

/**
 * Компонент информационного сообщения о режиме планирования проекта.
 * VB.12: Показывает текущий режим (Schedule from Start/End) и возможность установки дедлайна.
 * 
 * Clean Architecture: UI Component (Presentation Layer)
 * SOLID: Single Responsibility - отображение информации о режиме планирования
 * 
 * @version 1.0 - VB.12 Schedule Mode Validation
 */
export const ScheduleModeInfo: React.FC<ScheduleModeInfoProps> = ({ canSetDeadline }) => {
  const { t } = useTranslation()

  return (
    <div
      className={`p-4 rounded-xl border ${
        canSetDeadline
          ? 'bg-blue-50 border-blue-200'
          : 'bg-amber-50 border-amber-300'
      }`}
    >
      <div className="flex items-start gap-2">
        <AlertCircle
          className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
            canSetDeadline ? 'text-blue-600' : 'text-amber-600'
          }`}
        />
        <div className="flex-1">
          <p
            className={`text-sm font-semibold mb-1 ${
              canSetDeadline ? 'text-blue-900' : 'text-amber-900'
            }`}
          >
            {canSetDeadline
              ? t('project_props.schedule_from_start', {
                  defaultValue: 'Режим: Планирование от даты начала',
                })
              : t('project_props.schedule_from_end', {
                  defaultValue: 'Режим: Планирование от даты окончания',
                })}
          </p>
          <p
            className={`text-xs leading-relaxed ${
              canSetDeadline ? 'text-blue-700' : 'text-amber-800'
            }`}
          >
            {canSetDeadline
              ? t('project_props.can_set_deadline', {
                  defaultValue:
                    'Вы можете установить жёсткий дедлайн проекта. При просрочке задачи получат отрицательный резерв времени.',
                })
              : t('project_props.cannot_set_deadline', {
                  defaultValue:
                    'Жёсткий дедлайн не поддерживается в текущем режиме планирования. Переключитесь на планирование от даты начала, чтобы использовать эту функцию.',
                })}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ScheduleModeInfo
