import React from 'react';
import { Resource } from '@/hooks/useJavaApi';

interface ResourceFormProps {
  resource: Resource | null;
  formData: {
    name: string;
    email: string;
    role: string;
    availability: number;
    costPerHour: number;
  };
  onFormChange: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isLoading: boolean;
}

/**
 * Форма создания/редактирования ресурса
 */
export const ResourceForm: React.FC<ResourceFormProps> = ({
  resource,
  formData,
  onFormChange,
  onSubmit,
  onCancel,
  isLoading
}) => {
  const roleOptions = [
    'Developer',
    'Project Manager',
    'Designer',
    'Analyst',
    'Tester',
    'DevOps',
    'Business Analyst',
    'Technical Writer',
    'UI/UX Designer',
    'Data Scientist',
    'Other'
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        minWidth: '500px',
        maxWidth: '80%'
      }}>
        <h3>{resource ? 'Edit Resource' : 'Create New Resource'}</h3>
        
        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Resource Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
              style={{ 
                width: '100%', 
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '3px'
              }}
              placeholder="Enter resource name"
              required
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => onFormChange({ ...formData, email: e.target.value })}
              style={{ 
                width: '100%', 
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '3px'
              }}
              placeholder="Enter email address"
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => onFormChange({ ...formData, role: e.target.value })}
              style={{ 
                width: '100%', 
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '3px'
              }}
            >
              <option value="">Select Role</option>
              {roleOptions.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Availability (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.availability}
                onChange={(e) => onFormChange({ ...formData, availability: parseInt(e.target.value) || 0 })}
                style={{ 
                  width: '100%', 
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '3px'
                }}
              />
            </div>
            
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Cost per Hour ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.costPerHour}
                onChange={(e) => onFormChange({ ...formData, costPerHour: parseFloat(e.target.value) || 0 })}
                style={{ 
                  width: '100%', 
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '3px'
                }}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007acc',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                opacity: (isLoading || !formData.name.trim()) ? 0.5 : 1
              }}
            >
              {isLoading ? 'Saving...' : (resource ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

