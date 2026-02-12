import type { Project } from '@/types/project-types'
import type { ViewType, ViewSettings } from '@/types/ViewTypes'

/** Порт провайдера проекта для действий MainWindow */
export interface ProjectProviderPort {
  currentProject: Project | null;
  createProject?: (name: string) => Promise<Project | null>;
  saveProject?: (projectOrPath?: Project | string) => Promise<void>;
}

/** Порт навигации для действий MainWindow */
export interface NavigationProviderPort {
  navigateToView: (viewType: ViewType, settings?: Partial<ViewSettings>) => void;
  availableViews?: Array<{ type: ViewType; title?: string; path?: string }>;
}

/** Порт файловых операций для действий MainWindow */
export interface FileOperationsPort {
  createNewProject: () => Promise<void>;
  openProject: () => Promise<void>;
  saveProject: () => Promise<void>;
  saveProjectAs: () => Promise<void>;
}

/** Буфер обмена для действий cut/copy/paste */
export interface ClipboardPort {
  cut: () => void;
  copy: () => void;
  paste: () => void;
  canPaste: boolean;
}

/** Минимальный контракт app store для действий (undo/redo/cut/copy/paste) */
export interface AppStorePort {
  getState?: () => object;
  canUndo?: boolean;
  undoAction?: () => void;
  canRedo?: boolean;
  redoAction?: () => void;
  clipboard?: ClipboardPort;
}

/** Интерфейс для зависимостей MainWindow (Фаза 4: единый источник «есть ли проект для сохранения»). */
export interface MainWindowDependencies {
  projectProvider: ProjectProviderPort;
  appStore: AppStorePort;
  navigationProvider: NavigationProviderPort;
  /** Всегда задан; возможность Save/Save As определяется hasProjectToSave. */
  fileOperations: FileOperationsPort;
  /** Единственный источник: есть ли проект для сохранения (например, currentProjectId != null в store). */
  hasProjectToSave: boolean;
}

import type { IActionManager } from '../ActionManagerTypes'

/**
 * Базовый класс для регистрации действий
 */
export abstract class BaseActionRegistry {
  protected actionManager: IActionManager
  protected dependencies: MainWindowDependencies

  constructor(actionManager: IActionManager, dependencies: MainWindowDependencies) {
    this.actionManager = actionManager
    this.dependencies = dependencies
  }

  /**
   * Регистрация всех действий
   */
  public abstract registerAllActions(): void;

  /**
   * Удаление всех действий
   */
  public unregisterAllActions(): void {
    const allActions = this.actionManager.getAllActions()

    allActions.forEach(action => {
      this.actionManager.unregisterAction(action.id)
    })
  }

  /**
   * Перерегистрация всех действий
   */
  public reregisterAllActions(): void {
    this.unregisterAllActions()
    this.registerAllActions()
  }
}

