import React, { useState, useEffect } from 'react'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Button,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Input
} from '@/components/ui'
import { useProjectLibreAPI } from '@/hooks/useProjectLibreAPI'
import { Plus, RefreshCw, Download, Upload } from 'lucide-react'
import type { Project, Task, Resource, ID } from '@/types'

import { EnvironmentConfig } from '@/config/EnvironmentConfig'

/**
 * Демонстрационный компонент для API клиентов
 */
export const APIDemo: React.FC = () => {
  const api = useProjectLibreAPI();
  const apiBaseUrl = `${EnvironmentConfig.getApiBaseUrl()}/api`;
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузка данных при монтировании
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [projectsData, resourcesData] = await Promise.all([
        api.projects.getAll(),
        api.resources.getAll({ value: 1, type: 'project' } as ID)
      ]);
      
      setProjects(projectsData);
      setResources(resourcesData);
      
      // Загрузка задач для первого проекта
      if (projectsData.length > 0) {
        const tasksData = await api.tasks.getAll(projectsData[0].id);
        setTasks(tasksData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    try {
      const newProject = await api.projects.create({
        name: 'Новый проект',
        description: 'Создан через API',
        startDate: new Date(),
        finishDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'planning' as any
      });
      
      setProjects([...projects, newProject]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    }
  };

  const handleCreateTask = async () => {
    if (projects.length === 0) return;
    
    try {
      const newTask = await api.tasks.create({
        name: 'Новая задача',
        description: 'Создана через API',
        duration: { value: 5, unit: 'days' },
        startDate: new Date(),
        status: 'notStarted' as any
      });
      
      setTasks([...tasks, newTask]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  const handleCreateResource = async () => {
    try {
      const newResource = await api.resources.create({
        name: 'Новый ресурс',
        type: 'work' as any,
        cost: {
          standardRate: { amount: 1000, currency: { code: 'RUB', symbol: '₽' } },
          overtimeRate: { amount: 1500, currency: { code: 'RUB', symbol: '₽' } }
        }
      });
      
      setResources([...resources, newResource]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create resource');
    }
  };

  const refreshData = async () => {
    await loadInitialData();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Загрузка данных...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Заголовок и ошибки */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>ProjectLibre API Demo</CardTitle>
            <div className="flex gap-2">
              <Button onClick={refreshData} size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button onClick={handleCreateProject} size="sm">
                <Plus className="h-4 w-4" />
                Проект
              </Button>
              <Button onClick={handleCreateTask} size="sm">
                <Plus className="h-4 w-4" />
                Задача
              </Button>
              <Button onClick={handleCreateResource} size="sm">
                <Plus className="h-4 w-4" />
                Ресурс
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-md">
              <p className="text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Таблица проектов */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Проекты
            <Badge variant="outline">{projects.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Название</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Дата начала</TableHead>
                <TableHead>Дата окончания</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id.value}>
                  <TableCell className="font-mono">{project.id.value}</TableCell>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>
                    <Badge variant={project.status === 'active' ? 'success' : 'outline'}>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{project.startDate.toLocaleDateString()}</TableCell>
                  <TableCell>{project.finishDate?.toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Таблица задач */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Задачи первого проекта
            <Badge variant="outline">{tasks.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Название</TableHead>
                <TableHead>Длительность</TableHead>
                <TableHead>Прогресс</TableHead>
                <TableHead>Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.slice(0, 5).map((task) => (
                <TableRow key={task.id.value}>
                  <TableCell className="font-mono">{task.id.value}</TableCell>
                  <TableCell className="font-medium">{task.name}</TableCell>
                  <TableCell>
                    {task.duration.value} {task.duration.unit}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${task.completion.value}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">
                        {task.completion.value}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={task.status === 'inProgress' ? 'warning' : 'outline'}>
                      {task.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {tasks.length > 5 && (
            <div className="text-center text-sm text-muted-foreground mt-2">
              Показано 5 из {tasks.length} задач
            </div>
          )}
        </CardContent>
      </Card>

      {/* Таблица ресурсов */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Ресурсы
            <Badge variant="outline">{resources.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Название</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Ставка</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.slice(0, 5).map((resource) => (
                <TableRow key={resource.id.value}>
                  <TableCell className="font-mono">{resource.id.value}</TableCell>
                  <TableCell className="font-medium">{resource.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{resource.type}</Badge>
                  </TableCell>
                  <TableCell>
                    {resource.cost?.standardRate.amount} {resource.cost?.standardRate.currency.symbol}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {resources.length > 5 && (
            <div className="text-center text-sm text-muted-foreground mt-2">
              Показано 5 из {resources.length} ресурсов
            </div>
          )}
        </CardContent>
      </Card>

      {/* API информация */}
      <Card>
        <CardHeader>
          <CardTitle>API Информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Project API:</span>
              <span className="ml-2 text-muted-foreground">/projects/*</span>
            </div>
            <div>
              <span className="font-medium">Task API:</span>
              <span className="ml-2 text-muted-foreground">/tasks/*</span>
            </div>
            <div>
              <span className="font-medium">Resource API:</span>
              <span className="ml-2 text-muted-foreground">/resources/*</span>
            </div>
            <div>
              <span className="font-medium">Базовый URL:</span>
              <span className="ml-2 text-muted-foreground">{apiBaseUrl}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

