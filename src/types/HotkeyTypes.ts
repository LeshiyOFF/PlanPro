/**
 * Типы и интерфейсы для системы горячих клавиш
 * Based on Master_Functionality_Catalog.ts Hotkey interface
 */

export interface Hotkey {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
}

export interface HotkeyConfig {
  id: string;
  keys: Hotkey;
  description: string;
  category: HotkeyCategory;
  enabled: boolean;
  preventDefault?: boolean;
  action: string;
  icon?: string;
}

export enum HotkeyCategory {
  FILE = 'file',
  EDIT = 'edit', 
  VIEW = 'view',
  TASK = 'task',
  RESOURCE = 'resource',
  NAVIGATION = 'navigation',
  WINDOW = 'window'
}

export interface HotkeyAction {
  id: string;
  name: string;
  description: string;
  category: HotkeyCategory;
  execute: () => void | Promise<void>;
  canExecute?: () => boolean;
}

export interface HotkeyBinding {
  actionId: string;
  keys: Hotkey;
  enabled: boolean;
}

export interface HotkeyProfile {
  id: string;
  name: string;
  description: string;
  bindings: HotkeyBinding[];
  isActive: boolean;
}

export interface HotkeyConflict {
  action1: string;
  action2: string;
  keys: Hotkey;
  resolution?: 'disable1' | 'disable2' | 'modify1' | 'modify2';
}

export interface HotkeyState {
  profiles: HotkeyProfile[];
  activeProfile: string;
  conflicts: HotkeyConflict[];
  isEnabled: boolean;
  actionsCount?: number;
}

export type HotkeyEventHandler = (actionId: string, event: KeyboardEvent) => void;

// Предопределенные горячие клавиши на основе DEFAULT_SHORTCUTS
export const DEFAULT_HOTKEYS: Record<string, Hotkey> = {
  // File operations
  'NEW_PROJECT': { key: 'N', ctrl: true },
  'OPEN_PROJECT': { key: 'O', ctrl: true },
  'SAVE_PROJECT': { key: 'S', ctrl: true },
  'SAVE_AS': { key: 'S', ctrl: true, shift: true },
  'PRINT': { key: 'P', ctrl: true },
  'EXIT': { key: 'F4', alt: true },
  
  // Task operations
  'INSERT_TASK': { key: 'K', ctrl: true },
  'DELETE_TASK': { key: 'Delete' },
  'INDENT_TASK': { key: 'Tab' },
  'OUTDENT_TASK': { key: 'Tab', shift: true },
  'FIND_TASK': { key: 'F', ctrl: true },
  'GOTO_TASK': { key: 'F3' },
  
  // Edit operations
  'UNDO': { key: 'Z', ctrl: true },
  'REDO': { key: 'Y', ctrl: true },
  'CUT': { key: 'X', ctrl: true },
  'COPY': { key: 'C', ctrl: true },
  'PASTE': { key: 'V', ctrl: true },
  
  // View operations
  'ZOOM_IN': { key: '+', ctrl: true },
  'ZOOM_OUT': { key: '-', ctrl: true },
  'FIT_TO_WIDTH': { key: '0', ctrl: true },
  'TASK_INFO': { key: 'F9' },
  
  // Resource operations
  'ASSIGN_RESOURCES': { key: 'F10', alt: true },
  'RESOURCE_INFO': { key: 'F10' }
};

// Функции для работы с hotkey
export const hotkeyToString = (hotkey: Hotkey): string => {
  const parts: string[] = [];
  
  if (hotkey.ctrl) parts.push('Ctrl');
  if (hotkey.alt) parts.push('Alt');
  if (hotkey.shift) parts.push('Shift');
  if (hotkey.meta) parts.push('Meta');
  
  parts.push(hotkey.key);
  return parts.join('+');
};

export const hotkeyFromString = (str: string): Hotkey => {
  const parts = str.split('+').map(p => p.trim());
  const hotkey: Hotkey = {
    key: parts[parts.length - 1] || ''
  };
  
  parts.slice(0, -1).forEach(part => {
    switch (part.toLowerCase()) {
      case 'ctrl':
        hotkey.ctrl = true;
        break;
      case 'alt':
        hotkey.alt = true;
        break;
      case 'shift':
        hotkey.shift = true;
        break;
      case 'meta':
        hotkey.meta = true;
        break;
    }
  });
  
  return hotkey;
};

export const hotkeyEquals = (a: Hotkey, b: Hotkey): boolean => {
  return a.key === b.key &&
    a.ctrl === b.ctrl &&
    a.alt === b.alt &&
    a.shift === b.shift &&
    a.meta === b.meta;
};
