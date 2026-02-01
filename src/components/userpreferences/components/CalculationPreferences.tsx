import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PreferencesSection } from './PreferencesSection';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { ICalculationPreferences } from '../interfaces/UserPreferencesInterfaces';
import { Duration } from '@/types/Master_Functionality_Catalog';

/**
 * Компонент настроек расчетов
 * Управляет параметрами критического пути и логикой пересчета
 */
export const CalculationPreferences: React.FC = () => {
  const { preferences, updateCalculationPreferences } = useUserPreferences();
  const calcPrefs = preferences.calculations as ICalculationPreferences;

  const handleCriticalSlackValueChange = (value: string) => {
    const val = parseFloat(value) || 0;
    updateCalculationPreferences({ 
      criticalSlack: { ...calcPrefs.criticalSlack, value: val } 
    });
  };

  const handleCriticalSlackUnitChange = (unit: string) => {
    updateCalculationPreferences({ 
      criticalSlack: { ...calcPrefs.criticalSlack, unit: unit as Duration['unit'] } 
    });
  };

  const handleMultipleCriticalPathsChange = (checked: boolean) => {
    updateCalculationPreferences({ calculateMultipleCriticalPaths: checked });
  };

  const handleCriticalSlackLessThanValueChange = (value: string) => {
    const val = parseFloat(value) || 0;
    updateCalculationPreferences({ 
      tasksAreCriticalIfSlackIsLessThan: { ...calcPrefs.tasksAreCriticalIfSlackIsLessThan, value: val } 
    });
  };

  const handleCriticalSlackLessThanUnitChange = (unit: string) => {
    updateCalculationPreferences({ 
      tasksAreCriticalIfSlackIsLessThan: { ...calcPrefs.tasksAreCriticalIfSlackIsLessThan, unit: unit as Duration['unit'] } 
    });
  };

  const handleShowEstimatedChange = (checked: boolean) => {
    updateCalculationPreferences({ showEstimatedDurations: checked });
  };

  return (
    <PreferencesSection
      title="Настройки расчетов"
      description="Параметры определения критического пути и анализа резервов времени"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Считать задачи критическими, если резерв меньше или равен:</Label>
              <div className="flex space-x-2">
                <Input 
                  type="number" 
                  value={calcPrefs.criticalSlack.value}
                  onChange={(e) => handleCriticalSlackValueChange(e.target.value)}
                  className="w-24"
                />
                <Select 
                  value={calcPrefs.criticalSlack.unit} 
                  onValueChange={handleCriticalSlackUnitChange}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutes">Минуты</SelectItem>
                    <SelectItem value="hours">Часы</SelectItem>
                    <SelectItem value="days">Дни</SelectItem>
                    <SelectItem value="weeks">Недели</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="multipleCriticalPaths"
                checked={calcPrefs.calculateMultipleCriticalPaths}
                onCheckedChange={handleMultipleCriticalPathsChange}
              />
              <Label htmlFor="multipleCriticalPaths">Расчет нескольких критических путей</Label>
            </div>

            <div className="space-y-2 pt-2">
              <Label>Считать задачи критическими, если резерв меньше:</Label>
              <div className="flex space-x-2">
                <Input 
                  type="number" 
                  value={calcPrefs.tasksAreCriticalIfSlackIsLessThan?.value || 0}
                  onChange={(e) => handleCriticalSlackLessThanValueChange(e.target.value)}
                  className="w-24 h-8 text-xs"
                />
                <Select 
                  value={calcPrefs.tasksAreCriticalIfSlackIsLessThan?.unit || 'days'} 
                  onValueChange={handleCriticalSlackLessThanUnitChange}
                >
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutes">Минуты</SelectItem>
                    <SelectItem value="hours">Часы</SelectItem>
                    <SelectItem value="days">Дни</SelectItem>
                    <SelectItem value="weeks">Недели</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="showEstimated"
                checked={calcPrefs.showEstimatedDurations}
                onCheckedChange={handleShowEstimatedChange}
              />
              <Label htmlFor="showEstimated">Показывать оценочные длительности (Estimated)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="showActualWork"
                checked={calcPrefs.showActualWork}
                onCheckedChange={(checked) => updateCalculationPreferences({ showActualWork: checked })}
              />
              <Label htmlFor="showActualWork">Отображать фактические трудозатраты</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="showBaselineWork"
                checked={calcPrefs.showBaselineWork}
                onCheckedChange={(checked) => updateCalculationPreferences({ showBaselineWork: checked })}
              />
              <Label htmlFor="showBaselineWork">Отображать базовые трудозатраты</Label>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Критический путь — это последовательность задач, которая определяет дату завершения проекта. 
            Изменение этих параметров мгновенно отразится на визуализации в диаграмме Ганта.
          </p>
        </div>
      </div>
    </PreferencesSection>
  );
};

