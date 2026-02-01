import React from 'react'
import { UsageStatsCard, StatsCardColorScheme } from '@/components/ui/usage-stats-card'

/**
 * Пропсы для карточки статистики ресурсов
 * Использует подмножество цветовых схем: green, primary, red
 */
interface ResourceUsageStatsCardProps {
  title: string;
  value: number;
  tooltip: string;
  colorScheme: Extract<StatsCardColorScheme, 'green' | 'primary' | 'red'>;
}

/**
 * ResourceUsageStatsCard - Карточка статистики для представления использования ресурсов.
 *
 * Обёртка над унифицированным UsageStatsCard для обратной совместимости
 * с существующим ResourceUsageView.
 *
 * @deprecated Рекомендуется использовать UsageStatsCard напрямую
 */
export const ResourceUsageStatsCard: React.FC<ResourceUsageStatsCardProps> = (props) => {
  return <UsageStatsCard {...props} />
}
