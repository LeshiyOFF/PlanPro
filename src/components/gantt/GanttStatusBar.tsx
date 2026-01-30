import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/utils/formatUtils';

interface GanttStatusBarProps {
  viewMode: 'day' | 'week' | 'month';
  tasksCount: number;
  zoomLevel: number;
  currentDate: Date;
  showToday: boolean;
}

export const GanttStatusBar: React.FC<GanttStatusBarProps> = ({
  viewMode,
  tasksCount,
  zoomLevel,
  currentDate,
  showToday
}) => {
  const { t } = useTranslation();

  return (
    <div className="gantt-status flex items-center justify-between px-3 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-600">
      <div className="flex items-center gap-4">
        <span>{t('gantt.view_label')}: {t(`gantt.${viewMode}`)}</span>
        <span>{t('gantt.tasks_count', { count: tasksCount })}</span>
        <span>{t('gantt.zoom_label')}: {Math.round(zoomLevel * 100)}%</span>
        <span>{t('gantt.date_label')}: {formatDate(currentDate)}</span>
      </div>
      
      <div className="flex items-center gap-4">
        <span className={`px-2 py-1 rounded ${showToday ? 'bg-slate-100 text-slate-800' : 'bg-gray-100 text-gray-600'}`}>
          {showToday ? t('gantt.today_on') : t('gantt.today_off')}
        </span>
        <span>{t('gantt.controls_hint')}</span>
      </div>
    </div>
  );
};
