import React, { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TwoTierHeader } from '@/components/layout/ViewHeader';
import { useHelpContent } from '@/hooks/useHelpContent';
import { NetworkDiagramCore } from '@/components/gantt/NetworkDiagramCore';
import { NetworkNode, NetworkNodeType, NetworkConnection } from '@/domain/network/interfaces/NetworkDiagram';
import { Plus, Maximize, ZoomIn, ZoomOut, Layout, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProjectStore } from '@/store/projectStore';
import { TaskInformationDialog } from '@/components/dialogs/task/TaskInformationDialog';
import { cn } from '@/lib/utils';

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
  const nodes: NetworkNode[] = useMemo(() => tasks.map(task => ({
    id: task.id,
    name: task.name,
    duration: `${Math.ceil((new Date(task.endDate).getTime() - new Date(task.startDate).getTime()) / (24 * 60 * 60 * 1000))}${t('sheets.days')}`,
    startDate: new Date(task.startDate),
    endDate: new Date(task.endDate),
    type: task.type === 'milestone' ? NetworkNodeType.MILESTONE : 
          task.type === 'summary' ? NetworkNodeType.SUMMARY : NetworkNodeType.TASK,
    critical: !!(task.criticalPath || task.critical),
    progress: task.progress,
    x: (task as any).x || 0,
    y: (task as any).y || 0,
    width: 180,
    height: 80,
    isPinned: (task as any).isPinned || false
  })), [tasks, t]);

  // Формирование связей
  const connections: NetworkConnection[] = useMemo(() => {
    const conns: NetworkConnection[] = [];
    tasks.forEach(task => {
      if (task.predecessors) {
        task.predecessors.forEach((predId) => {
          const fromTask = tasks.find(t => t.id === predId);
          conns.push({
            id: `conn-${task.id}-${predId}`,
            fromId: predId,
            toId: task.id,
            type: 'fs',
            critical: !!((task.criticalPath || task.critical) && (fromTask?.criticalPath || fromTask?.critical))
          });
        });
      }
    });
    return conns;
  }, [tasks]);

  const handleNodesChange = useCallback((updatedNodes: NetworkNode[]) => {
    updatedNodes.forEach(node => {
      updateTask(node.id, { 
        x: node.x, 
        y: node.y, 
        isPinned: node.isPinned 
      } as any);
    });
  }, [updateTask]);

  const handleAddTask = useCallback(() => {
    const newId = `TASK-${String(tasks.length + 1).padStart(3, '0')}`;
    const newTask = {
      id: newId,
      name: `${t('sheets.new_task')} ${tasks.length + 1}`,
      startDate: new Date(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      progress: 0,
      color: 'hsl(var(--primary))',
      level: 1,
      x: 50, 
      y: 50,
      isPinned: true
    };
    addTask(newTask as any);
  }, [tasks.length, addTask, t]);

  const handleAutoLayout = useCallback(() => {
    tasks.forEach(t => updateTask(t.id, { isPinned: false } as any));
  }, [tasks, updateTask]);

  const handleNodeDoubleClick = useCallback((nodeId: string) => {
    setEditingNodeId(nodeId);
    setIsDialogOpen(true);
  }, []);

  const handleDialogClose = useCallback((result: any) => {
    setIsDialogOpen(false);
    if (result && result.success && result.data && editingNodeId) {
      updateTask(editingNodeId, result.data);
    }
    setEditingNodeId(null);
  }, [editingNodeId, updateTask]);

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
        <Maximize className="h-4 w-4" />
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
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-red-500 rounded-sm shadow-sm shadow-red-200"></span> 
              {t('help.critical_path')}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-primary rounded-sm shadow-sm shadow-[hsl(var(--primary-shadow-light))]"></span> 
              {t('help.regular_task')}
            </span>
          </div>
        </div>
      </div>

      {isDialogOpen && editingNodeId && (
        <TaskInformationDialog
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
          data={{
            ...tasks.find(n => n.id === editingNodeId)!,
            taskId: editingNodeId
          }}
        />
      )}
    </div>
  );
};

