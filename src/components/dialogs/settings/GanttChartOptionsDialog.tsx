import React from 'react';
import { BaseDialog, BaseDialogProps } from '../base/SimpleBaseDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDialogValidation } from '../hooks/useDialogValidation';

export interface GanttChartOptions {
  display: {
    timescale: 'days' | 'weeks' | 'months' | 'quarters';
    showGridlines: boolean;
    showProgress: boolean;
    showMilestones: boolean;
    showDependencies: boolean;
    showCriticalPath: boolean;
    showSlack: boolean;
    showBaseline: boolean;
  };
  colors: {
    criticalTask: string;
    normalTask: string;
    completedTask: string;
    milestone: string;
    dependency: string;
    baseline: string;
    slack: string;
  };
  formatting: {
    barHeight: number;
    fontSize: number;
    dateFormat: string;
    showTaskNames: boolean;
    showTaskIds: boolean;
    showDuration: boolean;
  };
  behavior: {
    enableDragDrop: boolean;
    enableZoom: boolean;
    enablePan: boolean;
    autoFit: boolean;
    snapToGrid: boolean;
  };
}

export interface GanttChartOptionsDialogProps extends Omit<BaseDialogProps, 'children'> {
  currentOptions?: GanttChartOptions;
  onSave?: (options: GanttChartOptions) => void;
  onReset?: () => void;
}

const TIMESCALES = [
  { value: 'days', label: 'Дни' },
  { value: 'weeks', label: 'Недели' },
  { value: 'months', label: 'Месяцы' },
  { value: 'quarters', label: 'Кварталы' }
];

const DATE_FORMATS = [
  { value: 'MM/DD', label: '01/31' },
  { value: 'DD/MM', label: '31/01' },
  { value: 'MM/DD/YY', label: '01/31/24' },
  { value: 'DD/MM/YY', label: '31/01/24' }
];

const PRESET_COLORS = {
  critical: '#FF4444',
  normal: '#4CAF50',
  completed: '#2196F3',
  milestone: '#FF9800',
  dependency: '#9C27B0',
  baseline: '#607D8B',
  slack: '#FFC107'
};

