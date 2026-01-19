import React from 'react'
import { Button } from '@/components/ui/Button'
import { Plus, Save, FolderOpen, FileText } from 'lucide-react'

/**
 * Header компонент для UIDemo с Ribbon меню
 * Следует SOLID принципам
 */
export const UIDemoHeader: React.FC = () => {
  return (
    <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
      <Button variant="ribbon" size="ribbon">
        <FolderOpen className="h-4 w-4 mr-1" />
        Открыть
      </Button>
      <Button variant="ribbon" size="ribbon">
        <Save className="h-4 w-4 mr-1" />
        Сохранить
      </Button>
      <div className="w-px h-6 bg-border" />
      <Button variant="ribbon" size="ribbon">
        <Plus className="h-4 w-4 mr-1" />
        Новая задача
      </Button>
      <Button variant="ribbon-active" size="ribbon">
        Диаграмма Ганта
      </Button>
      <Button variant="ribbon" size="ribbon">
        <FileText className="h-4 w-4 mr-1" />
        Отчеты
      </Button>
    </div>
  )
}
