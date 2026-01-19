import { StateCreator } from 'zustand';
import type { AppState } from '../types/Master_Functionality_Catalog';

// Logging middleware for development
export const loggerMiddleware = <T extends AppState>(
  config: StateCreator<T>
): StateCreator<T> => {
  return (set, get, api) => {
    const loggedSet: typeof set = (...args) => {
      const [partialState, replace, name] = args;
      
      if (process.env.NODE_ENV === 'development') {
        console.group(`🔄 Zustand Action: ${name || 'unknown'}`);
        console.log('Previous state:', get());
        console.log('Action:', partialState);
        console.log('Replace:', replace);
      }

      const result = set(partialState, replace, name);

      if (process.env.NODE_ENV === 'development') {
        console.log('New state:', get());
        console.groupEnd();
      }

      return result;
    };

    return config(loggedSet, get, api);
  };
};

// Persistence middleware for localStorage
export const persistMiddleware = <T extends AppState>(
  config: StateCreator<T>,
  options: {
    name: string;
    storage?: 'localStorage' | 'sessionStorage';
    whitelist?: (keyof T)[];
    blacklist?: (keyof T)[];
  } = { name: 'app-store' }
): StateCreator<T> => {
  return (set, get, api) => {
    const storage = options.storage === 'sessionStorage' 
      ? window.sessionStorage 
      : window.localStorage;

    // Load persisted state
    const loadPersistedState = (): Partial<T> => {
      try {
        const stored = storage.getItem(options.name);
        if (!stored) return {};

        const parsedState = JSON.parse(stored);
        
        // Apply whitelist/blacklist filters
        const filteredState: Partial<T> = {};
        const keys = Object.keys(parsedState) as (keyof T)[];

        for (const key of keys) {
          if (options.whitelist && !options.whitelist.includes(key)) continue;
          if (options.blacklist && options.blacklist.includes(key)) continue;
          
          filteredState[key] = parsedState[key];
        }

        return filteredState;
      } catch (error) {
        console.warn('Failed to load persisted state:', error);
        return {};
      }
    };

    // Initialize with persisted state
    const persistedState = loadPersistedState();
    const initialState = { ...config(set, get, api), ...persistedState };

    // Create wrapped set function
    const wrappedSet: typeof set = (partialState, replace, name) => {
      const result = set(partialState, replace, name);

      // Save to storage
      try {
        const currentState = get();
        const stateToSave: Partial<T> = {};
        const keys = Object.keys(currentState) as (keyof T)[];

        for (const key of keys) {
          if (options.whitelist && !options.whitelist.includes(key)) continue;
          if (options.blacklist && options.blacklist.includes(key)) continue;
          
          stateToSave[key] = currentState[key];
        }

        storage.setItem(options.name, JSON.stringify(stateToSave));
      } catch (error) {
        console.warn('Failed to persist state:', error);
      }

      return result;
    };

    // Return initial state with wrapped set
    return { ...initialState, setState: wrappedSet as any };
  };
};

// Validation middleware
export const validationMiddleware = <T extends AppState>(
  config: StateCreator<T>,
  validator?: (state: T) => string[] | null
): StateCreator<T> => {
  return (set, get, api) => {
    const validatedSet: typeof set = (partialState, replace, name) => {
      const newState = { ...get(), ...partialState } as T;
      
      if (validator) {
        const errors = validator(newState);
        if (errors && errors.length > 0) {
          console.warn('State validation errors:', errors);
          // Optionally, you could prevent the update or add errors to state
        }
      }

      return set(partialState, replace, name);
    };

    return config(validatedSet, get, api);
  };
};

// Undo/Redo middleware
export const undoRedoMiddleware = <T extends AppState>(
  config: StateCreator<T>,
  options: {
    maxSize?: number;
    whitelist?: (keyof T)[];
  } = { maxSize: 50 }
): StateCreator<T> => {
  return (set, get, api) => {
    let past: T[] = [];
    let future: T[] = [];
    const maxSize = options.maxSize || 50;

    const undoRedoSet: typeof set = (partialState, replace, name) => {
      const currentState = get();
      
      // Save current state to past if it's not an undo/redo action
      if (!name?.startsWith('undo/') && !name?.startsWith('redo/')) {
        past = [...past.slice(-(maxSize - 1)), currentState];
        future = []; // Clear future when new action is performed
      }

      return set(partialState, replace, name);
    };

    const store = config(undoRedoSet, get, api);

    return {
      ...store,
      undo: () => {
        if (past.length === 0) return;
        
        const previous = past.pop()!;
        future = [get(), ...future];
        set(previous, true, 'undo/action');
      },
      redo: () => {
        if (future.length === 0) return;
        
        const next = future.shift()!;
        past = [...past, get()];
        set(next, true, 'redo/action');
      },
      canUndo: () => past.length > 0,
      canRedo: () => future.length > 0,
      clearHistory: () => {
        past = [];
        future = [];
      }
    } as any;
  };
};

// Analytics middleware
export const analyticsMiddleware = <T extends AppState>(
  config: StateCreator<T>,
  onStateChange?: (state: T, action: string) => void
): StateCreator<T> => {
  return (set, get, api) => {
    const analyticsSet: typeof set = (partialState, replace, name) => {
      const result = set(partialState, replace, name);
      
      if (onStateChange) {
        const newState = get();
        onStateChange(newState, name || 'unknown');
      }

      return result;
    };

    return config(analyticsSet, get, api);
  };
};

