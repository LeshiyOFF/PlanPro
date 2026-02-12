import React from 'react'
import { useProjectStore } from '@/store/projectStore'
import { useTranslation } from 'react-i18next'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProjectDeadlineIndicatorProps {
  className?: string;
  variant?: 'compact' | 'full';
}

/**
 * Индикатор жёсткого дедлайна проекта (VB.5).
 * Отображает badge с датой, если дедлайн установлен.
 *
 * Clean Architecture: UI Component (Presentation Layer)
 * SOLID: Single Responsibility - отображение статуса дедлайна
 *
 * @version 1.0 - VB.5 Imposed Finish Date Indicator
 */
export const ProjectDeadlineIndicator: React.FC<ProjectDeadlineIndicatorProps> = ({
  className = '',
  variant = 'full',
}) => {
  const { t } = useTranslation()
  const { imposedFinishDate } = useProjectStore()

  if (!imposedFinishDate) return null

  const formattedDate = imposedFinishDate.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
          'bg-gradient-to-br from-emerald-500/10 to-emerald-600/10',
          'border border-emerald-500/20 shadow-sm',
          className
        )}
        title={t('project_props.imposed_finish_date', {
          defaultValue: 'Жёсткий дедлайн (Must Finish By)',
        })}
      >
        <Calendar className="h-3.5 w-3.5 text-emerald-600" />
        <span className="text-xs font-semibold text-emerald-700">
          {formattedDate}
        </span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-xl',
        'bg-gradient-to-br from-emerald-500/10 via-emerald-600/10 to-emerald-700/10',
        'border border-emerald-500/30 shadow-md hover:shadow-lg transition-all',
        className
      )}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
        <Calendar className="h-4 w-4 text-emerald-600" />
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
          {t('project_props.deadline', { defaultValue: 'Дедлайн' })}
        </span>
        <span className="text-sm font-bold text-emerald-900">
          {formattedDate}
        </span>
      </div>
    </div>
  )
}

export default ProjectDeadlineIndicator
