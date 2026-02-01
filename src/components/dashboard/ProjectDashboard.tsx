import React, { useState } from 'react'
import { ProjectManager } from '@/components/projects/ProjectManager'
import { TaskManager } from '@/components/tasks/TaskManager'
import { ResourceManager } from '@/components/resources/ResourceManager'
import { StatusMonitor } from '@/components/status/StatusMonitor'
import { StatusHistory } from '@/components/status/StatusHistory'
import { useJavaApi } from '@/hooks/useJavaApi'
import { useIpcService } from '@/hooks/useIpcService'
import { useStatusMonitor } from '@/hooks/useStatusMonitor'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { ErrorAlert } from '@/components/ui/error-alert'

type DashboardTab = 'projects' | 'tasks' | 'resources' | 'status' | 'history';

/**
 * Главный компонент дашборда с реальной Java API интеграцией
 */
export const ProjectDashboard: React.FC = () => {
  const javaApi = useJavaApi()
  const { ipcService } = useIpcService()
  const [activeTab, setActiveTab] = useState<DashboardTab>('projects')
  const [globalError, setGlobalError] = useState<string | null>(null)

  // Мониторинг статуса с обновлением каждые 3 секунды
  const { isHealthy, isMonitoring, monitoringErrors } = useStatusMonitor(3000)

  const getTabStyle = (tab: DashboardTab) => ({
    padding: '12px 24px',
    backgroundColor: activeTab === tab ? '#007acc' : '#f8f9fa',
    color: activeTab === tab ? 'white' : '#495057',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: activeTab === tab ? 'bold' : 'normal',
    transition: 'all 0.3s ease',
    marginRight: '5px',
  })

  const getStatusIndicator = () => {
    if (!javaApi.javaStatus?.running) {
      return {
        color: '#dc3545',
        text: 'Java Backend: Остановлен',
        action: 'Запустить Java',
      }
    }

    if (!javaApi.isApiAvailable) {
      return {
        color: '#ffc107',
        text: 'Java API: Недоступно',
        action: 'Проверить соединение',
      }
    }

    return {
      color: '#28a745',
      text: 'Java API: Доступно',
      action: 'Просмотр статуса',
    }
  }

  const status = getStatusIndicator()

  const handleStatusAction = async () => {
    setGlobalError(null)

    try {
      if (!javaApi.javaStatus?.running) {
        await ipcService.startJava()
      } else if (!javaApi.isApiAvailable) {
        await javaApi.checkApiAvailability()
      } else {
        await ipcService.showMessageBox({
          type: 'info',
          title: 'Статус Java API',
          message: `Java API запущен и доступен.\n\nПроектов: ${javaApi.projects.length}\nЗадач: ${javaApi.tasks.length}\nРесурсов: ${javaApi.resources.length}`,
        })
      }
    } catch (error) {
      setGlobalError(error instanceof Error ? error.message : 'Не удалось выполнить действие')
    }
  }

  return (
    <ErrorBoundary>
      <div style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f8f9fa',
      }}>
        {/* Global Error Alert */}
        <ErrorAlert
          error={globalError}
          onDismiss={() => setGlobalError(null)}
          onRetry={handleStatusAction}
          type="error"
          title="Системная ошибка"
        />
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #dee2e6',
          padding: '0 20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '70px',
          }}>
            <div>
              <h1 style={{ margin: '0', color: '#333', fontSize: '24px' }}>
              Дашборд ПланПро
              </h1>
              <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
              Управление проектами в реальном времени с интеграцией Java Backend
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {/* Status indicator */}
              <div style={{
                padding: '8px 16px',
                backgroundColor: `${isHealthy ? '#28a745' : status.color  }20`,
                border: `1px solid ${isHealthy ? '#28a745' : status.color}`,
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: isHealthy ? '#28a745' : status.color,
                }} />
                <span style={{
                  color: isHealthy ? '#28a745' : status.color,
                  fontSize: '14px',
                  fontWeight: '500',
                }}>
                  {isHealthy ? 'Система в норме' : status.text}
                </span>

                {/* Индикатор мониторинга */}
                {isMonitoring && (
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'hsl(var(--primary))',
                    animation: 'pulse 2s infinite',
                  }} />
                )}
              </div>

              <button
                onClick={handleStatusAction}
                style={{
                  padding: '8px 16px',
                  backgroundColor: isHealthy ? '#28a745' : status.color,
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                {isHealthy ? 'Подробнее' : status.action}
              </button>
            </div>
          </div>

          {/* Tab navigation */}
          <div style={{
            display: 'flex',
            padding: '15px 0',
            gap: '5px',
          }}>
            <button
              onClick={() => setActiveTab('projects')}
              style={getTabStyle('projects')}
            >
            Проекты ({javaApi.projects.length})
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              style={getTabStyle('tasks')}
            >
            Задачи ({javaApi.tasks.length})
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              style={getTabStyle('resources')}
            >
            Ресурсы ({javaApi.resources.length})
            </button>
            <button
              onClick={() => setActiveTab('status')}
              style={getTabStyle('status')}
            >
            Статус
              {!isHealthy && monitoringErrors.length > 0 && (
                <span style={{
                  marginLeft: '5px',
                  padding: '2px 6px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  borderRadius: '10px',
                  fontSize: '10px',
                }}>
                  {monitoringErrors.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              style={getTabStyle('history')}
            >
            История
            </button>
          </div>
        </div>

        {/* Main content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          backgroundColor: '#f8f9fa',
        }}>
          <ErrorBoundary>
            {activeTab === 'projects' && <ProjectManager />}
            {activeTab === 'tasks' && <TaskManager />}
            {activeTab === 'resources' && <ResourceManager />}
            {activeTab === 'status' && <StatusMonitor />}
            {activeTab === 'history' && <StatusHistory />}
          </ErrorBoundary>
        </div>

        {/* Footer */}
        <div style={{
          backgroundColor: 'white',
          borderTop: '1px solid #dee2e6',
          padding: '15px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          color: '#666',
        }}>
          <div>
            <strong>ПланПро</strong> Enterprise Edition
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>
            Статус Java: {javaApi.javaStatus?.running ? 'Запущено' : 'Остановлено'}
            </span>
            <span>
            API: {javaApi.isApiAvailable ? 'Доступно' : 'Недоступно'}
            </span>
            <span>
            Среда: {process.env.NODE_ENV === 'development' ? 'Разработка' : 'Продакшн'}
            </span>
          </div>
        </div>
      </div>

      {/* Global styles */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </ErrorBoundary>
  )
}

