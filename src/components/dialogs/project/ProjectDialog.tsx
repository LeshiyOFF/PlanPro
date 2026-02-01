import React, { useState, useEffect } from 'react'
import { BaseDialog } from '@/components/dialogs/base/BaseDialog'
import {
  IDialogActions,
  DialogResult,
  IDialogData,
} from '@/types/dialog/DialogTypes'
import { ProjectDialogData } from '@/types/calendar-types'
import { DialogRenderFunction } from '@/components/dialogs/base/BaseDialog'
import { useProjectAPI } from '@/hooks/useProjectAPI'
import { useProjectState } from '@/hooks/useProjectState'
import { mapCatalogProjectToUi } from '@/services/CatalogProjectMapper'
import { mapDialogDataToProject } from './ProjectDialogMapper'
import { projectDialogValidationRules } from './ProjectDialogValidation'
import { ProjectDialogForm } from './ProjectDialogForm'
import { getErrorMessage } from '@/utils/errorUtils'

/**
 * Интерфейс для ProjectDialog компонента
 */
export interface ProjectDialogProps {
  data?: Partial<ProjectDialogData>;
  isOpen: boolean;
  onClose: (result: DialogResult<ProjectDialogData>) => void;
}

/**
 * Диалог для создания и редактирования проектов
 * Соответствует ProjectDialog из Dialogs_Inventory.md
 * Реализует SOLID принцип Single Responsibility
 */
export const ProjectDialog: React.FC<ProjectDialogProps> = ({
  data = {},
  isOpen,
  onClose,
}) => {
  const [projectData, setProjectData] = useState<ProjectDialogData>(() => {
    const initial: ProjectDialogData = {
      id: `project_${Date.now()}`,
      title: 'Новый проект',
      description: 'Создание нового проекта',
      timestamp: new Date(),
      name: '',
      manager: '',
      notes: '',
      startDate: new Date(),
      resourcePool: undefined,
      forward: true,
      projectType: 0,
      projectStatus: 0,
      projectId: '',
      ...data,
    }
    return initial
  })

  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  const projectApi = useProjectAPI()
  const { updateProjectState } = useProjectState()
  const isEdit = Boolean(data?.projectId?.trim())

  /**
   * Обработчик изменения полей
   */
  const handleFieldChange = (field: keyof ProjectDialogData, value: ProjectDialogData[keyof ProjectDialogData]) => {
    setProjectData((prev: ProjectDialogData) => ({
      ...prev,
      [field]: value,
    }))

    // Очистка ошибок при изменении поля
    if (errors[field as string]) {
      setErrors((prev: Record<string, string[]>) => {
        const newErrors = { ...prev }
        delete newErrors[field as string]
        return newErrors
      })
    }
  }

  /**
   * Действия диалога: сохранение через ProjectAPIClient (create/update).
   */
  const actions: IDialogActions = {
    onOk: async () => {
      setSubmitError(null)
      try {
        const partial = mapDialogDataToProject(projectData)
        let catalogProject
        if (isEdit) {
          const projectId = data?.projectId?.trim()
          if (!projectId) throw new Error('Идентификатор проекта обязателен для сохранения')
          catalogProject = await projectApi.updateProject(projectId, partial)
        } else {
          catalogProject = await projectApi.createProject(partial)
        }
        const uiProject = mapCatalogProjectToUi(catalogProject)
        updateProjectState(uiProject)
      } catch (err) {
        setSubmitError(getErrorMessage(err))
        throw err
      }
    },

    onCancel: () => {
      onClose({ success: false, action: 'cancel' })
    },

    onHelp: () => {},

    onValidate: (_data: IDialogData) => {
      const newErrors: Record<string, string[]> = {}

      if (!projectData.name || projectData.name.trim().length === 0) {
        newErrors.name = ['Название проекта обязательно']
      } else if (projectData.name.trim().length < 3) {
        newErrors.name = ['Минимальная длина - 3 символа']
      }

      if (!projectData.manager || projectData.manager.trim().length === 0) {
        newErrors.manager = ['Менеджер проекта обязателен']
      }

      if (!projectData.startDate) {
        newErrors.startDate = ['Дата начала обязательна']
      }

      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    },
  }

  useEffect(() => {
    setSubmitError(null)
    if (data && Object.keys(data).length > 0) {
      setProjectData(prev => ({
        ...prev,
        ...data,
        id: prev.id,
        timestamp: new Date(),
      }))
    }
  }, [data])

  const renderContent: DialogRenderFunction<ProjectDialogData> = (dialogData, validationErrors) => (
    <ProjectDialogForm
      data={dialogData}
      validationErrors={validationErrors}
      submitError={submitError}
      onFieldChange={handleFieldChange}
    />
  )

  return (
    <BaseDialog<ProjectDialogData>
      data={projectData}
      actions={actions}
      validationRules={projectDialogValidationRules}
      isOpen={isOpen}
      onClose={onClose}
      config={{
        width: 600,
        height: 500,
        modal: true,
        showHelp: true,
      }}
    >
      {renderContent}
    </BaseDialog>
  )
}

export default ProjectDialog

