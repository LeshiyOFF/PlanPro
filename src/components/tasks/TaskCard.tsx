import React from 'react'
import { Task } from '@/hooks/useJavaApi'
import { formatDuration } from '@/utils/formatUtils'

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onProgressUpdate: (task: Task, progress: number) => void;
}

/**
 * Карточка задачи
 */
export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onProgressUpdate,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#28a745'
      case 'in_progress': return '#007acc'
      case 'not_started': return '#6c757d'
      case 'blocked': return '#dc3545'
      default: return '#6c757d'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'not_started': return 'Not Started'
      case 'in_progress': return 'In Progress'
      case 'completed': return 'Completed'
      case 'blocked': return 'Blocked'
      default: return status
    }
  }

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '20px',
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
            {task.name}
          </h3>
          {task.description && (
            <p style={{ margin: '0 0 15px 0', color: '#666' }}>
              {task.description}
            </p>
          )}

          <div style={{
            display: 'flex',
            gap: '15px',
            fontSize: '14px',
            color: '#666',
            marginBottom: '15px',
          }}>
            <span style={{ color: getStatusColor(task.status || 'not_started') }}>
              <strong>Status:</strong> {getStatusText(task.status || 'not_started')}
            </span>
            {task.duration && (
              <span>
                <strong>Duration:</strong> {formatDuration(task.duration)}
              </span>
            )}
            {task.startDate && (
              <span>
                <strong>Start:</strong> {new Date(task.startDate).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: '15px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '5px',
              fontSize: '14px',
            }}>
              <span>Progress</span>
              <span>{task.progress || 0}%</span>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#e9ecef',
              borderRadius: '4px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${task.progress || 0}%`,
                height: '100%',
                backgroundColor: getStatusColor(task.status || 'not_started'),
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>

          {/* Quick progress update buttons */}
          <div style={{ display: 'flex', gap: '5px' }}>
            <button
              onClick={() => onProgressUpdate(task, 0)}
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
              }}
            >
              0%
            </button>
            <button
              onClick={() => onProgressUpdate(task, 25)}
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
              }}
            >
              25%
            </button>
            <button
              onClick={() => onProgressUpdate(task, 50)}
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                backgroundColor: '#ffc107',
                color: 'black',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
              }}
            >
              50%
            </button>
            <button
              onClick={() => onProgressUpdate(task, 75)}
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                backgroundColor: '#fd7e14',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
              }}
            >
              75%
            </button>
            <button
              onClick={() => onProgressUpdate(task, 100)}
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
              }}
            >
              100%
            </button>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '5px',
          flexDirection: 'column',
        }}>
          <button
            onClick={() => onEdit(task)}
            style={{
              padding: '5px 10px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task)}
            style={{
              padding: '5px 10px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

