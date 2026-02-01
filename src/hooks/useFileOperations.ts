import { useCallback } from 'react'
import { useProjectStore } from '@/store/projectStore'
import { useFileNew } from './useFileNew'
import { useFileOpen } from './useFileOpen'
import { useFileSave } from './useFileSave'

/**
 * Facade for file operations (Open, Save, Save As, New).
 * Composes useFileNew, useFileOpen, useFileSave per SOLID SRP (13.7.1).
 * Delegates "Save" without path to "Save As" for consistent UX.
 */
export const useFileOperations = () => {
  const { currentFilePath } = useProjectStore()
  const newOps = useFileNew()
  const openOps = useFileOpen()
  const saveOps = useFileSave()

  const saveProject = useCallback(async (): Promise<void> => {
    if (!currentFilePath) {
      return saveOps.saveProjectAs()
    }
    return saveOps.saveProject()
  }, [currentFilePath, saveOps.saveProject, saveOps.saveProjectAs])

  const isProcessing =
    newOps.isProcessing || openOps.isProcessing || saveOps.isProcessing

  return {
    createNewProject: newOps.createNewProject,
    openProject: openOps.openProject,
    saveProject,
    saveProjectAs: saveOps.saveProjectAs,
    loadProjectFromPath: openOps.loadProjectFromPath,
    currentFilePath,
    isProcessing,
  }
}
