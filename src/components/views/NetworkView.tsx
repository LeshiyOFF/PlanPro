import React from 'react'

/**
 * Компонент сетевой диаграммы
 */
export const NetworkView: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      {/* Панель инструментов */}
      <div className="border-b border-border bg-muted/30 p-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Сетевая диаграмма</span>
        </div>
      </div>

      {/* Область диаграммы */}
      <div className="flex-1 p-8">
        <div className="h-full flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <p>Сетевая диаграмма проекта</p>
            <p className="text-xs mt-2">Будет реализована с использованием D3.js</p>
            <p className="text-xs mt-1">Отображает зависимости между задачами</p>
          </div>
        </div>
      </div>
    </div>
  )
}
