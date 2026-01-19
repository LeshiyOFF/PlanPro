import React from 'react';
import { ViewType, ViewSettings } from '@/types/ViewTypes';
import { WBSView } from './WBSView';

/**
 * WBS (Work Breakdown Structure) компонент-обертка
 */
export const WBSViewComponent: React.FC<{ viewType: ViewType; settings?: Partial<ViewSettings> }> = ({ 
  viewType, 
  settings 
}) => {
  return <WBSView />;
};


