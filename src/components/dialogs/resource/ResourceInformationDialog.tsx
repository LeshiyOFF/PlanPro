import React, { useState, useEffect } from 'react';
import { BaseDialog } from '@/components/dialogs/base/BaseDialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ResourceInformationData, 
  IDialogActions,
  DialogResult 
} from '@/types/dialog/DialogTypes';

/**
 * Интерфейс для ResourceInformationDialog компонента
 */
export interface ResourceInformationDialogProps {
  data?: Partial<ResourceInformationData>;
  isOpen: boolean;
  onClose: (result: DialogResult<ResourceInformationData>) => void;
}

/**
 * Диалог для отображения информации о ресурсе
 * Соответствует ResourceInformationDialog из Dialogs_Inventory.md
 * Реализует SOLID принцип Single Responsibility
 */
export const ResourceInformationDialog: React.FC<ResourceInformationDialogProps> = ({
  data = {},
  isOpen,
  onClose
}) => {
  const [resourceData, setResourceData] = useState<ResourceInformationData>({
    id: `resource_${Date.now()}`,
    title: 'Информация о ресурсе',
    description: 'Детальная информация',
    timestamp: new Date(),
    resourceId: '',
    name: '',
    type: 'Рабочий',
    rate: 0,
    cost: 0,
    availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    },
    assignedTasks: [],
    notes: '',
    ...data
  });

  /**
   * Получение статуса доступности
   */
  const getAvailabilityStatus = (): { text: string; variant: 'default' | 'success' | 'warning' | 'destructive' } => {
    if (!resourceData.availability) {
      return { text: 'Не определена', variant: 'warning' };
    }

    const days = Object.values(resourceData.availability).filter(Boolean).length;
    
    if (days === 7) {
      return { text: 'Полная занятость', variant: 'success' };
    } else if (days >= 5) {
      return { text: 'Стандартный график', variant: 'default' };
    } else if (days >= 3) {
      return { text: 'Частичная занятость', variant: 'warning' };
    } else {
      return { text: 'Минимальная занятость', variant: 'destructive' };
    }
  };

  /**
   * Получение типа ресурса
   */
  const getResourceTypeColor = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'рабочий':
      case 'work':
        return 'bg-primary';
      case 'оборудование':
      case 'equipment':
        return 'bg-green-500';
      case 'материал':
      case 'material':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  /**
   * Расчет общей загрузки ресурса
   */
  const getTotalWorkload = (): number => {
    if (!resourceData.assignedTasks.length) return 0;
    
    return resourceData.assignedTasks.reduce((total, task) => {
      return total + (task.duration || 0);
    }, 0);
  };

  /**
   * Действия диалога
   */
  const actions: IDialogActions = {
    onOk: async (data: ResourceInformationData) => {
      console.log('Resource information confirmed:', data);
      await new Promise(resolve => setTimeout(resolve, 500));
      return data;
    },
    
    onCancel: () => {
      console.log('Resource information dialog cancelled');
    },
    
    onHelp: () => {
      console.log('Opening resource information help...');
    }
  };

  /**
   * Инициализация данных при изменении
   */
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      setResourceData(prev => ({
        ...prev,
        ...data,
        id: prev.id,
        timestamp: new Date()
      }));
    }
  }, [data]);

  const availabilityStatus = getAvailabilityStatus();
  const totalWorkload = getTotalWorkload();

  /**
   * Компонент содержимого диалога
   */
  const DialogContent = () => (
    <div className="space-y-6 p-6">
      {/* Общая информация */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <div 
            className={`w-3 h-3 rounded-full ${getResourceTypeColor(resourceData.type)}`}
          />
          {resourceData.name}
          <Badge variant={availabilityStatus.variant}>
            {availabilityStatus.text}
          </Badge>
        </h3>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ID ресурса:</span>
              <span className="font-medium">{resourceData.resourceId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Тип:</span>
              <span className="font-medium">{resourceData.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ставка:</span>
              <span className="font-medium">{resourceData.rate}/ч</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Затраты:</span>
              <span className="font-medium">{resourceData.cost}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Загрузка:</span>
              <span className="font-medium">{totalWorkload}ч</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Создан:</span>
              <span className="font-medium">{resourceData.timestamp.toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* График доступности */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">График доступности</h3>
        
        <div className="grid grid-cols-7 gap-2">
          {[
            { key: 'monday', label: 'Пн' },
            { key: 'tuesday', label: 'Вт' },
            { key: 'wednesday', label: 'Ср' },
            { key: 'thursday', label: 'Чт' },
            { key: 'friday', label: 'Пт' },
            { key: 'saturday', label: 'Сб' },
            { key: 'sunday', label: 'Вс' }
          ].map(day => (
            <div
              key={day.key}
              className={`p-2 text-center rounded text-sm ${
                resourceData.availability?.[day.key as keyof typeof resourceData.availability]
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}
            >
              <div className="font-medium">{day.label}</div>
              <div className="text-xs">
                {resourceData.availability?.[day.key as keyof typeof resourceData.availability] ? '✓' : '✗'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Назначенные задачи */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          Назначенные задачи ({resourceData.assignedTasks.length})
        </h3>
        
        {resourceData.assignedTasks.length > 0 ? (
          <div className="space-y-2">
            {resourceData.assignedTasks.map((task, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded">
                <div className="flex-1">
                  <div className="font-medium">{task.name}</div>
                  <div className="text-sm text-muted-foreground">
                    ID: {task.id} • Длительность: {task.duration}ч
                  </div>
                  {task.progress !== undefined && (
                    <div className="mt-2">
                      <Progress value={task.progress} className="h-1" />
                      <div className="text-xs text-muted-foreground mt-1">
                        {task.progress}% выполнено
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-right ml-4">
                  <div className="font-medium">{task.rate}/ч</div>
                  <div className="text-sm text-muted-foreground">
                    {(task.rate * task.duration).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Итоговая информация */}
            <div className="border-t pt-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Общая длительность:</span>
                <span className="font-medium">{totalWorkload}ч</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Общие затраты:</span>
                <span className="font-medium">
                  {resourceData.assignedTasks.reduce((total, task) => {
                    return total + (task.rate * task.duration);
                  }, 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground italic">
            Ресурс не назначен на задачи
          </div>
        )}
      </div>

      {/* Заметки */}
      {resourceData.notes && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Заметки</h3>
          <div className="text-sm p-3 bg-muted rounded">
            {resourceData.notes}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <BaseDialog<ResourceInformationData>
      data={resourceData}
      actions={actions}
      isOpen={isOpen}
      onClose={onClose}
      config={{
        width: 700,
        height: 600,
        modal: true,
        showHelp: true
      }}
    >
      {DialogContent}
    </BaseDialog>
  );
};

export default ResourceInformationDialog;
