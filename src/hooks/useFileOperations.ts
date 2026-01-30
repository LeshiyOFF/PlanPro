import { useCallback, useRef, useState } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { useProjectLibreAPI } from './useProjectLibreAPI';
import { LastProjectService } from '@/services/LastProjectService';
import { TaskDataConverter } from '@/services/TaskDataConverter';
import { ResourceDataConverter } from '@/services/ResourceDataConverter';
import { CalendarDataConverter } from '@/services/CalendarDataConverter';
import { TaskLinkService } from '@/domain/services/TaskLinkService';

/**
 * Hook for file operations (Open, Save, Save As, New).
 * Connects UI, Electron dialogs and Java backend.
 * 
 * CRITICAL: After loading a .pod file, this hook retrieves full project data
 * (tasks + resources + calendars) from the Core model and populates the frontend store.
 * 
 * V2.0: Added calendar import support.
 * V2.1: CRITICAL FIX - исправлен stale closure баг с calendars при повторном открытии файла.
 *       Теперь используется getState() для получения актуального состояния после reset().
 */
export const useFileOperations = () => {
  const { file, projects: projectApi } = useProjectLibreAPI();
  const { tasks, resources, calendars, currentProjectId, currentFilePath, setProjectInfo, setTasks, setResources, addCalendar, reset, markClean } = useProjectStore();
  
  // Состояние для предотвращения двойных вызовов (Double Trigger protection)
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Используем ref для избежания проблем с circular dependencies между saveProject и saveProjectAs
  const saveProjectAsRef = useRef<() => Promise<void>>();

  /**
   * Create a new project.
   * @param silent - если true, не показывает диалоги (для автостарта)
   * @returns true если проект успешно создан
   */
  const createNewProject = useCallback(async (silent: boolean = false): Promise<boolean> => {
    if (isProcessing) {
      console.warn('[useFileOperations] Already processing an operation, ignoring createNewProject');
      return false;
    }

    try {
      setIsProcessing(true);
      
      if (!window.electronAPI) {
        console.error('[useFileOperations] Electron API not available');
        return false;
      }

      if (!projectApi) {
        console.error('[useFileOperations] Project API client is not available');
        if (!silent) {
          await window.electronAPI.showMessageBox({
            type: 'error',
            title: 'Ошибка',
            message: 'API клиент недоступен. Проверьте подключение к Java бэкенду.'
          });
        }
        return false;
      }

      const timestamp = new Date().toLocaleString('ru-RU');
      const name = `Новый проект ${timestamp}`;
      const startDate = new Date();
      
      const projectData = {
        name,
        description: 'Создано через React интерфейс',
        startDate
      };
      
      console.log('[useFileOperations] Creating new project with data:', projectData);
      
      const response = await projectApi.createProject(projectData);

      if (response && response.id) {
        console.log(`[useFileOperations] New project created with ID: ${response.id}`);
        reset();
        setProjectInfo(Number(response.id), undefined);
        
        if (!silent) {
          await window.electronAPI.showMessageBox({
            type: 'info',
            title: 'Успех',
            message: `Проект "${name}" успешно создан!\n\nID: ${response.id}\n\nТеперь вы можете добавлять задачи и сохранить проект.`
          });
        }
        return true;
      } else {
        throw new Error('Server returned empty response');
      }
    } catch (error) {
      console.error('[useFileOperations] Error creating project:', error);
      if (!silent && window.electronAPI) {
        await window.electronAPI.showMessageBox({
          type: 'error',
          title: 'Ошибка создания проекта',
          message: `Не удалось создать проект: ${(error as Error).message}`
        });
      }
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [projectApi, setProjectInfo, reset, isProcessing]);

  /**
   * Internal logic to load a project from path.
   * CRITICAL: After loading the file, retrieves full project data and populates store.
   */
  const loadProjectFromPath = useCallback(async (filePath: string) => {
    try {
      if (!filePath || filePath.trim().length === 0) return false;

      // ✅ РАЗРЕШЕННЫЕ ФОРМАТЫ: .pod, .mpp, .xml
      const allowedExtensions = ['.pod', '.mpp', '.xml'];
      const fileExt = filePath.toLowerCase().slice(filePath.lastIndexOf('.'));

      if (!allowedExtensions.includes(fileExt)) {
        if (window.electronAPI) {
          await window.electronAPI.showMessageBox({
            type: 'warning',
            title: 'Неподдерживаемый формат',
            message: `Файл "${fileExt}" не поддерживается.\n\nПожалуйста, выберите файл .pod, .mpp (Microsoft Project) или .xml`
          });
        }
        return false;
      }

      console.log(`[useFileOperations] Step 1: Loading ${fileExt} file via Java backend...`);
      
      // 🔒 КРИТИЧНО: Отключаем автокоррекцию дат при загрузке файла
      TaskLinkService.setLoadingMode(true);
      
      const response = await file.loadProject({ filePath });
      
      if (!response.success || !response.projectId) {
        console.error('[useFileOperations] Load failed:', response.error);
        // 🔓 Включаем обратно даже при ошибке
        TaskLinkService.setLoadingMode(false);
        
        if (window.electronAPI) {
          await window.electronAPI.showMessageBox({
            type: 'error',
            title: 'Ошибка загрузки',
            message: `Не удалось загрузить проект: ${response.error}`
          });
        }
        return false;
      }

      console.log('[useFileOperations] Step 2: File loaded, projectId:', response.projectId);
      
      // Сохраняем путь как последний открытый проект (MRU)
      LastProjectService.getInstance().setLastProject(filePath);
      
      // Очищаем store перед загрузкой новых данных
      reset();
      setProjectInfo(response.projectId, filePath);

      // CRITICAL STEP 3: Получаем полные данные проекта (tasks + resources)
      console.log('[useFileOperations] Step 3: Fetching project data from Core model...');
      
      try {
        const projectData = await file.getProjectData(response.projectId);
        
        if (projectData && projectData.tasks && projectData.tasks.length > 0) {
          console.log('[useFileOperations] Step 4: Converting and populating store...');
          console.log(`[useFileOperations] Tasks: ${projectData.tasks.length}, Resources: ${projectData.resources?.length || 0}, Calendars: ${projectData.calendars?.length || 0}`);
          
          // Конвертируем задачи
          const frontendTasks = projectData.tasks.map(TaskDataConverter.coreToFrontendTask);
          setTasks(frontendTasks);
          
          // Конвертируем ресурсы
          if (projectData.resources && projectData.resources.length > 0) {
            const frontendResources = projectData.resources.map(TaskDataConverter.coreToFrontendResource);
            setResources(frontendResources);
          }
          
          // V2.1: Импортируем кастомные календари из Java
          // CRITICAL FIX: Используем getState() для получения АКТУАЛЬНОГО состояния после reset()
          // Без этого фикса calendars содержит stale данные из замыкания, включая
          // кастомные календари от предыдущей загрузки, что приводит к их фильтрации
          if (projectData.calendars && projectData.calendars.length > 0) {
            const currentCalendars = useProjectStore.getState().calendars;
            const existingIds = currentCalendars.map(c => c.id);
            const newCalendars = CalendarDataConverter.apiToFrontendCalendars(
              projectData.calendars,
              existingIds
            );
            
            if (newCalendars.length > 0) {
              console.log(`[useFileOperations] 📅 Importing ${newCalendars.length} custom calendars...`);
              newCalendars.forEach(cal => {
                console.log(`[useFileOperations]   - ${cal.name} (${cal.id})`);
                addCalendar(cal);
              });
            }
          }
          
          // 🔓 КРИТИЧНО: Включаем автокоррекцию обратно ПОСЛЕ загрузки данных
          TaskLinkService.setLoadingMode(false);
          
          console.log('[useFileOperations] ✅ Store populated successfully!');
          
          if (window.electronAPI) {
            await window.electronAPI.showMessageBox({
              type: 'info',
              title: 'Проект загружен',
              message: `Проект "${response.projectName || projectData.projectName || 'Unknown'}" успешно загружен!\n\nЗадач: ${frontendTasks.length}\nРесурсов: ${projectData.resources?.length || 0}\nКалендарей: ${projectData.calendars?.length || 0}`
            });
          }
        } else {
          console.warn('[useFileOperations] ⚠️ No tasks in project data');
          if (window.electronAPI) {
            await window.electronAPI.showMessageBox({
              type: 'info',
              title: 'Проект загружен',
              message: `Проект "${response.projectName || 'Unknown'}" загружен, но не содержит задач.`
            });
          }
        }
        
        return true;
        
      } catch (dataError) {
        // Если не удалось получить данные, всё равно считаем файл загруженным
        console.error('[useFileOperations] Error fetching project data:', dataError);
        if (window.electronAPI) {
          await window.electronAPI.showMessageBox({
            type: 'warning',
            title: 'Частичная загрузка',
            message: `Файл проекта загружен, но не удалось получить данные задач. Ошибка: ${(dataError as Error).message}`
          });
        }
        return true;
      }
      
    } catch (error) {
      console.error('[useFileOperations] Error in loadProjectFromPath:', error);
      if (window.electronAPI) {
        await window.electronAPI.showMessageBox({
          type: 'error',
          title: 'Ошибка',
          message: `Ошибка загрузки: ${(error as Error).message}`
        });
      }
      return false;
    }
  }, [file, setProjectInfo, setTasks, setResources, reset]);

  /**
   * Open project from .pod file
   */
  const openProject = useCallback(async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      if (!window.electronAPI) return;

      const result = await window.electronAPI.showOpenDialog({
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
      console.error('[useFileOperations] Error opening project:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [loadProjectFromPath, isProcessing]);

  /**
   * Проверяет валидность currentProjectId.
   * ID должен существовать в Java-ядре (не -1 и не undefined).
   */
  const validateProjectId = useCallback(async (): Promise<boolean> => {
    if (!currentProjectId || currentProjectId < 0) {
      console.warn(`[useFileOperations] ⚠️ Invalid projectId: ${currentProjectId}. Project may not exist in Java.`);
      if (window.electronAPI) {
        await window.electronAPI.showMessageBox({
          type: 'warning',
          title: 'Проект не инициализирован',
          message: 'Проект не зарегистрирован в системе.\n\nСоздайте новый проект или откройте существующий файл.'
        });
      }
      return false;
    }
    return true;
  }, [currentProjectId]);

  /**
   * Save project as...
   */
  const saveProjectAs = useCallback(async () => {
    if (isProcessing) return;
    
    // Consistency Validation: проверяем что проект существует в Java
    const isValid = await validateProjectId();
    if (!isValid) return;

    try {
      setIsProcessing(true);
      if (!window.electronAPI) return;
      
      const result = await window.electronAPI.showSaveDialog({
        title: 'Сохранить проект как',
        defaultPath: currentFilePath || 'project.pod',
        filters: [
          { name: 'ProjectLibre (.pod)', extensions: ['pod'] },
          { name: 'Microsoft Project XML (.xml)', extensions: ['xml'] }
        ]
      });

      if (result.canceled || !result.filePath) return;

      // CRITICAL: Синхронизируем задачи и ресурсы из UI в Core перед сохранением
      // V2.0: Передаём calendars для синхронизации полных настроек кастомных календарей
      if (tasks.length > 0 || resources.length > 0) {
        console.log('[useFileOperations] Syncing project to Core before save...');
        const syncTasksData = TaskDataConverter.frontendTasksToSync(tasks);
        // CRITICAL FIX: Передаём calendars для включения calendarData в синхронизацию
        const syncResourcesData = ResourceDataConverter.frontendResourcesToSync(resources, calendars);
        try {
          await file.syncProjectToCore({ 
            projectId: currentProjectId, 
            tasks: syncTasksData,
            resources: syncResourcesData
          });
        } catch (syncError: unknown) {
          const errorMessage = syncError instanceof Error ? syncError.message : 'Unknown error';
          console.error('[useFileOperations] Sync failed:', errorMessage);
          // Если это наша специальная ошибка календаря, показываем её профессионально
          if (errorMessage.includes('календарь')) {
            if (window.electronAPI) {
              await window.electronAPI.showMessageBox({
                type: 'warning',
                title: 'Проблема с календарем',
                message: errorMessage
              });
            }
            return; // Прерываем сохранение, так как данные некорректны
          }
          throw syncError; // Прочие ошибки пробрасываем дальше
        }
      }

      const response = await file.saveProject({
        projectId: currentProjectId,
        filePath: result.filePath,
        createBackup: false
      });

      if (response.success) {
        setProjectInfo(currentProjectId, result.filePath);
        
        // ✅ CRITICAL FIX: Обновляем MRU с НОВЫМ путём после SaveAs
        // Гарантирует что при следующем запуске откроется файл из нового места
        const lastProjectService = LastProjectService.getInstance();
        lastProjectService.saveLastProject(result.filePath);
        console.log('[useFileOperations] ✅ MRU updated after SaveAs:', result.filePath);
        
        markClean(); // Помечаем проект как сохраненный
        await window.electronAPI.showMessageBox({
          type: 'info',
          title: 'Сохранено',
          message: `Проект успешно сохранён в:\n${result.filePath}`
        });
      } else {
        await window.electronAPI.showMessageBox({
          type: 'error',
          title: 'Ошибка сохранения',
          message: `Не удалось сохранить проект: ${response.error}`
        });
      }
    } catch (error) {
      console.error('[useFileOperations] Error in save as:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [currentProjectId, currentFilePath, file, setProjectInfo, isProcessing, tasks, markClean, validateProjectId]);

  saveProjectAsRef.current = saveProjectAs;

  /**
   * Save current project
   */
  const saveProject = useCallback(async () => {
    if (isProcessing) return;
    
    // Consistency Validation: проверяем что проект существует в Java
    const isValid = await validateProjectId();
    if (!isValid) return;

    if (!currentFilePath) {
      if (saveProjectAsRef.current) {
        return saveProjectAsRef.current();
      }
      return;
    }

    try {
      setIsProcessing(true);
      
      // CRITICAL: Синхронизируем задачи и ресурсы из UI в Core перед сохранением
      // V2.0: Передаём calendars для синхронизации полных настроек кастомных календарей
      if (tasks.length > 0 || resources.length > 0) {
        console.log('[useFileOperations] Syncing project to Core before save...');
        const syncTasksData = TaskDataConverter.frontendTasksToSync(tasks);
        // CRITICAL FIX: Передаём calendars для включения calendarData в синхронизацию
        const syncResourcesData = ResourceDataConverter.frontendResourcesToSync(resources, calendars);
        try {
          await file.syncProjectToCore({ 
            projectId: currentProjectId, 
            tasks: syncTasksData,
            resources: syncResourcesData
          });
        } catch (syncError: unknown) {
          const errorMessage = syncError instanceof Error ? syncError.message : 'Unknown error';
          console.error('[useFileOperations] Sync failed:', errorMessage);
          // Если это наша специальная ошибка календаря, показываем её профессионально
          if (errorMessage.includes('календарь')) {
            if (window.electronAPI) {
              await window.electronAPI.showMessageBox({
                type: 'warning',
                title: 'Проблема с календарем',
                message: errorMessage
              });
            }
            return; // Прерываем сохранение, так как данные некорректны
          }
          throw syncError; // Прочие ошибки пробрасываем дальше
        }
      }

      const response = await file.saveProject({
        projectId: currentProjectId,
        filePath: currentFilePath,
        createBackup: false
      });

      if (response.success) {
        markClean(); // Помечаем проект как сохраненный
        
        // ✅ CRITICAL FIX: Обновляем MRU после успешного сохранения
        // Гарантирует что при следующем запуске откроется этот файл
        const lastProjectService = LastProjectService.getInstance();
        lastProjectService.saveLastProject(currentFilePath);
        console.log('[useFileOperations] ✅ MRU updated after Save:', currentFilePath);
        
        if (window.electronAPI) {
          await window.electronAPI.showMessageBox({
            type: 'info',
            title: 'Сохранено',
            message: `Проект успешно сохранён в:\n${response.filePath}`
          });
        }
      } else {
        if (window.electronAPI) {
          await window.electronAPI.showMessageBox({
            type: 'error',
            title: 'Ошибка сохранения',
            message: `Не удалось сохранить проект: ${response.error}`
          });
        }
      }
    } catch (error) {
      console.error('[useFileOperations] Error saving project:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [currentProjectId, currentFilePath, file, isProcessing, tasks, markClean, validateProjectId]);

  return {
    createNewProject,
    openProject,
    saveProject,
    saveProjectAs,
    loadProjectFromPath,
    currentFilePath,
    isProcessing
  };
};

