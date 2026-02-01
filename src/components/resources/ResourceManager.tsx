import React, { useState, useEffect } from 'react';
import { useJavaApi, Resource } from '@/hooks/useJavaApi';
import { logger } from '@/utils/logger';
import type { ResourceUpdateRequest } from '@/types/api/request-types';

/**
 * Компонент управления ресурсами с реальной Java API интеграцией
 */
export const ResourceManager: React.FC = () => {
  const javaApi = useJavaApi();
  const [isCreating, setIsCreating] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    availability: 100,
    costPerHour: 0
  });
  
  /**
   * Инициализация при монтировании
   */
  useEffect(() => {
    if (javaApi.isApiAvailable) {
      javaApi.loadResources();
    }
  }, [javaApi.isApiAvailable, javaApi.loadResources]);
  
  /**
   * Сброс формы
   */
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: '',
      availability: 100,
      costPerHour: 0
    });
    setEditingResource(null);
    setIsCreating(false);
  };
  
  /**
   * Создание ресурса
   */
  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      await javaApi.ipcService.showMessageBox({
        type: 'error',
        title: 'Ошибка валидации',
        message: 'Имя ресурса обязательно для заполнения'
      });
      return;
    }
    
    try {
      const resource = await javaApi.createResource(formData);
      if (resource) {
        logger.info('Resource created successfully:', { resourceId: resource.id });
        resetForm();
      }
    } catch (error) {
      logger.error('Failed to create resource:', { message: error instanceof Error ? error.message : String(error) });
    }
  };
  
  /**
   * Обновление ресурса
   */
  const handleUpdateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingResource || !formData.name.trim()) {
      return;
    }
    
    try {
      const updates: ResourceUpdateRequest = {
        id: editingResource.id,
        name: formData.name,
        email: formData.email,
        costPerHour: formData.costPerHour
      };
      const updated = await javaApi.javaApiService.updateResource(editingResource.id, updates);
      if (updated?.data) {
        logger.info('Resource updated successfully:', { resourceId: editingResource.id });
        await javaApi.loadResources();
        resetForm();
      }
    } catch (error) {
      logger.error('Failed to update resource:', { message: error instanceof Error ? error.message : String(error) });
    }
  };
  
  /**
   * Удаление ресурса
   */
  const handleDeleteResource = async (resource: Resource) => {
    const result = await javaApi.ipcService.showMessageBox({
      type: 'question',
      title: 'Удалить ресурс',
      message: `Вы уверены, что хотите удалить "${resource.name}"?`,
      buttons: ['Да', 'Нет'],
      defaultId: 1
    });
    
    if (result.response === 0) {
      try {
        await javaApi.javaApiService.deleteResource(resource.id);
        logger.info('Resource deleted successfully:', { resourceId: resource.id });
        await javaApi.loadResources();
      } catch (error) {
        logger.error('Failed to delete resource:', { message: error instanceof Error ? error.message : String(error) });
      }
    }
  };
  
  /**
   * Редактирование ресурса
   */
  const startEditResource = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({
      name: resource.name,
      email: resource.email || '',
      role: resource.role || '',
      availability: resource.availability || 100,
      costPerHour: resource.costPerHour || 0
    });
    setIsCreating(true);
  };
  
  /**
   * Получение цвета для статуса доступности
   */
  const getAvailabilityColor = (availability: number) => {
    if (availability >= 80) return '#28a745';
    if (availability >= 50) return '#ffc107';
    if (availability >= 20) return '#fd7e14';
    return '#dc3545';
  };
  
  /**
   * Получение текста для статуса доступности
   */
  const getAvailabilityText = (availability: number) => {
    if (availability >= 80) return 'Доступен';
    if (availability >= 50) return 'Частично доступен';
    if (availability >= 20) return 'Ограничен';
    return 'Недоступен';
  };
  
  const roleOptions = [
    'Разработчик',
    'Менеджер проекта',
    'Дизайнер',
    'Аналитик',
    'Тестировщик',
    'DevOps',
    'Бизнес-аналитик',
    'Технический писатель',
    'UI/UX Дизайнер',
    'Data Scientist',
    'Другое'
  ];
  
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2>Ресурсы</h2>
        <button
          onClick={() => setIsCreating(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007acc',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Новый ресурс
        </button>
      </div>
      
      {/* Форма создания/редактирования */}
      {isCreating && (
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
            <h3>{editingResource ? 'Изменить ресурс' : 'Создать новый ресурс'}</h3>
            
            <form onSubmit={editingResource ? handleUpdateResource : handleCreateResource}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Имя ресурса *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  style={{ 
                    width: '100%', 
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '3px'
                  }}
                  placeholder="Введите имя ресурса"
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
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  style={{ 
                    width: '100%', 
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '3px'
                  }}
                  placeholder="Введите адрес email"
                />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Роль
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  style={{ 
                    width: '100%', 
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '3px'
                  }}
                >
                  <option value="">Выберите роль</option>
                  {roleOptions.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Доступность (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.availability}
                    onChange={(e) => setFormData(prev => ({ ...prev, availability: parseInt(e.target.value) || 0 }))}
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
                    Ставка в час (₽)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.costPerHour}
                    onChange={(e) => setFormData(prev => ({ ...prev, costPerHour: parseFloat(e.target.value) || 0 }))}
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
                  onClick={resetForm}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={javaApi.isLoading || !formData.name.trim()}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#007acc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    opacity: (javaApi.isLoading || !formData.name.trim()) ? 0.5 : 1
                  }}
                >
                  {javaApi.isLoading ? 'Сохранение...' : (editingResource ? 'Обновить' : 'Создать')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Список ресурсов */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {javaApi.resources.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '40px',
            color: '#666',
            border: '2px dashed #ddd',
            borderRadius: '10px'
          }}>
            <h3>Ресурсы не найдены</h3>
            <p>Создайте свой первый ресурс, чтобы начать работу</p>
          </div>
        ) : (
          javaApi.resources.map((resource: Resource) => (
            <div key={resource.id} style={{
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
                    <strong>Доступность:</strong>
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
                    <strong>Часовая ставка:</strong>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#007acc' }}>
                      {resource.costPerHour || 0} ₽
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
                  onClick={() => startEditResource(resource)}
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
                  Изменить
                </button>
                <button
                  onClick={() => handleDeleteResource(resource)}
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
                  Удалить
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Статистика */}
      {javaApi.resources.length > 0 && (
        <div style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '10px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>
            Статистика ресурсов
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007acc' }}>
                {javaApi.resources.length}
              </div>
              <div style={{ color: '#666', fontSize: '14px' }}>
                Всего ресурсов
              </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                {javaApi.resources.filter(r => (r.availability || 0) >= 50).length}
              </div>
              <div style={{ color: '#666', fontSize: '14px' }}>
                Доступные ресурсы
              </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
                {Math.round(javaApi.resources.reduce((sum, r) => sum + (r.costPerHour || 0), 0))} ₽
              </div>
              <div style={{ color: '#666', fontSize: '14px' }}>
                Суммарная ставка
              </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#17a2b8' }}>
                {Math.round(javaApi.resources.reduce((sum, r) => sum + (r.availability || 0), 0) / javaApi.resources.length)}%
              </div>
              <div style={{ color: '#666', fontSize: '14px' }}>
                Средняя доступность
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

