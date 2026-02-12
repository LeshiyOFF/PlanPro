import React from 'react'
import { Button } from '@/components/ui'
import { Plus, Link2, X } from 'lucide-react'
import { TaskSheet } from '@/components/sheets/table/TaskSheet'
import { Task } from '@/store/project/interfaces'
import { IGanttTaskUpdate } from '@/types/gantt/IGanttTypes'

interface GanttLeftPanelProps {
  readonly tasks: ReadonlyArray<Task>;
  readonly linkingTaskId: string | null;
  readonly t: (key: string) => string;
  readonly onAddTask: () => void;
  readonly onCancelLink: () => void;
  readonly onTaskUpdate: (id: string, updates: IGanttTaskUpdate) => void;
  readonly onContextMenu: (e: React.MouseEvent, task: Task) => void;
  readonly onTaskSelect: (task: Task) => void;
  readonly onDeleteTask: (id: string) => void;
  readonly disabledTaskIds: ReadonlyArray<string>;
  /** Ключи i18n причин блокировки выбора (для тултипа): taskId → gantt.link_disabled_* */
  readonly disabledReasons?: Readonly<Record<string, string>>;
  /** Ref для синхронизации вертикального скролла */
  readonly scrollRef?: React.RefObject<HTMLDivElement>;
  /** Callback при прокрутке для синхронизации */
  readonly onScroll?: () => void;
}

export const GanttLeftPanel: React.FC<GanttLeftPanelProps> = ({
  tasks, linkingTaskId, t, onAddTask, onCancelLink, onTaskUpdate,
  onContextMenu, onTaskSelect, onDeleteTask, disabledTaskIds, disabledReasons,
  scrollRef, onScroll,
}) => {
  return (
    <div className={`flex flex-col h-full overflow-hidden bg-white transition-colors duration-300 ${linkingTaskId ? 'ring-2 ring-amber-400 ring-inset bg-amber-50/10' : ''}`}>
      <div className="flex items-center justify-between p-3 border-b bg-slate-50/50 flex-shrink-0 h-[48px]">
        {linkingTaskId ? (
          <div className="flex items-center gap-2 text-amber-600 animate-pulse">
            <Link2 className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{t('help.select_predecessor')}</span>
            <Button size="sm" variant="ghost" onClick={onCancelLink} className="h-6 w-6 p-0 hover:bg-amber-100">
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <>
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{t('navigation.task_sheet')}</span>
            <Button size="sm" variant="ghost" onClick={onAddTask} className="h-7 w-7 p-0 hover:bg-slate-200">
              <Plus className="h-4 w-4 text-slate-600" />
            </Button>
          </>
        )}
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <TaskSheet
          tasks={[...tasks]} variant="compact" onTaskUpdate={onTaskUpdate}
          onContextMenu={onContextMenu} onRowSelect={onTaskSelect}
          onDeleteTasks={(ids) => ids.forEach(onDeleteTask)}
          disabledTaskIds={[...disabledTaskIds]}
          disabledReasons={disabledReasons}
          scrollRef={scrollRef}
          onScroll={onScroll}
        />
      </div>
    </div>
  )
}

