import { useEffect, useCallback } from 'react'

/**
 * Типы горячих клавиш
 */
export type KeyboardShortcut = string;

/**
 * Тип обработчика горячих клавиш
 */
export type KeyboardHandler = () => void;

/**
 * Конфигурация горячей клавиши
 */
export interface KeyboardShortcutConfig {
  key: KeyboardShortcut;
  description: string;
  handler: KeyboardHandler;
  enabled?: boolean;
  preventDefault?: boolean;
}

/**
 * Хук для управления горячими клавишами
 */
export const useKeyboardShortcuts = (
  shortcuts: KeyboardShortcutConfig[],
  enabled: boolean = true,
) => {
  const normalizeKey = useCallback((event: KeyboardEvent): string => {
    const parts: string[] = []

    if (event.ctrlKey || event.metaKey) parts.push('Ctrl')
    if (event.altKey) parts.push('Alt')
    if (event.shiftKey) parts.push('Shift')

    let key = event.key.toUpperCase()
    if (key === ' ') key = 'SPACE'
    if (key === 'ARROWUP') key = 'UP'
    if (key === 'ARROWDOWN') key = 'DOWN'
    if (key === 'ARROWLEFT') key = 'LEFT'
    if (key === 'ARROWRIGHT') key = 'RIGHT'
    if (key === 'PLUS' || key === '=') key = '+'
    if (key === 'MINUS' || key === '-') key = '-'

    parts.push(key)
    return parts.join('+')
  }, [])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    const normalizedKey = normalizeKey(event)
    const shortcut = shortcuts.find(s =>
      s.key === normalizedKey && (s.enabled !== false),
    )

    if (shortcut && shortcut.handler) {
      if (shortcut.preventDefault !== false) {
        event.preventDefault()
        event.stopPropagation()
      }

      shortcut.handler()
    }
  }, [shortcuts, enabled, normalizeKey])

  useEffect(() => {
    if (!enabled) return

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, enabled])
}

/**
 * Предопределенные горячие клавиши из UI_Functionality_Catalog.md
 */
export const DEFAULT_SHORTCUTS: Record<string, string> = {
  // File operations
  'NEW_PROJECT': 'Ctrl+N',
  'OPEN_PROJECT': 'Ctrl+O',
  'SAVE_PROJECT': 'Ctrl+S',
  'SAVE_AS': 'Ctrl+Shift+S',
  'PRINT': 'Ctrl+P',
  'EXIT': 'Alt+F4',

  // Task operations
  'INSERT_TASK': 'Ctrl+K',
  'DELETE_TASK': 'Delete',
  'INDENT_TASK': 'Tab',
  'OUTDENT_TASK': 'Shift+Tab',
  'FIND_TASK': 'Ctrl+F',
  'GOTO_TASK': 'F3',

  // Edit operations
  'UNDO': 'Ctrl+Z',
  'REDO': 'Ctrl+Y',
  'CUT': 'Ctrl+X',
  'COPY': 'Ctrl+C',
  'PASTE': 'Ctrl+V',

  // View operations
  'ZOOM_IN': 'Ctrl++',
  'ZOOM_OUT': 'Ctrl+-',
  'FIT_TO_WIDTH': 'Ctrl+0',
  'TASK_INFO': 'F9',

  // Resource operations
  'ASSIGN_RESOURCES': 'Alt+F10',
  'RESOURCE_INFO': 'F10',
}

