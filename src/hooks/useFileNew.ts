import { useCallback, useState } from 'react'
import { useProjectStore } from '@/store/projectStore'
import { useProjectLibreAPI } from './useProjectLibreAPI'
import { getElectronAPI } from '@/utils/electronAPI'

const LOG_TAG = '[useFileNew]'

/**
 * Hook for creating a new project.
 * Single responsibility: create project via API and update store.
 * Part of file operations decomposition (SOLID SRP).
 */
export const useFileNew = () => {
  const { projects: projectApi } = useProjectLibreAPI()
  const { setProjectInfo, reset } = useProjectStore()
  const [isProcessing, setIsProcessing] = useState(false)

  const createNewProject = useCallback(async (silent: boolean = false): Promise<boolean> => {
    if (isProcessing) {
      console.warn(`${LOG_TAG} Already processing, ignoring createNewProject`)
      return false
    }

    try {
      setIsProcessing(true)

      const api = getElectronAPI()
      if (!api) {
        console.error(`${LOG_TAG} Electron API not available`)
        return false
      }

      if (!projectApi) {
        console.error(`${LOG_TAG} Project API client is not available`)
        if (!silent && api.showMessageBox) {
          await api.showMessageBox({
            type: 'error',
            title: 'Ошибка',
            message: 'API клиент недоступен. Проверьте подключение к Java бэкенду.',
          })
        }
        return false
      }

      const timestamp = new Date().toLocaleString('ru-RU')
      const name = `Новый проект ${timestamp}`
      const start = new Date()
      const finish = new Date(start.getTime() + 24 * 60 * 60 * 1000)

      const projectData = {
        name,
        description: 'Создано через React интерфейс',
        start,
        finish,
      }

      console.log(`${LOG_TAG} Creating new project:`, projectData)

      const response = await projectApi.createProject(projectData)

      if (response && response.id) {
        console.log(`${LOG_TAG} New project created with ID: ${response.id}`)
        reset()
        setProjectInfo(Number(response.id), undefined)

        if (!silent && api.showMessageBox) {
          await api.showMessageBox({
            type: 'info',
            title: 'Успех',
            message: `Проект "${name}" успешно создан!\n\nID: ${response.id}\n\nТеперь вы можете добавлять задачи и сохранить проект.`,
          })
        }
        return true
      }

      throw new Error('Server returned empty response')
    } catch (error) {
      console.error(`${LOG_TAG} Error creating project:`, error)
      if (!silent) {
        const electronApi = getElectronAPI()
        if (electronApi?.showMessageBox) {
          await electronApi.showMessageBox({
            type: 'error',
            title: 'Ошибка создания проекта',
            message: `Не удалось создать проект: ${(error as Error).message}`,
          })
        }
      }
      return false
    } finally {
      setIsProcessing(false)
    }
  }, [projectApi, setProjectInfo, reset, isProcessing])

  return { createNewProject, isProcessing }
}
