import React from 'react'
import { UsageStatsCard, StatsCardColorScheme } from '@/components/ui/usage-stats-card'

/**
 * Пропсы для карточки статистики задач
 * Расширяет базовые цветовые схемы, исключая 'red' (не используется для задач)
 */
interface TaskUsageStatsCardProps {
  title: string;
  value: number;
  tooltip: string;
  colorScheme: Exclude<StatsCardColorScheme, 'red'>;
}

/**
 * TaskUsageStatsCard - Карточка статистики для представления использования задач.
 *
 * Обёртка над унифицированным UsageStatsCard для обратной совместимости
 * с существующим TaskUsageView.
 *
 * @deprecated Рекомендуется использовать UsageStatsCard напрямую
 */
export const TaskUsageStatsCard: React.FC<TaskUsageStatsCardProps> = (props) => {
  return <UsageStatsCard {...props} />
}
