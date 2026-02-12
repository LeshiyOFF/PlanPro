import React, { useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  Button,
} from '@/components/ui'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { IHelpModalProps } from '@/types/help'
import { getHelpContent } from '@/data/helpContent'
import { HelpBlockItem } from './help-block-item'

/**
 * HelpModal - Модальное окно справки
 * Дизайн идентичен SummaryTaskDialog и DependencyConflictDialog
 * Ширина увеличена до 700px для удобного чтения
 */
export const HelpModal: React.FC<IHelpModalProps> = ({
  isOpen,
  onClose,
  sectionId,
}) => {
  const { t } = useTranslation()
  
  // Получаем контент для секции
  const section = useMemo(
    () => getHelpContent(sectionId, t),
    [sectionId, t]
  )

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="p-0 border-none overflow-hidden max-w-[700px] max-h-[90vh] rounded-2xl shadow-2xl bg-[hsl(var(--primary))] gap-0 flex flex-col"
        hideClose={true}
      >
        {/* Акцентная шапка */}
        <div className="p-8 pb-6 text-white relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 opacity-70 hover:opacity-100 transition-all p-2 rounded-full hover:bg-white/10 z-50"
            aria-label={t('common.close', 'Закрыть')}
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-4">
            {/* Иконка секции */}
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white">
              {section.icon}
            </div>
            
            {/* Заголовки */}
            <div>
              <DialogTitle className="text-2xl font-black tracking-tight uppercase">
                {section.title}
              </DialogTitle>
              <DialogDescription className="text-[hsl(var(--primary-foreground)/0.8)] text-[10px] font-bold mt-1 uppercase tracking-[0.3em]">
                {section.subtitle}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Тело со скроллом */}
        <div className="bg-white rounded-t-2xl flex-1 min-h-0 overflow-y-auto p-8 space-y-6">
          {section.blocks.map((block, idx) => (
            <HelpBlockItem key={idx} block={block} index={idx} />
          ))}
        </div>

        {/* Футер */}
        <DialogFooter className="p-6 bg-white flex-shrink-0 border-t border-slate-100">
          <Button
            onClick={onClose}
            className="w-full h-12 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] text-white font-black uppercase tracking-wider shadow-xl shadow-[hsl(var(--primary)/0.25)] transition-all active:scale-[0.97] rounded-xl"
          >
            {t('help.understood', 'Понятно')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

HelpModal.displayName = 'HelpModal'
