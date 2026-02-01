import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  Button,
} from '@/components/ui'
import {
  FolderTree,
  FileText,
  Lock,
  ShieldCheck,
  X,
} from 'lucide-react'

interface SummaryTaskDialogProps {
  isOpen: boolean;
  onClose: (confirm: boolean) => void;
  parentTaskName: string;
  subtaskName: string;
}

/**
 * SummaryTaskDialog - Эталонное модальное окно для подтверждения создания суммарной задачи.
 * Версия 7: Синхронизированы углы (2xl), центрирована диаграмма, повышен контраст текста, уменьшен шрифт описания.
 */
export const SummaryTaskDialog: React.FC<SummaryTaskDialogProps> = ({
  isOpen,
  onClose,
  parentTaskName,
  subtaskName,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose(false)}>
      <DialogContent
        className="p-0 border-none overflow-hidden max-w-[480px] rounded-2xl shadow-2xl bg-[hsl(var(--primary))] gap-0"
        hideClose={true}
      >
        {/* Акцентная шапка */}
        <div className="p-8 pb-6 text-white relative">
          <button
            onClick={() => onClose(false)}
            className="absolute right-4 top-4 opacity-70 hover:opacity-100 transition-all p-2 rounded-full hover:bg-white/10 z-50"
          >
            <X size={20} />
          </button>
          <DialogTitle className="text-2xl font-black tracking-tight uppercase">Структурирование</DialogTitle>
          <DialogDescription className="text-[hsl(var(--primary-foreground)/0.8)] text-[10px] font-bold mt-1 uppercase tracking-[0.3em]">
            Изменение иерархии проекта
          </DialogDescription>
        </div>

        {/* Основной контент в белом блоке - углы синхронизированы с внешним контейнером */}
        <div className="bg-white rounded-t-2xl p-8 space-y-8">

          {/* Визуализация иерархического дерева - ЦЕНТРИРОВАННАЯ */}
          <div className="flex flex-col items-center py-2">
            <div className="relative inline-flex flex-col items-start">
              {/* Родительская задача */}
              <div className="flex items-center gap-4 bg-[hsl(var(--primary)/0.05)] border border-[hsl(var(--primary)/0.1)] p-3 pr-6 rounded-2xl shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-[hsl(var(--primary))] text-white flex items-center justify-center shadow-lg shadow-[hsl(var(--primary)/0.2)]">
                  <FolderTree size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[hsl(var(--primary))] uppercase tracking-widest leading-none mb-1">Суммарная задача</span>
                  <span className="text-sm font-black text-slate-900 truncate max-w-[200px]">{parentTaskName}</span>
                </div>
              </div>

              {/* Кривая линия связи */}
              <div className="ml-9 border-l-2 border-slate-300 h-10 w-6 rounded-bl-2xl border-b-2 -mt-1 mb-[-4px]" />

              {/* Подзадача - КОНТРАСТНЫЙ ТЕКСТ */}
              <div className="ml-14 flex items-center gap-3 bg-slate-50 border border-slate-200 p-2 pr-4 rounded-xl shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-300 text-slate-600 flex items-center justify-center">
                  <FileText size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider leading-none mb-0.5">Подзадача</span>
                  <span className="text-xs font-black text-slate-900 truncate max-w-[180px]">{subtaskName}</span>
                </div>
              </div>

              {/* Текст внизу - КОНТРАСТНЫЙ */}
              <div className="ml-[72px] mt-3 text-[10px] font-black text-slate-600 uppercase tracking-widest italic opacity-80">
                ...и другие вложенные работы
              </div>
            </div>
          </div>

          {/* Текстовое описание - УМЕНЬШЕННЫЙ ШРИФТ */}
          <div className="space-y-6">
            <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 text-center shadow-inner">
              <p className="text-[13px] text-slate-600 leading-relaxed font-medium">
                Задача <span className="font-black text-slate-900 underline decoration-[hsl(var(--primary)/0.3)] decoration-2 underline-offset-4">"{parentTaskName}"</span> становится суммарной.
                Теперь её параметры будут зависеть от <span className="font-black text-slate-900">всех вложенных подзадач</span>.
              </p>
            </div>

            <div className="space-y-5 px-1">
              <div className="flex items-start gap-4 group">
                <div className="mt-1 text-[hsl(var(--primary))] flex-shrink-0 bg-[hsl(var(--primary)/0.1)] p-2 rounded-xl transition-colors group-hover:bg-[hsl(var(--primary)/0.2)]">
                  <ShieldCheck size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-900 leading-none">Целостность данных</h4>
                  <p className="text-[13px] text-slate-600 leading-snug font-medium">
                    Сроки и прогресс суммарной задачи будут автоматически агрегировать данные всех вложенных работ для точности расписания.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="mt-1 text-amber-600 flex-shrink-0 bg-amber-50 p-2 rounded-xl transition-colors group-hover:bg-amber-100">
                  <Lock size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-900 leading-none">Фиксация на графике</h4>
                  <p className="text-[13px] text-slate-600 leading-snug font-medium">
                    Ручное перемещение суммарной задачи заблокировано, так как её границы определяются самой ранней и поздней подзадачами.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Футер с кнопками */}
        <DialogFooter className="p-8 pt-4 bg-white flex flex-row gap-4 sm:space-x-0">
          <Button
            variant="ghost"
            onClick={() => onClose(false)}
            className="flex-1 h-12 text-slate-400 font-bold hover:bg-slate-50 hover:text-slate-900 transition-all rounded-xl"
          >
            Отмена
          </Button>
          <Button
            onClick={() => onClose(true)}
            className="flex-1 h-12 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] text-white font-black uppercase tracking-wider shadow-xl shadow-[hsl(var(--primary)/0.25)] transition-all active:scale-[0.97] rounded-xl"
          >
            Подтвердить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
