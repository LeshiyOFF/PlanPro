import React from 'react'
import { ViewErrorBoundary } from './ViewErrorBoundary'

/**
 * HOC для обёртки View компонентов в ErrorBoundary.
 * Избегает дублирования wrapper кода в каждом View.
 * 
 * Следует принципам SOLID:
 * - DRY: единая точка обёртки
 * - Type-safe: сохранение типов props через generics
 * - Open/Closed: расширяется без изменений существующего кода
 * 
 * @example
 * const GanttView = withViewErrorBoundary(GanttViewInner, 'Диаграмма Ганта')
 * 
 * @param Component - View компонент для обёртки
 * @param viewName - Человекочитаемое название View для отображения в fallback
 * @returns Обёрнутый компонент с ErrorBoundary
 */
export function withViewErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  viewName: string
): React.ComponentType<P> {
  const Wrapped: React.FC<P> = (props) => (
    <ViewErrorBoundary viewName={viewName}>
      <Component {...props} />
    </ViewErrorBoundary>
  )

  // Preserve display name for React DevTools
  const componentName = Component.displayName || Component.name || 'Component'
  Wrapped.displayName = `withViewErrorBoundary(${componentName})`

  return Wrapped
}
