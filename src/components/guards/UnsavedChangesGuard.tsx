import React, { useEffect, useCallback } from 'react'
import { useProjectStore } from '@/store/projectStore'
import { getElectronAPI } from '@/utils/electronAPI'

/**
 * Компонент-guard для предотвращения случайного выхода при несохраненных изменениях.
 * Показывает системный диалог подтверждения при попытке закрыть приложение.
 *
 * Использует Electron API для перехвата события закрытия окна.
 */
export const UnsavedChangesGuard: React.FC = () => {
  const isDirty = useProjectStore((state) => state.isDirty)

  const handleBeforeUnload = useCallback((event: BeforeUnloadEvent): string | undefined => {
    if (isDirty) {
      event.preventDefault()
      event.returnValue = ''
      return ''
    }
    return undefined
  }, [isDirty])

  const handleElectronClose = useCallback(async () => {
    if (!isDirty) return true

    const api = getElectronAPI()
    if (!api?.showMessageBox) return true

    try {
      const result = await api.showMessageBox({
        type: 'warning',
        title: 'Несохраненные изменения',
        message: 'В проекте есть несохраненные изменения. Вы уверены, что хотите выйти?',
        buttons: ['Выйти без сохранения', 'Отмена'],
        defaultId: 1,
        cancelId: 1,
      })

      // Если пользователь выбрал "Выйти без сохранения" (index 0)
      return result.response === 0
    } catch (error) {
      console.error('[UnsavedChangesGuard] Error showing dialog:', error)
      return true
    }
  }, [isDirty])

  useEffect(() => {
    // Добавляем слушатель для веб-версии
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Регистрируем обработчик для Electron
    const api = getElectronAPI()
    if (api?.onCloseRequested) {
      api.onCloseRequested(handleElectronClose)
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [handleBeforeUnload, handleElectronClose])

  // Компонент невидим
  return null
}

