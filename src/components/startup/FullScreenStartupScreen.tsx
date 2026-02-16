import React, { useCallback, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FilePlus, FolderOpen, History } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { useFileOperations } from '@/hooks/useFileOperations'
import { LastProjectService } from '@/services/LastProjectService'
import { getElectronAPI } from '@/utils/electronAPI'

const ALLOWED_EXTENSIONS = ['.pod', '.mpp', '.xml']

/**
 * Полноэкранный стартовый экран при любом запуске (Фаза 2 ROADMAP).
 * Три кнопки: Создать новый проект, Открыть проект, Открыть последний проект.
 * Оформление в эталонном стиле: акцентные цвета, тени, hover/focus, глубина карточек.
 */
export const FullScreenStartupScreen: React.FC = () => {
  const { t } = useTranslation()
  const setStartupScreenCompleted = useAppStore((s) => s.setStartupScreenCompleted)
  const { createNewProject, openProject, loadProjectFromPath } = useFileOperations()
  const [lastProjectPath, setLastProjectPath] = useState<string | null>(null)
  const [lastProjectExists, setLastProjectExists] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const path = LastProjectService.getInstance().getLastProject()
    setLastProjectPath(path)
    if (!path) {
      setLastProjectExists(false)
      return
    }
    const check = async () => {
      const api = getElectronAPI()
      if (!api?.fileExists) {
        setLastProjectExists(true)
        return
      }
      try {
        const exists = await api.fileExists(path)
        setLastProjectExists(exists)
      } catch {
        setLastProjectExists(false)
      }
    }
    check()
  }, [])

  const runThenComplete = useCallback(
    (fn: () => Promise<void>) => async () => {
      if (isLoading) return
      setIsLoading(true)
      try {
        await fn()
        setStartupScreenCompleted(true)
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading, setStartupScreenCompleted],
  )

  const handleCreateNew = useCallback(
    runThenComplete(async () => {
      await createNewProject(true)
    }),
    [runThenComplete, createNewProject],
  )

  const handleOpenProject = useCallback(async () => {
    if (isLoading) return
    setIsLoading(true)
    try {
      const opened = await openProject()
      if (opened) setStartupScreenCompleted(true)
    } finally {
      setIsLoading(false)
    }
  }, [openProject, isLoading, setStartupScreenCompleted])

  const handleOpenLast = useCallback(
    runThenComplete(async () => {
      if (!lastProjectPath) return
      await loadProjectFromPath(lastProjectPath)
    }),
    [runThenComplete, loadProjectFromPath, lastProjectPath],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (!file) return
      
      // Используем webUtils.getPathForFile() для кроссплатформенной совместимости
      const api = getElectronAPI()
      const path = api?.getFilePathFromDrop?.(file) || ''
      
      if (!path) return
      const ext = path.toLowerCase().slice(path.lastIndexOf('.'))
      if (!ALLOWED_EXTENSIONS.includes(ext)) return
      runThenComplete(async () => {
        await loadProjectFromPath(path)
      })()
    },
    [runThenComplete, loadProjectFromPath],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => e.preventDefault(), [])

  const showLastButton = lastProjectPath !== null && lastProjectExists
  const buttonBase =
    'group flex items-center min-h-[72px] p-6 rounded-2xl border-2 border-[hsl(var(--primary))] ' +
    'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-lg shadow-[hsl(var(--primary-shadow-light)/0.3)] ' +
    'hover:bg-[hsl(var(--primary-hover))] hover:shadow-xl hover:scale-[1.02] ' +
    'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-2 focus:ring-offset-white ' +
    'active:scale-[0.99] ' +
    'transition-all duration-200 ease-out text-left w-full max-w-md '
  const buttonDisabled = 'disabled:opacity-70 disabled:hover:scale-100 disabled:hover:shadow-lg '
  const iconBox =
    'w-14 h-14 rounded-xl bg-[hsl(var(--primary-foreground)/0.2)] flex items-center justify-center mr-4 shrink-0 ' +
    'group-hover:bg-[hsl(var(--primary-foreground)/0.3)] text-[hsl(var(--primary-foreground))] ' +
    'transition-all duration-200 '

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-8 p-6 bg-white">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-slate-800">ПланПро</h1>
        <p className="text-slate-600 text-sm font-medium uppercase tracking-widest">
          {t('welcome.subtitle')}
        </p>
      </div>

      <div className="flex flex-col gap-5 w-full max-w-md">
        <button
          type="button"
          onClick={handleCreateNew}
          disabled={isLoading}
          className={buttonBase + buttonDisabled}
        >
          <div className={iconBox}>
            <FilePlus className="h-7 w-7" aria-hidden />
          </div>
          <div>
            <span className="font-semibold text-lg block">{t('welcome.createNew')}</span>
            <span className="text-sm opacity-80 block">{t('welcome.createNewDesc')}</span>
          </div>
        </button>

        <button
          type="button"
          onClick={handleOpenProject}
          disabled={isLoading}
          className={buttonBase + buttonDisabled}
        >
          <div className={iconBox}>
            <FolderOpen className="h-7 w-7" aria-hidden />
          </div>
          <div>
            <span className="font-semibold text-lg block">{t('welcome.openProject')}</span>
            <span className="text-sm opacity-80 block">{t('welcome.openProjectDesc')}</span>
          </div>
        </button>

        {showLastButton && (
          <button
            type="button"
            onClick={handleOpenLast}
            disabled={isLoading}
            className={buttonBase + buttonDisabled}
          >
            <div className={iconBox}>
              <History className="h-7 w-7" aria-hidden />
            </div>
            <div>
              <span className="font-semibold text-lg block">{t('welcome.openLastProject')}</span>
              <span className="text-sm opacity-80 block">{t('welcome.openLastProjectDesc')}</span>
            </div>
          </button>
        )}
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={
          'rounded-2xl border-2 border-dashed border-[hsl(var(--primary)/0.3)] p-8 w-full max-w-md text-center ' +
          'bg-slate-50 shadow-lg ' +
          'hover:border-[hsl(var(--primary)/0.5)] hover:bg-slate-100 ' +
          'hover:shadow-xl hover:scale-[1.01] transition-all duration-200'
        }
      >
        <p className="text-sm font-medium text-slate-600">{t('welcome.dropZone')}</p>
      </div>
    </div>
  )
}
