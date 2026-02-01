import React from 'react';
import { ViewType, ViewSettings } from '@/types/ViewTypes';
import { TrackingGanttView } from './TrackingGanttView';

/**
 * Tracking Gantt компонент (обертка)
 * Реализует режим сравнения Baseline vs Current
 */
export const TrackingGanttViewComponent: React.FC<{ viewType: ViewType; settings?: Partial<ViewSettings> }> = () => {
  return <TrackingGanttView />;
};


