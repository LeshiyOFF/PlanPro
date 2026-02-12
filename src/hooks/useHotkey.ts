import { useEffect, useCallback, useRef } from 'react'
import * as React from 'react'
import { hotkeyService } from '@/services/HotkeyService'
import { type Hotkey, type HotkeyAction, HotkeyCategory } from '@/types/HotkeyTypes'
import { logger } from '@/utils/logger'
import { getElectronAPI } from '@/utils/electronAPI'

interface UseHotkeyOptions {
  enabled?: boolean;
  preventDefault?: boolean;
  allowInInput?: boolean;
  deps?: React.DependencyList;
}

interface UseHotkeyReturn {
  bindHotkey: (keys: Hotkey, action: () => void, options?: UseHotkeyOptions) => (() => void) | void;
  unbindHotkey: (keys: Hotkey) => void;
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

/**
 * Основной хук для работы с горячими клавишами
 */
export const useHotkey = (): UseHotkeyReturn => {
  const isEnabledRef = useRef(true)
  const actionIdRef = useRef<string | null>(null)

  const bindHotkey = useCallback((
    keys: Hotkey,
    action: () => void,
    options: UseHotkeyOptions = {},
  ) => {
    const { enabled = true } = options
    if (!enabled) return

    const actionId = `hotkey_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    actionIdRef.current = actionId

    const hotkeyAction: HotkeyAction = {
      id: actionId,
      name: `Hotkey ${JSON.stringify(keys)}`,
      description: 'Dynamically created hotkey',
      category: HotkeyCategory.EDIT,
      execute: action,
      canExecute: () => isEnabledRef.current,
    }

    hotkeyService.registerAction(hotkeyAction)
    hotkeyService.registerBinding(actionId, keys)
    logger.dialog('Hotkey bound', { keys: String(keys), actionId }, 'useHotkey')

    const cleanup = () => {
      if (actionIdRef.current) {
        hotkeyService.unregisterBinding(actionIdRef.current)
      }
    }
    return cleanup
  }, [])

  const unbindHotkey = useCallback((keys: Hotkey) => {
    if (actionIdRef.current) {
      hotkeyService.unregisterBinding(actionIdRef.current)
      logger.dialog('Hotkey unbound', { keys: String(keys) }, 'useHotkey')
    }
  }, [])

  const setEnabled = useCallback((enabled: boolean) => {
    isEnabledRef.current = enabled
  }, [])

  return { bindHotkey, unbindHotkey, isEnabled: isEnabledRef.current, setEnabled }
}

/**
 * Хук для привязки конкретной горячей клавиши
 */
export const useHotkeyBind = (
  keys: Hotkey,
  action: () => void,
  options: UseHotkeyOptions = {},
) => {
  const { bindHotkey } = useHotkey()
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (options.enabled !== false) {
      const cleanup = bindHotkey(keys, action, options)
      cleanupRef.current = typeof cleanup === 'function' ? cleanup : null
    }
    return () => { cleanupRef.current?.() }
  }, [keys, action, options.enabled, ...(options.deps || [])])
}

/**
 * Хук для работы с предопределенными действиями
 */
export const useHotkeyAction = (
  actionId: string,
  handler?: (action: string, event: KeyboardEvent) => void,
  enabled: boolean = true,
) => {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    if (!enabled) return

    const eventHandler = (action: string, event: KeyboardEvent) => {
      handlerRef.current?.(action, event)
    }

    hotkeyService.addEventListener(actionId, eventHandler)
    return () => { hotkeyService.removeEventListener(actionId, eventHandler) }
  }, [actionId, enabled])
}

/**
 * Хук для получения состояния горячих клавиш
 */
export const useHotkeyState = () => {
  const [state, setState] = React.useState(hotkeyService.getState())

  useEffect(() => {
    const interval = setInterval(() => {
      setState(hotkeyService.getState())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return { ...state, setEnabled: hotkeyService.setEnabled.bind(hotkeyService) }
}

/**
 * Хук для категорий горячих клавиш
 */
export const useHotkeyCategory = (category: HotkeyCategory) => {
  const [actions, setActions] = React.useState<HotkeyAction[]>([])

  useEffect(() => {
    setActions(hotkeyService.getActionsByCategory(category))
  }, [category])

  return actions
}

/**
 * Хук для глобального включения/выключения горячих клавиш
 */
export const useHotkeyToggle = () => {
  const [enabled, setEnabled] = React.useState(true)

  useEffect(() => {
    hotkeyService.setEnabled(enabled)
  }, [enabled])

  return { enabled, setEnabled, toggle: useCallback(() => setEnabled(prev => !prev), []) }
}

/**
 * Хук для навигационных горячих клавиш
 */
export const useNavigationHotkeys = () => {
  const promptApi = usePrompt()

  useHotkeyAction('GOTO_TASK', () => {
    if (!promptApi) {
      logger.dialog('Prompt not available (mount PromptProvider)', {}, 'Navigation')
      return
    }
    void (async () => {
      const taskId = await promptApi.showPrompt('Введите ID задачи для перехода:')
      if (taskId) {
        window.dispatchEvent(new CustomEvent('gantt:navigate-to-task', { detail: { taskId } }))
        logger.dialog('Navigate to task', { taskId }, 'Navigation')
      }
    })()
  })

  useHotkeyAction('ZOOM_IN', () => {
    window.dispatchEvent(new CustomEvent('gantt:zoom-delta', { detail: { delta: 0.25 } }))
    logger.dialog('Zoom in executed', {}, 'Navigation')
  })

  useHotkeyAction('ZOOM_OUT', () => {
    window.dispatchEvent(new CustomEvent('gantt:zoom-delta', { detail: { delta: -0.25 } }))
    logger.dialog('Zoom out executed', {}, 'Navigation')
  })

  useHotkeyAction('FIT_TO_WIDTH', () => {
    window.dispatchEvent(new CustomEvent('gantt:fit-to-width'))
    logger.dialog('Fit to width executed', {}, 'Navigation')
  })
}

/**
 * Хук для файловых горячих клавиш
 */
export const useFileHotkeys = () => {
  useHotkeyAction('NEW_PROJECT', () => {
    window.dispatchEvent(new CustomEvent('file:new-project'))
    logger.dialog('New project hotkey triggered', {}, 'File')
  })

  useHotkeyAction('OPEN_PROJECT', () => {
    window.dispatchEvent(new CustomEvent('file:open-project'))
    logger.dialog('Open project hotkey triggered', {}, 'File')
  })

  useHotkeyAction('SAVE_PROJECT', () => {
    window.dispatchEvent(new CustomEvent('file:save-project'))
    logger.dialog('Save project hotkey triggered', {}, 'File')
  })

  useHotkeyAction('SAVE_AS', () => {
    window.dispatchEvent(new CustomEvent('file:save-project-as'))
    logger.dialog('Save as hotkey triggered', {}, 'File')
  })

  useHotkeyAction('PRINT', () => {
    window.print()
    logger.dialog('Print executed', {}, 'File')
  })

  useHotkeyAction('EXIT', () => {
    const api = getElectronAPI()
    if (api?.closeWindow) {
      api.closeWindow()
    } else {
      window.close()
    }
    logger.dialog('Exit executed', {}, 'File')
  })
}
