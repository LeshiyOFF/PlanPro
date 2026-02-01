import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserPreferences } from '@/components/userpreferences/hooks/useUserPreferences';
import { IGanttPreferences } from '@/components/userpreferences/interfaces/UserPreferencesInterfaces';

interface GanttSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GanttSettingsDialog: React.FC<GanttSettingsDialogProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { preferences, updateGanttPreferences } = useUserPreferences();
  const ganttPrefs = preferences.gantt;

  const handleUpdate = (updates: Partial<IGanttPreferences>) => {
    updateGanttPreferences(updates);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('gantt.settings_title', { defaultValue: 'Настройки диаграммы Ганта' })}</DialogTitle>
          <DialogDescription className="sr-only">
            {t('gantt.settings_description', { defaultValue: 'Конфигурация внешнего вида и отображения диаграммы Ганта' })}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="visual" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="visual">{t('gantt.settings_visual', { defaultValue: 'Вид' })}</TabsTrigger>
            <TabsTrigger value="colors">{t('gantt.settings_colors', { defaultValue: 'Цвета' })}</TabsTrigger>
            <TabsTrigger value="labels">{t('gantt.settings_labels', { defaultValue: 'Подписи' })}</TabsTrigger>
          </TabsList>

          <TabsContent value="visual" className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="showArrows">{t('gantt.show_arrows', { defaultValue: 'Отображать связи (стрелки)' })}</Label>
              <Switch id="showArrows" checked={ganttPrefs.showArrows} onCheckedChange={(val: boolean) => handleUpdate({ showArrows: val })} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="showGrid">{t('gantt.show_grid', { defaultValue: 'Отображать сетку' })}</Label>
              <Switch id="showGrid" checked={ganttPrefs.showGridlines} onCheckedChange={(val: boolean) => handleUpdate({ showGridlines: val })} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="highlightWeekends">{t('gantt.highlight_weekends', { defaultValue: 'Выделять выходные' })}</Label>
              <Switch id="highlightWeekends" checked={ganttPrefs.highlightWeekends} onCheckedChange={(val: boolean) => handleUpdate({ highlightWeekends: val })} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="showDeltas">{t('gantt.show_deltas', { defaultValue: 'Показывать отклонения в названиях' })}</Label>
              <Switch id="showDeltas" checked={ganttPrefs.showDeltasInLabels} onCheckedChange={(val: boolean) => handleUpdate({ showDeltasInLabels: val })} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>{t('gantt.row_height', { defaultValue: 'Высота строки' })}</Label>
                <span className="text-xs text-muted-foreground">{ganttPrefs.rowHeight}px</span>
              </div>
              <Slider value={[ganttPrefs.rowHeight]} min={30} max={80} step={5} onValueChange={([val]: number[]) => handleUpdate({ rowHeight: val })} />
            </div>
          </TabsContent>

          <TabsContent value="colors" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('gantt.task_coloring', { defaultValue: 'Режим раскраски задач' })}</Label>
              <Select value={ganttPrefs.coloringMode} onValueChange={(val: string) => handleUpdate({ coloringMode: val as 'single' | 'rainbow' | 'status' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">{t('gantt.color_single', { defaultValue: 'Единый цвет' })}</SelectItem>
                  <SelectItem value="rainbow">{t('gantt.color_rainbow', { defaultValue: 'Радуга (по ID)' })}</SelectItem>
                  <SelectItem value="status">{t('gantt.color_status', { defaultValue: 'По статусу' })}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('gantt.summary_coloring', { defaultValue: 'Режим раскраски суммарных задач' })}</Label>
              <Select value={ganttPrefs.summaryColoringMode} onValueChange={(val: string) => handleUpdate({ summaryColoringMode: val as 'single' | 'auto' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">{t('gantt.color_single', { defaultValue: 'Единый цвет' })}</SelectItem>
                  <SelectItem value="auto">{t('gantt.color_auto', { defaultValue: 'Автоматически' })}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="labels" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('gantt.label_mode', { defaultValue: 'Подписи у полосок' })}</Label>
              <Select value={ganttPrefs.labelMode} onValueChange={(val: string) => handleUpdate({ labelMode: val as 'none' | 'name' | 'resource' | 'dates' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('gantt.label_none', { defaultValue: 'Нет' })}</SelectItem>
                  <SelectItem value="name">{t('gantt.label_name', { defaultValue: 'Название' })}</SelectItem>
                  <SelectItem value="resource">{t('gantt.label_resource', { defaultValue: 'Ресурсы' })}</SelectItem>
                  <SelectItem value="dates">{t('gantt.label_dates', { defaultValue: 'Даты' })}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={onClose}>{t('common.close', { defaultValue: 'Закрыть' })}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
