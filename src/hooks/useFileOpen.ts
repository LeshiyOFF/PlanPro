import { useCallback, useState } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { useProjectLibreAPI } from './useProjectLibreAPI';
import { LastProjectService } from '@/services/LastProjectService';
import { TaskDataConverter } from '@/services/TaskDataConverter';
import { CalendarDataConverter, type CalendarDataFromApi } from '@/services/CalendarDataConverter';
import { TaskLinkService } from '@/domain/services/TaskLinkService';
import { getElectronAPI } from '@/utils/electronAPI';

const LOG_TAG = '[useFileOpen]';

const ALLOWED_EXTENSIONS = ['.pod', '.mpp', '.xml'];

/**
 * Hook for opening and loading project files.
 * Single responsibility: load file via backend and populate store.
 * Part of file operations decomposition (SOLID SRP).
 */
export const useFileOpen = () => {
  const { file } = useProjectLibreAPI();
  const {
    setProjectInfo,
    setTasks,
    setResources,
    reset,
    addCalendar
  } = useProjectStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const loadProjectFromPath = useCallback(async (filePath: string): Promise<boolean> => {
    try {
      if (!filePath || filePath.trim().length === 0) return false;

      const fileExt = filePath.toLowerCase().slice(filePath.lastIndexOf('.'));

      if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
        const api = getElectronAPI();
        if (api?.showMessageBox) {
          await api.showMessageBox({
            type: 'warning',
            title: 'Неподдерживаемый формат',
            message: `Файл "${fileExt}" не поддерживается.\n\nПожалуйста, выберите файл .pod, .mpp (Microsoft Project) или .xml`
          });
        }
        return false;
      }

      console.log(`${LOG_TAG} Step 1: Loading ${fileExt} file via Java backend...`);

      TaskLinkService.setLoadingMode(true);

      const response = await file.loadProject({ filePath });

      if (!response.success || !response.projectId) {
        console.error(`${LOG_TAG} Load failed:`, response.error);
        TaskLinkService.setLoadingMode(false);

        const api = getElectronAPI();
        if (api?.showMessageBox) {
          await api.showMessageBox({
            type: 'error',
            title: 'Ошибка загрузки',
            message: `Не удалось загрузить проект: ${response.error}`
          });
        }
        return false;
      }

      console.log(`${LOG_TAG} Step 2: File loaded, projectId:`, response.projectId);

      LastProjectService.getInstance().setLastProject(filePath);

      reset();
      setProjectInfo(response.projectId, filePath);

      console.log(`${LOG_TAG} Step 3: Fetching project data from Core model...`);

      try {
        const projectData = await file.getProjectData(response.projectId);

        if (projectData && projectData.tasks && projectData.tasks.length > 0) {
          console.log(`${LOG_TAG} Step 4: Converting and populating store...`);
          console.log(
            `${LOG_TAG} Tasks: ${projectData.tasks.length}, Resources: ${projectData.resources?.length ?? 0}, Calendars: ${projectData.calendars?.length ?? 0}`
          );

          const frontendTasks = projectData.tasks.map(TaskDataConverter.coreToFrontendTask);
          setTasks(frontendTasks);

          if (projectData.resources && projectData.resources.length > 0) {
            const frontendResources = projectData.resources.map(TaskDataConverter.coreToFrontendResource);
            setResources(frontendResources);
          }

          if (projectData.calendars && projectData.calendars.length > 0) {
            const currentCalendars = useProjectStore.getState().calendars;
            const existingIds = currentCalendars.map((c) => c.id);
            const calendarsForApi: CalendarDataFromApi[] = projectData.calendars.map((cal) => ({
              ...cal,
              exceptions: cal.exceptions?.map((ex) => ({ ...ex, working: ex.working ?? true })),
            }));
            const newCalendars = CalendarDataConverter.apiToFrontendCalendars(
              calendarsForApi,
              existingIds
            );

            if (newCalendars.length > 0) {
              console.log(`${LOG_TAG} Importing ${newCalendars.length} custom calendars...`);
              newCalendars.forEach((cal) => addCalendar(cal));
            }
          }

          TaskLinkService.setLoadingMode(false);
          console.log(`${LOG_TAG} Store populated successfully.`);

          const api = getElectronAPI();
          if (api?.showMessageBox) {
            await api.showMessageBox({
              type: 'info',
              title: 'Проект загружен',
              message: `Проект "${response.projectName ?? projectData.projectName ?? 'Unknown'}" успешно загружен!\n\nЗадач: ${frontendTasks.length}\nРесурсов: ${projectData.resources?.length ?? 0}\nКалендарей: ${projectData.calendars?.length ?? 0}`
            });
          }
        } else {
          console.warn(`${LOG_TAG} No tasks in project data`);
          const api = getElectronAPI();
          if (api?.showMessageBox) {
            await api.showMessageBox({
              type: 'info',
              title: 'Проект загружен',
              message: `Проект "${response.projectName ?? 'Unknown'}" загружен, но не содержит задач.`
            });
          }
        }

        return true;
      } catch (dataError) {
        console.error(`${LOG_TAG} Error fetching project data:`, dataError);
        const api = getElectronAPI();
        if (api?.showMessageBox) {
          await api.showMessageBox({
            type: 'warning',
            title: 'Частичная загрузка',
            message: `Файл проекта загружен, но не удалось получить данные задач. Ошибка: ${(dataError as Error).message}`
          });
        }
        return true;
      }
    } catch (error) {
      console.error(`${LOG_TAG} Error in loadProjectFromPath:`, error);
      const api = getElectronAPI();
      if (api?.showMessageBox) {
        await api.showMessageBox({
          type: 'error',
          title: 'Ошибка',
          message: `Ошибка загрузки: ${(error as Error).message}`
        });
      }
      return false;
    }
  }, [file, setProjectInfo, setTasks, setResources, reset, addCalendar]);

  const openProject = useCallback(async (): Promise<void> => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      const api = getElectronAPI();
      if (!api?.showOpenDialog) return;

      const result = await api.showOpenDialog({
        title: 'Открыть проект ПланПро',
        filters: [
          { name: 'Файлы ПланПро', extensions: ['pod'] },
          { name: 'Все файлы', extensions: ['*'] }
        ],
        properties: ['openFile']
      });

      if (result.canceled || result.filePaths.length === 0) return;

      await loadProjectFromPath(result.filePaths[0]);
    } catch (error) {
      console.error(`${LOG_TAG} Error opening project:`, error);
    } finally {
      setIsProcessing(false);
    }
  }, [loadProjectFromPath, isProcessing]);

  return { loadProjectFromPath, openProject, isProcessing };
};
