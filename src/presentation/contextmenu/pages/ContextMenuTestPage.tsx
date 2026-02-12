import React, { useState } from 'react'
import { useContextMenu } from '../providers/ContextMenuProvider'
import { ContextMenuType } from '../../../domain/contextmenu/ContextMenuType'

/**
 * Тестовая страница для демонстрации работы контекстных меню
 */
export const ContextMenuTestPage: React.FC = () => {
  const { showMenu } = useContextMenu()
  const [testResults, setTestResults] = useState<string[]>([])

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const handleContextMenu = async (
    event: React.MouseEvent,
    targetType: string,
    targetData: Record<string, string | number | undefined>,
  ) => {
    event.preventDefault()

    const position = { x: event.clientX, y: event.clientY }
    const context = {
      target: { ...targetData, type: targetType },
      position,
      metadata: { source: 'test-page' },
    }

    const menuType = targetType === 'task' ? ContextMenuType.TASK : ContextMenuType.RESOURCE

    try {
      await showMenu(menuType, context)
      addResult(`✅ Показано меню для ${targetType}`)
    } catch (error) {
      addResult(`❌ Ошибка меню: ${(error as Error).message}`)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>
        🧪 Тестирование Context Menu системы
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        {/* Тестовая задача */}
        <div
          style={{
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#f8fafc',
            cursor: 'pointer',
          }}
          onContextMenu={(e) => handleContextMenu(e, 'task', {
            id: 'TASK-001',
            name: 'Разработка интерфейса',
            duration: 5,
            progress: 75,
            assignee: 'Иван Петров',
          })}
        >
          <h3 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>
            📋 Тестовая задача
          </h3>
          <div style={{ fontSize: '14px', color: '#64748b' }}>
            <p>ID: TASK-001</p>
            <p>Название: Разработка интерфейса</p>
            <p>Продолжительность: 5 дней</p>
            <p>Прогресс: 75%</p>
            <p>Исполнитель: Иван Петров</p>
          </div>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '10px' }}>
            💡 Кликните правой кнопкой мыши для вызова контекстного меню
          </p>
        </div>

        {/* Тестовый ресурс */}
        <div
          style={{
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#fefce8',
            cursor: 'pointer',
          }}
          onContextMenu={(e) => handleContextMenu(e, 'resource', {
            id: 'RES-001',
            name: 'Иван Петров',
            type: 'human',
            availability: 80,
            hourlyRate: 1500,
            department: 'Разработка',
          })}
        >
          <h3 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>
            👤 Тестовый ресурс
          </h3>
          <div style={{ fontSize: '14px', color: '#64748b' }}>
            <p>ID: RES-001</p>
            <p>Имя: Иван Петров</p>
            <p>Тип: Человек</p>
            <p>Доступность: 80%</p>
            <p>Ставка: 1500 ₽/час</p>
            <p>Отдел: Разработка</p>
          </div>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '10px' }}>
            💡 Кликните правой кнопкой мыши для вызова контекстного меню
          </p>
        </div>
      </div>

      {/* Результаты тестов */}
      <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0, color: '#1e293b' }}>
            📊 Результаты тестов:
          </h3>
          <button
            onClick={clearResults}
            style={{
              padding: '6px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Очистить
          </button>
        </div>

        <div
          style={{
            backgroundColor: '#f8fafc',
            borderRadius: '4px',
            padding: '15px',
            height: '200px',
            overflowY: 'auto',
            fontFamily: 'monospace',
            fontSize: '12px',
            lineHeight: '1.5',
          }}
        >
          {testResults.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', margin: 0 }}>
              Нет результатов тестов
            </p>
          ) : (
            <div>
              {testResults.map((result, index) => (
                <div key={index} style={{ marginBottom: '2px' }}>
                  {result}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Инструкции */}
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#0369a1' }}>
          📖 Инструкции по тестированию:
        </h3>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#0c4a6e', fontSize: '14px' }}>
          <li>Кликните правой кнопкой мыши по карточке задачи для вызова контекстного меню задач</li>
          <li>Кликните правой кнопкой мыши по карточке ресурса для вызова контекстного меню ресурсов</li>
          <li>Попробуйте различные действия в меню: копирование, удаление, свойства</li>
          <li>Проверьте работу подменю (например, "Зависимости" для задач)</li>
          <li>Нажмите ESC для закрытия меню или кликните вне его области</li>
          <li>Результаты действий будут отображены в консоли и в разделе результатов тестов</li>
        </ul>
      </div>
    </div>
  )
}

