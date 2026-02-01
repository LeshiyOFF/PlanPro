import React, { useState, useEffect } from 'react';
import { useJavaApi, Task, Project } from '@/hooks/useJavaApi';
import { logger } from '@/utils/logger';
import { formatDuration } from '@/utils/formatUtils';

/**
 * Компонент управления задачами с реальной Java API интеграцией
 */
export const TaskManager: React.FC = () => {
  const javaApi = useJavaApi();
  const [isCreating, setIsCreating] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    duration: 1,
    progress: 0,
    status: 'not_started',
    resourceId: ''
  });
  
  /**
   * Инициализация при монтировании
   */
  useEffect(() => {
    if (javaApi.isApiAvailable) {
      javaApi.loadProjects();
      javaApi.loadResources();
    }
  }, [javaApi.isApiAvailable, javaApi.loadProjects, javaApi.loadResources]);
  
  /**
   * Загрузка задач при выборе проекта
   */
  useEffect(() => {
    if (selectedProject) {
      javaApi.loadProjectTasks(selectedProject.id);
    }
  }, [selectedProject, javaApi.loadProjectTasks]);
  
  /**
   * Сброс формы
   */
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      duration: 1,
      progress: 0,
      status: 'not_started',
      resourceId: ''
    });
    setEditingTask(null);
    setIsCreating(false);
  };
  
  /**
   * Создание задачи
   */
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProject || !formData.name.trim()) {
      await javaApi.ipcService.showMessageBox({
        type: 'error',
        title: 'Ошибка валидации',
        message: 'Пожалуйста, выберите проект и введите название задачи'
      });
      return;
    }
    
    try {
      const taskData = { ...formData, projectId: selectedProject.id };
      const task = await javaApi.createTask(selectedProject.id, taskData);
      if (task) {
        logger.info('Task created successfully:', { taskId: task.id, taskName: task.name });
        resetForm();
      }
    } catch (error) {
      logger.error('Failed to create task:', { error: String(error) });
    }
  };
  
  /**
   * Обновление задачи
   */
  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingTask || !formData.name.trim()) {
      return;
    }
    
    try {
      const updatePayload = {
        id: editingTask.id,
        name: formData.name,
        description: formData.description,
        status: formData.status,
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        duration: formData.duration,
        percentComplete: formData.progress,
        assigneeId: formData.resourceId || undefined
      };
      const updated = await javaApi.javaApiService.updateTask(editingTask.id, updatePayload);
      if (updated?.data) {
        logger.info('Task updated successfully:', { taskId: editingTask.id });
        if (selectedProject) {
          await javaApi.loadProjectTasks(selectedProject.id);
        }
        resetForm();
      }
    } catch (error) {
      logger.error('Failed to update task:', { error: String(error) });
    }
  };
  
  /**
   * Удаление задачи
   */
  const handleDeleteTask = async (task: Task) => {
    const result = await javaApi.ipcService.showMessageBox({
      type: 'question',
      title: 'Удалить задачу',
      message: `Вы уверены, что хотите удалить "${task.name}"?`,
      buttons: ['Да', 'Нет'],
      defaultId: 1
    });
    
    if (result.response === 0) {
      try {
        await javaApi.javaApiService.deleteTask(task.id);
        logger.info('Task deleted successfully:', { taskId: task.id, taskName: task.name });
        if (selectedProject) {
          await javaApi.loadProjectTasks(selectedProject.id);
        }
      } catch (error) {
        logger.error('Failed to delete task:', { error: String(error) });
      }
    }
  };
  
  /**
   * Редактирование задачи
   */
  const startEditTask = (task: Task) => {
    setEditingTask(task);
    setFormData({
      name: task.name,
      description: task.description || '',
      startDate: task.startDate || '',
      endDate: task.endDate || '',
      duration: task.duration || 1,
      progress: task.progress || 0,
      status: task.status || 'not_started',
      resourceId: task.resourceId || ''
    });
    setIsCreating(true);
  };
  
  /**
   * Обновление прогресса задачи
   */
  const updateTaskProgress = async (task: Task, progress: number) => {
    try {
      await javaApi.javaApiService.updateTask(task.id, { id: task.id, percentComplete: progress });
      logger.info(`Task progress updated to ${progress}%:`, { taskId: task.id, progress });
      if (selectedProject) {
        await javaApi.loadProjectTasks(selectedProject.id);
      }
    } catch (error) {
      logger.error('Failed to update task progress:', { error: String(error) });
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#28a745';
      case 'in_progress': return '#007acc';
      case 'not_started': return '#6c757d';
      case 'blocked': return '#dc3545';
      default: return '#6c757d';
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'not_started': return 'Не начата';
      case 'in_progress': return 'В процессе';
      case 'completed': return 'Завершена';
      case 'blocked': return 'Заблокирована';
      default: return status;
    }
  };
  
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2>Задачи</h2>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <select
            value={selectedProject?.id || ''}
            onChange={(e) => {
              const project = javaApi.projects.find(p => p.id === e.target.value);
              setSelectedProject(project || null);
            }}
            style={{
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '5px'
            }}
          >
            <option value="">Выберите проект</option>
            {javaApi.projects.map((project: Project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          
          <button
            onClick={() => setIsCreating(true)}
            disabled={!selectedProject}
            style={{
              padding: '10px 20px',
              backgroundColor: selectedProject ? '#007acc' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: selectedProject ? 'pointer' : 'not-allowed'
            }}
          >
            Новая задача
          </button>
        </div>
      </div>
      
      {!selectedProject ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#666',
          border: '2px dashed #ddd',
          borderRadius: '10px'
        }}>
          <h3>Выберите проект</h3>
          <p>Выберите проект для просмотра и управления его задачами</p>
        </div>
      ) : (
        <>
          <p style={{ marginBottom: '20px', color: '#666' }}>
            <strong>Проект:</strong> {selectedProject.name} | 
            <strong> Задачи:</strong> {javaApi.tasks.length}
          </p>
          
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
                <h3>{editingTask ? 'Изменить задачу' : 'Создать новую задачу'}</h3>
                
                <form onSubmit={editingTask ? handleUpdateTask : handleCreateTask}>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Имя задачи *
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
                      placeholder="Введите имя задачи"
                      required
                    />
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Описание
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      style={{ 
                        width: '100%', 
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '3px',
                        minHeight: '80px'
                      }}
                      placeholder="Введите описание задачи"
                    />
                  </div>
                  
                  <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Дата начала
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
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
                        Длительность (дни)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.duration}
                        onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
                        style={{ 
                          width: '100%', 
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '3px'
                        }}
                      />
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Статус
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                        style={{ 
                          width: '100%', 
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '3px'
                        }}
                      >
                        <option value="not_started">Не начата</option>
                        <option value="in_progress">В процессе</option>
                        <option value="completed">Завершена</option>
                        <option value="blocked">Заблокирована</option>
                      </select>
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Прогресс (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.progress}
                        onChange={(e) => setFormData(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
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
                      {javaApi.isLoading ? 'Сохранение...' : (editingTask ? 'Обновить' : 'Создать')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {/* Список задач */}
          <div style={{ display: 'grid', gap: '15px' }}>
            {javaApi.tasks.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#666',
                border: '2px dashed #ddd',
                borderRadius: '10px'
              }}>
                <h3>Задачи не найдены</h3>
                <p>Создайте свою первую задачу для этого проекта</p>
              </div>
            ) : (
              javaApi.tasks.map((task: Task) => (
                <div key={task.id} style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
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
                        marginBottom: '15px'
                      }}>
                        <span style={{ color: getStatusColor(task.status || 'not_started') }}>
                          <strong>Статус:</strong> {getStatusText(task.status || 'not_started')}
                        </span>
                        {task.duration && (
                          <span>
                            <strong>Длительность:</strong> {formatDuration(task.duration)}
                          </span>
                        )}
                        {task.startDate && (
                          <span>
                            <strong>Начало:</strong> {new Date(task.startDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      
                      {/* Progress bar */}
                      <div style={{ marginBottom: '15px' }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          marginBottom: '5px',
                          fontSize: '14px'
                        }}>
                          <span>Прогресс</span>
                          <span>{task.progress || 0}%</span>
                        </div>
                        <div style={{
                          width: '100%',
                          height: '8px',
                          backgroundColor: '#e9ecef',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${task.progress || 0}%`,
                            height: '100%',
                            backgroundColor: getStatusColor(task.status || 'not_started'),
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                      </div>
                      
                      {/* Quick progress update buttons */}
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                          onClick={() => updateTaskProgress(task, 0)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer'
                          }}
                        >
                          0%
                        </button>
                        <button
                          onClick={() => updateTaskProgress(task, 25)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            backgroundColor: '#17a2b8',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer'
                          }}
                        >
                          25%
                        </button>
                        <button
                          onClick={() => updateTaskProgress(task, 50)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            backgroundColor: '#ffc107',
                            color: 'black',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer'
                          }}
                        >
                          50%
                        </button>
                        <button
                          onClick={() => updateTaskProgress(task, 75)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            backgroundColor: '#fd7e14',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer'
                          }}
                        >
                          75%
                        </button>
                        <button
                          onClick={() => updateTaskProgress(task, 100)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer'
                          }}
                        >
                          100%
                        </button>
                      </div>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      gap: '5px',
                      flexDirection: 'column'
                    }}>
                      <button
                        onClick={() => startEditTask(task)}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task)}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

