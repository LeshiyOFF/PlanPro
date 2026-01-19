import React, { useState, useEffect } from 'react';
import { BaseDialog, BaseDialogProps } from '../dialogs/base/SimpleBaseDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/Card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/Badge';
import { hotkeyService } from '@/services/HotkeyService';
import { hotkeyToString, hotkeyFromString, hotkeyEquals, type HotkeyConfig, type HotkeyBinding, type HotkeyConflict } from '@/types/HotkeyTypes';
import { HotkeyDisplay } from './HotkeyDisplay';
import { logger } from '@/utils/logger';

interface HotkeySettingsProps extends Omit<BaseDialogProps, 'children'> {
  onSave?: () => void;
}

interface EditingBinding {
  actionId: string;
  keys: string;
  originalKeys: string;
  isEditing: boolean;
}

/**
 * Диалог настроек горячих клавиш
 */
export const HotkeySettings: React.FC<HotkeySettingsProps> = ({
  onSave,
  open,
  onOpenChange,
  ...props
}) => {
  const [bindings, setBindings] = useState<HotkeyBinding[]>([]);
  const [editingBinding, setEditingBinding] = useState<EditingBinding | null>(null);
  const [conflicts, setConflicts] = useState<HotkeyConflict[]>([]);
  const [filter, setFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (open) {
      loadBindings();
    }
  }, [open]);

  const loadBindings = () => {
    const allBindings = hotkeyService.getAllBindings();
    setBindings(allBindings);
    setEditingBinding(null);
    setConflicts([]);
  };

  const startEditing = (actionId: string, keys: string) => {
    setEditingBinding({
      actionId,
      keys: keys,
      originalKeys: keys,
      isEditing: true
    });
  };

  const cancelEditing = () => {
    setEditingBinding(null);
  };

  const saveEditing = () => {
    if (!editingBinding) return;

    try {
      const newKeys = hotkeyFromString(editingBinding.keys);
      
      // Проверка на конфликты
      const conflict = findConflict(editingBinding.actionId, newKeys);
      if (conflict) {
        setConflicts([conflict]);
        return;
      }

      // Обновление привязки
      hotkeyService.updateBinding(editingBinding.actionId, newKeys);
      loadBindings();
      
      logger.dialog('Hotkey updated', { 
        actionId: editingBinding.actionId, 
        newKeys: editingBinding.keys 
      }, 'HotkeySettings');
    } catch (error) {
      logger.dialogError('Invalid hotkey format', { keys: editingBinding.keys }, 'HotkeySettings');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!editingBinding) return;

    event.preventDefault();
    
    const keys: string[] = [];
    
    if (event.ctrlKey || event.metaKey) keys.push('Ctrl');
    if (event.altKey) keys.push('Alt');
    if (event.shiftKey) keys.push('Shift');
    
    // Основная клавиша
    const key = event.key;
    if (key && !['Control', 'Alt', 'Shift', 'Meta'].includes(key)) {
      keys.push(key);
    }

    setEditingBinding({
      ...editingBinding,
      keys: keys.join('+')
    });
  };

  const resetToDefault = (actionId: string) => {
    // TODO: Implement reset to default from DEFAULT_HOTKEYS
    logger.dialog('Reset to default', { actionId }, 'HotkeySettings');
  };

  const findConflict = (actionId: string, keys: any): HotkeyConflict | null => {
    for (const binding of bindings) {
      if (binding.actionId !== actionId && hotkeyEquals(binding.keys, keys)) {
        return {
          action1: actionId,
          action2: binding.actionId,
          keys
        };
      }
    }
    return null;
  };

  const getActionName = (actionId: string): string => {
    const actions = hotkeyService.getAllActions();
    const action = actions.find(a => a.id === actionId);
    return action?.name || actionId;
  };

  const getFilteredBindings = () => {
    let filtered = bindings;

    // Фильтрация по категории
    if (selectedCategory !== 'all') {
      const actions = hotkeyService.getActionsByCategory(selectedCategory as any);
      const actionIds = new Set(actions.map(a => a.id));
      filtered = filtered.filter(b => actionIds.has(b.actionId));
    }

    // Фильтрация по тексту
    if (filter) {
      const filterLower = filter.toLowerCase();
      filtered = filtered.filter(binding => 
        getActionName(binding.actionId).toLowerCase().includes(filterLower)
      );
    }

    return filtered;
  };

  const saveAll = () => {
    // TODO: Implement save to storage
    onSave?.();
    onOpenChange?.(false);
  };

  return (
    <BaseDialog
      title="Настройки горячих клавиш"
      open={open}
      onOpenChange={onOpenChange}
      confirmLabel="Сохранить"
      cancelLabel="Отмена"
      onConfirm={saveAll}
      width="800px"
      height="600px"
      {...props}
    >
      <div className="space-y-6">
        {/* Фильтры */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="filter">Поиск</Label>
            <Input
              id="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Найти действие..."
            />
          </div>
          <div className="w-48">
            <Label htmlFor="category">Категория</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
                <SelectItem value="file">Файл</SelectItem>
                <SelectItem value="edit">Правка</SelectItem>
                <SelectItem value="view">Вид</SelectItem>
                <SelectItem value="task">Задачи</SelectItem>
                <SelectItem value="resource">Ресурсы</SelectItem>
                <SelectItem value="navigation">Навигация</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Конфликты */}
        {conflicts.length > 0 && (
          <Alert>
            <AlertDescription>
              Обнаружен конфликт горячих клавиш между "{getActionName(conflicts[0].action1)}" 
              и "{getActionName(conflicts[0].action2)}". Пожалуйста, измените комбинацию.
            </AlertDescription>
          </Alert>
        )}

        {/* Список привязок */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {getFilteredBindings().map(binding => {
            const isEditing = editingBinding?.actionId === binding.actionId;
            
            return (
              <Card key={binding.actionId} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">
                      {getActionName(binding.actionId)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {binding.actionId}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editingBinding.keys}
                          onKeyDown={handleKeyDown}
                          placeholder="Нажмите комбинацию..."
                          className="w-32 font-mono"
                          autoFocus
                        />
                        <Button size="sm" onClick={saveEditing}>
                          ✓
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEditing}>
                          ✕
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <HotkeyDisplay hotkey={binding.keys} />
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => startEditing(binding.actionId, hotkeyToString(binding.keys))}
                        >
                          Изменить
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => resetToDefault(binding.actionId)}
                        >
                          Сброс
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Инструкция */}
        <Card className="p-4 bg-muted/50">
          <h4 className="font-medium mb-2">Инструкция</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Нажмите "Изменить" для редактирования комбинации</li>
            <li>• Нажмите новую комбинацию клавиш</li>
            <li>• Используйте Ctrl, Alt, Shift для модификаторов</li>
            <li>• Система предотвратит конфликты автоматически</li>
          </ul>
        </Card>
      </div>
    </BaseDialog>
  );
};

