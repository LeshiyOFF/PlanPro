import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Separator } from '@/components/ui/separator';
import { GeneralPreferences, DisplayPreferences, SchedulePreferences, CalendarPreferences, EditingPreferences, CalculationPreferences, SecurityPreferences } from './components';
import { useUserPreferences } from './hooks/useUserPreferences';
import { IUserPreferences, PreferencesCategory } from './interfaces/UserPreferencesInterfaces';
import { WebImportDialog } from './components/WebImportDialog';
import { AboutDialog } from '@/components/dialogs/information/AboutDialog';
import { Info } from 'lucide-react';
import './UserPreferencesStyles.css';

/**
 * Основной контейнер пользовательских настроек (SOLID Container).
 */
export const UserPreferencesContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const { preferences, resetToDefaults, exportPreferences, importPreferences } = useUserPreferences();
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isAboutDialogOpen, setIsAboutDialogOpen] = useState(false);

  const handleExport = async () => {
    try {
      if (!window.electronAPI) {
        const data = exportPreferences();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'user-preferences.json'; a.click();
        URL.revokeObjectURL(url);
        return;
      }

      const result = await window.electronAPI.showSaveDialog({
        title: 'Экспорт настроек',
        defaultPath: 'projectlibre-settings.json',
        filters: [{ name: 'JSON Files', extensions: ['json'] }]
      });

      if (!result.canceled && result.filePath) {
        await window.electronAPI.exportPreferencesToFile(result.filePath, preferences);
      }
    } catch (e) { console.error('Export failed:', e); }
  };

  const handleImport = async () => {
    if (!window.electronAPI) { setIsImportDialogOpen(true); return; }
    try {
      const result = await window.electronAPI.showOpenDialog({
        title: 'Импорт настроек',
        properties: ['openFile'],
        filters: [{ name: 'JSON Files', extensions: ['json'] }]
      });

      if (!result.canceled && result.filePaths?.length > 0) {
        const res = await window.electronAPI.importPreferencesFromFile(result.filePaths[0]);
        if (res.success && res.data) await importPreferences(JSON.stringify(res.data));
      }
    } catch (e) { console.error('Import failed:', e); }
  };

  const handleWebImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      await importPreferences(text);
      setIsImportDialogOpen(false);
    } catch (e) { console.error('Web import failed:', e); }
  };

  return (
    <div className="user-preferences-container bg-slate-50/50">
      <div className="preferences-header">
        <h1 className="preferences-title">Пользовательские настройки</h1>
        <p className="preferences-description">Управление настройками приложения и безопасности</p>
      </div>
      
      <div className="preferences-content scrollbar-thin">
        <div className="flex justify-between items-center mb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-100/50 border border-border/20">
              <TabsTrigger value="general">Общие</TabsTrigger>
              <TabsTrigger value="display">Отображение</TabsTrigger>
              <TabsTrigger value="schedule">Планирование</TabsTrigger>
              <TabsTrigger value="calendar">Календарь</TabsTrigger>
              <TabsTrigger value="editing">Редактирование</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={handleImport} className="rounded-xl border-border/40 hover:bg-primary/5 transition-all">Импорт</Button>
            <Button variant="outline" size="sm" onClick={handleExport} className="rounded-xl border-border/40 hover:bg-primary/5 transition-all">Экспорт</Button>
          </div>
        </div>

        <div className="space-y-8 pb-10">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-0">
            <TabsContent value="general" className="mt-0 focus-visible:ring-0"><GeneralPreferences /></TabsContent>
            <TabsContent value="display" className="mt-0 focus-visible:ring-0"><DisplayPreferences /></TabsContent>
            <TabsContent value="schedule" className="mt-0 focus-visible:ring-0"><SchedulePreferences /></TabsContent>
            <TabsContent value="calendar" className="mt-0 focus-visible:ring-0"><CalendarPreferences /></TabsContent>
            <TabsContent value="editing" className="mt-0 focus-visible:ring-0"><EditingPreferences /></TabsContent>
            <TabsContent value="calculations" className="mt-0 focus-visible:ring-0"><CalculationPreferences /></TabsContent>
            <TabsContent value="security" className="mt-0 focus-visible:ring-0"><SecurityPreferences /></TabsContent>
          </Tabs>
        </div>

        <div className="preferences-footer mt-auto pt-6 border-t border-border/10 flex justify-between items-center">
          <div className="text-xs text-muted-foreground flex items-center gap-4 opacity-70">
            <span>Версия настроек: 1.0.0</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-[10px] gap-1 px-2 hover:bg-primary/5 hover:text-primary transition-all"
              onClick={() => setIsAboutDialogOpen(true)}
            >
              <Info size={12} />
              О программе
            </Button>
          </div>
        </div>
      </div>

      <WebImportDialog isOpen={isImportDialogOpen} onClose={() => setIsImportDialogOpen(false)} onImport={handleWebImport} />
      <AboutDialog isOpen={isAboutDialogOpen} onClose={() => setIsAboutDialogOpen(false)} />
    </div>
  );
};

