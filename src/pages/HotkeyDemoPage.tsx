import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import {
  HotkeyProvider,
  HotkeyDisplay,
  HotkeyList,
  HotkeySettings,
  useGlobalHotkey,
  useHotkeyAction,
  useFileHotkeys,
  useNavigationHotkeys,
  hotkeyService,
} from '@/components/hotkey'
import type { HotkeyStatusBarBridge } from '@/services/HotkeyStatusBarBridge'
import type { HotkeyConfig } from '@/types/HotkeyTypes'
import { HotkeyCategory } from '@/types/HotkeyTypes'
import { logger } from '@/utils/logger'

/**
 * Демонстрационная страница системы горячих клавиш
 */
const HotkeyDemoPage: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false)
  const [message, setMessage] = useState('')
  const [count, setCount] = useState(0)
  const { isEnabled, toggleEnabled } = useGlobalHotkey()
  const [, setHotkeyStatusBarBridge] = useState<HotkeyStatusBarBridge | null>(null)

  // Глобальные горячие клавиши
  useFileHotkeys()
  useNavigationHotkeys()

  // Динамическая загрузка моста
  useEffect(() => {
    const loadBridge = async () => {
      const { hotkeyStatusBarBridge: bridge } = await import('@/services/HotkeyStatusBarBridge')
      setHotkeyStatusBarBridge(bridge)
      bridge.addCustomHotkeyListener('DEMO_HELP', 'Демонстрация помощи', 'message')
      bridge.addCustomHotkeyListener('DEMO_COUNTER', 'Счетчик увеличен', 'success')
    }
    void loadBridge()
  }, [])

  // Пользовательские горячие клавиши с интеграцией статусбара
  const { getService } = useGlobalHotkey()

  // Регистрация кастомных действий
  useEffect(() => {
    const service = getService()

    // Регистрация действия помощи
    service.registerAction({
      id: 'DEMO_HELP',
      name: 'Демонстрация помощи',
      description: 'Показать помощь по горячим клавишам',
      category: HotkeyCategory.NAVIGATION,
      execute: () => {
        logger.dialog('Help hotkey triggered', {}, 'HotkeyDemo')
      },
    })

    // Регистрация счетчика
    service.registerAction({
      id: 'DEMO_COUNTER',
      name: 'Счетчик',
      description: 'Увеличить счетчик',
      category: HotkeyCategory.NAVIGATION,
      execute: () => {
        setCount(prev => prev + 1)
      },
    })

    // Привязка горячих клавиш
    service.registerBinding('DEMO_HELP', { key: 'h', ctrl: true })
    service.registerBinding('DEMO_COUNTER', { key: 'c', ctrl: true, shift: true })
  }, [getService])

  // Слушатели действий
  useHotkeyAction('NEW_PROJECT', () => {
    setMessage('Создание нового проекта')
  })

  useHotkeyAction('SAVE_PROJECT', () => {
    setMessage('Сохранение проекта')
  })

  useHotkeyAction('UNDO', () => {
    setMessage('Отмена действия')
  })

  useHotkeyAction('FIND_TASK', () => {
    setMessage('Поиск задачи')
  })

  // Получение данных из сервиса
  const bindings = hotkeyService.getAllBindings()
  const actions = hotkeyService.getAllActions()

  // Создание конфигов для отображения
  const hotkeyConfigs: HotkeyConfig[] = bindings.map(binding => {
    const action = actions.find(a => a.id === binding.actionId)
    return {
      id: binding.actionId,
      keys: binding.keys,
      description: action?.description || binding.actionId,
      category: action?.category || HotkeyCategory.EDIT,
      enabled: binding.enabled,
      action: binding.actionId,
      icon: action?.id.includes('TASK') ? '📋' : action?.id.includes('PROJECT') ? '📁' : '⚙️',
    }
  })

  const showMessage = (msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <HotkeyProvider enabled={isEnabled}>
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Заголовок */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Система горячих клавиш ПланПро</h1>
            <p className="text-muted-foreground text-lg">
              Демонстрация интегрированной системы горячих клавиш с поддержкой SOLID и Clean Architecture
            </p>
          </div>

          {/* Статус системы */}
          <Alert>
            <AlertDescription className="flex items-center justify-between">
              <span>
                Система горячих клавиш: <strong>{isEnabled ? 'Включена' : 'Выключена'}</strong>
                <Badge variant="secondary" className="ml-2">
                  {bindings.length} комбинаций
                </Badge>
              </span>
              <Button onClick={toggleEnabled} variant="outline" size="sm">
                {isEnabled ? 'Выключить' : 'Включить'}
              </Button>
            </AlertDescription>
          </Alert>

          {/* Сообщение */}
          {message && (
            <Card className="p-4 bg-green-50 border-green-200">
              <p className="text-green-800 font-medium">{message}</p>
            </Card>
          )}

          {/* Демонстрация */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Быстрые действия */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Быстрые действия</h3>
              <div className="space-y-3">
                <Button
                  onClick={() => setShowSettings(true)}
                  className="w-full"
                >
                  Настройка горячих клавиш
                </Button>
                <Button
                  onClick={() => showMessage('Простое действие')}
                  variant="outline"
                  className="w-full"
                >
                  Тестовое действие
                </Button>
              </div>
            </Card>

            {/* Примеры горячих клавиш */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Примеры комбинаций</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Создать проект</span>
                  <HotkeyDisplay hotkey={{ key: 'N', ctrl: true }} />
                </div>
                <div className="flex justify-between items-center">
                  <span>Сохранить проект</span>
                  <HotkeyDisplay hotkey={{ key: 'S', ctrl: true }} />
                </div>
                <div className="flex justify-between items-center">
                  <span>Найти задачу</span>
                  <HotkeyDisplay hotkey={{ key: 'F', ctrl: true }} />
                </div>
                <div className="flex justify-between items-center">
                  <span>Пользовательское</span>
                  <HotkeyDisplay hotkey={{ key: 'H', ctrl: true }} />
                </div>
              </div>
            </Card>

            {/* Статистика */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Статистика</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Всего действий:</span>
                  <Badge variant="secondary">{actions.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Всего привязок:</span>
                  <Badge variant="secondary">{bindings.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Активных привязок:</span>
                  <Badge>{bindings.filter(b => b.enabled).length}</Badge>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span>Счетчик:</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              </div>
            </Card>
          </div>

          {/* Список всех горячих клавиш */}
          <Card className="p-6">
            <h3 className="text-2xl font-semibold mb-6">Все горячие клавиши</h3>
            <HotkeyList
              configs={hotkeyConfigs}
              groupBy="category"
              size="md"
            />
          </Card>

          {/* Инструкция */}
          <Card className="p-6 bg-muted/50">
            <h3 className="text-xl font-semibold mb-4">Инструкция по использованию</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Базовые комбинации:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <kbd>Ctrl+N</kbd> - Создать проект</li>
                  <li>• <kbd>Ctrl+S</kbd> - Сохранить проект</li>
                  <li>• <kbd>Ctrl+F</kbd> - Найти задачу</li>
                  <li>• <kbd>Ctrl+Z</kbd> - Отменить</li>
                  <li>• <kbd>Ctrl+Shift+S</kbd> - Сохранить как</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Демо-комбинации:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <kbd>Ctrl+H</kbd> - Показать помощь</li>
                  <li>• <kbd>Ctrl+Shift+C</kbd> - Увеличить счетчик</li>
                  <li>• <kbd>F3</kbd> - Перейти к задаче</li>
                  <li>• <kbd>F9</kbd> - Информация о задаче</li>
                  <li>• <kbd>F10</kbd> - Информация о ресурсе</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Диалог настроек */}
        <HotkeySettings
          title="Настройки горячих клавиш"
          open={showSettings}
          onOpenChange={setShowSettings}
          onSave={() => {
            showMessage('Настройки сохранены')
          }}
        />
      </HotkeyProvider>
    </div>
  )
}

export default HotkeyDemoPage

