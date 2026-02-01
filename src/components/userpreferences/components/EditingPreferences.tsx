import React, { useCallback, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { PreferencesSection } from './PreferencesSection';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { IEditingPreferences } from '../interfaces/UserPreferencesInterfaces';

/**
 * Компонент настроек редактирования
 */
export const EditingPreferences: React.FC = () => {
  const { preferences, updateEditingPreferences, flush } = useUserPreferences();
  const editingPrefs = preferences.editing as IEditingPreferences;

  // Гарантированное сохранение при закрытии окна
  useEffect(() => {
    return () => {
      flush();
    };
  }, [flush]);

  const handleAutoCalculateChange = useCallback((checked: boolean) => {
    updateEditingPreferences({ autoCalculate: checked });
  }, [updateEditingPreferences]);

  const handleShowDependenciesChange = useCallback((checked: boolean) => {
    updateEditingPreferences({ showDependencies: checked });
  }, [updateEditingPreferences]);

  const handleAllowTaskDeletionChange = useCallback((checked: boolean) => {
    updateEditingPreferences({ allowTaskDeletion: checked });
  }, [updateEditingPreferences]);

  const handleConfirmDeletionsChange = useCallback((checked: boolean) => {
    updateEditingPreferences({ confirmDeletions: checked });
  }, [updateEditingPreferences]);

  const handleAutoLinkTasksChange = useCallback((checked: boolean) => {
    updateEditingPreferences({ autoLinkTasks: checked });
  }, [updateEditingPreferences]);

  const handleSplitTasksEnabledChange = useCallback((checked: boolean) => {
    updateEditingPreferences({ splitTasksEnabled: checked });
  }, [updateEditingPreferences]);

  return (
    <PreferencesSection
      title="Настройки редактирования"
      description="Параметры поведения интерфейса при изменении данных"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="autoCalculate"
            checked={editingPrefs.autoCalculate}
            onCheckedChange={handleAutoCalculateChange}
          />
          <Label htmlFor="autoCalculate">Автоматический пересчет проекта</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="autoLinkTasks"
            checked={editingPrefs.autoLinkTasks}
            onCheckedChange={handleAutoLinkTasksChange}
          />
          <Label htmlFor="autoLinkTasks">Автоматически связывать вставленные задачи</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="showDependencies"
            checked={editingPrefs.showDependencies}
            onCheckedChange={handleShowDependenciesChange}
          />
          <Label htmlFor="showDependencies">Показывать линии зависимостей</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="splitTasksEnabled"
            checked={editingPrefs.splitTasksEnabled}
            onCheckedChange={handleSplitTasksEnabledChange}
          />
          <Label htmlFor="splitTasksEnabled">Разрешить прерывание задач</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="allowTaskDeletion"
            checked={editingPrefs.allowTaskDeletion}
            onCheckedChange={handleAllowTaskDeletionChange}
          />
          <Label htmlFor="allowTaskDeletion">Разрешить удаление задач</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="confirmDeletions"
            checked={editingPrefs.confirmDeletions}
            onCheckedChange={handleConfirmDeletionsChange}
          />
          <Label htmlFor="confirmDeletions">Подтверждать удаление объектов</Label>
        </div>
      </div>
    </PreferencesSection>
  );
};

