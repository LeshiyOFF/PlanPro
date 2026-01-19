import React from 'react'
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  Input,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui'
import { Plus, Save, FolderOpen, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react'

/**
 * Демонстрационный компонент UI элементов с Tailwind + shadcn/ui
 * Показывает все основные компоненты ProjectLibre
 */
export const UIDemo: React.FC = () => {
  const tasks = [
    { id: 1, name: 'Разработка архитектуры', status: 'completed', assignee: 'Иван Петров' },
    { id: 2, name: 'Настройка Tailwind CSS', status: 'in-progress', assignee: 'Мария Иванова' },
    { id: 3, name: 'Интеграция shadcn/ui', status: 'delayed', assignee: 'Алексей Сидоров' },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="task-completed">Завершено</Badge>
      case 'in-progress':
        return <Badge variant="task-in-progress">В работе</Badge>
      case 'delayed':
        return <Badge variant="task-delayed">Задержано</Badge>
      default:
        return <Badge variant="task-planned">Планируется</Badge>
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header с Ribbon меню */}
      <Card>
        <CardHeader>
          <CardTitle>ProjectLibre UI Demo</CardTitle>
          <CardDescription>
            Демонстрация компонентов с Tailwind CSS + shadcn/ui
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Ribbon меню */}
          <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
            <Button variant="ribbon" size="ribbon">
              <FolderOpen className="h-4 w-4 mr-1" />
              Открыть
            </Button>
            <Button variant="ribbon" size="ribbon">
              <Save className="h-4 w-4 mr-1" />
              Сохранить
            </Button>
            <div className="w-px h-6 bg-border" />
            <Button variant="ribbon" size="ribbon">
              <Plus className="h-4 w-4 mr-1" />
              Новая задача
            </Button>
            <Button variant="ribbon-active" size="ribbon">
              Диаграмма Ганта
            </Button>
            <Button variant="ribbon" size="ribbon">
              <FileText className="h-4 w-4 mr-1" />
              Отчеты
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Форма ввода */}
      <Card>
        <CardHeader>
          <CardTitle>Новая задача</CardTitle>
          <CardDescription>
            Создание новой задачи с использованием Tailwind стилей
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Название задачи</label>
              <Input placeholder="Введите название задачи..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Исполнитель</label>
              <Input placeholder="Выберите исполнителя..." />
            </div>
          </div>
          <div className="flex gap-2">
            <Button>Создать задачу</Button>
            <Button variant="outline">Отмена</Button>
            <Button variant="ghost">Сохранить как черновик</Button>
          </div>
        </CardContent>
      </Card>

      {/* Таблица задач */}
      <Card>
        <CardHeader>
          <CardTitle>Текущие задачи</CardTitle>
          <CardDescription>
            Таблица задач с кастомными баджами статусов
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Название</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Исполнитель</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-mono">{task.id}</TableCell>
                  <TableCell className="font-medium">{task.name}</TableCell>
                  <TableCell>{getStatusBadge(task.status)}</TableCell>
                  <TableCell>{task.assignee}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline">Изменить</Button>
                      <Button size="sm" variant="ghost">Удалить</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Статусы и баджи */}
      <Card>
        <CardHeader>
          <CardTitle>Статусы задач</CardTitle>
          <CardDescription>
            Все возможные статусы с Tailwind цветами
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="task-completed">
              <CheckCircle className="h-3 w-3 mr-1" />
              Завершено
            </Badge>
            <Badge variant="task-in-progress">
              <Clock className="h-3 w-3 mr-1" />
              В работе
            </Badge>
            <Badge variant="task-delayed">
              <AlertCircle className="h-3 w-3 mr-1" />
              Задержано
            </Badge>
            <Badge variant="task-planned">
              Планируется
            </Badge>
            <Badge variant="task-milestone">
              Веха
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Кнопки всех вариантов */}
      <Card>
        <CardHeader>
          <CardTitle>Варианты кнопок</CardTitle>
          <CardDescription>
            Все доступные варианты кнопок Tailwind + shadcn/ui
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Основные варианты</h4>
              <div className="flex gap-2">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Специальные варианты</h4>
              <div className="flex gap-2">
                <Button variant="destructive">Destructive</Button>
                <Button variant="link">Link</Button>
                <Button variant="ribbon">Ribbon</Button>
                <Button variant="ribbon-active">Ribbon Active</Button>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <h4 className="font-medium">Размеры кнопок</h4>
            <div className="flex gap-2 items-end">
              <Button size="sm">Small</Button>
              <Button>Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

