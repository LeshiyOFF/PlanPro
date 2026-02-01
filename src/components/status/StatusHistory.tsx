import React from 'react'
import { useStatusMonitor } from '@/hooks/useStatusMonitor'

/**
 * Компонент для отображения истории статуса
 */
export const StatusHistory: React.FC = () => {
  const {
    statusHistory,
    monitoringErrors,
    getStatistics,
    clearHistory,
    hasErrors,
  } = useStatusMonitor(5000)

  const statistics = getStatistics()

  const formatDuration = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()

    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return `${Math.floor(diff / 86400000)}d ago`
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running': return '🟢'
      case 'stopped': return '🔴'
      case 'starting': return '🟡'
      case 'error': return '❌'
      default: return '⚪'
    }
  }

  if (statusHistory.length === 0 && !hasErrors) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px',
        color: '#6b7280',
        border: '2px dashed #d1d5db',
        borderRadius: '10px',
        backgroundColor: '#f9fafb',
      }}>
        <h3>No Status History</h3>
        <p>Status monitoring will begin when Java backend is started</p>
      </div>
    )
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      margin: '10px 0',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    }}>
      {/* Заголовок и статистика */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '1px solid #e5e7eb',
      }}>
        <h3 style={{ margin: 0, color: '#1f2937' }}>
          Status History & Statistics
        </h3>

        <button
          onClick={clearHistory}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          Clear History
        </button>
      </div>

      {/* Статистика */}
      {statistics && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginBottom: '20px',
        }}>
          <div style={{
            backgroundColor: '#f0f9ff',
            padding: '15px',
            borderRadius: '8px',
            border: '1px solid #38bdf8',
          }}>
            <div style={{ fontSize: '12px', color: '#0c4a6e', marginBottom: '5px' }}>
              Total Checks
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0369a1' }}>
              {statistics.totalChecks}
            </div>
          </div>

          {statistics.averageUptime !== null && (
            <div style={{
              backgroundColor: '#f0fdf4',
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid #22c55e',
            }}>
              <div style={{ fontSize: '12px', color: '#166534', marginBottom: '5px' }}>
                Avg Uptime
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#15803d' }}>
                {Math.floor(statistics.averageUptime / 3600)}h
              </div>
            </div>
          )}

          {statistics.averageMemoryUsage !== null && (
            <div style={{
              backgroundColor: '#fefce8',
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid #eab308',
            }}>
              <div style={{ fontSize: '12px', color: '#713f12', marginBottom: '5px' }}>
                Avg Memory
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ca8a04' }}>
                {Math.round(statistics.averageMemoryUsage / (1024 * 1024))}MB
              </div>
            </div>
          )}

          <div style={{
            backgroundColor: hasErrors ? '#fef2f2' : '#f0fdf4',
            padding: '15px',
            borderRadius: '8px',
            border: `1px solid ${hasErrors ? '#ef4444' : '#22c55e'}`,
          }}>
            <div style={{ fontSize: '12px', color: hasErrors ? '#991b1b' : '#166534', marginBottom: '5px' }}>
              Error Rate
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: hasErrors ? '#dc2626' : '#15803d' }}>
              {statistics.errorRate.toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {/* Ошибки мониторинга */}
      {hasErrors && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fca5a5',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px',
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#991b1b' }}>
            Recent Monitoring Errors
          </h4>
          {monitoringErrors.map((error, index) => (
            <div key={index} style={{
              fontSize: '13px',
              color: '#7f1d1d',
              marginBottom: '5px',
              padding: '5px',
              backgroundColor: '#fee2e2',
              borderRadius: '4px',
            }}>
              {error}
            </div>
          ))}
        </div>
      )}

      {/* История статуса */}
      <div style={{ maxHeight: '400px', overflow: 'auto' }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#374151' }}>
          Recent Status Changes
        </h4>

        {statusHistory.length === 0 ? (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
            No status changes recorded yet
          </p>
        ) : (
          statusHistory.slice(0, 20).map((entry, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px',
              backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              marginBottom: '8px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>
                  {getStatusIcon(entry.status.status)}
                </span>
                <div>
                  <div style={{ fontWeight: '600', color: '#1f2937' }}>
                    {entry.status.status.charAt(0).toUpperCase() + entry.status.status.slice(1)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {formatDuration(entry.timestamp)}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                {entry.timestamp.toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

