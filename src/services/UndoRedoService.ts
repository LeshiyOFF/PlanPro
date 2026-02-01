/**
 * Service for Undo/Redo synchronization between React store (Zustand) and Java Core
 * Provides bridge for history consistency across frontend and backend
 */

import { BaseJavaService } from './BaseJavaService';

/**
 * Service for Undo/Redo synchronization between React store (Zustand) and Java Core
 * Provides bridge for history consistency across frontend and backend
 */

export interface UndoRedoState {
  canUndo: boolean;
  canRedo: boolean;
  undoName: string | null;
  redoName: string | null;
  editHistory: string[];
  historySize: number;
}

export class UndoRedoService extends BaseJavaService {
  private static instance: UndoRedoService;
  private listeners: Set<(state: UndoRedoState) => void> = new Set();

  private constructor() {
    super();
  }

  static getInstance(): UndoRedoService {
    if (!UndoRedoService.instance) {
      UndoRedoService.instance = new UndoRedoService();
    }
    return UndoRedoService.instance;
  }

  addStateListener(listener: (state: UndoRedoState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(state: UndoRedoState): void {
    this.listeners.forEach(listener => listener(state));
  }

  async undo(projectId?: number): Promise<boolean> {
    try {
      const data = await this.executeApiCommand('undo.perform', [projectId]);
      if (data) {
        this.notifyListeners(data);
      }
      return true;
    } catch (error) {
      console.error('[UndoRedoService] Undo failed:', error);
      return false;
    }
  }

  async redo(projectId?: number): Promise<boolean> {
    try {
      const data = await this.executeApiCommand('undo.redo', [projectId]);
      if (data) {
        this.notifyListeners(data);
      }
      return true;
    } catch (error) {
      console.error('[UndoRedoService] Redo failed:', error);
      return false;
    }
  }

  async getState(projectId?: number): Promise<UndoRedoState | null> {
    try {
      const data = await this.executeApiCommand('undo.getState', [projectId]);
      if (data) {
        this.notifyListeners(data);
        return data;
      }
      return null;
    } catch (error) {
      console.error('[UndoRedoService] Get state failed:', error);
      return null;
    }
  }

  async clearHistory(projectId?: number): Promise<boolean> {
    try {
      await this.executeApiCommand('undo.clear', [projectId]);
      return true;
    } catch (error) {
      console.error('[UndoRedoService] Clear history failed:', error);
      return false;
    }
  }

  async beginTransaction(projectId?: number): Promise<boolean> {
    try {
      await this.executeApiCommand('undo.begin', [projectId]);
      return true;
    } catch (error) {
      console.error('[UndoRedoService] Begin transaction failed:', error);
      return false;
    }
  }

  async endTransaction(projectId?: number): Promise<boolean> {
    try {
      const data = await this.executeApiCommand('undo.end', [projectId]);
      if (data) {
        this.notifyListeners(data);
      }
      return true;
    } catch (error) {
      console.error('[UndoRedoService] End transaction failed:', error);
      return false;
    }
  }
}

export const undoRedoService = UndoRedoService.getInstance();
export default UndoRedoService;

