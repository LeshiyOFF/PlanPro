import React, { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TwoTierHeader } from '@/components/layout/ViewHeader';
import { useHelpContent } from '@/hooks/useHelpContent';
import { NetworkDiagramCore } from '@/components/gantt/NetworkDiagramCore';
import { NetworkNode, NetworkNodeType, NetworkConnection } from '@/domain/network/interfaces/NetworkDiagram';
import { Plus, ZoomIn, ZoomOut, Layout, GitBranch, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProjectStore, createTaskFromView } from '@/store/projectStore';
import { TaskPropertiesDialog } from '@/components/dialogs/TaskPropertiesDialog';
import { SafeTooltip } from '@/components/ui/tooltip';
import { ITaskWithPosition } from '@/types/views/IViewTypes';

/**
 * NetworkView - Сетевой график (PERT диаграмма)
 * 
 * Визуализирует зависимости между задачами в виде графа.
 * Использует TwoTierHeader + Dynamic Accent System.
 * 
 * @version 8.14
 */
export const NetworkView: React.FC = () => {
  const { t } = useTranslation();
  const helpContent = useHelpContent();
  const [zoom, setZoom] = useState(1);
  const { tasks, updateTask, addTask } = useProjectStore();
  
  // Состояние диалога редактирования
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Конвертация задач из стора в узлы для диаграммы
  const nodes: NetworkNode[] = useMemo(() => tasks.map((task): NetworkNode => {
    const taskWithPosition = task as ITaskWithPosition;
    const isMilestone = (task as { isMilestone?: boolean }).isMilestone === true;
    const isSummary = (task as { isSummary?: boolean }).isSummary === true;
    return {
      id: task.id,
      name: task.name,
      duration: `${Math.ceil((new Date(task.endDate).getTime() - new Date(task.startDate).getTime()) / (24 * 60 * 60 * 1000))}${t('sheets.days')}`,
      startDate: new Date(task.startDate),
      endDate: new Date(task.endDate),
      type: isMilestone ? NetworkNodeType.MILESTONE : isSummary ? NetworkNodeType.SUMMARY : NetworkNodeType.TASK,
      critical: !!(task.criticalPath ?? task.isCritical),
      progress: task.progress,
      x: taskWithPosition.x ?? 0,
      y: taskWithPosition.y ?? 0,
      width: 180,
      height: 80,
      isPinned: taskWithPosition.isPinned ?? false
    };
  }), [tasks, t]);

  // Формирование связей
  const connections: NetworkConnection[] = useMemo(() => {
    const conns: NetworkConnection[] = [];
    tasks.forEach(task => {
      if (task.predecessors) {
        task.predecessors.forEach((predId) => {
          const fromTask = tasks.find(t => t.id === predId);
          const taskCritical = task.isCritical ?? task.criticalPath ?? false;
          const fromCritical = fromTask ? (fromTask.isCritical ?? fromTask.criticalPath ?? false) : false;
          conns.push({
            id: `conn-${task.id}-${predId}`,
            fromId: predId,
            toId: task.id,
            type: 'fs',
            critical: taskCritical && fromCritical
          });
        });
      }
    });
    return conns;
  }, [tasks]);

  const handleNodesChange = useCallback((updatedNodes: NetworkNode[]) => {
    updatedNodes.forEach(node => {
      const positionUpdate: Partial<ITaskWithPosition> = { 
        x: node.x, 
        y: node.y, 
        isPinned: node.isPinned 
      };
      updateTask(node.id, positionUpdate);
    });
  }, [updateTask]);

  const handleAddTask = useCallback(() => {
    const newId = `TASK-${String(tasks.length + 1).padStart(3, '0')}`;
    const newTask = createTaskFromView({
      id: newId,
      name: `${t('sheets.new_task')} ${tasks.length + 1}`,
      startDate: new Date(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      progress: 0,
      color: 'hsl(var(--primary))',
      level: 1
    });
    addTask(newTask);
  }, [tasks.length, addTask, t]);

  const handleAutoLayout = useCallback(() => {
    tasks.forEach(t => {
      const resetPosition: Partial<ITaskWithPosition> = { isPinned: false };
      updateTask(t.id, resetPosition);
    });
  }, [tasks, updateTask]);

  const handleNodeDoubleClick = useCallback((nodeId: string) => {
    setEditingNodeId(nodeId);
    setIsDialogOpen(true);
  }, []);

  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false);
    setEditingNodeId(null);
  }, []);

  const handleConnectionCreate = useCallback((fromId: string, toId: string) => {
    const targetTask = tasks.find(t => t.id === toId);
    if (targetTask) {
      const preds = targetTask.predecessors || [];
      if (!preds.includes(fromId)) {
        updateTask(toId, { predecessors: [...preds, fromId] });
      }
    }
  }, [tasks, updateTask]);

  // Контролы масштабирования
  const zoomControls = (
    <div className="flex items-center gap-1">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setZoom(z => Math.min(z + 0.1, 2))} 
        className="h-9 w-9 p-0 border-border/40 hover:bg-[hsl(var(--primary-soft))] text-primary transition-all"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))} 
        className="h-9 w-9 p-0 border-border/40 hover:bg-[hsl(var(--primary-soft))] text-primary transition-all"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setZoom(1)} 
        className="h-9 w-9 p-0 border-border/40 hover:bg-[hsl(var(--primary-soft))] text-primary transition-all"
      >
        <Maximize2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <TwoTierHeader
        title={t('navigation.network')}
        description={t('descriptions.network')}
        icon={<GitBranch />}
        help={helpContent.NETWORK}
        actionBar={{
          primaryAction: {
            label: t('sheets.add_task'),
            onClick: handleAddTask,
            icon: <Plus className="w-4 h-4" />
          },
          secondaryActions: [
            {
              label: t('help.auto_layout'),
              onClick: handleAutoLayout,
              icon: <Layout className="w-4 h-4" />,
              variant: 'outline'
            }
          ],
          controls: zoomControls
        }}
      />

      <div className="flex-1 overflow-hidden p-4 flex flex-col gap-4">
        <div className="flex-1 min-h-0 bg-white rounded-xl shadow-lg border overflow-hidden transition-all soft-border">
          <NetworkDiagramCore 
            nodes={nodes}
            connections={connections}
            width={2000}
            height={1200}
            zoomLevel={zoom}
            onNodesChange={handleNodesChange}
            onNodeDoubleClick={handleNodeDoubleClick}
            onConnectionCreate={handleConnectionCreate}
          />
        </div>
        
        {/* Footer с акцентными элементами */}
        <div className="p-3 bg-white/80 border rounded-xl text-xs text-slate-700 flex justify-between items-center shadow-md transition-all soft-border">
          <p className="flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary font-bold">!</span>
            <span><strong>{t('help.tip_bold')}:</strong> {t('help.network_footer_tip')}</span>
          </p>
          <div className="flex gap-4 font-medium">
            <SafeTooltip content={t('help.critical_path_tip')} side="top">
              <span className="flex items-center gap-1.5 cursor-help hover:opacity-80 transition-opacity">
                <span className="w-3 h-3 bg-red-500 rounded-sm shadow-sm shadow-red-200"></span> 
                {t('help.critical_path')}
              </span>
            </SafeTooltip>
            <SafeTooltip content={t('help.regular_task_tip')} side="top">
              <span className="flex items-center gap-1.5 cursor-help hover:opacity-80 transition-opacity">
                <span className="w-3 h-3 bg-primary rounded-sm shadow-sm shadow-[hsl(var(--primary-shadow-light))]"></span> 
                {t('help.regular_task')}
              </span>
            </SafeTooltip>
          </div>
        </div>
      </div>

      {isDialogOpen && editingNodeId && (
        <TaskPropertiesDialog
          taskId={editingNodeId}
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
        />
      )}
    </div>
  );
};

