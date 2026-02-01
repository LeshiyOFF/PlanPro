import React from 'react'
import { ContextMenuProvider } from './providers/ContextMenuProvider'
import { ContextMenuTestPage } from './pages/ContextMenuTestPage'

/**
 * Полный пример использования Context Menu системы
 */
export const ContextMenuExample: React.FC = () => {
  return (
    <ContextMenuProvider>
      <ContextMenuTestPage />
    </ContextMenuProvider>
  )
}

