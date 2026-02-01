import React, { memo } from 'react';
import { SafeTooltip, TooltipProvider } from '@/components/ui/tooltip';

/**
 * Доступные цветовые схемы для карточки статистики
 */
export type StatsCardColorScheme = 'primary' | 'green' | 'amber' | 'slate' | 'red';

/**
 * Пропсы для универсальной карточки статистики
 */
export interface UsageStatsCardProps {
  /** Заголовок карточки */
  title: string;
  /** Числовое значение для отображения */
  value: number;
  /** Текст подсказки при наведении */
  tooltip: string;
  /** Цветовая схема карточки */
  colorScheme: StatsCardColorScheme;
  /** Дополнительные CSS классы */
  className?: string;
  /** Опциональный форматтер для значения */
  formatValue?: (value: number) => string | number;
}

/**
 * Карты стилей для каждой цветовой схемы
 */
const COLOR_CLASSES: Record<StatsCardColorScheme, { bg: string; title: string; value: string }> = {
  primary: {
    bg: 'bg-primary/5',
    title: 'text-primary',
    value: 'text-primary'
  },
  green: {
    bg: 'bg-green-50/30',
    title: 'text-green-700',
    value: 'text-green-600'
  },
  amber: {
    bg: 'bg-amber-50/30',
    title: 'text-amber-700',
    value: 'text-amber-600'
  },
  slate: {
    bg: 'bg-slate-50/30',
    title: 'text-slate-700',
    value: 'text-slate-600'
  },
  red: {
    bg: 'bg-red-50/30',
    title: 'text-red-700',
    value: 'text-red-600'
  }
};

/**
 * UsageStatsCard - Универсальная карточка статистики с tooltip.
 * 
 * Переиспользуемый компонент для отображения метрик как в TaskUsageView,
 * так и в ResourceUsageView. Следует принципу DRY.
 * 
 * @example
 * ```tsx
 * <UsageStatsCard
 *   title="Активные задачи"
 *   value={42}
 *   tooltip="Общее количество задач в проекте"
 *   colorScheme="primary"
 * />
 * ```
 */
export const UsageStatsCard: React.FC<UsageStatsCardProps> = memo(({
  title,
  value,
  tooltip,
  colorScheme,
  className = '',
  formatValue
}) => {
  const colors = COLOR_CLASSES[colorScheme];
  const displayValue = formatValue ? formatValue(value) : value;

  return (
    <TooltipProvider>
      <SafeTooltip 
        content={
          <div className="max-w-xs p-1">
            <p className="text-sm whitespace-pre-line">{tooltip}</p>
          </div>
        }
        side="bottom"
        delayDuration={300}
      >
        <div 
          className={`
            stat-card border rounded-lg p-4 shadow-sm soft-border 
            cursor-help transition-all hover:shadow-md
            ${colors.bg} ${className}
          `.trim()}
        >
          <h3 className={`font-medium ${colors.title} text-sm`}>{title}</h3>
          <p className={`text-2xl font-bold ${colors.value}`}>{displayValue}</p>
        </div>
      </SafeTooltip>
    </TooltipProvider>
  );
});

UsageStatsCard.displayName = 'UsageStatsCard';
