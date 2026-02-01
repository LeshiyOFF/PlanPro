import React from 'react'
import { useProject } from '@/providers/ProjectProvider'

/**
 * Секция информации о проекте
 * Отображает имя текущего проекта
 */
export const ProjectInfoSection: React.FC = () => {
  const { project } = useProject()

  const projectName = React.useMemo(() => {
    return project?.name || 'Нет проекта'
  }, [project])

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Проект:</span>
      <span className="font-medium">{projectName}</span>
    </div>
  )
}

