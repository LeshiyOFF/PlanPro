import React from 'react';
import { Resource } from '@/hooks/useJavaApi';

interface ResourceCardProps {
  resource: Resource;
  onEdit: (resource: Resource) => void;
  onDelete: (resource: Resource) => void;
}

/**
 * Карточка ресурса
 */
export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onEdit,
  onDelete
}) => {
  const getAvailabilityColor = (availability: number) => {
    if (availability >= 80) return '#28a745';
    if (availability >= 50) return '#ffc107';
    if (availability >= 20) return '#fd7e14';
    return '#dc3545';
  };

  const getAvailabilityText = (availability: number) => {
    if (availability >= 80) return 'Available';
    if (availability >= 50) return 'Partially Available';
    if (availability >= 20) return 'Limited';
    return 'Unavailable';
  };

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '20px',
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '15px'
        }}>
          <h3 style={{ margin: '0', color: '#333', fontSize: '18px' }}>
            {resource.name}
          </h3>
          <span style={{
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 'bold',
            backgroundColor: getAvailabilityColor(resource.availability || 0),
            color: 'white'
          }}>
            {getAvailabilityText(resource.availability || 0)}
          </span>
        </div>
        
        {resource.email && (
          <p style={{ 
            margin: '0 0 10px 0', 
            color: '#666',
            fontSize: '14px'
          }}>
            📧 {resource.email}
          </p>
        )}
        
        {resource.role && (
          <p style={{ 
            margin: '0 0 15px 0', 
            color: '#333',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            💼 {resource.role}
          </p>
        )}
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          fontSize: '14px',
          color: '#666'
        }}>
          <div>
            <strong>Availability:</strong>
            <div style={{
              marginTop: '5px',
              height: '6px',
              backgroundColor: '#e9ecef',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${resource.availability || 0}%`,
                height: '100%',
                backgroundColor: getAvailabilityColor(resource.availability || 0)
              }} />
            </div>
            <span style={{ fontSize: '12px' }}>
              {resource.availability || 0}%
            </span>
          </div>
          
          <div>
            <strong>Hourly Rate:</strong>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#007acc' }}>
              ${resource.costPerHour || 0}
            </div>
          </div>
        </div>
      </div>
      
      <div style={{ 
        display: 'flex', 
        gap: '10px',
        marginTop: '15px',
        paddingTop: '15px',
        borderTop: '1px solid #eee'
      }}>
        <button
          onClick={() => onEdit(resource)}
          style={{
            flex: 1,
            padding: '8px 12px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(resource)}
          style={{
            flex: 1,
            padding: '8px 12px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

