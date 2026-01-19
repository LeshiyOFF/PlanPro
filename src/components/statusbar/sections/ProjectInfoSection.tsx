import React from 'react';
import { useProject } from '@/providers/ProjectProvider';
import { Separator } from '@/components/ui/separator';

/**
 * Секция информации о проекте
 * Отображает имя текущего проекта
 */
export const ProjectInfoSection: React.FC = () => {
  const { currentProject } = useProject();

  const projectName = React.useMemo(() => {
    return currentProject?.name || 'Нет проекта';
  }, [currentProject]);

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Проект:</span>
      <span className="font-medium">{projectName}</span>
    </div>
  );
};
