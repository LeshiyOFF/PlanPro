import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { TwoTierHeader } from '@/components/layout/ViewHeader';
import { WBSCanvasCore } from '@/components/gantt/WBSCanvasCore';
import { WBSNode } from '@/domain/wbs/interfaces/WBS';
import { WBSCodeService } from '@/domain/wbs/services/WBSCodeService';
import { useProjectStore } from '@/store/projectStore';
import { useHelpContent } from '@/hooks/useHelpContent';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Share2, 
  Plus, 
  Trash2,
  Info,
  ChevronRight,
  ChevronLeft,
  Network
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useContextMenu } from '@/presentation/contextmenu/providers/ContextMenuProvider';
import { ContextMenuType } from '@/domain/contextmenu/ContextMenuType';
import { ViewType } from '@/types/ViewTypes';
import { useTaskDeletion } from '@/hooks/task/useTaskDeletion';

/**
 * Work Breakdown Structure (WBS) View - СДР (Структура декомпозиции работ)
 * 
 * Визуализирует иерархическую структуру работ проекта в виде дерева.
 * Использует TwoTierHeader для визуальной консистентности (Этап 7.23).
 * 
 * @version 8.13
 */
export const WBSView: React.FC = () => {
  const { t } = useTranslation();
  const { tasks, addTask, indentTask, outdentTask } = useProjectStore();
  const { deleteTask, isDeletionAllowed } = useTaskDeletion();
  const helpContent = useHelpContent();
  const [zoom, setZoom] = useState(1);
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const { showMenu } = useContextMenu();

  /**
   * Расчет длительности для ветви
   */
  const calculateDuration = useCallback((taskId: string): string => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return `0${t('sheets.days')}`;

    const start = new Date(task.startDate);
    const end = new Date(task.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    return `${days}${t('sheets.days')}`;
  }, [tasks, t]);

  // Преобразование задач проекта в узлы WBS
  const wbsNodes: WBSNode[] = useMemo(() => {
    const nodes: WBSNode[] = tasks.map((task, index) => {
      let parentId: string | undefined = undefined;
      if (task.level > 0) {
        for (let i = index - 1; i >= 0; i--) {
          if (tasks[i].level < task.level) {
            parentId = tasks[i].id;
            break;
          }
        }
        if (!parentId && tasks[0].level === 0) parentId = tasks[0].id;
      }

      return {
        id: task.id,
        name: task.name,
        wbsCode: '',
        level: task.level,
        parentId: parentId,
        isExpanded: !collapsedNodes.has(task.id),
        isSummary: !!(task.summary || task.type === 'summary'),
        progress: task.progress,
        startDate: new Date(task.startDate),
        endDate: new Date(task.endDate),
        duration: calculateDuration(task.id),
        critical: !!(task.critical || task.criticalPath),
        color: task.color,
        childrenIds: [],
        x: 0, y: 0, width: 180, height: 90
      };
    });

    nodes.forEach(node => {
      if (node.parentId) {
        const parent = nodes.find(n => n.id === node.parentId);
        if (parent) parent.childrenIds.push(node.id);
      }
    });

    return WBSCodeService.calculateCodes(nodes);
  }, [tasks, collapsedNodes, calculateDuration]);

  // Видимые узлы (с учетом свернутых)
  const visibleNodes = useMemo(() => {
    return wbsNodes.filter(node => {
      let currentParentId = node.parentId;
      while (currentParentId) {
        if (collapsedNodes.has(currentParentId)) return false;
        const parent = wbsNodes.find(n => n.id === currentParentId);
        currentParentId = parent?.parentId;
      }
      return true;
    });
  }, [wbsNodes, collapsedNodes]);

  const handleNodeToggle = useCallback((nodeId: string) => {
    setCollapsedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }, []);

  const handleNodeContextMenu = useCallback((nodeId: string, x: number, y: number) => {
    const task = tasks.find(n => n.id === nodeId);
    if (task) {
      const taskIndex = tasks.findIndex(t => t.id === task.id);
      
      let indentParent = null;
      for (let i = taskIndex - 1; i >= 0; i--) {
        if (tasks[i].level === task.level) {
          indentParent = tasks[i];
          break;
        } else if (tasks[i].level < task.level) {
          break;
        }
      }

      let outdentParent = null;
      if (task.level > 1) {
        for (let i = taskIndex - 1; i >= 0; i--) {
          if (tasks[i].level === task.level - 2) {
            outdentParent = tasks[i];
            break;
          }
        }
      }

      showMenu(ContextMenuType.TASK, {
        target: task,
        position: { x, y },
        actions: [
          { 
            label: t('context_menu.task_info'), 
            onClick: () => { /* Открытие диалога */ },
            icon: <Info size={14} className="text-primary" />
          },
          { divider: true },
          { 
            label: indentParent ? t('context_menu.indent_task_to', { taskName: indentParent.name }) : t('context_menu.indent_task'), 
            onClick: () => indentTask(task.id), 
            icon: <ChevronRight size={14} /> 
          },
          { 
            label: outdentParent ? t('context_menu.outdent_task_to', { taskName: outdentParent.name }) : t('context_menu.outdent_task'), 
            onClick: () => outdentTask(task.id), 
            icon: <ChevronLeft size={14} /> 
          },
          { divider: true },
          { 
            label: t('context_menu.delete_task'), 
            onClick: () => deleteTask(task.id), 
            icon: <Trash2 size={14} className={isDeletionAllowed ? "text-red-500" : "text-gray-400"} />,
            disabled: !isDeletionAllowed
          }
        ]
      });
    }
  }, [tasks, showMenu, indentTask, outdentTask, deleteTask, isDeletionAllowed, t]);

  const handleAddTask = () => {
    const newId = `TASK-${String(tasks.length + 1).padStart(3, '0')}`;
    addTask({
      id: newId,
      name: t('wbs.new_task_name', { number: tasks.length + 1 }),
      startDate: new Date(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      progress: 0,
      color: 'hsl(var(--primary))',
      level: 1
    });
  };

  // Контролы масштабирования для правой части ActionBar
  const zoomControls = (
    <div className="flex items-center gap-1">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setZoom(z => Math.min(z + 0.1, 2))}
        title={t('help.zoom_in')}
        className="h-9 w-9 p-0 border-border/40 hover:bg-[hsl(var(--primary-soft))] text-primary transition-all"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))}
        title={t('help.zoom_out')}
        className="h-9 w-9 p-0 border-border/40 hover:bg-[hsl(var(--primary-soft))] text-primary transition-all"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setZoom(1)}
        title={t('help.zoom_reset')}
        className="h-9 w-9 p-0 border-border/40 hover:bg-[hsl(var(--primary-soft))] text-primary transition-all"
      >
        <Maximize className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Two-Tier Header: Заголовок + Панель действий */}
      <TwoTierHeader
        title={t('wbs.title')}
        description={t('descriptions.wbs')}
        icon={<Network className="w-6 h-6" />}
        help={helpContent.WBS}
        actionBar={{
          primaryAction: {
            label: t('wbs.add_task_button'),
            onClick: handleAddTask,
            icon: <Plus className="w-4 h-4" />
          },
          secondaryActions: [
            {
              label: t('wbs.export_button'),
              onClick: () => {/* TODO: implement export */},
              icon: <Share2 className="w-4 h-4" />,
              variant: 'outline'
            }
          ],
          controls: zoomControls
        }}
      />
      
      {/* Основной контент: WBS Canvas */}
      <div className="flex-1 overflow-hidden p-6">
        <div className="h-full w-full bg-white rounded-xl shadow-lg border overflow-hidden transition-all soft-border">
          <WBSCanvasCore 
            nodes={visibleNodes}
            zoomLevel={zoom}
            onNodeToggle={handleNodeToggle}
            onNodeSelect={(id) => console.log('Selected:', id)}
            onNodeContextMenu={handleNodeContextMenu}
          />
        </div>
      </div>
    </div>
  );
};
