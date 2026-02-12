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
import { ShieldAlert, X, FolderTree, Link2Off } from 'lucide-react'

/**
 * Причина блокировки связи
 */
export type ConnectionBlockReason = 'summary_task' | 'parent_child' | 'self_link'

export interface ConnectionBlockedDialogProps {
  open: boolean;
  onClose: () => void;
  reason: ConnectionBlockReason;
  fromTaskName: string;
  toTaskName: string;
}

/**
 * Диалог предупреждения о запрещённой связи в сетевом графике.
 * Показывается при попытке связать суммарную задачу или родителя с потомком.
 * Дизайн соответствует DependencyConflictDialog.
 * 
 * @version 1.0
 */
export const ConnectionBlockedDialog: React.FC<ConnectionBlockedDialogProps> = ({
  open,
  onClose,
  reason,
  fromTaskName,
  toTaskName,
}) => {
  const { t } = useTranslation()

  const getTitleKey = (): string => {
    switch (reason) {
      case 'summary_task':
        return 'network.connection_blocked_summary_title'
      case 'parent_child':
        return 'network.connection_blocked_parent_child_title'
      case 'self_link':
        return 'network.connection_blocked_self_title'
      default:
        return 'network.connection_blocked_title'
    }
  }

  const getDescriptionKey = (): string => {
    switch (reason) {
      case 'summary_task':
        return 'network.connection_blocked_summary_desc'
      case 'parent_child':
        return 'network.connection_blocked_parent_child_desc'
      case 'self_link':
        return 'network.connection_blocked_self_desc'
      default:
        return 'network.connection_blocked_desc'
    }
  }

  const getExplanationKey = (): string => {
    switch (reason) {
      case 'summary_task':
        return 'network.connection_blocked_summary_explanation'
      case 'parent_child':
        return 'network.connection_blocked_parent_child_explanation'
      case 'self_link':
        return 'network.connection_blocked_self_explanation'
      default:
        return 'network.connection_blocked_explanation'
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="p-0 border-none overflow-hidden max-w-[min(540px,95vw)] rounded-2xl shadow-2xl bg-[hsl(var(--primary))] gap-0 flex flex-col"
        hideClose={true}
      >
        {/* Акцентная шапка */}
        <div className="p-8 pb-6 text-white relative flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 opacity-70 hover:opacity-100 transition-all p-2 rounded-full hover:bg-white/10 z-50"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-white/20 rounded-xl">
              <Link2Off size={28} />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight uppercase">
              {t(getTitleKey(), { defaultValue: 'Связь запрещена' })}
            </DialogTitle>
          </div>
          <DialogDescription className="text-[hsl(var(--primary-foreground)/0.8)] text-[10px] font-bold uppercase tracking-[0.3em]">
            {t(getDescriptionKey(), { defaultValue: 'Данная связь не может быть создана' })}
          </DialogDescription>
        </div>

        {/* Белое тело */}
        <div className="bg-white rounded-t-2xl flex-1 min-h-0 overflow-y-auto p-8 space-y-6">
          {/* Схема связи */}
          <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 text-center shadow-inner">
            <p className="text-[13px] text-slate-600 leading-relaxed font-medium">
              <span className="font-black text-slate-900">{fromTaskName}</span>
              {' → '}
              <span className="font-black text-slate-900">{toTaskName}</span>
            </p>
          </div>

          {/* Объяснение */}
          <div className="flex items-start gap-4 group">
            <div className="mt-1 text-[hsl(var(--primary))] flex-shrink-0 bg-[hsl(var(--primary-soft))] p-2 rounded-xl">
              {reason === 'summary_task' ? <FolderTree size={20} /> : <ShieldAlert size={20} />}
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-slate-900 leading-none">
                {t('network.connection_blocked_why', { defaultValue: 'Почему запрещено?' })}
              </h4>
              <p className="text-[13px] text-slate-600 leading-snug font-medium">
                {t(getExplanationKey(), {
                  defaultValue: reason === 'summary_task'
                    ? 'Суммарные задачи являются организационными контейнерами. Они автоматически рассчитывают свои даты на основе дочерних задач. Связывание суммарных задач напрямую нарушает логику иерархии проекта.'
                    : reason === 'parent_child'
                    ? 'Родительская и дочерняя задачи уже связаны иерархически. Создание дополнительной зависимости между ними создаст циклическую связь.'
                    : 'Задача не может зависеть от самой себя.',
                })}
              </p>
            </div>
          </div>

          {/* Рекомендация */}
          <div className="flex items-start gap-4 group">
            <div className="mt-1 text-[hsl(var(--primary))] flex-shrink-0 bg-[hsl(var(--primary-soft))] p-2 rounded-xl">
              <ShieldAlert size={20} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-slate-900 leading-none">
                {t('network.connection_blocked_recommendation', { defaultValue: 'Рекомендация' })}
              </h4>
              <p className="text-[13px] text-slate-600 leading-snug font-medium">
                {t('network.connection_blocked_recommendation_text', {
                  defaultValue: 'Создавайте связи только между обычными задачами (не суммарными).',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Футер */}
        <DialogFooter className="p-8 pt-4 pb-8 bg-white flex-shrink-0">
          <Button
            onClick={onClose}
            className="w-full h-12 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] text-white font-black uppercase tracking-wider shadow-xl shadow-[hsl(var(--primary)/0.25)] transition-all active:scale-[0.97] rounded-xl flex items-center justify-center gap-2"
          >
            {t('common.understood', { defaultValue: 'Понятно' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
