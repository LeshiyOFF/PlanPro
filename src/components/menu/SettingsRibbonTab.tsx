import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Settings, User } from 'lucide-react';
import { useNavigation } from '@/providers/NavigationProvider';
import { ViewType } from '@/types/ViewTypes';

/**
 * Вкладка настроек в Ribbon меню
 */
export const SettingsRibbonTab: React.FC = () => {
  const { t } = useTranslation();
  const { navigateToView } = useNavigation();

  return (
    <div className="flex items-center space-x-1">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-3"
        tooltip={t('ribbon.buttons.app_settings')}
        onClick={() => navigateToView(ViewType.SETTINGS)}
      >
        <Settings className="h-4 w-4" />
        <span className="ml-2">{t('ribbon.tabs.settings')}</span>
      </Button>
    </div>
  );
};
