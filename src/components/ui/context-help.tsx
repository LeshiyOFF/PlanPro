import React, { useState, useCallback } from 'react'
import { HelpCircle } from 'lucide-react'
import { SafeTooltip } from './tooltip'
import { useUserPreferences } from '@/components/userpreferences/hooks/useUserPreferences'
import { cn } from '@/lib/utils'
import { HelpSectionId } from '@/types/help'
import { HelpModal } from './help-modal'

interface ContextHelpProps {
  /** Заголовок справки (для tooltip и aria-label) */
  title: string
  /** Контент для tooltip (обратная совместимость) */
  content: React.ReactNode
  /** ID секции для модального окна (если указан - открывается модальное окно) */
  section?: HelpSectionId
  /** Дополнительные CSS-классы */
  className?: string
  /** Сторона отображения tooltip (если section не указан) */
  side?: 'top' | 'bottom' | 'left' | 'right'
}

/**
 * Компонент контекстной помощи
 * - Если указан section: открывает модальное окно со справкой
 * - Если section не указан: показывает tooltip (обратная совместимость)
 * - Учитывает настройку showTips из пользовательских предпочтений
 */
export const ContextHelp: React.FC<ContextHelpProps> = ({
  title,
  content,
  section,
  className = '',
  side = 'bottom',
}) => {
  const { preferences } = useUserPreferences()
  const showTips = preferences.display.showTips
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleClick = useCallback(() => {
    if (section) {
      setIsModalOpen(true)
    }
  }, [section])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  if (!showTips) {
    return null
  }

  // Если указана секция - используем кнопку с модальным окном
  if (section) {
    return (
      <div className={cn('inline-block', className)}>
        <button
          onClick={handleClick}
          className="text-muted-foreground hover:text-primary transition-colors focus:outline-none p-1 rounded-full hover:bg-primary/10"
          aria-label={`Помощь: ${title}`}
        >
          <HelpCircle size={18} />
        </button>
        <HelpModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          sectionId={section}
        />
      </div>
    )
  }

  // Обратная совместимость: без section показываем tooltip
  return (
    <div className={cn('inline-block', className)}>
      <SafeTooltip
        content={
          <div className="max-w-xs p-2">
            <h4 className="font-bold border-b border-border pb-1 mb-2 text-sm">{title}</h4>
            <div className="text-xs space-y-2 leading-relaxed">
              {content}
            </div>
          </div>
        }
        side={side}
        align="end"
      >
        <button
          className="text-muted-foreground hover:text-primary transition-colors focus:outline-none"
          aria-label={`Помощь: ${title}`}
        >
          <HelpCircle size={18} />
        </button>
      </SafeTooltip>
    </div>
  )
}

ContextHelp.displayName = 'ContextHelp'
