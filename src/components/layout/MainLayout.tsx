import React from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Save, FolderOpen, FileText } from 'lucide-react'

/**
 * Основной layout приложения
 */
export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Ribbon меню */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center h-12 px-2">
          {/* Группа Файл */}
          <div className="toolbar-group">
            <Button variant="ribbon" size="ribbon">
              <FolderOpen className="h-4 w-4 mr-1" />
              Открыть
            </Button>
            <Button variant="ribbon" size="ribbon">
              <Save className="h-4 w-4 mr-1" />
              Сохранить
            </Button>
          </div>

          {/* Группа Правка */}
          <div className="toolbar-group">
            <Button variant="ribbon" size="ribbon">
              <Plus className="h-4 w-4 mr-1" />
              Новая задача
            </Button>
          </div>

          {/* Группа Представление */}
          <div className="toolbar-group">
            <Button variant="ribbon-active" size="ribbon">
              Диаграмма Ганта
            </Button>
            <Button variant="ribbon" size="ribbon">
              Сетевая диаграмма
            </Button>
          </div>

          {/* Группа Отчеты */}
          <div className="toolbar-group">
            <Button variant="ribbon" size="ribbon">
              <FileText className="h-4 w-4 mr-1" />
              Отчеты
            </Button>
          </div>
        </div>
      </header>

      {/* Основная область */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}

