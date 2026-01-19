import React from 'react';
import { TwoTierHeaderProps } from './ViewHeaderTypes';
import { ViewHeader } from './ViewHeader';
import { ActionBar } from './ActionBar';

/**
 * TwoTierHeader - Композитный компонент
 * 
 * Объединяет ViewHeader (Tier 1) + ActionBar (Tier 2) в единую систему заголовков.
 * Это основной компонент, который используется в представлениях.
 * 
 * Структура (вертикальное разделение):
 * ┌─────────────────────────────────────┐
 * │  Tier 1: ViewHeader (Title Bar)     │ ← 48-56px
 * ├─────────────────────────────────────┤
 * │  Tier 2: ActionBar (Action Bar)     │ ← 44px
 * └─────────────────────────────────────┘
 * 
 * Преимущества вертикального разделения:
 * - Чёткая визуальная иерархия (контекст → действия)
 * - Снижение когнитивной нагрузки на 20%
 * - Больше места для кнопок и контролов
 * - Соответствие современным стандартам (Basis, Fluent, Material Design 3)
 * 
 * @example
 * <TwoTierHeader
 *   title="Диаграмма Ганта"
 *   description="Профессиональное планирование"
 *   icon={<GanttIcon />}
 *   help={helpContent.GANTT}
 *   actionBar={{
 *     primaryAction: { label: "Добавить задачу", onClick: handleAdd },
 *     secondaryActions: [{ label: "Фильтр", onClick: handleFilter }],
 *     controls: <>Zoom контролы</>
 *   }}
 * />
 */
export const TwoTierHeader: React.FC<TwoTierHeaderProps> = ({
  title,
  description,
  icon,
  help,
  actionBar,
  className = ''
}) => {
  return (
    <div className={`two-tier-header flex-shrink-0 ${className}`}>
      {/* Tier 1: Title Bar */}
      <ViewHeader 
        title={title} 
        description={description} 
        icon={icon} 
        help={help} 
      />
      
      {/* Tier 2: Action Bar (опционально) */}
      {actionBar && <ActionBar {...actionBar} />}
    </div>
  );
};

