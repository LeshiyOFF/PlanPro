import React, { useState, useEffect } from 'react';
import { BaseDialog } from '@/components/dialogs/base/BaseDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ProjectDialogData, 
  IDialogActions, 
  ValidationRule,
  DialogResult 
} from '@/types/dialog/DialogTypes';

/**
 * Интерфейс для ProjectDialog компонента
 */
export interface ProjectDialogProps {
  data?: Partial<ProjectDialogData>;
  isOpen: boolean;
  onClose: (result: DialogResult<ProjectDialogData>) => void;
}

/**
 * Диалог для создания и редактирования проектов
 * Соответствует ProjectDialog из Dialogs_Inventory.md
 * Реализует SOLID принцип Single Responsibility
 */
export const ProjectDialog: React.FC<ProjectDialogProps> = ({
  data = {},
  isOpen,
  onClose
}) => {
  const [projectData, setProjectData] = useState<ProjectDialogData>({
    id: `project_${Date.now()}`,
    title: 'Новый проект',
    description: 'Создание нового проекта',
    timestamp: new Date(),
    name: '',
    manager: '',
    notes: '',
    startDate: new Date(),
    resourcePool: undefined,
    forward: true,
    projectType: 0,
    projectStatus: 0,
    ...data
  });

  const [errors, setErrors] = useState<Record<string, string[]>>({});

  /**
   * Правила валидации полей проекта
   */
  const validationRules: ValidationRule[] = [
    {
      field: 'name',
      required: true,
      minLength: 3,
      maxLength: 100,
      custom: (value: string) => {
        if (!value || value.trim().length === 0) {
          return 'Название проекта обязательно';
        }
        if (value.trim().length < 3) {
          return 'Минимальная длина названия - 3 символа';
        }
        return true;
      }
    },
    {
      field: 'manager',
      required: true,
      minLength: 2,
      maxLength: 50
    },
    {
      field: 'startDate',
      required: true,
      custom: (value: Date) => {
        if (!value) {
          return 'Дата начала обязательна';
        }
        if (value > new Date()) {
          return 'Дата начала не может быть в будущем';
        }
        return true;
      }
    }
  ];

  /**
   * Обработчик изменения полей
   */
  const handleFieldChange = (field: string, value: any) => {
    setProjectData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Очистка ошибок при изменении поля
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  /**
   * Действия диалога
   */
  const actions: IDialogActions = {
    onOk: async (data: ProjectDialogData) => {
      // Имитация сохранения проекта
      console.log('Saving project:', data);
      
      // Здесь будет реальное сохранение через API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return data;
    },
    
    onCancel: () => {
      console.log('Project dialog cancelled');
    },
    
    onHelp: () => {
      console.log('Opening project help...');
      // Открытие справки по проектам
    },
    
    onValidate: (data: ProjectDialogData) => {
      const newErrors: Record<string, string[]> = {};
      
      if (!data.name || data.name.trim().length === 0) {
        newErrors.name = ['Название проекта обязательно'];
      } else if (data.name.trim().length < 3) {
        newErrors.name = ['Минимальная длина - 3 символа'];
      }
      
      if (!data.manager || data.manager.trim().length === 0) {
        newErrors.manager = ['Менеджер проекта обязателен'];
      }
      
      if (!data.startDate) {
        newErrors.startDate = ['Дата начала обязательна'];
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }
  };

  /**
   * Инициализация данных при изменении
   */
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      setProjectData(prev => ({
        ...prev,
        ...data,
        id: prev.id,
        timestamp: new Date()
      }));
    }
  }, [data]);

  /**
   * Компонент содержимого диалога
   */
  const DialogContent = (data: ProjectDialogData, validationErrors: Record<string, string[]>) => (
    <div className="space-y-6 p-6">
      {/* Основная информация */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Основная информация</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">
              Название проекта *
            </Label>
            <Input
              id="project-name"
              value={data.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              placeholder="Введите название проекта"
              className={validationErrors.name?.length ? 'border-destructive' : ''}
              autoFocus
            />
            {validationErrors.name?.length && (
              <div className="text-sm text-destructive">
                {validationErrors.name[0]}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="project-manager">
              Менеджер проекта *
            </Label>
            <Input
              id="project-manager"
              value={data.manager}
              onChange={(e) => handleFieldChange('manager', e.target.value)}
              placeholder="Имя менеджера"
              className={validationErrors.manager?.length ? 'border-destructive' : ''}
            />
            {validationErrors.manager?.length && (
              <div className="text-sm text-destructive">
                {validationErrors.manager[0]}
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="project-start-date">
            Дата начала *
          </Label>
          <Input
            id="project-start-date"
            type="date"
            value={data.startDate.toISOString().split('T')[0]}
            onChange={(e) => handleFieldChange('startDate', new Date(e.target.value))}
            className={validationErrors.startDate?.length ? 'border-destructive' : ''}
          />
          {validationErrors.startDate?.length && (
            <div className="text-sm text-destructive">
              {validationErrors.startDate[0]}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="project-notes">
            Заметки
          </Label>
          <Textarea
            id="project-notes"
            value={data.notes}
            onChange={(e) => handleFieldChange('notes', e.target.value)}
            placeholder="Дополнительная информация о проекте"
            rows={3}
          />
        </div>
      </div>

      {/* Настройки проекта */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Настройки проекта</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="project-type">
              Тип проекта
            </Label>
            <Select
              value={data.projectType.toString()}
              onValueChange={(value) => handleFieldChange('projectType', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите тип проекта" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Базовый проект</SelectItem>
                <SelectItem value="1">Шаблон проекта</SelectItem>
                <SelectItem value="2">Мастер-проект</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="project-status">
              Статус проекта
            </Label>
            <Select
              value={data.projectStatus.toString()}
              onValueChange={(value) => handleFieldChange('projectStatus', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Планирование</SelectItem>
                <SelectItem value="1">В работе</SelectItem>
                <SelectItem value="2">Завершен</SelectItem>
                <SelectItem value="3">Приостановлен</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            id="project-forward"
            type="checkbox"
            checked={data.forward}
            onChange={(e) => handleFieldChange('forward', e.target.checked)}
            className="rounded border-gray-300"
          />
          <Label htmlFor="project-forward" className="text-sm">
            Планирование вперед
          </Label>
        </div>
      </div>
    </div>
  );

  return (
    <BaseDialog<ProjectDialogData>
      data={projectData}
      actions={actions}
      validationRules={validationRules}
      isOpen={isOpen}
      onClose={onClose}
      config={{
        width: 600,
        height: 500,
        modal: true,
        showHelp: true
      }}
    >
      {DialogContent}
    </BaseDialog>
  );
};

export default ProjectDialog;
