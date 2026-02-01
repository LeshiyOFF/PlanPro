/**
 * Контракты для проектных диалогов
 */

import { BaseDialogData, BaseDialogResult } from '../IDialogRegistry';

/**
 * Проектные диалоги
 */
export interface ProjectsDialogData extends BaseDialogData {
  readonly projects: ReadonlyArray<{
    id: string;
    name: string;
    lastModified: Date;
  }>;
}

export interface ProjectsDialogResult extends BaseDialogResult {
  readonly selectedProjectId?: string;
}

export interface UpdateProjectDialogData extends BaseDialogData {
  readonly projectId: string;
  readonly currentProgress: number;
}

export interface UpdateProjectDialogResult extends BaseDialogResult {
  readonly updated: boolean;
}

export interface RenameProjectDialogData extends BaseDialogData {
  readonly projectId: string;
  readonly currentName: string;
}

export interface RenameProjectDialogResult extends BaseDialogResult {
  readonly newName?: string;
}

export interface OpenProjectDialogData extends BaseDialogData {
  readonly recentProjects: ReadonlyArray<string>;
}

export interface OpenProjectDialogResult extends BaseDialogResult {
  readonly projectPath?: string;
}

export interface EarnedValueDialogData extends BaseDialogData {
  readonly projectId: string;
  readonly plannedValue: number;
  readonly earnedValue: number;
  readonly actualCost: number;
}

export interface EarnedValueDialogResult extends BaseDialogResult {
  readonly acknowledged: boolean;
}

export interface ProjectStatisticsDialogData extends BaseDialogData {
  readonly projectId: string;
  readonly totalTasks: number;
  readonly completedTasks: number;
  readonly totalResources: number;
}

export interface ProjectStatisticsDialogResult extends BaseDialogResult {
  readonly acknowledged: boolean;
}
