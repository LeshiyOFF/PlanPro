import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { GanttView } from '@/components/views/GanttView'
import { NetworkView } from '@/components/views/NetworkView'
import { TaskUsageView } from '@/components/views/TaskUsageView'
import { ResourceUsageView } from '@/components/views/ResourceUsageView'
import { ProjectProvider } from '@/providers/ProjectProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { Toaster } from '@/components/ui/toaster'
import { logger } from '@/utils/logger'

/**
 * Главный компонент приложения
 * Определяет маршрутизацию и провайдеры контекста
 */
const App: React.FC = () => {
  useEffect(() => {
    // Инициализация Electron API
    if (window.electronAPI) {
      logger.info('Electron API initialized')

      // Установка слушателей событий Java процесса
      window.electronAPI.onJavaStarted(() => {
        logger.info('Java backend started')
      })

      window.electronAPI.onJavaStopped(() => {
        logger.info('Java backend stopped')
      })

      window.electronAPI.onJavaError((error) => {
        logger.error('Java backend error', error)
      })
    }
  }, [])

  return (
    <ThemeProvider defaultTheme="light" storageKey="projectlibre-ui-theme">
      <ProjectProvider>
        <MainLayout>
          <Routes>
            <Route path="/" element={<GanttView />} />
            <Route path="/gantt" element={<GanttView />} />
            <Route path="/network" element={<NetworkView />} />
            <Route path="/task-usage" element={<TaskUsageView />} />
            <Route path="/resource-usage" element={<ResourceUsageView />} />
          </Routes>
        </MainLayout>
        <Toaster />
      </ProjectProvider>
    </ThemeProvider>
  )
}

export default App
