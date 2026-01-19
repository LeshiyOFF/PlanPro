import React, { useMemo, useEffect, useRef, useState } from 'react';
import { Gantt, Task as GanttTask, ViewMode } from 'gantt-task-react';
import "gantt-task-react/dist/index.css";
import { Task } from '@/store/projectStore';
import { useUserPreferences } from '@/components/userpreferences/hooks/useUserPreferences';
import { useTaskEstimation } from '@/hooks/task/useTaskEstimation';
import { useTaskWorkVisualization } from '@/hooks/task/useTaskWorkVisualization';

interface ProfessionalGanttProps {
  tasks: Task[];
  onTaskUpdate?: (taskId: string, updates: { startDate: Date; endDate: Date; progress: number }) => void;
  onTaskSelect?: (task: Task) => void;
  onTaskDoubleClick?: (task: Task) => void;
  zoomLevel?: number;
  mode?: 'standard' | 'tracking';
}

/**
 * ProfessionalGantt - Высокоуровневая обертка над gantt-task-react.
 * Реализована поддержка скрытия зависимостей на уровне рендеринга (Stage 5.11.3).
 */
export const ProfessionalGantt: React.FC<ProfessionalGanttProps> = ({
  tasks,
  onTaskUpdate,
  onTaskSelect,
  onTaskDoubleClick,
  zoomLevel = 1,
  mode = 'standard'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const { preferences } = useUserPreferences();
  const { getFormattedName } = useTaskEstimation();
  const { getVisualProgress, showBaseline } = useTaskWorkVisualization(mode);
  const showDependencies = preferences.editing.showDependencies;

  // Инъекция стилей для визуализации базового плана и отклонений
  const baselineStyles = useMemo(() => `
    .gantt-baseline-enabled .task-delayed {
      stroke: #f59e0b !important;
      stroke-width: 1.5px !important;
      stroke-dasharray: 4 2 !important;
    }
  `, []);

  const ganttTasks = useMemo((): GanttTask[] => {
    if (!tasks.length) return [];
    return tasks.map(task => {
      const visualProgress = getVisualProgress(task);
      const isCritical = task.critical || task.criticalPath;
      
      // Логика цвета для режима отслеживания (Tracking)
      let barColor = task.color;
      if (mode === 'tracking' || showBaseline) {
        // Если есть базовый план и текущая дата окончания позже базовой - красим в оранжевый (задержка)
        if (task.baselineEndDate && new Date(task.endDate) > new Date(task.baselineEndDate)) {
          barColor = '#f59e0b'; // Warning/Delay color
        }
      }

      return {
        id: task.id,
        name: getFormattedName(task),
        start: new Date(task.startDate),
        end: new Date(task.endDate),
        progress: visualProgress,
        type: task.summary ? 'project' : (task.milestone ? 'milestone' : 'task'),
        dependencies: task.predecessors || [],
        styles: {
          backgroundColor: barColor || (isCritical ? '#ef4444' : '#3b82f6'),
          backgroundSelectedColor: '#2563eb',
          progressColor: isCritical ? '#b91c1c' : '#1d4ed8',
          progressSelectedColor: '#1e40af'
        },
        isDisabled: false,
        originalTask: task
      } as any;
    });
  }, [tasks, getFormattedName, getVisualProgress, mode, showBaseline]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const viewMode = useMemo(() => {
    if (zoomLevel <= 0.5) return ViewMode.Month;
    if (zoomLevel <= 1) return ViewMode.Week;
    return ViewMode.Day;
  }, [zoomLevel]);

  return (
    <div 
      ref={containerRef} 
      className={`professional-gantt-container w-full h-full bg-white relative gantt-modern-scrollbars ${showBaseline ? 'gantt-baseline-enabled' : ''}`}
    >
      {ganttTasks.length > 0 && dimensions.width > 0 ? (
        <div className="absolute inset-0 gantt-hide-list">
          <Gantt
            tasks={ganttTasks}
            viewMode={viewMode}
            onDateChange={(task) => {
              // Нормализация дат при перетаскивании в Ганте (Stage 7.18)
              const start = new Date(task.start);
              const end = new Date(task.end);
              start.setHours(0, 0, 0, 0);
              end.setHours(23, 59, 59, 999);
              onTaskUpdate?.(task.id, { startDate: start, endDate: end, progress: task.progress / 100 });
            }}
            onProgressChange={(task) => onTaskUpdate?.(task.id, { startDate: task.start, endDate: task.end, progress: task.progress / 100 })}
            onSelect={(t, sel) => sel && onTaskSelect?.((t as any).originalTask)}
            onDoubleClick={(t) => onTaskDoubleClick?.((t as any).originalTask)}
            listCellWidth=""
            ganttHeight={dimensions.height - 15}
            columnWidth={zoomLevel * 65}
            headerHeight={50}
            rowHeight={45}
            barCornerRadius={4}
            handleWidth={10}
            locale="ru-RU"
            fontSize="12px"
            projectBackgroundColor="#f1f5f9"
            projectProgressColor="#64748b"
            milestoneBackgroundColor="#334155"
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-slate-400 font-medium">
          {ganttTasks.length === 0 ? 'Нет задач для отображения' : 'Инициализация...'}
        </div>
      )}

      {/* OMEGA: Эталонное скрытие списка через официальный API (Stage 7.17.3) */}
      <style>{`
        /* Полное скрытие списка задач (библиотека не рендерит при listCellWidth="") */
        .gantt-hide-list div[class*="taskList"] { 
          display: none !important;
        }
        
        /* Убираем лишние границы слева от графика */
        .gantt-hide-list div[class*="gridRow"] { 
          border-left: none !important; 
        }
        
        /* Кастомные современные скроллбары (Webkit) */
        .gantt-modern-scrollbars ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .gantt-modern-scrollbars ::-webkit-scrollbar-track {
          background: #f8fafc;
          border-radius: 4px;
        }

        .gantt-modern-scrollbars ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
          border: 2px solid #f8fafc;
        }

        .gantt-modern-scrollbars ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Управление видимостью стрелок зависимостей */
        ${!showDependencies ? `
          .gantt-hide-list g[class*="arrow"] { display: none !important; }
          .gantt-hide-list path[class*="arrow"] { display: none !important; }
        ` : ''}
        
        ${baselineStyles}
      `}</style>
    </div>
  );
};

