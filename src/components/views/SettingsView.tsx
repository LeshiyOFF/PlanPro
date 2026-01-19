import React from 'react';
import { useTranslation } from 'react-i18next';
import { UserPreferencesContainer } from '@/components/userpreferences';
import { TwoTierHeader } from '@/components/layout/ViewHeader';
import { useHelpContent } from '@/hooks/useHelpContent';
import { ViewType } from '@/types/ViewTypes';
import { Settings, Download, Upload } from 'lucide-react';

/**
 * SettingsView - Настройки приложения
 * 
 * Полный интерфейс пользовательских настроек и предпочтений.
 * Использует TwoTierHeader для визуальной консистентности (Этап 7.23).
 * 
 * @version 8.13
 */
export const SettingsViewComponent: React.FC<{ viewType?: ViewType }> = ({ 
  viewType = ViewType.SETTINGS 
}) => {
  const { t } = useTranslation();
  const helpContent = useHelpContent();

  const handleImport = () => {
    // TODO: Реализовать импорт настроек
    console.log("Import settings...");
  };

  const handleExport = () => {
    // TODO: Реализовать экспорт настроек
    console.log("Export settings...");
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Two-Tier Header: Заголовок + Панель действий */}
      <TwoTierHeader
        title={t('navigation.settings')}
        description={t('descriptions.settings')}
        icon={<Settings className="w-6 h-6" />}
        help={helpContent.SETTINGS}
        actionBar={{
          secondaryActions: [
            {
              label: t('common.import') || 'Импорт',
              onClick: handleImport,
              icon: <Upload className="w-4 h-4" />,
              variant: 'outline'
            },
            {
              label: t('common.export') || 'Экспорт',
              onClick: handleExport,
              icon: <Download className="w-4 h-4" />,
              variant: 'outline'
            }
          ]
        }}
      />

      {/* Основной контент: UserPreferencesContainer */}
      <div className="flex-1 overflow-hidden p-6">
        <div className="h-full bg-white rounded-xl shadow-lg border overflow-hidden soft-border">
          <UserPreferencesContainer />
        </div>
      </div>
    </div>
  );
};

