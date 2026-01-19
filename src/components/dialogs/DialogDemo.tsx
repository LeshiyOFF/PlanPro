import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useDialogManager } from './DialogManager';
import { 
  FileText, 
  Users, 
  Calendar, 
  Settings, 
  Search, 
  Edit,
  Info,
  Target,
  Hash
} from 'lucide-react';

interface DialogCategory {
  name: string;
  icon: React.ReactNode;
  color: string;
  dialogs: {
    type: string;
    label: string;
    description: string;
    icon: React.ReactNode;
  }[];
}

export const DialogDemo: React.FC = () => {
  const { openDialog } = useDialogManager();

  const categories: DialogCategory[] = [
    {
      name: 'Проекты',
      icon: <FileText className="h-5 w-5" />,
      color: 'bg-slate-100 text-slate-900',
      dialogs: [
        {
          type: 'projects',
          label: 'Управление проектами',
          description: 'Создание, открытие и управление проектами',
          icon: <FileText className="h-4 w-4" />
        },
        {
          type: 'update-project',
          label: 'Обновление проекта',
          description: 'Обновление информации о проекте',
          icon: <Edit className="h-4 w-4" />
        },
        {
          type: 'rename-project',
          label: 'Переименование проекта',
          description: 'Переименование или сохранение как новый проект',
          icon: <Edit className="h-4 w-4" />
        },
        {
          type: 'open-project',
          label: 'Открытие проекта',
          description: 'Открытие существующего проекта',
          icon: <FileText className="h-4 w-4" />
        },
        {
          type: 'baseline',
          label: 'Базовые планы',
          description: 'Управление базовыми планами проекта',
          icon: <Target className="h-4 w-4" />
        }
      ]
    },
    {
      name: 'Задачи',
      icon: <Target className="h-5 w-5" />,
      color: 'bg-green-100 text-green-800',
      dialogs: [
        {
          type: 'dependency',
          label: 'Зависимости задач',
          description: 'Создание и управление зависимостями',
          icon: <Target className="h-4 w-4" />
        },
        {
          type: 'xbs-dependency',
          label: 'Расширенные зависимости',
          description: 'Управление XBS зависимостями',
          icon: <Target className="h-4 w-4" />
        },
        {
          type: 'delegate-task',
          label: 'Делегирование задач',
          description: 'Делегирование задач другим пользователям',
          icon: <Users className="h-4 w-4" />
        },
        {
          type: 'update-task',
          label: 'Массовое обновление',
          description: 'Обновление нескольких задач одновременно',
          icon: <Edit className="h-4 w-4" />
        }
      ]
    },
    {
      name: 'Ресурсы',
      icon: <Users className="h-5 w-5" />,
      color: 'bg-purple-100 text-purple-800',
      dialogs: [
        {
          type: 'assignment',
          label: 'Назначения ресурсов',
          description: 'Управление назначением ресурсов на задачи',
          icon: <Users className="h-4 w-4" />
        },
        {
          type: 'resource-mapping',
          label: 'Маппинг ресурсов',
          description: 'Сопоставление полей ресурсов',
          icon: <Hash className="h-4 w-4" />
        },
        {
          type: 'resource-addition',
          label: 'Добавление ресурсов',
          description: 'Создание новых ресурсов',
          icon: <Users className="h-4 w-4" />
        },
        {
          type: 'replace-assignment',
          label: 'Замена назначений',
          description: 'Замена одного ресурса другим',
          icon: <Users className="h-4 w-4" />
        }
      ]
    },
    {
      name: 'Календарь',
      icon: <Calendar className="h-5 w-5" />,
      color: 'bg-orange-100 text-orange-800',
      dialogs: [
        {
          type: 'new-base-calendar',
          label: 'Новый календарь',
          description: 'Создание или копирование базового календаря',
          icon: <Calendar className="h-4 w-4" />
        },
        {
          type: 'holiday',
          label: 'Праздники',
          description: 'Управление праздничными днями',
          icon: <Calendar className="h-4 w-4" />
        }
      ]
    },
    {
      name: 'Информация',
      icon: <Info className="h-5 w-5" />,
      color: 'bg-cyan-100 text-cyan-800',
      dialogs: [
        {
          type: 'task-details',
          label: 'Детали задачи',
          description: 'Подробная информация о задаче',
          icon: <Info className="h-4 w-4" />
        },
        {
          type: 'earned-value',
          label: 'Освоенный объем',
          description: 'Анализ освоенного объема',
          icon: <Target className="h-4 w-4" />
        },
        {
          type: 'project-statistics',
          label: 'Статистика проекта',
          description: 'Статистические данные по проекту',
          icon: <Info className="h-4 w-4" />
        },
        {
          type: 'task-links',
          label: 'Связи задач',
          description: 'Просмотр и управление связями задач',
          icon: <Target className="h-4 w-4" />
        },
        {
          type: 'task-notes',
          label: 'Заметки задач',
          description: 'Управление заметками к задачам',
          icon: <Info className="h-4 w-4" />
        }
      ]
    },
    {
      name: 'Поиск',
      icon: <Search className="h-5 w-5" />,
      color: 'bg-yellow-100 text-yellow-800',
      dialogs: [
        {
          type: 'advanced-search',
          label: 'Расширенный поиск',
          description: 'Продвинутый поиск с фильтрами',
          icon: <Search className="h-4 w-4" />
        },
        {
          type: 'filter',
          label: 'Фильтрация',
          description: 'Фильтрация данных проекта',
          icon: <Search className="h-4 w-4" />
        }
      ]
    },
    {
      name: 'Настройки',
      icon: <Settings className="h-5 w-5" />,
      color: 'bg-gray-100 text-gray-800',
      dialogs: [
        {
          type: 'project-options',
          label: 'Настройки проекта',
          description: 'Основные настройки проекта',
          icon: <Settings className="h-4 w-4" />
        },
        {
          type: 'gantt-chart-options',
          label: 'Настройки диаграммы Ганта',
          description: 'Настройки отображения диаграммы',
          icon: <Settings className="h-4 w-4" />
        },
        {
          type: 'calculation-options',
          label: 'Настройки расчетов',
          description: 'Параметры расчета проекта',
          icon: <Settings className="h-4 w-4" />
        },
        {
          type: 'notification-settings',
          label: 'Уведомления',
          description: 'Настройки системы уведомлений',
          icon: <Settings className="h-4 w-4" />
        },
        {
          type: 'security-settings',
          label: 'Безопасность',
          description: 'Настройки безопасности проекта',
          icon: <Settings className="h-4 w-4" />
        }
      ]
    },
    {
      name: 'Редактирование',
      icon: <Edit className="h-5 w-5" />,
      color: 'bg-red-100 text-red-800',
      dialogs: [
        {
          type: 'find-and-replace',
          label: 'Найти и заменить',
          description: 'Поиск и замена текста',
          icon: <Search className="h-4 w-4" />
        },
        {
          type: 'go-to',
          label: 'Перейти к',
          description: 'Быстрый переход к элементам',
          icon: <Target className="h-4 w-4" />
        }
      ]
    }
  ];

  const handleOpenDialog = (type: string) => {
    openDialog(type as any, {
      // Sample data for testing
      projectId: 'demo-project-123',
      taskId: 'demo-task-456',
      resourceId: 'demo-resource-789'
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Демонстрация диалогов</h1>
        <p className="text-gray-600">
          Интерактивная демонстрация всех 37 диалоговых окон системы управления проектами
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, categoryIndex) => (
          <Card key={categoryIndex} className="h-fit">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Badge className={category.color} variant="secondary">
                  {category.icon}
                </Badge>
                <CardTitle className="text-lg">{category.name}</CardTitle>
              </div>
              <CardDescription>
                {category.dialogs.length} диалогов
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {category.dialogs.map((dialog, dialogIndex) => (
                <div key={dialogIndex} className="flex items-start gap-2 p-2 rounded hover:bg-gray-50">
                  <div className="mt-0.5">{dialog.icon}</div>
                  <div className="flex-1 min-w-0">
                    <Button
                      variant="ghost"
                      className="h-auto p-0 text-left justify-start"
                      onClick={() => handleOpenDialog(dialog.type)}
                    >
                      <div className="w-full">
                        <div className="font-medium text-sm">{dialog.label}</div>
                        <div className="text-xs text-gray-500 mt-1">{dialog.description}</div>
                      </div>
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-4 bg-primary/10 rounded-lg">
        <h3 className="font-semibold text-black mb-2">Информация о системе диалогов</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-slate-800 font-medium">Всего категорий</div>
            <div className="text-black font-bold">{categories.length}</div>
          </div>
          <div>
            <div className="text-slate-800 font-medium">Всего диалогов</div>
            <div className="text-black font-bold">
              {categories.reduce((sum, cat) => sum + cat.dialogs.length, 0)}
            </div>
          </div>
          <div>
            <div className="text-slate-800 font-medium">Компонентов</div>
            <div className="text-black font-bold">37</div>
          </div>
          <div>
            <div className="text-slate-800 font-medium">Статус</div>
            <div className="text-green-600 font-bold">Готово</div>
          </div>
        </div>
      </div>
    </div>
  );
};

