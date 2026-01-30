import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { useProjectStore } from '@/store/projectStore';
import { useTranslation } from 'react-i18next';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { History, Save, Trash2, CheckCircle2 } from 'lucide-react';

interface BaselineManagerDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BaselineManagerDialog: React.FC<BaselineManagerDialogProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { baselines, activeBaselineId, saveBaseline, deleteBaseline, setActiveBaseline, tasks } = useProjectStore();
  const [newBaselineName, setNewBaselineName] = useState('');

  const handleSave = () => {
    saveBaseline(newBaselineName || undefined);
    setNewBaselineName('');
  };

  const getDiffCount = (baselineId: string) => {
    const baseline = baselines.find(b => b.id === baselineId);
    if (!baseline) return 0;
    return tasks.filter(t => {
      const bDate = baseline.taskDates[t.id];
      if (!bDate) return false;
      return new Date(t.endDate).getTime() !== new Date(bDate.endDate).getTime();
    }).length;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            {t('baseline.manager_title', { defaultValue: 'Менеджер базовых планов' })}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t('baseline.manager_description', { defaultValue: 'Управление снимками базового плана проекта' })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <Input 
              placeholder={t('baseline.new_name_placeholder', { defaultValue: 'Название нового снимка...' })}
              value={newBaselineName}
              onChange={(e) => setNewBaselineName(e.target.value)}
            />
            <Button onClick={handleSave} disabled={tasks.length === 0}>
              <Save className="h-4 w-4 mr-2" />
              {t('baseline.save_btn', { defaultValue: 'Зафиксировать' })}
            </Button>
          </div>

          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('baseline.name', { defaultValue: 'Название' })}</TableHead>
                  <TableHead>{t('baseline.date', { defaultValue: 'Дата' })}</TableHead>
                  <TableHead>{t('baseline.diff', { defaultValue: 'Отклонения' })}</TableHead>
                  <TableHead className="text-right">{t('baseline.actions', { defaultValue: 'Действия' })}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {baselines.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      {t('baseline.no_baselines', { defaultValue: 'Снимков пока нет. Зафиксируйте текущее состояние проекта.' })}
                    </TableCell>
                  </TableRow>
                ) : (
                  baselines.map((b) => (
                    <TableRow key={b.id} className={activeBaselineId === b.id ? 'bg-muted/50' : ''}>
                      <TableCell className="font-medium">
                        {b.name}
                        {activeBaselineId === b.id && (
                          <Badge variant="secondary" className="ml-2 text-[10px]">
                            {t('baseline.active', { defaultValue: 'Активен' })}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(b.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getDiffCount(b.id) > 0 ? 'destructive' : 'outline'} className="text-[10px]">
                          {getDiffCount(b.id)} {t('baseline.tasks', { defaultValue: 'задач' })}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button 
                          size="sm" 
                          variant={activeBaselineId === b.id ? 'secondary' : 'ghost'}
                          onClick={() => setActiveBaseline(activeBaselineId === b.id ? undefined : b.id)}
                          title={t('baseline.toggle_compare', { defaultValue: 'Сравнить' })}
                        >
                          <CheckCircle2 className={`h-4 w-4 ${activeBaselineId === b.id ? 'text-green-500' : ''}`} />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => deleteBaseline(b.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('common.close', { defaultValue: 'Закрыть' })}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
