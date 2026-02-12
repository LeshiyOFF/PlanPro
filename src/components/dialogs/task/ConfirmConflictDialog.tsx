import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ShieldAlert, X } from 'lucide-react'
import type { DependencyConflictKind } from '@/domain/services/TaskLinkService'

export interface ConfirmConflictDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  /** Тип конфликта: разный текст для «раньше предшественника» и «во время/в момент окончания». */
  conflictKind?: DependencyConflictKind;
}

/**
 * Второе модальное окно при выборе «Я знаю, что делаю». Дизайн как SummaryTaskDialog:
 * акцентная шапка, белое тело, схема-предупреждение, футер на белом.
 */
export const ConfirmConflictDialog: React.FC<ConfirmConflictDialogProps> = ({
  open,
  onClose,
  onConfirm,
  conflictKind = 'during_or_end',
}) => {
  const { t } = useTranslation()
  const isBeforePredecessor = conflictKind === 'before_predecessor'

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="p-0 border-none overflow-hidden max-w-[480px] rounded-2xl shadow-2xl bg-[hsl(var(--primary))] gap-0"
        hideClose={true}
      >
        <div className="p-8 pb-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 opacity-70 hover:opacity-100 transition-all p-2 rounded-full hover:bg-white/10 z-50"
          >
            <X size={20} />
          </button>
          <DialogTitle className="text-2xl font-black tracking-tight uppercase">
            {t('gantt.confirm_conflict_title', { defaultValue: 'Подтверждение действия' })}
          </DialogTitle>
          <DialogDescription className="text-[hsl(var(--primary-foreground)/0.8)] text-[10px] font-bold mt-1 uppercase tracking-[0.3em]">
            {isBeforePredecessor
              ? t('gantt.confirm_conflict_subtitle_before_predecessor', {
                  defaultValue: 'Преемник начинается раньше предшественника',
                })
              : t('gantt.confirm_conflict_subtitle_during_or_end', {
                  defaultValue: 'Преемник начинается во время выполнения или в момент окончания предшественника',
                })}
          </DialogDescription>
        </div>

        <div className="bg-white rounded-t-2xl p-8 space-y-8">
          <div className="flex flex-col items-center py-2">
            <div className="flex items-center gap-4 bg-amber-50 border border-amber-200 p-4 pr-6 rounded-2xl shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
                <ShieldAlert size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest leading-none mb-1">
                  {t('gantt.confirm_conflict_diagram_caption', { defaultValue: 'Без автокоррекции дат' })}
                </span>
                <span className="text-sm font-black text-slate-900">
                  {isBeforePredecessor
                    ? t('gantt.confirm_conflict_subtitle_before_predecessor', {
                        defaultValue: 'Преемник начинается раньше предшественника',
                      })
                    : t('gantt.confirm_conflict_subtitle_during_or_end', {
                        defaultValue: 'Преемник начинается во время выполнения или в момент окончания предшественника',
                      })}
                </span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 shadow-inner">
            <p className="text-[13px] text-slate-600 leading-relaxed font-medium">
              {isBeforePredecessor
                ? t('gantt.confirm_conflict_message_before_predecessor', {
                    defaultValue:
                      'Даты не будут автоматически скорректированы. Связь будет сохранена в текущем виде. Это может привести к некорректному отображению расписания и расчёту критического пути. Продолжить?',
                  })
                : t('gantt.confirm_conflict_message_during_or_end', {
                    defaultValue:
                      'Даты останутся без изменений. По правилам планирования преемник рекомендуется начинать со следующего дня после окончания предшественника. Вы подтверждаете сохранение текущих дат?',
                  })}
            </p>
          </div>
        </div>

        <DialogFooter className="p-8 pt-4 bg-white flex flex-row gap-4">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1 h-12 text-slate-400 font-bold hover:bg-slate-50 hover:text-slate-900 transition-all rounded-xl"
          >
            {t('common.cancel', { defaultValue: 'Отмена' })}
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 h-12 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] text-white font-black uppercase tracking-wider shadow-xl shadow-[hsl(var(--primary)/0.25)] transition-all active:scale-[0.97] rounded-xl"
          >
            {t('gantt.confirm_conflict_confirm', { defaultValue: 'Подтвердить' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
