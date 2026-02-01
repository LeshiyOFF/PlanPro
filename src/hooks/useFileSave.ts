import { useCallback, useRef, useState } from 'react'
import { useProjectStore } from '@/store/projectStore'
import { useProjectLibreAPI } from './useProjectLibreAPI'
import { LastProjectService } from '@/services/LastProjectService'
import { TaskDataConverter } from '@/services/TaskDataConverter'
import { ResourceDataConverter } from '@/services/ResourceDataConverter'
import { getElectronAPI } from '@/utils/electronAPI'

const LOG_TAG = '[useFileSave]'

/**
 * Hook for saving projects (Save and Save As).
 * Single responsibility: sync store to Core and persist to file.
 * Part of file operations decomposition (SOLID SRP).
 */
export const useFileSave = () => {
  const { file } = useProjectLibreAPI()
  const {
    currentProjectId,
    currentFilePath,
    tasks,
    resources,
    calendars,
    setProjectInfo,
    markClean,
  } = useProjectStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const saveProjectAsRef = useRef<() => Promise<void>>()

  const validateProjectId = useCallback(async (): Promise<boolean> => {
    if (!currentProjectId || currentProjectId < 0) {
      console.warn(`${LOG_TAG} Invalid projectId: ${currentProjectId}. Project may not exist in Java.`)
      const api = getElectronAPI()
      if (api?.showMessageBox) {
        await api.showMessageBox({
          type: 'warning',
          title: 'Проект не инициализирован',
          message: 'Проект не зарегистрирован в системе.\n\nСоздайте новый проект или откройте существующий файл.',
        })
      }
      return false
    }
    return true
  }, [currentProjectId])

  const performSyncBeforeSave = useCallback(async (): Promise<boolean> => {
    if (tasks.length === 0 && resources.length === 0) return true
    if (currentProjectId == null || currentProjectId < 0) return false

    console.log(`${LOG_TAG} Syncing project to Core before save...`)
    const syncTasksData = TaskDataConverter.frontendTasksToSync(tasks)
    const syncResourcesData = ResourceDataConverter.frontendResourcesToSync(resources, calendars)

    try {
      await file.syncProjectToCore({
        projectId: currentProjectId,
        tasks: syncTasksData,
        resources: syncResourcesData,
      })
      return true
    } catch (syncError: unknown) {
      const errorMessage = syncError instanceof Error ? syncError.message : 'Unknown error'
      console.error(`${LOG_TAG} Sync failed:`, errorMessage)
      if (errorMessage.includes('календарь')) {
        const api = getElectronAPI()
        if (api?.showMessageBox) {
          await api.showMessageBox({
            type: 'warning',
            title: 'Проблема с календарем',
            message: errorMessage,
          })
        }
        return false
      }
      throw syncError
    }
  }, [currentProjectId, file, tasks, resources, calendars])

  const saveProjectAs = useCallback(async (): Promise<void> => {
    if (isProcessing) return

    const isValid = await validateProjectId()
    if (!isValid) return

    try {
      setIsProcessing(true)
      const api = getElectronAPI()
      if (!api?.showSaveDialog) return
      const result = await api.showSaveDialog({
        title: 'Сохранить проект как',
        defaultPath: currentFilePath ?? 'project.pod',
        filters: [
          { name: 'ProjectLibre (.pod)', extensions: ['pod'] },
          { name: 'Microsoft Project XML (.xml)', extensions: ['xml'] },
        ],
      })
      if (result.canceled || !result.filePath) return

      const syncOk = await performSyncBeforeSave()
      if (!syncOk) return
      const projectId = currentProjectId as number

      const response = await file.saveProject({
        projectId,
        filePath: result.filePath,
        createBackup: false,
      })

      if (response.success) {
        setProjectInfo(projectId, result.filePath)
        LastProjectService.getInstance().saveLastProject(result.filePath)
        console.log(`${LOG_TAG} MRU updated after SaveAs:`, result.filePath)
        markClean()
        const api = getElectronAPI()
        if (api?.showMessageBox) {
          await api.showMessageBox({
            type: 'info',
            title: 'Сохранено',
            message: `Проект успешно сохранён в:\n${result.filePath}`,
          })
        }
      } else {
        const api = getElectronAPI()
        if (api?.showMessageBox) {
          await api.showMessageBox({
            type: 'error',
            title: 'Ошибка сохранения',
            message: `Не удалось сохранить проект: ${response.error}`,
          })
        }
      }
    } catch (error) {
      console.error(`${LOG_TAG} Error in save as:`, error)
    } finally {
      setIsProcessing(false)
    }
  }, [
    currentProjectId,
    currentFilePath,
    file,
    setProjectInfo,
    isProcessing,
    tasks,
    markClean,
    validateProjectId,
    performSyncBeforeSave,
  ])

  saveProjectAsRef.current = saveProjectAs

  const saveProject = useCallback(async (): Promise<void> => {
    if (isProcessing) return

    const isValid = await validateProjectId()
    if (!isValid) return

    if (!currentFilePath) {
      if (saveProjectAsRef.current) {
        return saveProjectAsRef.current()
      }
      return
    }

    try {
      setIsProcessing(true)

      const syncOk = await performSyncBeforeSave()
      if (!syncOk) return
      const projectId = currentProjectId as number

      const response = await file.saveProject({
        projectId,
        filePath: currentFilePath,
        createBackup: false,
      })

      if (response.success) {
        markClean()
        LastProjectService.getInstance().saveLastProject(currentFilePath)
        console.log(`${LOG_TAG} MRU updated after Save:`, currentFilePath)
        const api = getElectronAPI()
        if (api?.showMessageBox) {
          await api.showMessageBox({
            type: 'info',
            title: 'Сохранено',
            message: `Проект успешно сохранён в:\n${response.filePath}`,
          })
        }
      } else {
        const api = getElectronAPI()
        if (api?.showMessageBox) {
          await api.showMessageBox({
            type: 'error',
            title: 'Ошибка сохранения',
            message: `Не удалось сохранить проект: ${response.error}`,
          })
        }
      }
    } catch (error) {
      console.error(`${LOG_TAG} Error saving project:`, error)
    } finally {
      setIsProcessing(false)
    }
  }, [
    currentProjectId,
    currentFilePath,
    file,
    isProcessing,
    markClean,
    validateProjectId,
    performSyncBeforeSave,
  ])

  return { saveProject, saveProjectAs, isProcessing }
}
