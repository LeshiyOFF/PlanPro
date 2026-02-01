import React, { useState, useCallback, useEffect } from 'react'

interface GanttLayoutProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  initialLeftWidth?: number;
}

/**
 * GanttLayout - Компонент управления пространством с резиновым разделителем.
 */
export const GanttLayout: React.FC<GanttLayoutProps> = ({
  leftPanel,
  rightPanel,
  initialLeftWidth = 260,
}) => {
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth)
  const [isResizing, setIsResizing] = useState(false)

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    document.body.style.cursor = 'col-resize'
  }, [])

  const stopResizing = useCallback(() => {
    setIsResizing(false)
    document.body.style.cursor = 'default'
  }, [])

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing) {
      // Находим корневой элемент вида, чтобы вычислить позицию относительно него
      const root = document.querySelector('.gantt-view-root')
      if (root) {
        const rect = root.getBoundingClientRect()
        const newWidth = e.clientX - rect.left

        // Ограничения: минимум 100px, максимум 80% от ширины доступного пространства
        if (newWidth > 100 && newWidth < rect.width * 0.8) {
          setLeftWidth(newWidth)
        }
      }
    }
  }, [isResizing])

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize)
      window.addEventListener('mouseup', stopResizing)
    }
    return () => {
      window.removeEventListener('mousemove', resize)
      window.removeEventListener('mouseup', stopResizing)
    }
  }, [isResizing, resize, stopResizing])

  return (
    <div className="flex h-full w-full overflow-hidden bg-white relative">
      {/* Левая панель */}
      <div
        style={{ width: `${leftWidth}px` }}
        className="flex-shrink-0 flex flex-col h-full border-r border-border/40 z-10 bg-white"
      >
        {leftPanel}
      </div>

      {/* Разделитель */}
      <div
        onMouseDown={startResizing}
        className={`w-1.5 h-full cursor-col-resize flex-shrink-0 z-20 transition-colors duration-150 group relative
          ${isResizing ? 'bg-primary' : 'bg-slate-100 hover:bg-primary/30'}`}
      >
        <div className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-px 
          ${isResizing ? 'bg-white/50' : 'bg-slate-300 group-hover:bg-primary/50'}`}
        />
      </div>

      {/* Правая панель */}
      <div className="flex-1 min-w-0 h-full bg-slate-50 relative">
        {rightPanel}
      </div>

      {/* Overlay при ресайзе для предотвращения перехвата событий iframe-ами или другими элементами */}
      {isResizing && <div className="absolute inset-0 z-50 cursor-col-resize" />}
    </div>
  )
}

