import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react'
import './ToolbarStyles.css'
import './IntegratedToolbarStyles.css'
import {
  NewAction,
  OpenAction,
  SaveAction,
  SaveAsAction,
} from '../toolbar/actions'
import {
  FilePlus,
  FolderOpen,
  Save,
  FileText,
  Calculator,
  Loader2,
} from 'lucide-react'
import { useFileOperations } from '@/hooks/useFileOperations'
import { useProjectStore } from '@/store/projectStore'
import { ProjectDeadlineIndicator } from '@/components/project/ProjectDeadlineIndicator'
import { useUserPreferences } from '@/components/userpreferences/hooks/useUserPreferences'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/hooks/use-toast'

/**
 * Интерфейс интегрированного тулбара (Hotbar)
 */
interface IIntegratedToolbarProps {
  className?: string;
  onAction?: (actionId: string, actionLabel: string) => void;
}

/**
 * Компактный Hotbar для работы с файлами.
 * Отображает текущий статус проекта и основные операции.
 */
export const IntegratedToolbar: React.FC<IIntegratedToolbarProps> = ({
  className,
  onAction,
}) => {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { currentFilePath, isDirty, imposedFinishDate, recalculateAllTasks, currentProjectId } = useProjectStore()
  const { createNewProject, openProject, saveProject, saveProjectAs } = useFileOperations()
  const { preferences } = useUserPreferences()
  const autoCalculate = preferences.editing?.autoCalculate ?? true
  const [isRecalculating, setIsRecalculating] = useState(false)

  // Извлечение имени файла из полного пути
  const projectName = useMemo(() => {
    if (!currentFilePath) return 'Новый проект'
    // Находим последний слэш или бэк-слэш
    const lastSlash = Math.max(currentFilePath.lastIndexOf('/'), currentFilePath.lastIndexOf('\\'))
    return lastSlash === -1 ? currentFilePath : currentFilePath.substring(lastSlash + 1)
  }, [currentFilePath])

  // Создаём действия (обёртки возвращают void для совместимости с () => void | Promise<void>)
  const actions = useMemo(() => ({
    new: new NewAction(() => { void createNewProject() }),
    open: new OpenAction(() => { void openProject() }),
    save: new SaveAction(() => { void saveProject() }),
    saveAs: new SaveAsAction(() => { void saveProjectAs() }),
  }), [createNewProject, openProject, saveProject, saveProjectAs])

  const lastClickTimeRef = useRef<Map<string, number>>(new Map())
  const DEBOUNCE_MS = 300

  const handleRecalculate = useCallback(() => {
    if (!currentProjectId) {
      toast({
        variant: 'destructive',
        title: t('toolbar.no_project_title', { defaultValue: 'Нет открытого проекта' }),
        description: t('toolbar.no_project_desc', { defaultValue: 'Откройте проект для пересчёта.' }),
      })
      return
    }
    setIsRecalculating(true)
    try {
      recalculateAllTasks()
      toast({
        title: t('toolbar.recalculate_success', { defaultValue: 'Пересчёт завершён' }),
        description: t('toolbar.recalculate_success_desc', { defaultValue: 'Расписание проекта обновлено.' }),
      })
    } finally {
      setIsRecalculating(false)
    }
  }, [currentProjectId, recalculateAllTasks, toast, t])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F9' && !autoCalculate) {
        e.preventDefault()
        handleRecalculate()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [autoCalculate, handleRecalculate])

  const handleAction = useCallback((actionId: string, actionLabel: string) => {
    const now = Date.now()
    const lastClick = lastClickTimeRef.current.get(actionId) || 0

    if (now - lastClick < DEBOUNCE_MS) return
    lastClickTimeRef.current.set(actionId, now)

    try {
      onAction?.(actionId, actionLabel)
    } catch (error) {
      console.error(`Ошибка при выполнении действия ${actionId}:`, error)
    }
  }, [onAction])

  // Вспомогательный компонент кнопки
  interface ToolbarButtonProps {
    action: { label: string };
    id: string;
    icon: React.ComponentType<{ className?: string }>;
    tooltip?: string;
  }
  const ToolbarButton = ({ action, id, icon: Icon, tooltip }: ToolbarButtonProps) => (
    <button
      className="toolbar-button"
      onClick={() => handleAction(id, action.label)}
      title={tooltip || action.label}
    >
      <span className="toolbar-button-icon">
        <Icon />
      </span>
    </button>
  )

  return (
    <>
      <div className={`integrated-toolbar-container ${className || ''}`}>
        {/* ЛЕВАЯ ЧАСТЬ: Информация о проекте */}
        <div className="toolbar-project-info">
          <FileText className="project-icon h-4 w-4" />
          <span className="project-name" title={currentFilePath || 'Проект не сохранен'}>
            {projectName}
          </span>
          <span className={`project-status ${isDirty ? 'dirty' : ''}`}>
            {isDirty ? 'Изменено •' : 'Сохранено'}
          </span>
          {imposedFinishDate && (
            <ProjectDeadlineIndicator variant="compact" className="ml-2" />
          )}
        </div>

      {/* ПРАВАЯ ЧАСТЬ: Файловые операции */}
      <div className="toolbar-actions-group">
        <ToolbarButton
          id="TB001"
          action={actions.new}
          icon={FilePlus}
          tooltip="Создать новый проект (Ctrl+N)"
        />
        <ToolbarButton
          id="TB002"
          action={actions.open}
          icon={FolderOpen}
          tooltip="Открыть существующий проект (Ctrl+O)"
        />

        <div className="toolbar-divider" />

        <ToolbarButton
          id="TB003"
          action={actions.save}
          icon={Save}
          tooltip="Сохранить текущий проект (Ctrl+S)"
        />
        <ToolbarButton
          id="TB003_AS"
          action={actions.saveAs}
          icon={() => (
            <div className="relative">
              <Save />
              <span className="absolute -bottom-1 -right-1 text-[9px] font-bold leading-none bg-background px-0.5 rounded shadow-sm">+</span>
            </div>
          )}
          tooltip="Сохранить как... (Ctrl+Shift+S)"
        />

        {!autoCalculate && (
          <>
            <div className="toolbar-divider" />
            <button
              className="toolbar-button recalculate-button"
              onClick={handleRecalculate}
              disabled={isRecalculating}
              title={t('toolbar.recalculate_tooltip', { defaultValue: 'Пересчитать расписание проекта (F9)' })}
            >
              <span className="toolbar-button-icon">
                {isRecalculating ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Calculator />
                )}
              </span>
              <span className="toolbar-button-label">
                {t('toolbar.recalculate_project', { defaultValue: 'Пересчитать' })}
              </span>
            </button>
          </>
        )}

      </div>
    </div>
  </>
  )
}

export default IntegratedToolbar

