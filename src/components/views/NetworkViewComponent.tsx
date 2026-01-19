import React from 'react';
import { ViewType, ViewSettings } from '@/types/ViewTypes';
import { NetworkView } from './NetworkView';

/**
 * Network View компонент (обертка)
 * Использует новую Canvas-based сетевую диаграмму
 */
export const NetworkViewComponent: React.FC<{ viewType: ViewType; settings?: Partial<ViewSettings> }> = ({ 
  viewType, 
  settings 
}) => {
  // Делегируем отрисовку новому компоненту NetworkView
  return <NetworkView />;
};
