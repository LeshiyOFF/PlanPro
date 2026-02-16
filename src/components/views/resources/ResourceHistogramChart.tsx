import React from 'react'
import { useTranslation } from 'react-i18next'
import { IResourceHistogramData } from '@/domain/resources/interfaces/IResourceHistogram'
import { BarChart3 } from 'lucide-react'
import { SafeTooltip, TooltipProvider } from '@/components/ui/tooltip'

interface ResourceHistogramChartProps {
  data: IResourceHistogramData;
  height?: number;
}

/**
 * Визуальный компонент гистограммы загрузки ресурса (SVG)
 */
export const ResourceHistogramChart: React.FC<ResourceHistogramChartProps> = ({
  data,
  height = 200,
}) => {
  const { t } = useTranslation()
  const chartWidth = 800
  const padding = 40

  // Защита от деления на 0
  const daysCount = data.days.length || 1
  const barWidth = (chartWidth - padding * 2) / daysCount

  // Проверяем, есть ли реальная загрузка
  const hasWorkload = data.days.some(d => d.workloadPercent > 0)

  // Максимальное значение для масштабирования (минимум 100%)
  const maxVal = Math.max(1.5, ...data.days.map(d => Math.max(d.workloadPercent, d.maxCapacityPercent)))
  // Фактический лимит мощности по данным (для линии и подписи)
  const limitPercent = data.days.length > 0
    ? Math.max(...data.days.map(d => d.maxCapacityPercent), 1)
    : 1

  const getY = (percent: number) => {
    return height - padding - (percent / maxVal) * (height - padding * 2)
  }

  // Подписи оси Y: 100%, 150%, 200% и т.д. до maxVal (без дублирования подписи линии лимита)
  const yAxisLabels: number[] = []
  for (let p = 1; p <= Math.ceil(maxVal * 100) / 100; p += 0.5) {
    if (p <= maxVal && Math.abs(p - limitPercent) > 0.01) yAxisLabels.push(p)
  }
  if (yAxisLabels.length === 0 || yAxisLabels[yAxisLabels.length - 1] < maxVal) {
    const top = Math.ceil(maxVal * 100) / 100
    if (Math.abs(top - limitPercent) > 0.01) yAxisLabels.push(top)
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg border overflow-x-auto transition-all soft-border">
      <h4 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-tight">
        {t('sheets.histogram_title', { defaultValue: 'Гистограмма загрузки' })}: {data.resourceName}
      </h4>

      {!hasWorkload || data.days.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <BarChart3 className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm font-medium">
            {t('sheets.no_workload', { defaultValue: 'Нет назначений для этого ресурса' })}
          </p>
          <p className="text-xs mt-1">
            {t('sheets.no_workload_hint', { defaultValue: 'Назначьте ресурс на задачи, чтобы увидеть нагрузку' })}
          </p>
        </div>
      ) : (
        <>
          <svg width={chartWidth} height={height} className="overflow-visible">
            {/* Сетка и оси */}
            <line x1={padding} y1={height - padding} x2={chartWidth - padding} y2={height - padding} stroke="#cbd5e1" />
            <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#cbd5e1" />

            {/* Линия лимита мощности (по maxCapacityPercent) */}
            <line
              x1={padding} y1={getY(limitPercent)} x2={chartWidth - padding} y2={getY(limitPercent)}
              stroke="#94a3b8" strokeDasharray="4 2"
            />
            <text x={padding - 5} y={getY(limitPercent)} textAnchor="end" className="text-[10px] fill-slate-400">
              {Math.round(limitPercent * 100)}%
            </text>
            {/* Подписи оси Y (100%, 150%, 200% при перегрузке) */}
            {yAxisLabels.map((p) => (
              <text key={p} x={padding - 5} y={getY(p)} textAnchor="end" className="text-[10px] fill-slate-400">
                {Math.round(p * 100)}%
              </text>
            ))}

            {/* Бары загрузки */}
            {data.days.map((day, i) => {
              const x = padding + i * barWidth
              const barHeight = (day.workloadPercent / maxVal) * (height - padding * 2)
              const isOverloaded = day.isOverloaded

              return (
                <g key={i}>
                  <rect
                    x={x + 2} y={getY(day.workloadPercent)}
                    width={Math.max(1, barWidth - 4)} height={Math.max(2, barHeight)}
                    fill={isOverloaded ? '#ef4444' : 'hsl(var(--primary))'}
                    className="transition-all hover:opacity-80"
                  />
                  {/* Дата снизу (каждый 5-й день для чистоты) */}
                  {i % 5 === 0 && (
                    <text x={x + barWidth / 2} y={height - padding + 15} textAnchor="middle" className="text-[9px] fill-slate-500">
                      {day.date.getDate()}.{(day.date.getMonth() + 1).toString().padStart(2, '0')}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>

          <TooltipProvider>
            <div className="mt-4 flex gap-4 text-[10px] text-slate-500">
              <SafeTooltip
                content={
                  <div className="max-w-sm p-2">
                    <p className="text-sm whitespace-pre-line">
                      {t('sheets.normal_load_tooltip')}
                    </p>
                  </div>
                }
                side="top"
                delayDuration={200}
              >
                <div className="flex items-center gap-1 cursor-help hover:opacity-70 transition-opacity">
                  <div className="w-3 h-3 bg-[hsl(var(--primary))] rounded-sm"></div>
                  {t('sheets.normal_load', { defaultValue: 'Нормальная загрузка' })}
                </div>
              </SafeTooltip>

              <SafeTooltip
                content={
                  <div className="max-w-sm p-2">
                    <p className="text-sm whitespace-pre-line">
                      {t('sheets.overload_tooltip')}
                    </p>
                  </div>
                }
                side="top"
                delayDuration={200}
              >
                <div className="flex items-center gap-1 cursor-help hover:opacity-70 transition-opacity">
                  <div className="w-3 h-3 bg-[#ef4444] rounded-sm"></div>
                  {t('sheets.overload', { defaultValue: 'Перегрузка' })}
                </div>
              </SafeTooltip>

              <SafeTooltip
                content={
                  <div className="max-w-sm p-2">
                    <p className="text-sm whitespace-pre-line">
                      {t('sheets.capacity_limit_tooltip')}
                    </p>
                  </div>
                }
                side="top"
                delayDuration={200}
              >
                <div className="flex items-center gap-1 cursor-help hover:opacity-70 transition-opacity">
                  <div className="w-3 h-3 border border-slate-400 border-dashed rounded-sm"></div>
                  {t('sheets.capacity_limit', { defaultValue: 'Предел мощности' })}
                </div>
              </SafeTooltip>
            </div>
          </TooltipProvider>
        </>
      )}
    </div>
  )
}


