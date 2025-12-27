import React from 'react'

/**
 * Компонент использования задач
 */
export const TaskUsageView: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      {/* Панель инструментов */}
      <div className="border-b border-border bg-muted/30 p-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Использование задач</span>
        </div>
      </div>

      {/* Область таблицы */}
      <div className="flex-1 p-8">
        <div className="h-full flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <p>Использование задач</p>
            <p className="text-xs mt-2">Табличное представление использования задач</p>
            <p className="text-xs mt-1">Показывает распределение работы по задачам</p>
          </div>
        </div>
      </div>
    </div>
  )
}
