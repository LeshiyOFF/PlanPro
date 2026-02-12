import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui'
import { TwoTierHeader } from '@/components/layout/ViewHeader'
import { useHelpContent } from '@/hooks/useHelpContent'
import { GanttCanvasController } from '@/components/gantt'
import { useProjectStore } from '@/store/projectStore'
import { LineChart, RefreshCw } from 'lucide-react'
import { withViewErrorBoundary } from '@/components/error-handling'

/**
 * Tracking Gantt View - Гант отслеживания
 *
 * Режим только для чтения: сравнение базового плана с текущим состоянием.
 * Редактирование задач заблокировано для предотвращения случайных изменений.
 *
 * @version 8.15 - TRACKING-READONLY
 */
const TrackingGanttViewInner: React.FC = () => {
  const { t, i18n } = useTranslation()
  const helpContent = useHelpContent()
  const [currentDate, setCurrentDate] = useState(new Date())

  // Глобальное хранилище задач
  const { tasks } = useProjectStore()
  
  // GANTT-SYNC: Флаг для одноразовой инициализации даты при загрузке задач
  const isInitialDateSet = useRef(false)
  
  // GANTT-SYNC: Синхронизация начальной даты тулбара с диапазоном проекта
  useEffect(() => {
    if (!isInitialDateSet.current && tasks.length > 0) {
      const minStartDate = new Date(Math.min(
        ...tasks.map(task => new Date(task.startDate).getTime())
      ))
      setCurrentDate(minStartDate)
      isInitialDateSet.current = true
    }
  }, [tasks])

  const handleTaskSelect = useCallback((task: { id: string }) => {
    console.log('Tracking Gantt: Task selected:', task)
  }, [])

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Two-Tier Header: Заголовок + Панель действий */}
      <TwoTierHeader
        title={t('tracking_gantt.title')}
        description={t('descriptions.tracking')}
        icon={<LineChart className="w-6 h-6" />}
        help={helpContent.TRACKING}
        actionBar={{
          primaryAction: {
            label: t('view_controls.update_progress'),
            onClick: () => { /* Update progress: reserved for future implementation */ },
            icon: <RefreshCw className="w-4 h-4" />,
          },
        }}
      />

      {/* Основной контент */}
      <div className="flex-1 overflow-hidden p-4">
        <div className="flex h-full gap-4">
          {/* Панель задач - Режим только для чтения */}
          <div className="w-64 flex-shrink-0 flex flex-col bg-white rounded-xl shadow-lg border overflow-hidden transition-all soft-border">
            <div className="px-4 py-3 border-b border-border/20 flex-shrink-0 bg-slate-50/30">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-tight">{t('tracking_gantt.tracking_panel_title')}</h3>
            </div>
            <div className="p-3 flex-1 overflow-auto space-y-1">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="task-item p-2 text-xs rounded-lg"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div
                        className="h-2.5 w-2.5 rounded-full flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: task.color }}
                      />
                      <span className="truncate font-semibold text-slate-700">{task.name}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] px-1.5 h-4.5 border-primary/20 text-primary bg-primary/5">
                      {Math.round(task.progress * 100)}%
                    </Badge>
                  </div>
                  {task.baselineStartDate && (
                    <div className="flex justify-between text-[9px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1 opacity-70">
                        <LineChart className="w-3 h-3" />
                        {t('tracking_gantt.plan_label')}: {new Date(task.baselineStartDate).toLocaleDateString(i18n.language === 'ru' ? 'ru-RU' : 'en-US')}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Canvas диаграмма в режиме TRACKING - Только для чтения */}
          <div className="flex-1 bg-white rounded-xl shadow-lg border overflow-hidden transition-all soft-border">
            <GanttCanvasController
              tasks={tasks}
              currentDate={currentDate}
              onCurrentDateChange={setCurrentDate}
              onTaskSelect={handleTaskSelect}
              mode="tracking"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * TrackingGanttView обёрнут в ViewErrorBoundary для изоляции ошибок.
 * Падение этого View не ломает остальное приложение.
 */
export const TrackingGanttView = withViewErrorBoundary(
  TrackingGanttViewInner,
  'Гант отслеживания'
)
