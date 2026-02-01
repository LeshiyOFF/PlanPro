import React, { useState, useEffect, useCallback } from 'react'
import { useIpcService } from '@/hooks/useIpcService'
import { useJavaApi } from '@/hooks/useJavaApi'

interface StatusInfo {
  javaVersion?: string;
  memoryUsage?: number;
  uptime?: number;
  activeConnections?: number;
  lastCheck?: Date;
}

/**
 * Компонент для реального мониторинга статуса Java бэкенда
 */
export const StatusMonitor: React.FC = () => {
  const { javaStatus, startJava, restartJava, getJavaStatus } = useIpcService()
  const { isApiAvailable, checkApiAvailability } = useJavaApi()
  const [statusInfo, setStatusInfo] = useState<StatusInfo>({})
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)

  /**
   * Получение детальной информации о статусе
   */
  const refreshStatusInfo = useCallback(async () => {
    if (!javaStatus?.running) return

    setIsRefreshing(true)
    try {
      const response = await getJavaStatus()
      if (response.success && response.data) {
        const d = response.data
        setStatusInfo({
          javaVersion: d.version,
          memoryUsage: d.memoryUsage,
          uptime: d.uptime,
          activeConnections: d.activeConnections,
          lastCheck: new Date(),
        })
      }
    } catch (error) {
      console.error('Failed to get detailed status:', error)
    } finally {
      setIsRefreshing(false)
    }
  }, [javaStatus?.running, getJavaStatus])

  /**
   * Автоматическое обновление статуса
   */
  useEffect(() => {
    if (!autoRefresh || !javaStatus?.running) return

    const interval = setInterval(() => {
      refreshStatusInfo()
    }, 5000) // Обновление каждые 5 секунд

    return () => clearInterval(interval)
  }, [autoRefresh, javaStatus?.running, refreshStatusInfo])

  /**
   * Проверка API доступности при изменении статуса Java
   */
  useEffect(() => {
    if (javaStatus?.running) {
      checkApiAvailability()
    }
  }, [javaStatus?.running, checkApiAvailability])

  /**
   * Обработка start/restart Java
   */
  const handleJavaAction = async () => {
    try {
      if (javaStatus?.running) {
        await restartJava()
      } else {
        await startJava()
      }

      // Небольшая задержка перед проверкой статуса
      setTimeout(() => {
        refreshStatusInfo()
        checkApiAvailability()
      }, 2000)
    } catch (error) {
      console.error('Failed to perform Java action:', error)
    }
  }

  const getStatusColor = () => {
    if (!javaStatus?.running) return '#dc3545'
    if (!isApiAvailable) return '#ffc107'
    return '#28a745'
  }

  const getStatusText = () => {
    if (!javaStatus?.running) return 'Остановлен'
    if (!isApiAvailable) return 'Запущен (API недоступно)'
    return 'Запущен'
  }

  const formatUptime = (seconds?: number) => {
    if (!seconds) return 'н/д'

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days}д ${hours % 24}ч ${minutes}м`
    }

    return `${hours}ч ${minutes}м`
  }

  const formatMemory = (bytes?: number) => {
    if (!bytes) return 'н/д'

    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} МБ`
  }

  return (
    <div style={{
      backgroundColor: 'white',
      border: `2px solid ${getStatusColor()}`,
      borderRadius: '12px',
      padding: '20px',
      margin: '10px 0',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    }}>
      {/* Заголовок с основным статусом */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '1px solid #e5e7eb',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: getStatusColor(),
          }} />
          <h3 style={{ margin: 0, color: '#1f2937', fontSize: '18px' }}>
            Статус Java Backend
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            style={{
              padding: '6px 12px',
              backgroundColor: autoRefresh ? '#28a745' : '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            {autoRefresh ? 'Авто ВКЛ' : 'Авто ВЫКЛ'}
          </button>

          <button
            onClick={refreshStatusInfo}
            disabled={isRefreshing || !javaStatus?.running}
            style={{
              padding: '6px 12px',
              backgroundColor: '#007acc',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
              opacity: isRefreshing ? 0.5 : 1,
            }}
          >
            {isRefreshing ? 'Обновление...' : 'Обновить'}
          </button>

          <button
            onClick={handleJavaAction}
            style={{
              padding: '6px 12px',
              backgroundColor: getStatusColor(),
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            {javaStatus?.running ? 'Перезапустить' : 'Запустить'}
          </button>
        </div>
      </div>

      {/* Детальная информация */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '15px',
      }}>
        <div style={{
          backgroundColor: '#f9fafb',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#374151', fontSize: '14px' }}>
            Основной статус
          </h4>
          <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.6' }}>
            <div><strong>Статус:</strong> <span style={{ color: getStatusColor() }}>{getStatusText()}</span></div>
            <div><strong>API:</strong> {isApiAvailable ? 'Доступно' : 'Недоступно'}</div>
            {statusInfo.javaVersion && <div><strong>Версия:</strong> {statusInfo.javaVersion}</div>}
            {statusInfo.lastCheck && (
              <div><strong>Проверка:</strong> {statusInfo.lastCheck.toLocaleTimeString()}</div>
            )}
          </div>
        </div>

        <div style={{
          backgroundColor: '#f9fafb',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#374151', fontSize: '14px' }}>
            Производительность
          </h4>
          <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.6' }}>
            {statusInfo.uptime !== undefined && (
              <div><strong>Аптайм:</strong> {formatUptime(statusInfo.uptime)}</div>
            )}
            {statusInfo.memoryUsage !== undefined && (
              <div><strong>Память:</strong> {formatMemory(statusInfo.memoryUsage)}</div>
            )}
            {statusInfo.activeConnections !== undefined && (
              <div><strong>Соединения:</strong> {statusInfo.activeConnections}</div>
            )}
          </div>
        </div>

        <div style={{
          backgroundColor: '#f9fafb',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#374151', fontSize: '14px' }}>
            Системная информация
          </h4>
          <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.6' }}>
            <div><strong>Среда:</strong> {import.meta.env.MODE === 'development' ? 'Разработка' : 'Продакшн'}</div>
            <div><strong>Платформа:</strong> {navigator.platform}</div>
            <div><strong>Автообновление:</strong> {autoRefresh ? 'Каждые 5с' : 'Выключено'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

