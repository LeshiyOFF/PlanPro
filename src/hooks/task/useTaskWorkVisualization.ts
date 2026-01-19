import { useMemo, useCallback } from 'react';
import { useUserPreferences } from '@/components/userpreferences/hooks/useUserPreferences';
import { TaskWorkVisualizationService } from '@/services/task/TaskWorkVisualizationService';
import { Task } from '@/store/projectStore';

/**
 * useTaskWorkVisualization - Хук для синхронизации визуализации работ с настройками.
 */
export const useTaskWorkVisualization = (mode: 'standard' | 'tracking' = 'standard') => {
  const { preferences } = useUserPreferences();
  const visualizationService = useMemo(() => new TaskWorkVisualizationService(), []);

  const showActual = useMemo(() => 
    visualizationService.shouldShowActualWork(preferences), 
    [visualizationService, preferences]
  );

  const showBaseline = useMemo(() => 
    visualizationService.shouldShowBaselineWork(mode, preferences), 
    [visualizationService, mode, preferences]
  );

  const getVisualProgress = useCallback((task: Task) => {
    return visualizationService.getVisualProgress(task, preferences);
  }, [visualizationService, preferences]);

  return {
    showActual,
    showBaseline,
    getVisualProgress,
    baselineStyles: visualizationService.getBaselineStyles([], showBaseline)
  };
};
