import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Types для Gantt диаграммы
interface GanttTask {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dependencies: string[];
  assignee?: string;
}

interface GanttBarProps {
  task: GanttTask;
  left: number;
  width: number;
  height: number;
  color: string;
  top: number;
  onTaskClick?: (task: GanttTask) => void;
  onTaskHover?: (task: GanttTask, event: React.MouseEvent) => void;
}

// Virtualization constants
const ROW_HEIGHT = 40;
const HEADER_HEIGHT = 60;
const MIN_TASK_WIDTH = 5;
const DAY_WIDTH = 40;

// Utility функции
const getDaysBetween = (start: Date, end: Date): number => {
  const diffTime = end.getTime() - start.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'not_started': return '#94a3b8';
    case 'in_progress': return '#3b82f6';
    case 'completed': return '#10b981';
    default: return '#6b7280';
  }
};

const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'critical': return '#ef4444';
    case 'high': return '#f97316';
    case 'medium': return '#eab308';
    case 'low': return '#22c55e';
    default: return '#6b7280';
  }
};

/**
 * Virtualized Gantt Bar Component
 * Отображает одну задачу как полосу на timeline
 */
const GanttBar: React.FC<GanttBarProps> = ({
  task,
  left,
  width,
  height,
  color,
  top,
  onTaskClick,
  onTaskHover
}) => {
  const handleClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    onTaskClick?.(task);
  }, [task, onTaskClick]);

  const handleHover = useCallback((event: React.MouseEvent) => {
    onTaskHover?.(task, event);
  }, [task, onTaskHover]);

  return (
    <div
      className={cn(
        "absolute border border-gray-200 rounded cursor-pointer transition-all hover:shadow-lg hover:border-blue-300",
        color === '#ef4444' && "border-red-300"
      )}
      style={{
        left: `${left}px`,
        width: `${width}px`,
        height: `${height}px`,
        top: `${top}px`,
        backgroundColor: color,
        minHeight: `${height}px`
      }}
      onClick={handleClick}
      onMouseEnter={handleHover}
      title={`${task.name} (${task.progress}%)`}
    >
      <div className="p-2 h-full flex flex-col justify-between">
        <div className="text-xs font-medium text-white truncate">
          {task.name}
        </div>
        <div className="flex items-center gap-1">
          <Badge 
            variant={task.status === 'completed' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {task.progress}%
          </Badge>
          {task.priority !== 'low' && (
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getPriorityColor(task.priority) }}
              title={`Priority: ${task.priority}`}
            />
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Virtual Row Component для отображения одного дня/недели
 */
const VirtualGanttRow: React.FC<{
  date: Date;
  tasks: GanttTask[];
  rowHeight: number;
}> = ({ date, tasks, rowHeight }) => {
  return (
    <div className="flex border-b border-gray-100" style={{ height: `${rowHeight}px` }}>
      <div className="w-20 flex-shrink-0 bg-gray-50 border-r border-gray-200 p-2 text-xs font-medium">
        {date.toLocaleDateString()}
      </div>
      <div className="flex-1 relative">
        {tasks.map(task => {
          const daysFromStart = getDaysBetween(task.startDate, date);
          const taskDuration = getDaysBetween(task.startDate, task.endDate);
          const left = daysFromStart * DAY_WIDTH;
          const width = taskDuration * DAY_WIDTH;
          
          return (
            <GanttBar
              key={task.id}
              task={task}
              left={left}
              width={Math.max(width, MIN_TASK_WIDTH)}
              height={rowHeight - 4}
              color={getStatusColor(task.status)}
              top={2}
              onTaskClick={(clickedTask) => {
                console.log('Task clicked:', clickedTask);
              }}
              onTaskHover={(hoveredTask, event) => {
                console.log('Task hovered:', hoveredTask);
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

/**
 * Header Component с информацией о проекте
 */
const GanttHeader: React.FC<{
  project: {
    name: string;
    startDate: Date;
    endDate: Date;
    tasks: GanttTask[];
  };
}> = ({ project }) => {
  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = project.tasks.filter(t => t.status === 'in_progress').length;
  const projectDuration = getDaysBetween(project.startDate, project.endDate);

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{project.name}</h3>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              {totalTasks} задач
            </Badge>
            <Badge variant="outline" className="bg-green-100 text-green-800">
              {completedTasks} завершено
            </Badge>
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
              {inProgressTasks} в работе
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium">Начало:</span>
            <div>{project.startDate.toLocaleDateString()}</div>
          </div>
          <div>
            <span className="font-medium">Окончание:</span>
            <div>{project.endDate.toLocaleDateString()}</div>
          </div>
          <div>
            <span className="font-medium">Длительность:</span>
            <div>{projectDuration} дней</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Основной Gantt Component с virtual scrolling
 */
interface GanttChartProps {
  tasks: GanttTask[];
  onTaskUpdate?: (taskId: string, updates: Partial<GanttTask>) => void;
  containerHeight?: number;
}

const GanttChart: React.FC<GanttChartProps> = ({ 
  tasks, 
  onTaskUpdate,
  containerHeight = 600 
}) => {
  const [scrollOffset, setScrollOffset] = useState(0);
  const [hoveredTask, setHoveredTask] = useState<GanttTask | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  // Calculate project timeline
  const projectTimeline = useMemo(() => {
    if (tasks.length === 0) {
      return { startDate: new Date(), endDate: new Date() };
    }

    const allDates = tasks.flatMap(task => [task.startDate, task.endDate]);
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

    return { startDate: minDate, endDate: maxDate };
  }, [tasks]);

  // Group tasks by date for virtual rendering
  const tasksByDate = useMemo(() => {
    const grouped = new Map<Date, GanttTask[]>();
    
    tasks.forEach(task => {
      const date = new Date(task.startDate.getFullYear(), task.startDate.getMonth(), task.startDate.getDate());
      
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)!.push(task);
    });

    return grouped;
  }, [tasks]);

  // Generate all dates in project timeline
  const allDates = useMemo(() => {
    const dates: Date[] = [];
    const currentDate = new Date(projectTimeline.startDate);
    
    while (currentDate <= projectTimeline.endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  }, [projectTimeline]);

  // Virtual scrolling calculations
  const totalHeight = useMemo(() => {
    return allDates.length * ROW_HEIGHT + HEADER_HEIGHT;
  }, [allDates]);

  const visibleDates = useMemo(() => {
    const visibleRowCount = Math.floor(containerHeight / ROW_HEIGHT);
    const startIndex = Math.floor(scrollOffset / ROW_HEIGHT);
    const endIndex = Math.min(startIndex + visibleRowCount + 5, allDates.length); // +5 для buffer
    
    return allDates.slice(startIndex, endIndex);
  }, [allDates, scrollOffset, containerHeight]);

  // Handle scroll
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const newOffset = event.currentTarget.scrollTop;
    setScrollOffset(newOffset);
  }, []);

  const handleTaskClick = useCallback((task: GanttTask) => {
    setSelectedTask(task.id);
    onTaskUpdate?.(task.id, { 
      ...task, 
      status: task.status === 'completed' ? 'not_started' : 'in_progress' 
    });
  }, [onTaskUpdate]);

  return (
    <div className="h-full flex flex-col">
      <GanttHeader
        project={{
          name: 'Gantt Prototype Demo',
          startDate: projectTimeline.startDate,
          endDate: projectTimeline.endDate,
          tasks: tasks
        }}
      />
      
      <div className="flex-1 relative">
        {/* Stats Bar */}
        <div className="bg-blue-50 border-b border-blue-200 p-4 text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Всего задач: {tasks.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>В работе: {tasks.filter(t => t.status === 'in_progress').length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Завершено: {tasks.filter(t => t.status === 'completed').length}</span>
            </div>
          </div>
          
          {hoveredTask && (
            <div className="ml-auto text-sm text-gray-600">
              Hovered: {hoveredTask.name}
            </div>
          )}
        </div>

        {/* Virtual Scrolling Container */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto"
          style={{ height: `${containerHeight}px` }}
          onScroll={handleScroll}
        >
          <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
            {/* Date Headers */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200" style={{ height: `${HEADER_HEIGHT}px` }}>
              <div className="flex h-full">
                {allDates.map(date => (
                  <div 
                    key={date.toISOString()} 
                    className="flex-shrink-0 w-20 bg-gray-50 border-r border-gray-200 p-2 text-xs font-medium border-b"
                  >
                    {date.toLocaleDateString()}
                  </div>
                ))}
              </div>
            </div>

            {/* Virtual Rows */}
            {visibleDates.map(date => (
              <VirtualGanttRow
                key={date.toISOString()}
                date={date}
                tasks={tasksByDate.get(date) || []}
                rowHeight={ROW_HEIGHT}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Показано: {visibleDates.length} из {allDates.length} дней
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => console.log('Export functionality')}
            >
              Экспорт
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => console.log('Print functionality')}
            >
              Печать
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;