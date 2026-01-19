import { useEffect, useCallback, useRef } from 'react';
import { hotkeyService } from '@/services/HotkeyService';
import type { Hotkey, HotkeyAction, HotkeyCategory } from '@/types/HotkeyTypes';
import { logger } from '@/utils/logger';

/**
 * Хук для работы с горячими клавишами
 * Интегрирует HotkeyService с React компонентами
 */

interface UseHotkeyOptions {
  enabled?: boolean;
  preventDefault?: boolean;
  allowInInput?: boolean;
  deps?: React.DependencyList;
}

interface UseHotkeyReturn {
  bindHotkey: (keys: Hotkey, action: () => void, options?: UseHotkeyOptions) => void;
  unbindHotkey: (keys: Hotkey) => void;
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

/**
 * Основной хук для работы с горячими клавишами
 */
export const useHotkey = (): UseHotkeyReturn => {
  const isEnabledRef = useRef(true);
  const actionIdRef = useRef<string | null>(null);

  const bindHotkey = useCallback((
    keys: Hotkey, 
    action: () => void, 
    options: UseHotkeyOptions = {}
  ) => {
    const {
      enabled = true,
      preventDefault = true,
      allowInInput = false,
      deps = []
    } = options;

    if (!enabled) return;

    // Генерация уникального ID для действия
    const actionId = `hotkey_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    actionIdRef.current = actionId;

    // Создание действия
    const hotkeyAction: HotkeyAction = {
      id: actionId,
      name: `Hotkey ${JSON.stringify(keys)}`,
      description: 'Dynamically created hotkey',
      category: HotkeyCategory.EDIT,
      execute: action,
      canExecute: () => isEnabledRef.current
    };

    // Регистрация действия и привязки
    hotkeyService.registerAction(hotkeyAction);
    hotkeyService.registerBinding(actionId, keys);

    logger.dialog('Hotkey bound', { keys, actionId }, 'useHotkey');

    // Функция очистки
    return () => {
      if (actionIdRef.current) {
        hotkeyService.unregisterBinding(actionIdRef.current);
        logger.dialog('Hotkey unbound', { keys, actionId: actionIdRef.current }, 'useHotkey');
      }
    };
  }, []);

  const unbindHotkey = useCallback((keys: Hotkey) => {
    if (actionIdRef.current) {
      hotkeyService.unregisterBinding(actionIdRef.current);
      logger.dialog('Hotkey unbound', { keys }, 'useHotkey');
    }
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    isEnabledRef.current = enabled;
  }, []);

  return {
    bindHotkey,
    unbindHotkey,
    isEnabled: isEnabledRef.current,
    setEnabled
  };
};

/**
 * Хук для привязки конкретной горячей клавиши
 */
export const useHotkeyBind = (
  keys: Hotkey,
  action: () => void,
  options: UseHotkeyOptions = {}
) => {
  const { bindHotkey, unbindHotkey } = useHotkey();
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (options.enabled !== false) {
      cleanupRef.current = bindHotkey(keys, action, options);
    }

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [keys, action, options.enabled, ...options.deps]);
};

/**
 * Хук для работы с предопределенными действиями
 */
export const useHotkeyAction = (
  actionId: string,
  handler?: (action: string, event: KeyboardEvent) => void,
  enabled: boolean = true
) => {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return;

    const eventHandler = (action: string, event: KeyboardEvent) => {
      if (handlerRef.current) {
        handlerRef.current(action, event);
      }
    };

    hotkeyService.addEventListener(actionId, eventHandler);

    return () => {
      hotkeyService.removeEventListener(actionId, eventHandler);
    };
  }, [actionId, enabled]);
};

/**
 * Хук для получения состояния горячих клавиш
 */
export const useHotkeyState = () => {
  const [state, setState] = React.useState(hotkeyService.getState());

  useEffect(() => {
    const interval = setInterval(() => {
      const currentState = hotkeyService.getState();
      setState(currentState);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    ...state,
    setEnabled: hotkeyService.setEnabled.bind(hotkeyService)
  };
};

/**
 * Хук для категорий горячих клавиш
 */
export const useHotkeyCategory = (category: HotkeyCategory) => {
  const [actions, setActions] = React.useState<HotkeyAction[]>([]);

  useEffect(() => {
    const categoryActions = hotkeyService.getActionsByCategory(category);
    setActions(categoryActions);
  }, [category]);

  return actions;
};

/**
 * Хук для глобального включения/выключения горячих клавиш
 */
export const useHotkeyToggle = () => {
  const [enabled, setEnabled] = React.useState(true);

  useEffect(() => {
    hotkeyService.setEnabled(enabled);
  }, [enabled]);

  const toggle = useCallback(() => {
    setEnabled(prev => !prev);
  }, []);

  return {
    enabled,
    setEnabled,
    toggle
  };
};

/**
 * Хук для навигационных горячих клавиш
 */
export const useNavigationHotkeys = () => {
  useHotkeyAction('GOTO_TASK', (action) => {
    // TODO: Implement navigation to task
    logger.dialog('Navigate to task', {}, 'Navigation');
  });

  useHotkeyAction('ZOOM_IN', (action) => {
    // TODO: Implement zoom in
    logger.dialog('Zoom in', {}, 'Navigation');
  });

  useHotkeyAction('ZOOM_OUT', (action) => {
    // TODO: Implement zoom out
    logger.dialog('Zoom out', {}, 'Navigation');
  });

  useHotkeyAction('FIT_TO_WIDTH', (action) => {
    // TODO: Implement fit to width
    logger.dialog('Fit to width', {}, 'Navigation');
  });
};

/**
 * Хук для файловых горячих клавиш
 */
export const useFileHotkeys = () => {
  useHotkeyAction('NEW_PROJECT', (action) => {
    // TODO: Implement new project
    logger.dialog('New project', {}, 'File');
  });

  useHotkeyAction('OPEN_PROJECT', (action) => {
    // TODO: Implement open project
    logger.dialog('Open project', {}, 'File');
  });

  useHotkeyAction('SAVE_PROJECT', (action) => {
    // TODO: Implement save project
    logger.dialog('Save project', {}, 'File');
  });

  useHotkeyAction('SAVE_AS', (action) => {
    // TODO: Implement save as
    logger.dialog('Save as', {}, 'File');
  });

  useHotkeyAction('PRINT', (action) => {
    // TODO: Implement print
    logger.dialog('Print', {}, 'File');
  });

  useHotkeyAction('EXIT', (action) => {
    // TODO: Implement exit
    logger.dialog('Exit', {}, 'File');
  });
};

