/**
 * Экспорт всех React хуков
 */

// Хуки для работы с проектами
export { useProjectActions } from './useProjectActions'
export { useTaskActions } from './useTaskActions'
export { useResourceActions } from './useResourceActions'
export { useAssignmentActions } from './useAssignmentActions'
export { useCalendarActions } from './useCalendarActions'

// Хуки для работы с состоянием
export { useProjectState } from './useProjectState'
export { useAsyncOperation } from './useAsyncOperation'
export { useProject } from './ProjectProvider'

// Хуки для работы с API (типизированные)
export { useProjectAPI } from './useProjectAPI'
export { useTaskAPI } from './useTaskAPI'
export { useResourceAPI } from './useResourceAPI'
export { useProjectLibreAPI } from './useProjectLibreAPI'

// Хуки для работы с UI
export { useModal } from './useModal'
export { useKeyboardShortcuts } from './useKeyboardShortcuts'
export { useTheme } from './useTheme'

// Хуки для работы с компонентами
export { useProjectForm } from './useProjectForm'
export { useTaskForm } from './useTaskForm'
export { useResourceForm } from './useResourceForm'
export { useFilters } from './useFilters'
export { useTable } from './useTable'
export { useDragAndDrop } from './useDragAndDrop'

// Хуки для доступности
export { useAccessibilityTesting } from './useAccessibilityTesting'

// Хуки для Canvas
export { useGanttCanvasHandlers } from './useGanttCanvasHandlers'

