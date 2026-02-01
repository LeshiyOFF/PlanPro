import React from 'react'
import { Project } from '@/hooks/useJavaApi'

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onExport: (project: Project) => void;
  onDelete: (project: Project) => void;
}

/**
 * Карточка проекта
 */
export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onExport,
  onDelete,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#28a745'
      case 'active': return '#007acc'
      case 'on_hold': return '#ffc107'
      case 'cancelled': return '#dc3545'
      default: return '#6c757d'
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
            {project.name}
          </h3>
          {project.description && (
            <p style={{ margin: '0 0 15px 0', color: '#666' }}>
              {project.description}
            </p>
          )}
          <div style={{
            display: 'flex',
            gap: '15px',
            fontSize: '14px',
            color: '#666',
          }}>
            <span>
              <strong>Status:</strong>
              <span style={{ color: getStatusColor(project.status || 'planning') }}>
                {project.status || 'Unknown'}
              </span>
            </span>
            {project.startDate && (
              <span>
                <strong>Start:</strong> {new Date(project.startDate).toLocaleDateString()}
              </span>
            )}
            {project.endDate && (
              <span>
                <strong>End:</strong> {new Date(project.endDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '5px',
          flexDirection: 'column',
        }}>
          <button
            onClick={() => onEdit(project)}
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
            onClick={() => onExport(project)}
            style={{
              padding: '5px 10px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Export
          </button>
          <button
            onClick={() => onDelete(project)}
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

