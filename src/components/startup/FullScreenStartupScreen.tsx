import React, { useCallback, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FilePlus, FolderOpen, History, Info } from 'lucide-react'
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
  const [platform, setPlatform] = useState<string>('unknown')
  const [showLinuxWarning, setShowLinuxWarning] = useState<boolean>(() => {
    // Проверяем localStorage: закрывал ли пользователь предупреждение ранее
    try {
      const dismissed = localStorage.getItem('linuxDragWarningDismissed')
      return dismissed !== 'true'
    } catch (error) {
      console.warn('[Startup] localStorage unavailable, showing warning by default')
      return true
    }
  })

  // Определение платформы для условного отображения drag-and-drop зоны
  useEffect(() => {
    const fetchPlatform = async () => {
      const api = getElectronAPI()
      if (!api?.getAppInfo) {
        console.warn('[Startup] getAppInfo API not available')
        return
      }

      try {
        const appInfo = await api.getAppInfo()
        setPlatform(appInfo.platform)
        console.log('[Startup] Platform detected:', appInfo.platform)
      } catch (error) {
        console.error('[Startup] Failed to fetch platform info:', error)
        // Оставляем 'unknown', drop-зона будет скрыта для безопасности
      }
    }

    fetchPlatform()
  }, [])

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

  const handleDismissWarning = useCallback(() => {
    try {
      localStorage.setItem('linuxDragWarningDismissed', 'true')
      setShowLinuxWarning(false)
      console.log('[Startup] Linux drag-drop warning dismissed by user')
    } catch (error) {
      console.error('[Startup] Failed to save dismissal state:', error)
      // Всё равно скрываем, даже если localStorage недоступен
      setShowLinuxWarning(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const files = e.dataTransfer.files
      const api = getElectronAPI()

      // ПРОВЕРКА 1: Проверяем, пришли ли файлы от системы
      // На Linux из-за Chromium race condition files может быть пустым
      if (!files || files.length === 0) {
        console.warn('[Startup] Drop event received but files list is empty (Linux Chromium limitation)')
        api?.showMessageBox({
          type: 'info',
          title: 'Drag-and-drop недоступен',
          message: 'На вашей системе функция перетаскивания файлов ограничена.\n\nИспользуйте кнопку "Открыть проект" для выбора файла.',
        })
        return
      }

      const file = files[0]

      // Диагностическое логирование
      console.log('[Startup] File dropped:', {
        name: file.name,
        size: file.size,
        type: file.type,
        hasDeprecatedPath: 'path' in file,
      })

      // ПРОВЕРКА 2: Получаем путь через webUtils.getPathForFile()
      const path = api?.getFilePathFromDrop?.(file) || ''

      console.log('[Startup] Path resolution:', {
        path,
        pathAvailable: !!path,
      })

      if (!path) {
        console.error('[Startup] webUtils.getPathForFile returned empty path (contextBridge serialization issue)')
        api?.showMessageBox({
          type: 'info',
          title: 'Используйте кнопку "Открыть"',
          message: 'Не удалось получить путь к файлу из-за ограничений системы.\n\nИспользуйте кнопку "Открыть проект" для выбора файла.',
        })
        return
      }

      // ПРОВЕРКА 3: Валидация расширения
      const ext = path.toLowerCase().slice(path.lastIndexOf('.'))
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        console.warn('[Startup] Invalid file extension:', ext)
        api?.showMessageBox({
          type: 'warning',
          title: 'Неверный формат файла',
          message: `Можно открывать только файлы с расширениями: ${ALLOWED_EXTENSIONS.join(', ')}`,
        })
        return
      }

      // Всё хорошо - загружаем проект
      console.log(`[Startup] Loading project from: ${path}`)
      runThenComplete(async () => {
        await loadProjectFromPath(path)
      })()
    },
    [runThenComplete, loadProjectFromPath],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    // Явно указываем dropEffect для Linux (критично для корректного курсора)
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy'
    }
  }, [])

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

      {/* 
        Для Linux: Информационное уведомление о недоступности drag-and-drop (XDND ограничение).
        Для Windows/macOS: Стандартная drag-and-drop зона.
      */}
      {platform === 'linux' && showLinuxWarning ? (
        // Сдержанное информационное уведомление для Linux (скрываемое)
        <div className="w-full max-w-md rounded-2xl border border-slate-300 
                        bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 
                        shadow-md p-6 transition-all duration-200">
          <div className="flex items-start gap-4 mb-5">
            {/* Иконка Info (читаемый размер, нейтральный цвет) */}
            <div className="w-11 h-11 rounded-xl bg-slate-200/70 flex items-center justify-center shrink-0">
              <Info className="w-6 h-6 text-slate-600" strokeWidth={2} aria-hidden />
            </div>
            
            {/* Текстовый контент */}
            <div className="flex-1">
              <h4 className="text-base font-semibold text-slate-700 mb-2 tracking-tight leading-snug">
                Информация о перетаскивании файлов
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Функция drag-and-drop недоступна в связи с особенностями операционной системы. 
                Для открытия проектов используйте кнопку{' '}
                <span className="font-semibold text-slate-700">"Открыть проект"</span> выше.
              </p>
            </div>
          </div>
          
          {/* Кнопка в стиле приложения (primary палитра - динамический акцентный цвет) */}
          <button 
            type="button"
            onClick={handleDismissWarning}
            className="w-full h-11 
                       bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary-hover))]
                       border border-[hsl(var(--primary))]/20
                       text-[hsl(var(--primary-foreground))] 
                       font-medium text-sm rounded-xl
                       shadow-md shadow-[hsl(var(--primary-shadow-light)/0.15)]
                       hover:shadow-lg hover:scale-[1.01]
                       active:scale-[0.99]
                       focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-2
                       transition-all duration-200"
          >
            Понятно
          </button>
        </div>
      ) : platform !== 'linux' ? (
        // Обычная дроп-зона для Windows/macOS (без изменений)
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
      ) : null}
    </div>
  )
}
