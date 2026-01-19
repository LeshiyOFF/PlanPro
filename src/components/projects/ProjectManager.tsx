import React, { useState, useEffect } from 'react';
import { useJavaApi, Project } from '@/hooks/useJavaApi';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { logger } from '@/utils/logger';
import { ProjectForm } from './ProjectForm';
import { ProjectCard } from './ProjectCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ProjectCardSkeleton } from '@/components/ui/SkeletonLoader';

/**
 * Компонент управления проектами с реальной Java API интеграцией
 */
export const ProjectManager: React.FC = () => {
  const javaApi = useJavaApi();
  const [isCreating, setIsCreating] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'planning'
  });

  // Hook для операций с проектами
  const projectOperation = useAsyncOperation<Project>();
  const loadProjectsOperation = useAsyncOperation<Project[]>();
  
  /**
   * Инициализация при монтировании
   */
  useEffect(() => {
    if (javaApi.isApiAvailable) {
      loadProjectsOperation.execute(
        () => javaApi.loadProjects(),
        {
          onSuccess: (data) => {
            logger.info('Projects loaded successfully:', data);
          },
          onError: (error) => {
            logger.error('Failed to load projects:', error);
          }
        }
      );
    }
  }, [javaApi.isApiAvailable, javaApi.loadProjects, loadProjectsOperation]);
  
  /**
   * Сброс формы
   */
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      status: 'planning'
    });
    setEditingProject(null);
    setIsCreating(false);
  };
  
  /**
   * Создание проекта
   */
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      await javaApi.ipcService.showMessageBox({
        type: 'error',
        title: 'Ошибка валидации',
        message: 'Название проекта обязательно для заполнения'
      });
      return;
    }
    
    projectOperation.execute(
      () => javaApi.createProject(formData),
      {
        onSuccess: (project) => {
          logger.info('Project created successfully:', project);
          resetForm();
          // Reload projects list
          loadProjectsOperation.execute(() => javaApi.loadProjects());
        },
        onError: (error) => {
          logger.error('Failed to create project:', error);
        }
      }
    );
  };
  
  /**
   * Обновление проекта
   */
  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingProject || !formData.name.trim()) {
      return;
    }
    
    projectOperation.execute(
      () => javaApi.updateProject(editingProject.id, formData),
      {
        onSuccess: (updated) => {
          logger.info('Project updated successfully:', updated);
          resetForm();
          // Reload projects list
          loadProjectsOperation.execute(() => javaApi.loadProjects());
        },
        onError: (error) => {
          logger.error('Failed to update project:', error);
        }
      }
    );
  };
  
  /**
   * Удаление проекта
   */
  const handleDeleteProject = async (project: Project) => {
    const result = await javaApi.ipcService.showMessageBox({
      type: 'question',
      title: 'Удалить проект',
      message: `Вы уверены, что хотите удалить "${project.name}"?`,
      buttons: ['Да', 'Нет'],
      defaultId: 1
    });
    
    if (result.response === 0) {
      projectOperation.execute(
        () => javaApi.deleteProject(project.id),
        {
          onSuccess: () => {
            logger.info('Project deleted successfully:', project);
            // Reload projects list
            loadProjectsOperation.execute(() => javaApi.loadProjects());
          },
          onError: (error) => {
            logger.error('Failed to delete project:', error);
          }
        }
      );
    }
  };
  
  /**
   * Редактирование проекта
   */
  const startEditProject = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      startDate: project.startDate || '',
      endDate: project.endDate || '',
      status: project.status || 'planning'
    });
    setIsCreating(true);
  };
  
  /**
   * Экспорт проекта
   */
  const handleExportProject = async (project: Project) => {
    try {
      const result = await javaApi.exportProject(project.id, 'json');
      if (result) {
        await javaApi.ipcService.showMessageBox({
          type: 'info',
          title: 'Экспорт выполнен',
          message: `Проект "${project.name}" успешно экспортирован`
        });
      }
    } catch (error) {
      logger.error('Failed to export project:', error);
    }
  };
  
  return (
    <ErrorBoundary>
      <div style={{ padding: '20px' }}>
        {/* Error Alert */}
        <ErrorAlert
          error={projectOperation.error || loadProjectsOperation.error}
          onRetry={() => {
            projectOperation.clearError();
            loadProjectsOperation.clearError();
            loadProjectsOperation.execute(() => javaApi.loadProjects());
          }}
          onDismiss={() => {
            projectOperation.clearError();
            loadProjectsOperation.clearError();
          }}
        />

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2>Проекты</h2>
          <button
            onClick={() => setIsCreating(true)}
            disabled={projectOperation.loading}
            style={{
              padding: '10px 20px',
              backgroundColor: projectOperation.loading ? '#6c757d' : '#007acc',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: projectOperation.loading ? 'not-allowed' : 'pointer'
            }}
          >
            {projectOperation.loading ? 'Создание...' : 'Новый проект'}
          </button>
        </div>
      
      {/* Форма создания/редактирования */}
      {isCreating && (
        <ProjectForm
            project={editingProject}
            formData={formData}
            onFormChange={setFormData}
            onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
            onCancel={resetForm}
            isLoading={projectOperation.loading}
          />
      )}
      
      {/* Список проектов */}
        <div style={{ display: 'grid', gap: '15px' }}>
          {loadProjectsOperation.loading ? (
            // Show skeleton loaders during loading
            <>
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
            </>
          ) : javaApi.projects.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#666',
              border: '2px dashed #ddd',
              borderRadius: '10px'
            }}>
              <h3>Проекты не найдены</h3>
              <p>Создайте свой первый проект, чтобы начать работу</p>
            </div>
          ) : (
            javaApi.projects.map((project: Project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={startEditProject}
                onExport={handleExportProject}
                onDelete={handleDeleteProject}
              />
            ))
          )}
        </div>

        {/* Global loading overlay */}
        {(projectOperation.loading || loadProjectsOperation.loading) && (
          <LoadingSpinner
            overlay={true}
            message={projectOperation.loading ? 'Обработка проекта...' : 'Загрузка проектов...'}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};
