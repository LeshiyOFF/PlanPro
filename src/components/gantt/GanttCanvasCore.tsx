import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { 
  GanttCanvasEngine, 
  GanttCanvasData, 
  CanvasEventHandlers,
  GanttTaskRender,
  GanttTimeline,
  GanttInteractionType,
  GanttInteraction,
  VarianceCalculator,
  GanttTaskMapper,
  GanttTimelineService
} from '@/domain';
import { GanttInteractionService } from '@/domain/canvas/services/GanttInteractionService';
import { 
  TimelineGridLayer,
  TimelineHeaderLayer,
  TaskRowsLayer,
  TaskNamesLayer,
  TaskBarsLayer,
  TrackingBarsLayer
} from '@/domain/canvas';
import { useContextMenu } from '@/presentation/contextmenu/providers/ContextMenuProvider';
import { ContextMenuType } from '@/domain/contextmenu/ContextMenuType';
import { GANTT_CONSTANTS } from '@/domain/canvas/GanttConstants';
import { useGanttCanvasHandlers } from '@/hooks/useGanttCanvasHandlers';

interface GanttCanvasCoreProps {
  width?: number;
  height?: number;
  tasks?: any[];
  startDate?: Date;
  endDate?: Date;
  selectedTask?: string | null;
  onTaskSelect?: (task: any) => void;
  onTaskDoubleClick?: (task: any) => void;
  onTaskUpdate?: (taskId: string, updates: { startDate: Date; endDate: Date }) => void;
  zoomLevel?: number;
  mode?: 'standard' | 'tracking';
}

/**
 * Gantt Canvas Core Component
 * Pure canvas rendering with interaction support
 */
export const GanttCanvasCore: React.FC<GanttCanvasCoreProps> = ({
  width = 1200,
  height = 600,
  tasks = [],
  startDate = new Date(),
  endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  selectedTask,
  onTaskSelect,
  onTaskDoubleClick,
  onTaskUpdate,
  zoomLevel = 1,
  mode = 'standard'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GanttCanvasEngine | null>(null);
  const interactionService = useMemo(() => new GanttInteractionService(), []);
  const { showMenu } = useContextMenu();

  const eventHandlers = useGanttCanvasHandlers(
    engineRef,
    interactionService,
    onTaskSelect,
    onTaskDoubleClick,
    onTaskUpdate,
    showMenu
  );

  /**
   * Calculate task position on timeline
   */
  const calculateTaskPosition = useCallback((taskStart: any, timelineStart: any): number => {
    try {
      const start = taskStart instanceof Date ? taskStart : new Date(taskStart);
      const tStart = timelineStart instanceof Date ? timelineStart : new Date(timelineStart);
      const daysDiff = (start.getTime() - tStart.getTime()) / (24 * 60 * 60 * 1000);
      return daysDiff * 24 * zoomLevel;
    } catch (e) {
      return 0;
    }
  }, [zoomLevel]);

  /**
   * Calculate task duration
   */
  const calculateTaskDuration = useCallback((taskStart: any, taskEnd: any): number => {
    try {
      const start = taskStart instanceof Date ? taskStart : new Date(taskStart);
      const end = taskEnd instanceof Date ? taskEnd : new Date(taskEnd);
      const daysDiff = (end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000);
      return Math.max(daysDiff * 24 * zoomLevel, 24 * zoomLevel);
    } catch (e) {
      return 24 * zoomLevel;
    }
  }, [zoomLevel]);

  // Memoize data conversion
  const renderTasks = useMemo(() => {
    return GanttTaskMapper.mapTasksToRenderData(
      tasks,
      selectedTask || null,
      startDate,
      zoomLevel,
      calculateTaskPosition,
      calculateTaskDuration
    );
  }, [tasks, selectedTask, startDate, zoomLevel, calculateTaskPosition, calculateTaskDuration]);

  /**
   * Timeline data memoization
   */
  const timelineData = useMemo((): GanttTimeline => {
    return GanttTimelineService.calculateTimeline(startDate, endDate, zoomLevel);
  }, [startDate, endDate, zoomLevel]);

  /**
   * Layers initialization
   */
  const layers = useMemo(() => {
    const list = [];
    try {
      if (typeof TimelineGridLayer === 'function') list.push(new TimelineGridLayer());
      if (typeof TaskRowsLayer === 'function') list.push(new TaskRowsLayer());
      
      if (mode === 'tracking' && typeof TrackingBarsLayer === 'function') {
        list.push(new TrackingBarsLayer());
      } else if (typeof TaskBarsLayer === 'function') {
        list.push(new TaskBarsLayer());
      }
      
      if (typeof TimelineHeaderLayer === 'function') list.push(new TimelineHeaderLayer());
    } catch (e) {
      console.error('Critical error initializing Gantt layers:', e);
    }
    return list;
  }, [mode]);

  /**
   * Initialize canvas engine (ONLY ONCE or on dimension change)
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Создаем движок один раз
    const engine = new GanttCanvasEngine(canvas, eventHandlers);
    engine.initialize(width, height);
    engineRef.current = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [width, height]);

  /**
   * Update engine handlers when they change
   */
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateHandlers(eventHandlers);
    }
  }, [eventHandlers]);

  /**
   * Update canvas data only when dependencies change
   */
  useEffect(() => {
    if (!engineRef.current) return;

    try {
      const data: GanttCanvasData = {
        tasks: renderTasks,
        timeline: timelineData,
        viewport: {
          scale: 1,
          offsetX: 0,
          offsetY: 0,
          minScale: 0.5,
          maxScale: 3
        },
        selectedTask: selectedTask || undefined,
        layers
      };

      engineRef.current.updateData(data);
      engineRef.current.render();
    } catch (error) {
      logger.error('Failed to update or render canvas', error, 'GanttCanvasCore');
    }
  }, [renderTasks, timelineData, selectedTask, layers]);

  return (
    <div className="gantt-canvas-container border border-gray-300 rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="block"
        style={{ width: `${width}px`, height: `${height}px` }}
      />
    </div>
  );
};