export const GanttChartOptionsDialog: React.FC<GanttChartOptionsDialogProps> = ({
  currentOptions,
  onSave,
  onReset,
  onClose,
  ...props
}) => {
  const [options, setOptions] = React.useState<GanttChartOptions>(
    currentOptions || {
      display: {
        timescale: 'weeks',
        showGridlines: true,
        showProgress: true,
        showMilestones: true,
        showDependencies: true,
        showCriticalPath: true,
        showSlack: false,
        showBaseline: false
      },
      colors: {
        criticalTask: PRESET_COLORS.critical,
        normalTask: PRESET_COLORS.normal,
        completedTask: PRESET_COLORS.completed,
        milestone: PRESET_COLORS.milestone,
        dependency: PRESET_COLORS.dependency,
        baseline: PRESET_COLORS.baseline,
        slack: PRESET_COLORS.slack
      },
      formatting: {
        barHeight: 20,
        fontSize: 12,
        dateFormat: 'MM/DD',
        showTaskNames: true,
        showTaskIds: false,
        showDuration: true
      },
      behavior: {
        enableDragDrop: true,
        enableZoom: true,
        enablePan: true,
        autoFit: true,
        snapToGrid: false
      }
    }
  );

  const { validate, errors, isValid } = useDialogValidation({
    'formatting.barHeight': {
      required: true,
      min: 10,
      max: 50,
      validate: (value) => (value >= 10 && value <= 50) ? null : 'Высота полосы должна быть от 10 до 50'
    },
    'formatting.fontSize': {
      required: true,
      min: 8,
      max: 24,
      validate: (value) => (value >= 8 && value <= 24) ? null : 'Размер шрифта должен быть от 8 до 24'
    }
  });

  React.useEffect(() => {
    if (currentOptions) {
      setOptions(currentOptions);
    }
  }, [currentOptions]);

  React.useEffect(() => {
    validate('formatting.barHeight', options.formatting.barHeight);
    validate('formatting.fontSize', options.formatting.fontSize);
  }, [options.formatting]);

  const handleOptionChange = (category: keyof GanttChartOptions, field: string, value: any) => {
    setOptions(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleColorChange = (field: keyof GanttChartOptions['colors'], value: string) => {
    setOptions(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    if (isValid()) {
      onSave?.(options);
      onClose?.();
    }
  };

  const handleReset = () => {
    onReset?.();
    onClose?.();
  };

  const canSave = isValid();

  return (
    <BaseDialog
      title="Настройки диаграммы Ганта"
      size="fullscreen"
      {...props}
      onClose={onClose}
      footer={
        <div className="flex justify-between">
          <Button variant="destructive" onClick={handleReset}>
            Сбросить настройки
          </Button>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={!canSave}>
              Сохранить
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Display Options */}
        <div className="border rounded-lg p-4">
          <Label className="text-lg font-medium mb-4">Параметры отображения</Label>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timescale">Шкала времени</Label>
              <Select
                value={options.display.timescale}
                onValueChange={(value) => handleOptionChange('display', 'timescale', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMESCALES.map(scale => (
                    <SelectItem key={scale.value} value={scale.value}>
                      {scale.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 grid grid-cols-4 gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showGridlines"
                  checked={options.display.showGridlines}
                  onCheckedChange={(checked) => handleOptionChange('display', 'showGridlines', checked)}
                />
                <Label htmlFor="showGridlines" className="text-sm">Сетка</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showProgress"
                  checked={options.display.showProgress}
                  onCheckedChange={(checked) => handleOptionChange('display', 'showProgress', checked)}
                />
                <Label htmlFor="showProgress" className="text-sm">Прогресс</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showMilestones"
                  checked={options.display.showMilestones}
                  onCheckedChange={(checked) => handleOptionChange('display', 'showMilestones', checked)}
                />
                <Label htmlFor="showMilestones" className="text-sm">Вехи</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showDependencies"
                  checked={options.display.showDependencies}
                  onCheckedChange={(checked) => handleOptionChange('display', 'showDependencies', checked)}
                />
                <Label htmlFor="showDependencies" className="text-sm">Связи</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showCriticalPath"
                  checked={options.display.showCriticalPath}
                  onCheckedChange={(checked) => handleOptionChange('display', 'showCriticalPath', checked)}
                />
                <Label htmlFor="showCriticalPath" className="text-sm">Критический путь</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showSlack"
                  checked={options.display.showSlack}
                  onCheckedChange={(checked) => handleOptionChange('display', 'showSlack', checked)}
                />
                <Label htmlFor="showSlack" className="text-sm">Резерв времени</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showBaseline"
                  checked={options.display.showBaseline}
                  onCheckedChange={(checked) => handleOptionChange('display', 'showBaseline', checked)}
                />
                <Label htmlFor="showBaseline" className="text-sm">Базовый план</Label>
              </div>
            </div>
          </div>
        </div>

        {/* Color Options */}
        <div className="border rounded-lg p-4">
          <Label className="text-lg font-medium mb-4">Цветовая схема</Label>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(options.colors).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key} className="capitalize">
                  {key === 'criticalTask' ? 'Критическая задача' :
                   key === 'normalTask' ? 'Обычная задача' :
                   key === 'completedTask' ? 'Завершенная задача' :
                   key === 'milestone' ? 'Веха' :
                   key === 'dependency' ? 'Связь' :
                   key === 'baseline' ? 'Базовый план' :
                   key === 'slack' ? 'Резерв' : key}
                </Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id={key}
                    type="color"
                    value={value}
                    onChange={(e) => handleColorChange(key as keyof GanttChartOptions['colors'], e.target.value)}
                    className="w-16 h-8 p-1 border rounded"
                  />
                  <Input
                    type="text"
                    value={value}
                    onChange={(e) => handleColorChange(key as keyof GanttChartOptions['colors'], e.target.value)}
                    className="flex-1 text-sm font-mono"
                    placeholder="#000000"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Formatting Options */}
        <div className="border rounded-lg p-4">
          <Label className="text-lg font-medium mb-4">Форматирование</Label>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="barHeight">Высота полосы (px)</Label>
              <Input
                id="barHeight"
                type="number"
                min="10"
                max="50"
                value={options.formatting.barHeight}
                onChange={(e) => handleOptionChange('formatting', 'barHeight', parseInt(e.target.value))}
                className={errors['formatting.barHeight'] ? 'border-red-500' : ''}
              />
              {errors['formatting.barHeight'] && (
                <div className="text-sm text-red-500">{errors['formatting.barHeight']}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fontSize">Размер шрифта (px)</Label>
              <Input
                id="fontSize"
                type="number"
                min="8"
                max="24"
                value={options.formatting.fontSize}
                onChange={(e) => handleOptionChange('formatting', 'fontSize', parseInt(e.target.value))}
                className={errors['formatting.fontSize'] ? 'border-red-500' : ''}
              />
              {errors['formatting.fontSize'] && (
                <div className="text-sm text-red-500">{errors['formatting.fontSize']}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFormat">Формат даты</Label>
              <Select
                value={options.formatting.dateFormat}
                onValueChange={(value) => handleOptionChange('formatting', 'dateFormat', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATE_FORMATS.map(format => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-3 grid grid-cols-3 gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showTaskNames"
                  checked={options.formatting.showTaskNames}
                  onCheckedChange={(checked) => handleOptionChange('formatting', 'showTaskNames', checked)}
                />
                <Label htmlFor="showTaskNames" className="text-sm">Имена задач</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showTaskIds"
                  checked={options.formatting.showTaskIds}
                  onCheckedChange={(checked) => handleOptionChange('formatting', 'showTaskIds', checked)}
                />
                <Label htmlFor="showTaskIds" className="text-sm">ID задач</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showDuration"
                  checked={options.formatting.showDuration}
                  onCheckedChange={(checked) => handleOptionChange('formatting', 'showDuration', checked)}
                />
                <Label htmlFor="showDuration" className="text-sm">Длительность</Label>
              </div>
            </div>
          </div>
        </div>

        {/* Behavior Options */}
        <div className="border rounded-lg p-4">
          <Label className="text-lg font-medium mb-4">Поведение</Label>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enableDragDrop"
                  checked={options.behavior.enableDragDrop}
                  onCheckedChange={(checked) => handleOptionChange('behavior', 'enableDragDrop', checked)}
                />
                <Label htmlFor="enableDragDrop" className="text-sm">Включить Drag & Drop</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enableZoom"
                  checked={options.behavior.enableZoom}
                  onCheckedChange={(checked) => handleOptionChange('behavior', 'enableZoom', checked)}
                />
                <Label htmlFor="enableZoom" className="text-sm">Включить Масштаб</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enablePan"
                  checked={options.behavior.enablePan}
                  onCheckedChange={(checked) => handleOptionChange('behavior', 'enablePan', checked)}
                />
                <Label htmlFor="enablePan" className="text-sm">Включить Панорамирование</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoFit"
                  checked={options.behavior.autoFit}
                  onCheckedChange={(checked) => handleOptionChange('behavior', 'autoFit', checked)}
                />
                <Label htmlFor="autoFit" className="text-sm">Автоматический масштаб</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="snapToGrid"
                  checked={options.behavior.snapToGrid}
                  onCheckedChange={(checked) => handleOptionChange('behavior', 'snapToGrid', checked)}
                />
                <Label htmlFor="snapToGrid" className="text-sm">Привязка к сетке</Label>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="border rounded-lg p-4 bg-muted/30">
          <Label className="text-lg font-medium mb-4">Предпросмотр</Label>
          <div className="text-center py-8">
            <div className="text-sm text-muted-foreground">
              Предварительный просмотр диаграммы Ганта с выбранными параметрами
            </div>
            <div className="mt-4 p-4 border rounded bg-white max-w-2xl mx-auto">
              <div className="flex items-center space-x-4">
                <div className="text-sm font-medium">Пример задачи</div>
                <div className="flex-1">
                  <div 
                    className="h-4 rounded"
                    style={{ 
                      backgroundColor: options.colors.normalTask,
                      height: `${options.formatting.barHeight}px`
                    }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  {options.formatting.showDuration ? '5 дн.' : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseDialog>
  );
};
