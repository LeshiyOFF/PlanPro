import React from 'react'
import { TFunction } from 'i18next'
import { IHelpSection } from '@/types/help'
import { 
  BarChart, 
  Layers, 
  Activity, 
  Link2, 
  Pin, 
  Palette, 
  CalendarX,
  AlertTriangle
} from 'lucide-react'

/**
 * Контент справки для секции GANTT (Диаграмма Ганта)
 */
export const getGanttHelpSection = (t: TFunction): IHelpSection => ({
  title: t('help.gantt.title', 'Диаграмма Ганта'),
  subtitle: t('help.gantt.subtitle', 'Планирование временных графиков'),
  icon: <BarChart size={24} />,
  blocks: [
    {
      title: t('help.gantt.taskTypes.title', 'Типы задач'),
      icon: <Layers size={20} />,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      content: (
        <div className="space-y-2">
          <p><strong>{t('help.gantt.taskTypes.normal', 'Обычные задачи')}</strong> {t('help.gantt.taskTypes.normalDesc', '(синие полоски): Атомарные работы с фиксированной длительностью')}</p>
          <p><strong>{t('help.gantt.taskTypes.summary', 'Суммарные задачи')}</strong> {t('help.gantt.taskTypes.summaryDesc', '(черные скобки): Группы подзадач. Их сроки рассчитываются автоматически')}</p>
          <p><strong>{t('help.gantt.taskTypes.milestone', 'Вехи')}</strong> {t('help.gantt.taskTypes.milestoneDesc', '(ромбики): Контрольные точки без длительности')}</p>
          <p className="text-xs italic text-slate-500 mt-2">{t('help.gantt.taskTypes.note', 'Суммарные задачи нельзя перетаскивать — они зависят от дочерних')}</p>
        </div>
      ),
    },
    {
      title: t('help.gantt.criticalPath.title', 'Критический путь (Pulse Mode)'),
      icon: <Activity size={20} />,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-50',
      content: (
        <div className="space-y-2">
          <p><strong>{t('help.gantt.criticalPath.what', 'Что это:')}</strong> {t('help.gantt.criticalPath.whatDesc', 'Последовательность задач, определяющих минимальную длительность проекта')}</p>
          <p><strong>{t('help.gantt.criticalPath.how', 'Как активировать:')}</strong> {t('help.gantt.criticalPath.howDesc', 'Нажмите кнопку "Пульс" (иконка Activity) на панели инструментов')}</p>
          <p><strong>{t('help.gantt.criticalPath.visual', 'Визуализация:')}</strong> {t('help.gantt.criticalPath.visualDesc', 'Критические задачи окрашиваются в красный')}</p>
          <p><strong>{t('help.gantt.criticalPath.slack', 'Резерв времени (Slack):')}</strong> {t('help.gantt.criticalPath.slackDesc', 'В тултипе показывается количество дней, на которое можно задержать задачу')}</p>
        </div>
      ),
    },
    {
      title: t('help.gantt.dependencies.title', 'Связи между задачами'),
      icon: <Link2 size={20} />,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      content: (
        <div className="space-y-2">
          <p>{t('help.gantt.dependencies.desc', 'Задачи можно связать между собой стрелками. Связанные задачи выполняются последовательно: пока не завершится предыдущая задача, следующая не начнётся.')}</p>
          <p>{t('help.gantt.dependencies.visual', 'Стрелки наглядно показывают порядок выполнения работ и помогают контролировать последовательность этапов проекта.')}</p>
          <div className="mt-2 p-2 bg-amber-50 rounded-lg text-xs">
            <p><AlertTriangle size={12} className="inline-block mr-1 mb-0.5 text-amber-600" /> {t('help.gantt.dependencies.noSummary', 'Нельзя связать обычную задачу с суммарной')}</p>
            <p><AlertTriangle size={12} className="inline-block mr-1 mb-0.5 text-amber-600" /> {t('help.gantt.dependencies.noCycle', 'Нельзя создать циклическую зависимость')}</p>
          </div>
        </div>
      ),
    },
    {
      title: t('help.gantt.baseline.title', 'Базовый план (Baseline)'),
      icon: <Pin size={20} />,
      iconColor: 'text-slate-600',
      iconBg: 'bg-slate-100',
      content: (
        <div className="space-y-2">
          <p><strong>{t('help.gantt.baseline.why', 'Зачем нужен:')}</strong> {t('help.gantt.baseline.whyDesc', 'Фиксирует исходный график для сравнения с текущим')}</p>
          <p><strong>{t('help.gantt.baseline.how', 'Как создать:')}</strong> {t('help.gantt.baseline.howDesc', 'Кнопка "Зафиксировать план" (иконка Pin) → менеджер базовых планов')}</p>
          <p><strong>{t('help.gantt.baseline.visual', 'Визуализация:')}</strong> {t('help.gantt.baseline.visualDesc', 'Серые полоски под текущими задачами показывают исходные сроки')}</p>
          <p><strong>{t('help.gantt.baseline.deviation', 'Отклонения:')}</strong> {t('help.gantt.baseline.deviationDesc', 'В тултипе отображается разница в днях (например, "[+3д]")')}</p>
        </div>
      ),
    },
    {
      title: t('help.gantt.colorModes.title', 'Режимы раскраски'),
      icon: <Palette size={20} />,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50',
      content: (
        <div className="space-y-2">
          <p><strong>{t('help.gantt.colorModes.single', 'Единый цвет:')}</strong> {t('help.gantt.colorModes.singleDesc', 'Все задачи в выбранном вами цвете (настройки → Цвет задач)')}</p>
          <p><strong>{t('help.gantt.colorModes.rainbow', 'Радуга:')}</strong> {t('help.gantt.colorModes.rainbowDesc', 'Каждая задача получает уникальный цвет на основе ID')}</p>
          <p><strong>{t('help.gantt.colorModes.status', 'По статусу:')}</strong> {t('help.gantt.colorModes.statusDesc', 'Серый (не начато) → Жёлтый (начато) → Синий (в процессе) → Зелёный (завершено)')}</p>
        </div>
      ),
    },
    {
      title: t('help.gantt.calendar.title', 'Календарные конфликты'),
      icon: <CalendarX size={20} />,
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-50',
      content: (
        <div className="space-y-2">
          <p>{t('help.gantt.calendar.conflict', 'Если задача назначена на выходной день по календарю ресурса, появится предупреждение.')}</p>
          <p className="text-xs italic">{t('help.gantt.calendar.example', 'Пример: Задача на субботу, но у ресурса "Иван" 5-дневная рабочая неделя')}</p>
          <p>{t('help.gantt.calendar.calculation', 'Система учитывает рабочие календари при расчёте длительности.')}</p>
        </div>
      ),
    },
  ],
})
