import React, { ReactNode } from 'react'
import { useNavigation } from '@/providers/NavigationProvider'
import { useActionManager } from '@/providers/ActionContext'
import { SidebarNavigation } from '@/components/navigation'
import { ViewType } from '@/types/ViewTypes'
import MainWindow from './MainWindow'
import { MainWindowInitializer } from './MainWindowInitializer'
import { MenuProvider } from '@/providers/MenuProvider'

/**
 * Интерфейс для MainLayout
 */
interface MainLayoutProps {
  children?: ReactNode;
  onViewChange?: (viewType: ViewType) => void;
}

/**
 * Основной layout приложения с View навигацией и MainWindow
 * Следует SOLID принципу Single Responsibility
 */
export const ViewLayout: React.FC<MainLayoutProps> = ({
  children,
  onViewChange,
}) => {
  useNavigation()
  const { updateActionStates } = useActionManager()

  /**
   * Обработчик изменения представления
   */
  const handleViewChange = (viewType: ViewType) => {
    if (onViewChange) {
      onViewChange(viewType)
    }
    updateActionStates() // Обновление состояний действий
  }

  return (
    <MainWindowInitializer>
      <div className="main-grid-layout bg-background">
        {/* Боковая навигация - фиксированная ширина */}
        <div className="sidebar-wrapper">
          <SidebarNavigation />
        </div>

        {/* Основной контент - оставшееся пространство */}
        <div className="content-wrapper flex flex-col">
          {/* Menu Provider и MainWindow с Ribbon toolbar */}
          <MenuProvider>
            <MainWindow onViewChange={handleViewChange}>
              {children}
            </MainWindow>
          </MenuProvider>
        </div>
      </div>
    </MainWindowInitializer>
  )
}

