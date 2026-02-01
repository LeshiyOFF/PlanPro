import React, { useState, useEffect } from 'react'
import { BaseDialog } from '@/components/dialogs/base/BaseDialog'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  IDialogActions,
  DialogResult,
  IDialogData,
} from '@/types/dialog/DialogTypes'

/**
 * Интерфейс для данных проекта
 */
interface ProjectInformationData extends IDialogData {
  projectName: string;
  projectManager: string;
  projectStartDate: Date;
  projectEndDate?: Date;
  projectStatus: string;
  projectProgress: number;
  projectBudget?: number;
  projectActualCost?: number;
  projectTasks: {
    total: number;
    completed: number;
    inProgress: number;
    delayed: number;
  };
  projectResources: {
    total: number;
    assigned: number;
    available: number;
  };
  projectNotes?: string;
}

/**
 * Интерфейс для ProjectInformationDialog компонента
 */
export interface ProjectInformationDialogProps {
  data?: Partial<ProjectInformationData>;
  isOpen: boolean;
  onClose: (result: DialogResult<ProjectInformationData>) => void;
}

/**
 * Диалог для отображения общей информации о проекте
 * Соответствует ProjectInformationDialog из Dialogs_Inventory.md
 * Реализует SOLID принцип Single Responsibility
 */
