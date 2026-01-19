import { useCallback, useMemo } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { useUserPreferences } from '@/components/userpreferences/hooks/useUserPreferences';
import { TaskDeletionService } from '@/services/task/TaskDeletionService';

/**
 * useTaskDeletion - Хук для управления процессом удаления задач.
 * Интегрирует бизнес-логику из TaskDeletionService с состоянием приложения.
 */
export const useTaskDeletion = () => {
  const { deleteTask } = useProjectStore();
  const { preferences } = useUserPreferences();
  
  const deletionService = useMemo(() => new TaskDeletionService(), []);

  const isDeletionAllowed = useMemo(() => 
    deletionService.canDeleteTask(preferences), 
    [deletionService, preferences]
  );

  const performDeleteTask = useCallback((taskId: string) => {
    if (!isDeletionAllowed) {
      console.warn('[TaskDeletion] Deletion is disabled in preferences');
      return false;
    }

    // В будущем здесь можно добавить логику подтверждения через диалоговое окно,
    // если deletionService.shouldConfirmDeletion(preferences) === true.
    
    deleteTask(taskId);
    return true;
  }, [isDeletionAllowed, deleteTask]);

  return {
    isDeletionAllowed,
    deleteTask: performDeleteTask,
    shouldConfirm: deletionService.shouldConfirmDeletion(preferences)
  };
};

