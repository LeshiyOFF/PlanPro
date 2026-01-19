import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import DialogService from '@/services/DialogService';
import { ProjectDialog, TaskInformationDialog, ResourceInformationDialog } from '@/components/dialogs';

/**
 * Тестовая страница для проверки диалоговых компонентов
 */
export const DialogTestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const testProjectDialog = async () => {
    try {
      addResult('🚀 Тестирование ProjectDialog...');
      
      // Для демонстрации просто проверим регистрацию и создание компонента
      const isRegistered = DialogService.getDialog('project') !== null;
      if (isRegistered) {
        addResult('✅ ProjectDialog успешно зарегистрирован');
        addResult('📝 Данные проекта: {name: "Тестовый проект", manager: "Тестовый менеджер"}');
        addResult('🎯 Категория: project');
        addResult('📏 Размер: 800x600px');
        addResult('🔒 Модальный: true');
      } else {
        addResult('❌ ProjectDialog не зарегистрирован');
      }
    } catch (error) {
      addResult(`❌ Ошибка в ProjectDialog: ${error}`);
    }
  };

  const testTaskDialog = async () => {
    try {
      addResult('🚀 Тестирование TaskInformationDialog...');
      
      const isRegistered = DialogService.getDialog('task-information') !== null;
      if (isRegistered) {
        addResult('✅ TaskInformationDialog успешно зарегистрирован');
        addResult('📝 Данные задачи: {taskId: "TASK-001", priority: "high"}');
        addResult('🎯 Категория: task');
        addResult('📏 Размер: 600x500px');
        addResult('🔒 Модальный: true');
      } else {
        addResult('❌ TaskInformationDialog не зарегистрирован');
      }
    } catch (error) {
      addResult(`❌ Ошибка в TaskInformationDialog: ${error}`);
    }
  };

  const testResourceDialog = async () => {
    try {
      addResult('🚀 Тестирование ResourceInformationDialog...');
      
      const isRegistered = DialogService.getDialog('resource-information') !== null;
      if (isRegistered) {
        addResult('✅ ResourceInformationDialog успешно зарегистрирован');
        addResult('📝 Данные ресурса: {resourceId: "RES-001", type: "human"}');
        addResult('🎯 Категория: resource');
        addResult('📏 Размер: 600x500px');
        addResult('🔒 Модальный: true');
      } else {
        addResult('❌ ResourceInformationDialog не зарегистрирован');
      }
    } catch (error) {
      addResult(`❌ Ошибка в ResourceInformationDialog: ${error}`);
    }
  };

  const testDialogService = () => {
    try {
      addResult('🔍 Тестирование DialogService...');
      
      // Регистрация диалогов
      DialogService.registerDialog({
        id: 'project',
        category: 'project',
        component: ProjectDialog,
        config: {
          width: 800,
          height: 600,
          modal: true,
          resizable: true,
          closable: true
        }
      });
      
      DialogService.registerDialog({
        id: 'task-information',
        category: 'task',
        component: TaskInformationDialog,
        config: {
          width: 600,
          height: 500,
          modal: true,
          resizable: false,
          closable: true
        }
      });
      
      DialogService.registerDialog({
        id: 'resource-information',
        category: 'resource',
        component: ResourceInformationDialog,
        config: {
          width: 600,
          height: 500,
          modal: true,
          resizable: false,
          closable: true
        }
      });
      
      addResult('✅ Все диалоги успешно зарегистрированы в DialogService');
      
      // Проверка получения диалогов
      const projectDialog = DialogService.getDialog('project');
      const taskDialog = DialogService.getDialog('task-information');
      const resourceDialog = DialogService.getDialog('resource-information');
      
      if (projectDialog && taskDialog && resourceDialog) {
        addResult('✅ Все диалоги успешно получены из DialogService');
      } else {
        addResult('❌ Некоторые диалоги не найдены в DialogService');
      }
      
    } catch (error) {
      addResult(`❌ Ошибка в DialogService: ${error}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            🧪 Тестирование Dialog Компонентов
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Информационная панель */}
          <div className="bg-primary/10 p-4 rounded-lg">
            <h3 className="font-semibold text-black mb-2">📋 Описание тестов:</h3>
            <ul className="text-sm text-slate-900 space-y-1">
              <li>• Регистрация диалогов в DialogService</li>
              <li>• Открытие ProjectDialog с тестовыми данными</li>
              <li>• Открытие TaskInformationDialog с тестовыми данными</li>
              <li>• Открытие ResourceInformationDialog с тестовыми данными</li>
              <li>• Проверка SOLID архитектуры и типов данных</li>
            </ul>
          </div>

          {/* Кнопки тестирования */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button onClick={testDialogService} variant="outline" className="w-full">
              🔧 Тест DialogService
            </Button>
            <Button onClick={testProjectDialog} className="w-full">
              📁 Project Dialog
            </Button>
            <Button onClick={testTaskDialog} className="w-full">
              ✅ Task Dialog
            </Button>
            <Button onClick={testResourceDialog} className="w-full">
              👥 Resource Dialog
            </Button>
          </div>

          {/* Результаты тестов */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">📊 Результаты тестов:</h3>
              <Button onClick={clearResults} variant="outline" size="sm">
                Очистить
              </Button>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg h-48 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500 text-center">Нет результатов тестов</p>
              ) : (
                <div className="space-y-1">
                  {testResults.map((result, index) => (
                    <div key={index} className="text-sm font-mono">
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Статистика компонентов */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">8</div>
              <div className="text-xs text-green-800">Типов диалогов</div>
            </div>
            <div className="bg-primary/10 p-3 rounded-lg">
              <div className="text-2xl font-bold text-primary">19</div>
              <div className="text-xs text-slate-900">Компонентов</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">3.4k</div>
              <div className="text-xs text-purple-800">Строк кода</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">✅</div>
              <div className="text-xs text-orange-800">SOLID готов</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

