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
import { CalendarClock, Link2Off, ShieldAlert, Undo2, X } from 'lucide-react'
import { DependencyConflictDiagram } from './DependencyConflictDiagram'
import type { DependencyConflictResult, DependencyConflictKind } from '@/domain/services/TaskLinkService'

export type DependencyConflictAction =
  | 'adjust_dates'
  | 'remove_link'
  | 'confirm_without_fix'
  | 'cancel'

export interface DependencyConflictDialogProps {
  open: boolean;
  onClose: () => void;
  conflict: DependencyConflictResult;
  onAction: (action: DependencyConflictAction) => void;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Диалог конфликта дат при создании связи. Дизайн как SummaryTaskDialog:
 * акцентная шапка, белое тело, схема предшественник→конфликт→преемник, футер на белом.
 */
export const DependencyConflictDialog: React.FC<DependencyConflictDialogProps> = ({
  open,
  onClose,
  conflict,
  onAction,
}) => {
  const { t } = useTranslation()
  const kind: DependencyConflictKind = conflict.conflictKind ?? 'during_or_end'
  const isBeforePredecessor = kind === 'before_predecessor'

  const handleAction = (action: DependencyConflictAction) => {
    onAction(action)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="p-0 border-none overflow-hidden max-w-[min(640px,95vw)] max-h-[90vh] rounded-2xl shadow-2xl bg-[hsl(var(--primary))] gap-0 flex flex-col"
        hideClose={true}
      >
        <div className="p-8 pb-6 text-white relative flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 opacity-70 hover:opacity-100 transition-all p-2 rounded-full hover:bg-white/10 z-50"
          >
            <X size={20} />
          </button>
          <DialogTitle className="text-2xl font-black tracking-tight uppercase">
            {t('gantt.dependency_conflict_title', { defaultValue: 'Конфликт дат зависимости' })}
          </DialogTitle>
          <DialogDescription className="text-[hsl(var(--primary-foreground)/0.8)] text-[10px] font-bold mt-1 uppercase tracking-[0.3em]">
            {isBeforePredecessor
              ? t('gantt.dependency_conflict_subtitle_before_predecessor', {
                  defaultValue: 'Преемник начинается раньше предшественника',
                })
              : t('gantt.dependency_conflict_subtitle_during_or_end', {
                  defaultValue: 'Преемник начинается во время выполнения или в момент окончания предшественника',
                })}
          </DialogDescription>
        </div>

        <div className="bg-white rounded-t-2xl flex-1 min-h-0 overflow-y-auto p-8 space-y-8">
          <DependencyConflictDiagram
            predecessorName={conflict.predecessorName}
            successorName={conflict.successorName}
          />

          <div className="space-y-6">
            <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 text-center shadow-inner">
              <p className="text-[13px] text-slate-600 leading-relaxed font-medium">
                <span className="font-black text-slate-900">{conflict.predecessorName}</span>
                {' → '}
                <span className="font-black text-slate-900">{conflict.successorName}</span>.
                {' '}
                {t('gantt.dependency_conflict_min_date', { defaultValue: 'Минимальная дата начала преемника' })}:{' '}
                <span className="font-black text-slate-900">{formatDate(conflict.minStartDate)}</span>.
              </p>
            </div>

            <div className="space-y-5 px-1">
              <div className="flex items-start gap-4 group">
                <div className="mt-1 text-amber-600 flex-shrink-0 bg-amber-50 p-2 rounded-xl transition-colors group-hover:bg-amber-100">
                  <ShieldAlert size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-900 leading-none">
                    {t('gantt.dependency_conflict_consequences_title', { defaultValue: 'В чём проблема' })}
                  </h4>
                  <p className="text-[13px] text-slate-600 leading-snug font-medium">
                    {isBeforePredecessor
                      ? t('gantt.dependency_conflict_consequences_body_before_predecessor', {
                          defaultValue:
                            'Преемник начинается до того, как предшественник начался. Это нарушает логику зависимостей: критический путь и отчёты могут рассчитываться неверно, длительности и сроки проекта станут некорректными.',
                        })
                      : t('gantt.dependency_conflict_consequences_body_during_or_end', {
                          defaultValue:
                            'Преемник начинается во время выполнения предшественника или в день его окончания. По связи он должен начинаться со следующего дня после окончания предшественника. Иначе критический путь и отчёты могут рассчитываться неверно.',
                        })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 group">
                <div className="mt-1 text-slate-500 flex-shrink-0 bg-slate-100 p-2 rounded-xl">
                  <CalendarClock size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-900 leading-none">
                    {t('gantt.dependency_conflict_consequences_leave_title', { defaultValue: 'Если оставить как есть' })}
                  </h4>
                  <p className="text-[13px] text-slate-600 leading-snug font-medium">
                    {isBeforePredecessor
                      ? t('gantt.dependency_conflict_consequences_leave_body_before_predecessor', {
                          defaultValue:
                            'Связь будет противоречить датам. Расписание окажется некорректным, возможны ошибки при пересчёте, экспорте и в отчётах.',
                        })
                      : t('gantt.dependency_conflict_consequences_leave_body_during_or_end', {
                          defaultValue:
                            'Связь будет противоречить датам. Рекомендуется начинать преемника со следующего дня после окончания предшественника.',
                        })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-8 pt-4 pb-8 bg-white flex flex-col gap-3 flex-shrink-0">
          <Button
            onClick={() => handleAction('cancel')}
            className="w-full h-12 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] text-white font-black uppercase tracking-wider shadow-xl shadow-[hsl(var(--primary)/0.25)] transition-all active:scale-[0.97] rounded-xl flex items-center justify-center gap-2"
          >
            <Undo2 className="w-5 h-5" />
            {t('gantt.dependency_conflict_leave_unchanged', { defaultValue: 'Оставить без изменений' })}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleAction('remove_link')}
            className="w-full h-12 rounded-xl font-semibold border-slate-300 text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <Link2Off className="w-5 h-5" />
            {t('gantt.dependency_conflict_remove_link', { defaultValue: 'Удалить связь' })}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleAction('confirm_without_fix')}
            className="w-full h-12 rounded-xl font-semibold border-amber-400 text-amber-700 hover:bg-amber-50 transition-all flex items-center justify-center gap-2"
          >
            <ShieldAlert className="w-5 h-5" />
            {t('gantt.dependency_conflict_i_know', { defaultValue: 'Я знаю, что делаю' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
