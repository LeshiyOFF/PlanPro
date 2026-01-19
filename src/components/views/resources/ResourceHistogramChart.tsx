import React from 'react';
import { IResourceHistogramData } from '@/domain/resources/interfaces/IResourceHistogram';

interface ResourceHistogramChartProps {
  data: IResourceHistogramData;
  height?: number;
}

/**
 * Визуальный компонент гистограммы загрузки ресурса (SVG)
 */
export const ResourceHistogramChart: React.FC<ResourceHistogramChartProps> = ({ 
  data, 
  height = 200 
}) => {
  const chartWidth = 800;
  const padding = 40;
  const barWidth = (chartWidth - padding * 2) / data.days.length;
  
  // Максимальное значение для масштабирования (минимум 100%)
  const maxVal = Math.max(1.5, ...data.days.map(d => Math.max(d.workloadPercent, d.maxCapacityPercent)));

  const getY = (percent: number) => {
    return height - padding - (percent / maxVal) * (height - padding * 2);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg border overflow-x-auto transition-all soft-border">
      <h4 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-tight">
        Гистограмма загрузки: {data.resourceName}
      </h4>
      
      <svg width={chartWidth} height={height} className="overflow-visible">
        {/* Сетка и оси */}
        <line x1={padding} y1={height - padding} x2={chartWidth - padding} y2={height - padding} stroke="#cbd5e1" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#cbd5e1" />
        
        {/* Линия 100% мощности */}
        <line 
          x1={padding} 
          y1={getY(1.0)} 
          x2={chartWidth - padding} 
          y2={getY(1.0)} 
          stroke="#94a3b8" 
          strokeDasharray="4 2" 
        />
        <text x={padding - 5} y={getY(1.0)} textAnchor="end" className="text-[10px] fill-slate-400">100%</text>

        {/* Бары загрузки */}
        {data.days.map((day, i) => {
          const x = padding + i * barWidth;
          const barHeight = (day.workloadPercent / maxVal) * (height - padding * 2);
          const isOverloaded = day.isOverloaded;
          
          return (
            <g key={i}>
              <rect
                x={x + 2}
                y={getY(day.workloadPercent)}
                width={barWidth - 4}
                height={Math.max(2, barHeight)}
                fill={isOverloaded ? '#ef4444' : 'hsl(var(--primary))'}
                className="transition-all hover:opacity-80"
              />
              {/* Дата снизу (каждый 5-й день для чистоты) */}
              {i % 5 === 0 && (
                <text 
                  x={x + barWidth / 2} 
                  y={height - padding + 15} 
                  textAnchor="middle" 
                  className="text-[9px] fill-slate-500"
                >
                  {day.date.getDate()}.{(day.date.getMonth() + 1).toString().padStart(2, '0')}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      
      <div className="mt-4 flex gap-4 text-[10px] text-slate-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[hsl(var(--primary))] rounded-sm"></div> Нормальная загрузка
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#ef4444] rounded-sm"></div> Перегрузка
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 border border-slate-400 border-dashed rounded-sm"></div> Предел мощности
        </div>
      </div>
    </div>
  );
};