export const ProjectInformationDialog: React.FC<ProjectInformationDialogProps> = ({
  data = {},
  isOpen,
  onClose,
}) => {
  const [projectData, setProjectData] = useState<ProjectInformationData>(() => {
    const initial: ProjectInformationData = {
      id: `project_info_${Date.now()}`,
      title: 'Информация о проекте',
      description: 'Общая информация и статистика проекта',
      timestamp: new Date(),
      projectName: '',
      projectManager: '',
      projectStartDate: new Date(),
      projectStatus: 'Планирование',
      projectProgress: 0,
      projectTasks: {
        total: 0,
        completed: 0,
        inProgress: 0,
        delayed: 0,
      },
      projectResources: {
        total: 0,
        assigned: 0,
        available: 0,
      },
      ...data,
    }
    return initial
  })

  /**
   * Получение статуса проекта
   */
  const getStatusVariant = (status: string): 'default' | 'success' | 'warning' | 'destructive' => {
    switch (status.toLowerCase()) {
      case 'завершен':
      case 'completed':
        return 'success'
      case 'в работе':
      case 'in progress':
        return 'warning'
      case 'приостановлен':
      case 'suspended':
        return 'destructive'
      default:
        return 'default'
    }
  }

  /**
   * Расчет эффективности бюджета
   */
  const getBudgetEfficiency = (): { percentage: number; status: string } => {
    if (!projectData.projectBudget || !projectData.projectActualCost) {
      return { percentage: 0, status: 'Нет данных' }
    }

    const percentage = ((projectData.projectBudget - projectData.projectActualCost) / projectData.projectBudget) * 100

    if (percentage >= 10) {
      return { percentage, status: 'Под бюджетом' }
    } else if (percentage >= -5) {
      return { percentage, status: 'В рамках бюджета' }
    } else {
      return { percentage, status: 'Превышение бюджета' }
    }
  }

  /**
   * Форматирование даты
   */
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  /**
   * Действия диалога
   */
  const actions: IDialogActions = {
    onOk: async (_data?: IDialogData) => {
      onClose({ success: true, data: projectData, action: 'ok' })
    },

    onCancel: () => {
      console.log('Project information dialog cancelled')
      onClose({ success: false, action: 'cancel' })
    },

    onHelp: () => {
      console.log('Opening project information help...')
    },

    onValidate: (_data: IDialogData) => {
      return true
    },
  }

  /**
   * Инициализация данных при изменении
   */
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      setProjectData((prev: ProjectInformationData) => ({
        ...prev,
        ...data,
        id: prev.id,
        timestamp: new Date(),
      }))
    }
  }, [data])

  const budgetEfficiency = getBudgetEfficiency()

  /**
   * Компонент содержимого диалога
   */
  const DialogContent: React.FC = () => (
    <div className="space-y-6 p-6">
      {/* Основная информация */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-semibold text-foreground">{projectData.projectName}</h3>
          <Badge variant={getStatusVariant(projectData.projectStatus)}>
            {projectData.projectStatus}
          </Badge>
        </div>

        <div className="text-sm text-muted-foreground">
          <div>Менеджер: {projectData.projectManager}</div>
          <div>Создан: {formatDate(projectData.timestamp)}</div>
        </div>
      </div>

      {/* Прогресс и даты */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Прогресс выполнения</span>
            <span className="font-medium">{projectData.projectProgress}%</span>
          </div>
          <Progress value={projectData.projectProgress} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Дата начала:</span>
            <div className="font-medium">{formatDate(projectData.projectStartDate)}</div>
          </div>
          {projectData.projectEndDate && (
            <div>
              <span className="text-muted-foreground">Дата окончания:</span>
              <div className="font-medium">{formatDate(projectData.projectEndDate)}</div>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Статистика задач */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Статистика задач</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Всего задач:</span>
              <span className="font-medium">{projectData.projectTasks.total}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Завершено:</span>
              <span className="font-medium text-green-600">{projectData.projectTasks.completed}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">В работе:</span>
              <span className="font-medium text-primary">{projectData.projectTasks.inProgress}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Отстают:</span>
              <span className="font-medium text-red-600">{projectData.projectTasks.delayed}</span>
            </div>

            {/* Прогресс задач */}
            {projectData.projectTasks.total > 0 && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Выполнение задач:</div>
                <Progress
                  value={(projectData.projectTasks.completed / projectData.projectTasks.total) * 100}
                  className="h-2"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Ресурсы */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Ресурсы проекта</h3>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-muted rounded">
            <div className="text-2xl font-bold text-foreground">{projectData.projectResources.total}</div>
            <div className="text-sm text-muted-foreground">Всего</div>
          </div>
          <div className="p-3 bg-primary/10 dark:bg-blue-900 rounded">
            <div className="text-2xl font-bold text-primary dark:text-blue-300">{projectData.projectResources.assigned}</div>
            <div className="text-sm text-muted-foreground">Назначено</div>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900 rounded">
            <div className="text-2xl font-bold text-green-600 dark:text-green-300">{projectData.projectResources.available}</div>
            <div className="text-sm text-muted-foreground">Доступно</div>
          </div>
        </div>

        {/* Прогресс использования ресурсов */}
        {projectData.projectResources.total > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Загрузка ресурсов:</span>
              <span className="font-medium">
                {Math.round((projectData.projectResources.assigned / projectData.projectResources.total) * 100)}%
              </span>
            </div>
            <Progress
              value={(projectData.projectResources.assigned / projectData.projectResources.total) * 100}
              className="h-2"
            />
          </div>
        )}
      </div>

      {/* Бюджет */}
      {projectData.projectBudget && (
        <>
          <Separator />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Бюджет проекта</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Плановый бюджет:</span>
                  <span className="font-medium">{projectData.projectBudget}</span>
                </div>
                {projectData.projectActualCost && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Фактические затраты:</span>
                    <span className="font-medium">{projectData.projectActualCost}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Эффективность бюджета:</div>
                <div className="flex items-center gap-2">
                  <Progress
                    value={Math.abs(budgetEfficiency.percentage)}
                    className="h-2 flex-1"
                  />
                  <span className={`text-sm font-medium ${
                    budgetEfficiency.percentage >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {budgetEfficiency.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {budgetEfficiency.status}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Заметки */}
      {projectData.projectNotes && (
        <>
          <Separator />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Заметки</h3>
            <div className="text-sm p-3 bg-muted rounded">
              {projectData.projectNotes}
            </div>
          </div>
        </>
      )}
    </div>
  )

  return (
    <BaseDialog<ProjectInformationData>
      data={projectData}
      actions={actions}
      isOpen={isOpen}
      onClose={onClose}
      config={{
        width: 700,
        height: 600,
        modal: true,
        showHelp: true,
      }}
    >
      <DialogContent />
    </BaseDialog>
  )
}

export default ProjectInformationDialog

