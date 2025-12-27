import React from 'react'

/**
 * Компонент диаграммы Ганта
 */
export const GanttView: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      {/* Панель инструментов */}
      <div className="border-b border-border bg-muted/30 p-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Диаграмма Ганта</span>
          <span className="text-xs text-muted-foreground ml-4">
            Масштаб: Недели
          </span>
        </div>
      </div>

      {/* Область диаграммы */}
      <div className="flex-1 flex">
        {/* Панель задач */}
        <div className="w-80 border-r border-border bg-card">
          <div className="border-b border-border p-2">
            <div className="text-sm font-medium">Задачи</div>
          </div>
          <div className="p-4 text-center text-muted-foreground">
            <p>Диаграмма Ганта</p>
            <p className="text-xs mt-2">Будет реализована в следующих этапах</p>
          </div>
        </div>

        {/* Панель таймлайна */}
        <div className="flex-1 bg-background">
          <div className="border-b border-border p-2">
            <div className="text-sm font-medium">Timeline</div>
          </div>
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p>Область диаграммы Ганта</p>
              <p className="text-xs mt-2">Будет реализована с использованием D3.js</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
