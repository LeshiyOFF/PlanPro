import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select' // Используется в других вкладках
import { useUserPreferences } from '@/components/userpreferences/hooks/useUserPreferences'
import { IGanttPreferences } from '@/components/userpreferences/interfaces/UserPreferencesInterfaces'

interface GanttSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GanttSettingsDialog: React.FC<GanttSettingsDialogProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation()
  const { preferences, updateGanttPreferences, updateEditingPreferences } = useUserPreferences()
  const ganttPrefs = preferences.gantt

  const handleUpdate = (updates: Partial<IGanttPreferences>) => {
    updateGanttPreferences(updates)
    
    // Синхронизация: при изменении showArrows обновляем editing.showDependencies
    if ('showArrows' in updates && updates.showArrows !== undefined) {
      updateEditingPreferences({ showDependencies: updates.showArrows })
    }
  }

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
            {/* VB.11: Опция для показа задач с отрицательным slack */}
            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1 pr-4">
                <Label htmlFor="showNegativeSlack">{t('gantt.show_negative_slack', { defaultValue: 'Подсвечивать просроченные задачи' })}</Label>
                <p className="text-xs text-slate-500">{t('gantt.show_negative_slack_hint', { defaultValue: 'Отображает задачи с отрицательным резервом (totalSlack < 0) оранжевым цветом' })}</p>
              </div>
              <Switch id="showNegativeSlack" checked={ganttPrefs.showNegativeSlack ?? false} onCheckedChange={(val: boolean) => handleUpdate({ showNegativeSlack: val })} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>{t('gantt.row_height', { defaultValue: 'Высота строки' })}</Label>
                <span className="text-xs text-muted-foreground">{ganttPrefs.rowHeight}px</span>
              </div>
              <Slider value={[ganttPrefs.rowHeight]} min={30} max={80} step={5} onValueChange={([val]: number[]) => handleUpdate({ rowHeight: val })} />
            </div>
          </TabsContent>

          <TabsContent value="colors" className="space-y-5 py-4">
            {/* GANTT-COLORS-FIX v3: Полноценная палитра для выбора цвета задач */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">{t('gantt.task_color', { defaultValue: 'Цвет задач' })}</Label>
              
              {/* Color picker + HEX код */}
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={ganttPrefs.accentColor || '#3b82f6'}
                  onChange={(e) => handleUpdate({ accentColor: e.target.value, coloringMode: 'single' })}
                  className="h-12 w-20 cursor-pointer rounded-xl border border-slate-200 bg-transparent p-1 transition-all hover:scale-105"
                />
                <span className="text-sm text-muted-foreground font-mono uppercase tracking-wide">
                  {ganttPrefs.accentColor || '#3b82f6'}
                </span>
              </div>

              {/* Пресеты цветов как в настройках программы */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  {t('gantt.color_presets', { defaultValue: 'Пресеты' })}
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: t('gantt.color_blue', { defaultValue: 'Синий' }), color: '#3b82f6' },
                    { name: t('gantt.color_sky', { defaultValue: 'Небесный' }), color: '#0ea5e9' },
                    { name: t('gantt.color_cyan', { defaultValue: 'Голубой' }), color: '#06b6d4' },
                    { name: t('gantt.color_teal', { defaultValue: 'Бирюзовый' }), color: '#14b8a6' },
                    { name: t('gantt.color_emerald', { defaultValue: 'Изумрудный' }), color: '#10b981' },
                    { name: t('gantt.color_green', { defaultValue: 'Зелёный' }), color: '#22c55e' },
                    { name: t('gantt.color_lime', { defaultValue: 'Лаймовый' }), color: '#84cc16' },
                    { name: t('gantt.color_yellow', { defaultValue: 'Жёлтый' }), color: '#eab308' },
                    { name: t('gantt.color_amber', { defaultValue: 'Янтарный' }), color: '#f59e0b' },
                    { name: t('gantt.color_orange', { defaultValue: 'Оранжевый' }), color: '#f97316' },
                    { name: t('gantt.color_red', { defaultValue: 'Красный' }), color: '#ef4444' },
                    { name: t('gantt.color_rose', { defaultValue: 'Розовый' }), color: '#f43f5e' },
                    { name: t('gantt.color_pink', { defaultValue: 'Малиновый' }), color: '#ec4899' },
                    { name: t('gantt.color_fuchsia', { defaultValue: 'Фуксия' }), color: '#d946ef' },
                    { name: t('gantt.color_purple', { defaultValue: 'Фиолетовый' }), color: '#a855f7' },
                    { name: t('gantt.color_violet', { defaultValue: 'Индиго' }), color: '#8b5cf6' },
                    { name: t('gantt.color_indigo', { defaultValue: 'Тёмно-синий' }), color: '#6366f1' },
                    { name: t('gantt.color_slate', { defaultValue: 'Графит' }), color: '#64748b' },
                  ].map((preset) => (
                    <button
                      key={preset.color}
                      type="button"
                      onClick={() => handleUpdate({ accentColor: preset.color, coloringMode: 'single' })}
                      className={`group relative w-8 h-8 rounded-full border transition-all hover:scale-110 ${
                        ganttPrefs.coloringMode === 'single' && ganttPrefs.accentColor === preset.color
                          ? 'ring-2 ring-offset-2 ring-slate-400 scale-110 border-slate-400'
                          : 'border-slate-200 opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: preset.color }}
                      title={preset.name}
                    >
                      {ganttPrefs.coloringMode === 'single' && ganttPrefs.accentColor === preset.color && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Специальные режимы раскраски */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  {t('gantt.special_modes', { defaultValue: 'Специальные режимы' })}
                </span>
                
                <div className="flex flex-col gap-2">
                  {/* Режим "Радуга" */}
                  <button
                    type="button"
                    onClick={() => handleUpdate({ coloringMode: 'rainbow' })}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      ganttPrefs.coloringMode === 'rainbow'
                        ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {/* Градиентный индикатор радуги */}
                    <div 
                      className="w-8 h-8 rounded-full border border-slate-200"
                      style={{ background: 'conic-gradient(from 0deg, #ef4444, #f59e0b, #22c55e, #06b6d4, #3b82f6, #8b5cf6, #ec4899, #ef4444)' }}
                    />
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">{t('gantt.color_rainbow', { defaultValue: 'Радуга' })}</div>
                      <div className="text-xs text-muted-foreground">{t('gantt.color_rainbow_desc', { defaultValue: 'Каждая задача получает уникальный цвет' })}</div>
                    </div>
                    {ganttPrefs.coloringMode === 'rainbow' && (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>

                  {/* Режим "По статусу" */}
                  <button
                    type="button"
                    onClick={() => handleUpdate({ coloringMode: 'status' })}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      ganttPrefs.coloringMode === 'status'
                        ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {/* Индикатор статусов */}
                    <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center overflow-hidden">
                      <div className="flex flex-col w-full">
                        <div className="h-2 bg-slate-400" />
                        <div className="h-2 bg-amber-500" />
                        <div className="h-2 bg-blue-500" />
                        <div className="h-2 bg-emerald-500" />
                      </div>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">{t('gantt.color_status', { defaultValue: 'По статусу' })}</div>
                      <div className="text-xs text-muted-foreground">{t('gantt.color_status_desc', { defaultValue: 'Цвет зависит от прогресса выполнения' })}</div>
                    </div>
                    {ganttPrefs.coloringMode === 'status' && (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Разделитель */}
            <div className="border-t border-slate-200" />

            {/* Суммарные задачи */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">{t('gantt.summary_tasks', { defaultValue: 'Суммарные задачи' })}</Label>
              
              <div className="flex flex-col gap-2">
                {/* Единый цвет для суммарных */}
                <button
                  type="button"
                  onClick={() => handleUpdate({ summaryColoringMode: 'single' })}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    ganttPrefs.summaryColoringMode === 'single'
                      ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div 
                    className="w-8 h-8 rounded-full border border-slate-200"
                    style={{ backgroundColor: ganttPrefs.summaryColor || '#1e293b' }}
                  />
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">{t('gantt.summary_single', { defaultValue: 'Единый цвет' })}</div>
                  </div>
                  {ganttPrefs.summaryColoringMode === 'single' && (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>

                {/* Автоматический цвет */}
                <button
                  type="button"
                  onClick={() => handleUpdate({ summaryColoringMode: 'auto' })}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    ganttPrefs.summaryColoringMode === 'auto'
                      ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div 
                    className="w-8 h-8 rounded-full border border-slate-200"
                    style={{ background: 'conic-gradient(from 0deg, #ef4444, #f59e0b, #22c55e, #06b6d4, #3b82f6, #8b5cf6, #ec4899, #ef4444)' }}
                  />
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">{t('gantt.summary_auto', { defaultValue: 'Автоматически' })}</div>
                    <div className="text-xs text-muted-foreground">{t('gantt.summary_auto_desc', { defaultValue: 'Уникальный цвет для каждой группы' })}</div>
                  </div>
                  {ganttPrefs.summaryColoringMode === 'auto' && (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              </div>

              {/* Color picker для суммарных задач */}
              {ganttPrefs.summaryColoringMode === 'single' && (
                <div className="flex items-center gap-3 pl-2">
                  <input
                    type="color"
                    value={ganttPrefs.summaryColor || '#1e293b'}
                    onChange={(e) => handleUpdate({ summaryColor: e.target.value })}
                    className="h-10 w-16 cursor-pointer rounded-xl border border-slate-200 bg-transparent p-1 transition-all hover:scale-105"
                  />
                  <span className="text-xs text-muted-foreground font-mono uppercase">
                    {ganttPrefs.summaryColor || '#1e293b'}
                  </span>
                  {/* Быстрые пресеты для суммарных */}
                  <div className="flex gap-1.5 ml-auto">
                    {[
                      { color: '#1e293b', name: 'Тёмный' },
                      { color: '#334155', name: 'Серый' },
                      { color: '#0f172a', name: 'Чёрный' },
                      { color: '#1e40af', name: 'Синий' },
                      { color: '#166534', name: 'Зелёный' },
                    ].map((preset) => (
                      <button
                        key={preset.color}
                        type="button"
                        onClick={() => handleUpdate({ summaryColor: preset.color })}
                        className={`w-6 h-6 rounded-full border transition-all hover:scale-110 ${
                          ganttPrefs.summaryColor === preset.color
                            ? 'ring-2 ring-offset-1 ring-slate-400 border-slate-400'
                            : 'border-slate-200'
                        }`}
                        style={{ backgroundColor: preset.color }}
                        title={preset.name}
                      />
                    ))}
                  </div>
                </div>
              )}
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
  )
}
