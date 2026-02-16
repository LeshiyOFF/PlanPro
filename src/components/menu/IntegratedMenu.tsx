import React, { useCallback, useEffect, useState } from 'react'
import { ContextMenu } from './ContextMenu'
import { ContextMenuType, ContextMenuItem, useMenuContext } from '@/providers/MenuProvider'
import { useKeyboardShortcuts, DEFAULT_SHORTCUTS } from '@/hooks/useKeyboardShortcuts'
import { ContextMenuFactory } from './factories/ContextMenuFactory'
import { useFileOperations } from '@/hooks/useFileOperations'
import { useTaskDeletion } from '@/hooks/task/useTaskDeletion'
import { contextActionService, ContextActionType } from '@/services/ContextActionService'
import { getElectronAPI } from '@/utils/electronAPI'

/**
 * Интегрированный Menu компонент
 * Объединяет Ribbon Menu, горячие клавиши и контекстные меню
 */
export const IntegratedMenu: React.FC = () => {
  const { contextMenu, showContextMenu, hideContextMenu } = useMenuContext()
  const { isDeletionAllowed } = useTaskDeletion()
  const { createNewProject, openProject, saveProject, saveProjectAs, loadProjectFromPath } = useFileOperations()
  const [platform, setPlatform] = useState<string>('unknown')

  // Обработчики горячих клавиш
  const handleShortcutAction = useCallback((action: string) => {
    console.log(`Hotkey triggered: ${action}`)

    switch (action) {
      case 'DELETE_TASK':
        if (!isDeletionAllowed) {
          console.warn('[IntegratedMenu] Deletion is disabled in preferences')
          break
        }
        console.log('Task deletion triggered from menu/shortcut')
        break
      case 'NEW_PROJECT':
        createNewProject()
        break
      case 'OPEN_PROJECT':
        openProject()
        break
      case 'SAVE_PROJECT':
        saveProject()
        break
      case 'SAVE_AS':
        saveProjectAs()
        break
      case 'INSERT_TASK':
        window.dispatchEvent(new CustomEvent('task:insert'))
        break
      case 'FIND_TASK':
        window.dispatchEvent(new CustomEvent('search:open'))
        break
      default:
        console.log(`Unhandled hotkey action: ${action}`)
    }
  }, [isDeletionAllowed, createNewProject, openProject, saveProject, saveProjectAs])

  // Определение платформы для условной обработки drag-and-drop
  useEffect(() => {
    const fetchPlatform = async () => {
      const api = getElectronAPI()
      if (!api?.getAppInfo) {
        console.warn('[IntegratedMenu] getAppInfo API not available')
        return
      }

      try {
        const appInfo = await api.getAppInfo()
        setPlatform(appInfo.platform)
        console.log('[IntegratedMenu] Platform detected:', appInfo.platform)
      } catch (error) {
        console.error('[IntegratedMenu] Failed to fetch platform info:', error)
        // Оставляем 'unknown' для безопасности
      }
    }

    fetchPlatform()
  }, [])

  // Глобальный обработчик Drag-and-Drop
  React.useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      // Явно указываем dropEffect для Linux (критично для корректного курсора)
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy'
      }
    }

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const api = getElectronAPI()

      // На Linux drag-and-drop полностью недоступен - показываем универсальное сообщение
      if (platform === 'linux') {
        console.log('[IntegratedMenu] Drag-and-drop attempted on Linux - feature not supported')
        if (api?.showMessageBox) {
          await api.showMessageBox({
            type: 'info',
            title: 'Перетаскивание не поддерживается',
            message: 'Функция перетаскивания файлов недоступна в связи с ограничениями операционной системы.\n\nДля открытия проекта используйте кнопки в правом верхнем углу.',
          })
        }
        return
      }

      // Для Windows/macOS продолжаем обычную обработку
      const files = e.dataTransfer?.files

      // ПРОВЕРКА 1: Проверяем, пришли ли файлы от системы
      if (!files || files.length === 0) {
        console.warn('[IntegratedMenu] Drop event received but files list is empty')
        if (api?.showMessageBox) {
          await api.showMessageBox({
            type: 'info',
            title: 'Не удалось обработать файл',
            message: 'Не удалось получить информацию о перетаскиваемом файле.\n\nПопробуйте открыть файл через меню Файл → Открыть проект.',
          })
        }
        return
      }

      const file = files[0]

      // Диагностическое логирование для отладки на разных платформах
      console.log('[IntegratedMenu] File dropped:', {
        name: file.name,
        type: file.type,
        size: file.size,
        hasDeprecatedPath: 'path' in file,
      })

      // ПРОВЕРКА 2: Получаем путь через webUtils.getPathForFile()
      // Это кроссплатформенный метод, но File объект может быть сериализован некорректно через contextBridge
      const filePath = api?.getFilePathFromDrop?.(file) || ''

      console.log('[IntegratedMenu] Path resolution:', {
        path: filePath,
        pathAvailable: !!filePath,
      })

      if (!filePath) {
        // Путь недоступен
        console.error('[IntegratedMenu] webUtils.getPathForFile returned empty path')
        if (api?.showMessageBox) {
          await api.showMessageBox({
            type: 'info',
            title: 'Ошибка доступа к файлу',
            message: 'Не удалось получить путь к файлу.\n\nИспользуйте кнопки в правом верхнем углу для открытия проекта.',
          })
        }
        return
      }

      // ПРОВЕРКА 3: Валидация расширения файла
      if (!filePath.endsWith('.pod')) {
        if (api?.showMessageBox) {
          await api.showMessageBox({
            type: 'warning',
            title: 'Неверный формат файла',
            message: 'Можно открывать только файлы с расширением .pod',
          })
        }
        return
      }

      // Всё хорошо - загружаем проект
      console.log(`[IntegratedMenu] Loading project from: ${filePath}`)
      await loadProjectFromPath(filePath)
    }

    window.addEventListener('dragover', handleDragOver)
    window.addEventListener('drop', handleDrop)

    return () => {
      window.removeEventListener('dragover', handleDragOver)
      window.removeEventListener('drop', handleDrop)
    }
  }, [loadProjectFromPath])

  // Конфигурация горячих клавиш
  const shortcuts = [
    { key: DEFAULT_SHORTCUTS.NEW_PROJECT, description: 'Новый проект', handler: () => handleShortcutAction('NEW_PROJECT') },
    { key: DEFAULT_SHORTCUTS.OPEN_PROJECT, description: 'Открыть проект', handler: () => handleShortcutAction('OPEN_PROJECT') },
    { key: DEFAULT_SHORTCUTS.SAVE_PROJECT, description: 'Сохранить проект', handler: () => handleShortcutAction('SAVE_PROJECT') },
    { key: DEFAULT_SHORTCUTS.SAVE_AS, description: 'Сохранить как', handler: () => handleShortcutAction('SAVE_AS') },
    { key: DEFAULT_SHORTCUTS.PRINT, description: 'Печать', handler: () => handleShortcutAction('PRINT') },
    { key: DEFAULT_SHORTCUTS.INSERT_TASK, description: 'Вставить задачу', handler: () => handleShortcutAction('INSERT_TASK') },
    { key: DEFAULT_SHORTCUTS.DELETE_TASK, description: 'Удалить задачу', handler: () => handleShortcutAction('DELETE_TASK') },
    { key: DEFAULT_SHORTCUTS.INDENT_TASK, description: 'Увеличить отступ', handler: () => handleShortcutAction('INDENT_TASK') },
    { key: DEFAULT_SHORTCUTS.OUTDENT_TASK, description: 'Уменьшить отступ', handler: () => handleShortcutAction('OUTDENT_TASK') },
    { key: DEFAULT_SHORTCUTS.FIND_TASK, description: 'Найти задачу', handler: () => handleShortcutAction('FIND_TASK') },
    { key: DEFAULT_SHORTCUTS.GOTO_TASK, description: 'Перейти к задаче', handler: () => handleShortcutAction('GOTO_TASK') },
    { key: DEFAULT_SHORTCUTS.UNDO, description: 'Отменить', handler: () => handleShortcutAction('UNDO') },
    { key: DEFAULT_SHORTCUTS.REDO, description: 'Повторить', handler: () => handleShortcutAction('REDO') },
    { key: DEFAULT_SHORTCUTS.CUT, description: 'Вырезать', handler: () => handleShortcutAction('CUT') },
    { key: DEFAULT_SHORTCUTS.COPY, description: 'Копировать', handler: () => handleShortcutAction('COPY') },
    { key: DEFAULT_SHORTCUTS.PASTE, description: 'Вставить', handler: () => handleShortcutAction('PASTE') },
    { key: DEFAULT_SHORTCUTS.ZOOM_IN, description: 'Увеличить масштаб', handler: () => handleShortcutAction('ZOOM_IN') },
    { key: DEFAULT_SHORTCUTS.ZOOM_OUT, description: 'Уменьшить масштаб', handler: () => handleShortcutAction('ZOOM_OUT') },
    { key: DEFAULT_SHORTCUTS.FIT_TO_WIDTH, description: 'Масштаб по ширине', handler: () => handleShortcutAction('FIT_TO_WIDTH') },
    { key: DEFAULT_SHORTCUTS.TASK_INFO, description: 'Информация о задаче', handler: () => handleShortcutAction('TASK_INFO') },
    { key: DEFAULT_SHORTCUTS.ASSIGN_RESOURCES, description: 'Назначить ресурсы', handler: () => handleShortcutAction('ASSIGN_RESOURCES') },
    { key: DEFAULT_SHORTCUTS.RESOURCE_INFO, description: 'Информация о ресурсе', handler: () => handleShortcutAction('RESOURCE_INFO') },
    { key: DEFAULT_SHORTCUTS.EXIT, description: 'Выход', handler: () => handleShortcutAction('EXIT') },
  ]

  // Включаем горячие клавиши
  useKeyboardShortcuts(shortcuts, true)

  // Обработчики контекстных меню
  const handleContextMenuAction = useCallback(async (type: string, action: string) => {
    const fullAction: ContextActionType = `${type}-${action}` as ContextActionType
    await contextActionService.executeAction(fullAction)
  }, [])

  const VALID_CONTEXT_TYPES: ContextMenuType[] = ['task', 'resource', 'project', 'gantt']

  const handleContextMenu = useCallback((event: MouseEvent) => {
    event.preventDefault()
    const target = event.target as HTMLElement
    const rawType = target.getAttribute('data-context-type')
    const contextType = rawType && VALID_CONTEXT_TYPES.includes(rawType as ContextMenuType)
      ? (rawType as ContextMenuType)
      : null
    if (!contextType) return

    const menuItems: ContextMenuItem[] = ContextMenuFactory.getMenuByType(
      contextType,
      (action) => handleContextMenuAction(contextType, action),
    )
    if (menuItems.length > 0) {
      showContextMenu(contextType, menuItems, event.clientX, event.clientY)
    }
  }, [showContextMenu, handleContextMenuAction])

  useEffect(() => {
    document.addEventListener('contextmenu', handleContextMenu)
    return () => document.removeEventListener('contextmenu', handleContextMenu)
  }, [handleContextMenu])

  return (
    <>
      {contextMenu && (
        <ContextMenu
          config={contextMenu}
          onHide={hideContextMenu}
        />
      )}
    </>
  )
}

export default IntegratedMenu

