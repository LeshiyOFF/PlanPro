import React, { useState, useEffect } from 'react';
import { BaseDialog, BaseDialogProps } from '../dialogs/base/SimpleBaseDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { hotkeyService } from '@/services/HotkeyService';
import { hotkeyFromString, hotkeyEquals, HotkeyCategory, type Hotkey, type HotkeyBinding, type HotkeyConflict } from '@/types/HotkeyTypes';
import { HotkeyBindingList } from './HotkeyBindingList';
import { EditingBinding } from './HotkeyBindingEditor';
import { logger } from '@/utils/logger';

interface HotkeySettingsProps extends Omit<BaseDialogProps, 'children'> {
  onSave?: () => void;
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
      keys,
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
      const conflict = findConflict(editingBinding.actionId, newKeys);
      
      if (conflict) {
        setConflicts([conflict]);
        return;
      }

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

  const updateEditingKeys = (keys: string) => {
    if (editingBinding) {
      setEditingBinding({ ...editingBinding, keys });
    }
  };

  const resetToDefault = (actionId: string) => {
    const defaultBinding = hotkeyService.getDefaultBinding(actionId);
    if (defaultBinding) {
      hotkeyService.updateBinding(actionId, defaultBinding.keys);
      loadBindings();
      logger.dialog('Hotkey reset to default', { actionId }, 'HotkeySettings');
    }
  };

  const findConflict = (actionId: string, keys: Hotkey): HotkeyConflict | null => {
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

  const getFilteredBindings = (): HotkeyBinding[] => {
    let filtered = bindings;

    if (selectedCategory !== 'all' && Object.values(HotkeyCategory).includes(selectedCategory as HotkeyCategory)) {
      const actions = hotkeyService.getActionsByCategory(selectedCategory as HotkeyCategory);
      const actionIds = new Set(actions.map(a => a.id));
      filtered = filtered.filter(b => actionIds.has(b.actionId));
    }

    if (filter) {
      const filterLower = filter.toLowerCase();
      filtered = filtered.filter(binding => 
        getActionName(binding.actionId).toLowerCase().includes(filterLower)
      );
    }

    return filtered;
  };

  const saveAll = () => {
    try {
      hotkeyService.saveToStorage();
      logger.dialog('Hotkeys saved to storage', {}, 'HotkeySettings');
      onSave?.();
      onOpenChange?.(false);
    } catch (error) {
      logger.dialogError('Failed to save hotkeys', error instanceof Error ? error : String(error), 'HotkeySettings');
    }
  };

  const { title: _omitTitle, ...dialogProps } = props;
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
      {...dialogProps}
    >
      <div className="space-y-6">
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

        {conflicts.length > 0 && (
          <Alert>
            <AlertDescription>
              Обнаружен конфликт горячих клавиш между "{getActionName(conflicts[0].action1)}" 
              и "{getActionName(conflicts[0].action2)}". Пожалуйста, измените комбинацию.
            </AlertDescription>
          </Alert>
        )}

        <HotkeyBindingList
          bindings={getFilteredBindings()}
          editingBinding={editingBinding}
          getActionName={getActionName}
          onStartEdit={startEditing}
          onSaveEdit={saveEditing}
          onCancelEdit={cancelEditing}
          onResetToDefault={resetToDefault}
          onEditingKeysChange={updateEditingKeys}
        />

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
