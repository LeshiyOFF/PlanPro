import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { hotkeyService } from '@/services/HotkeyService';
import { logger } from '@/utils/logger';
import type { HotkeyState, HotkeyBinding, HotkeyAction } from '@/types/HotkeyTypes';

interface HotkeyContextType {
  state: HotkeyState;
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
  bindings: HotkeyBinding[];
  actions: HotkeyAction[];
  toggleEnabled: () => void;
}

const HotkeyContext = createContext<HotkeyContextType | null>(null);

interface HotkeyProviderProps {
  children: React.ReactNode;
  enabled?: boolean;
}

/**
 * Провайдер для глобальной системы горячих клавиш
 */
export const HotkeyProvider: React.FC<HotkeyProviderProps> = ({
  children,
  enabled: initialEnabled = true
}) => {
  const [state, setState] = useState<HotkeyState>(hotkeyService.getState());
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Инициализация системы
  useEffect(() => {
    // Установка начального состояния
    hotkeyService.setEnabled(isEnabled);

    // Добавление глобального обработчика клавиатуры
    const handleKeyDown = (event: KeyboardEvent) => {
      try {
        hotkeyService.handleKeyDown(event);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        logger.dialogError('Hotkey handling error', { errorMessage }, 'HotkeyProvider');
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);

    // Периодическое обновление состояния
    updateIntervalRef.current = setInterval(() => {
      const currentState = hotkeyService.getState();
      setState(currentState);
    }, 1000);

    logger.dialog('Hotkey provider initialized', { enabled: isEnabled }, 'HotkeyProvider');

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
      
      logger.dialog('Hotkey provider cleaned up', {}, 'HotkeyProvider');
    };
  }, []);

  // Обновление состояния сервиса
  useEffect(() => {
    hotkeyService.setEnabled(isEnabled);
    logger.dialog('Hotkey system', isEnabled ? 'enabled' : 'disabled', 'HotkeyProvider');
  }, [isEnabled]);

  // Получение данных из сервиса
  const bindings = hotkeyService.getAllBindings();
  const actions = hotkeyService.getAllActions();

  const toggleEnabled = () => {
    setIsEnabled(prev => !prev);
  };

  const contextValue: HotkeyContextType = {
    state,
    isEnabled,
    setEnabled: setIsEnabled,
    bindings,
    actions,
    toggleEnabled
  };

  return (
    <HotkeyContext.Provider value={contextValue}>
      {children}
    </HotkeyContext.Provider>
  );
};

/**
 * Хук для доступа к контексту горячих клавиш
 */
export const useHotkeyContext = (): HotkeyContextType => {
  const context = useContext(HotkeyContext);
  
  if (!context) {
    throw new Error('useHotkeyContext must be used within a HotkeyProvider');
  }
  
  return context;
};

/**
 * Хук для управления горячими клавишами в компонентах
 */
export const useGlobalHotkey = () => {
  const { state, isEnabled, setEnabled, bindings, actions, toggleEnabled } = useHotkeyContext();

  return {
    // Состояние
    state,
    isEnabled,
    bindings,
    actions,
    
    // Управление
    setEnabled,
    toggleEnabled,
    
    // Доступ к сервису
    getService: () => hotkeyService,
    
    // Утилиты
    getBinding: (actionId: string) => bindings.find(b => b.actionId === actionId),
    getAction: (actionId: string) => actions.find(a => a.id === actionId),
    hasAction: (actionId: string) => actions.some(a => a.id === actionId)
  };
};

/**
 * Хук для отображения состояния горячих клавиш
 */
export const useHotkeyStatus = () => {
  const { isEnabled, bindings, actions } = useHotkeyContext();
  const [lastAction, setLastAction] = useState<string | null>(null);

  const { getService } = useGlobalHotkey();

  useEffect(() => {
    const handleAction = (actionId: string) => {
      setLastAction(actionId);
      setTimeout(() => setLastAction(null), 2000); // Сброс через 2 секунды
    };

    // Подписка на все действия
    actions.forEach(action => {
      getService().addEventListener(action.id, handleAction);
    });

    return () => {
      actions.forEach(action => {
        getService().removeEventListener(action.id, handleAction);
      });
    };
  }, [actions, getService]);

  return {
    isEnabled,
    totalBindings: bindings.length,
    enabledBindings: bindings.filter(b => b.enabled).length,
    totalActions: actions.length,
    lastAction
  };
};

/**
 * Компонент для индикации состояния горячих клавиш
 */
export const HotkeyStatusIndicator: React.FC<{
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showDetails?: boolean;
}> = ({ 
  position = 'bottom-right',
  showDetails = false 
}) => {
  const { isEnabled, toggleEnabled } = useGlobalHotkey();
  const status = useHotkeyStatus();

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  return (
    <div className={`fixed z-50 ${positionClasses[position]}`}>
      <div className={`
        flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
        transition-colors duration-200 shadow-lg
        ${isEnabled 
          ? 'bg-green-500 text-white' 
          : 'bg-gray-500 text-white'
        }
      `}>
        <div className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-white' : 'bg-gray-300'}`} />
        <span>
          {isEnabled ? 'Hotkeys ON' : 'Hotkeys OFF'}
        </span>
        
        {showDetails && (
          <div className="ml-2 text-xs opacity-75">
            ({status.enabledBindings}/{status.totalBindings})
          </div>
        )}
        
        <button
          onClick={toggleEnabled}
          className="ml-2 opacity-75 hover:opacity-100 transition-opacity"
          title="Включить/выключить горячие клавиши"
        >
          {isEnabled ? '⏸' : '▶'}
        </button>
      </div>
      
      {status.lastAction && (
        <div className="absolute bottom-full mb-2 right-0 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {status.lastAction}
        </div>
      )}
    </div>
  );
};

