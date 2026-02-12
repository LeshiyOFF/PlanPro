import React from 'react'
import { ViewHeaderProps } from './ViewHeaderTypes'
import { ContextHelp } from '@/components/ui/context-help'
import { cn } from '@/lib/utils'

/**
 * ViewHeader - Tier 1: Title Bar
 *
 * Отображает заголовок с поддержкой Dynamic Accent System.
 *
 * @version 8.14
 */
export const ViewHeader: React.FC<ViewHeaderProps> = ({
  title,
  description,
  icon,
  help,
  className = '',
}) => {
  return (
    <div
      className={cn(
        'view-header-tier1 bg-white/95 backdrop-blur-md border-b border-[hsl(var(--primary-border)/0.5)] px-6 py-3 flex-shrink-0 relative overflow-hidden',
        className,
      )}
      role="banner"
      aria-label={title}
    >
      {/* Тонкий акцентный декор сверху для "эталонности" */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary/40 via-primary/5 to-transparent" />

      <div className="flex items-start justify-between gap-4">
        {/* Левая секция: Иконка + Текст */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {icon && (
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-[hsl(var(--primary-soft))] text-primary shadow-sm shadow-[hsl(var(--primary-shadow-light))] transition-all hover:shadow-md hover:shadow-[hsl(var(--primary-shadow-medium))] cursor-default" aria-hidden="true">
              {React.cloneElement(icon as React.ReactElement, { size: 20 })}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-slate-900 leading-tight tracking-tight truncate">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-slate-500 mt-0.5 leading-relaxed line-clamp-2 font-medium">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Правая секция: Контекстная помощь */}
        {help && (
          <div className="flex-shrink-0 mt-1">
            <ContextHelp
              title={help.title}
              content={help.content}
              section={help.section}
              side="bottom"
            />
          </div>
        )}
      </div>
    </div>
  )
}

