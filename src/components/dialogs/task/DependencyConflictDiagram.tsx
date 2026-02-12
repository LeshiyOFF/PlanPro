import React from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar, ListTodo, AlertTriangle } from 'lucide-react'

export interface DependencyConflictDiagramProps {
  predecessorName: string;
  successorName: string;
}

/**
 * Схема конфликта дат: предшественник → конфликт → преемник.
 * Стили согласованы с SummaryTaskDialog (карточки, линии).
 */
export const DependencyConflictDiagram: React.FC<DependencyConflictDiagramProps> = ({
  predecessorName,
  successorName,
}) => {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center py-2">
      <div className="relative inline-flex flex-col items-center">
        <div className="flex items-center gap-3 bg-[hsl(var(--primary)/0.05)] border border-[hsl(var(--primary)/0.1)] p-3 pr-6 rounded-2xl shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-[hsl(var(--primary))] text-white flex items-center justify-center shadow-lg shadow-[hsl(var(--primary)/0.2)]">
            <Calendar size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[hsl(var(--primary))] uppercase tracking-widest leading-none mb-1">
              {t('gantt.dependency_conflict_predecessor', { defaultValue: 'Предшественник' })}
            </span>
            <span className="text-sm font-black text-slate-900 truncate max-w-[200px]">{predecessorName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 my-1">
          <div className="w-8 border-t-2 border-slate-300 rounded-full" />
          <div className="w-8 h-8 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="w-8 border-t-2 border-slate-300 rounded-full" />
        </div>

        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-2 pr-4 rounded-xl shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-white border border-slate-300 text-slate-600 flex items-center justify-center">
            <ListTodo size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider leading-none mb-0.5">
              {t('gantt.dependency_conflict_successor', { defaultValue: 'Преемник' })}
            </span>
            <span className="text-xs font-black text-slate-900 truncate max-w-[180px]">{successorName}</span>
          </div>
        </div>

        <div className="mt-3 text-[10px] font-black text-slate-600 uppercase tracking-widest italic opacity-80">
          {t('gantt.dependency_conflict_diagram_caption', { defaultValue: 'Конфликт дат' })}
        </div>
      </div>
    </div>
  )
}
