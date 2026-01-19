import React from 'react';
import { 
  Info, Trash2, ChevronRight, ChevronLeft, ArrowUp, ArrowDown, 
  Link2, Link2Off, Diamond, Scissors, Combine 
} from 'lucide-react';
import { ContextMenuType } from '@/domain/contextmenu/ContextMenuType';
import { Task } from '@/store/project/interfaces';

export const useGanttContextMenu = (
  showMenu: any, t: any, actions: any, isDeletionAllowed: boolean
) => {
  return (event: React.MouseEvent, task: Task, tasks: Task[]) => {
    event.preventDefault();
    const taskIndex = tasks.findIndex(t => t.id === task.id);
    
    let indentParent = tasks.slice(0, taskIndex).reverse().find(t => t.level === task.level);
    let outdentParent = task.level > 1 
      ? tasks.slice(0, taskIndex).reverse().find(t => t.level === task.level - 2)
      : null;

    showMenu(ContextMenuType.TASK, {
      target: task,
      position: { x: event.clientX, y: event.clientY },
      actions: [
        { label: t('sheets.task_info'), onClick: () => actions.onInfo(task.id), icon: <Info size={14} className="text-primary" /> },
        { 
          label: task.milestone ? t('help.make_regular') : t('help.make_milestone'), 
          onClick: () => actions.onToggleMilestone(task.id), 
          icon: <Diamond size={14} className={task.milestone ? "text-slate-400" : "text-amber-600"} /> 
        },
        { divider: true },
        { label: t('help.link_tasks'), onClick: () => actions.onStartLink(task.id), icon: <Link2 size={14} className="text-amber-500" /> },
        { 
          label: t('help.unlink_tasks'), 
          onClick: () => actions.onUnlink(task.id), 
          icon: <Link2Off size={14} className="text-slate-400" />,
          disabled: !task.predecessors || task.predecessors.length === 0
        },
        { divider: true },
        {
          label: t('dialogs.split_task.title') || 'Прервать задачу',
          onClick: () => actions.onSplit(task.id),
          icon: <Scissors size={14} className="text-amber-600" />
        },
        {
          label: t('dialogs.split_task.merge') || 'Объединить сегменты',
          onClick: () => actions.onMerge(task.id),
          icon: <Combine size={14} className="text-slate-600" />,
          disabled: !task.segments || task.segments.length <= 1
        },
        { divider: true },
        { 
          label: indentParent ? `${t('help.indent_to')} "${indentParent.name}"` : t('help.indent'), 
          onClick: () => actions.onIndent(task.id), 
          icon: <ChevronRight size={14} className="text-slate-600" />,
          disabled: !indentParent 
        },
        { 
          label: outdentParent ? `${t('help.outdent_to')} "${outdentParent.name}"` : t('help.outdent'), 
          onClick: () => actions.onOutdent(task.id), 
          icon: <ChevronLeft size={14} className="text-slate-600" />,
          disabled: task.level <= 1
        },
        { divider: true },
        { label: t('help.move_up'), onClick: () => actions.onMove(task.id, 'up'), icon: <ArrowUp size={14} className="text-slate-600" /> },
        { label: t('help.move_down'), onClick: () => actions.onMove(task.id, 'down'), icon: <ArrowDown size={14} className="text-slate-600" /> },
        { divider: true },
        { 
          label: t('common.delete'), 
          onClick: () => actions.onDelete(task.id), 
          icon: <Trash2 size={14} className={isDeletionAllowed ? "text-red-500" : "text-gray-400"} />,
          disabled: !isDeletionAllowed
        }
      ]
    });
  };
};

