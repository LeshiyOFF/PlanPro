import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

/**
 * Информация о редактируемой привязке
 */
export interface EditingBinding {
  actionId: string;
  keys: string;
  originalKeys: string;
  isEditing: boolean;
}

interface HotkeyBindingEditorProps {
  editingBinding: EditingBinding;
  onChange: (keys: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

/**
 * Компонент редактирования горячей клавиши
 */
export const HotkeyBindingEditor: React.FC<HotkeyBindingEditorProps> = ({
  editingBinding,
  onChange,
  onSave,
  onCancel
}) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    event.preventDefault();
    
    const keys: string[] = [];
    if (event.ctrlKey || event.metaKey) keys.push('Ctrl');
    if (event.altKey) keys.push('Alt');
    if (event.shiftKey) keys.push('Shift');
    
    const key = event.key;
    if (key && !['Control', 'Alt', 'Shift', 'Meta'].includes(key)) {
      keys.push(key);
    }

    onChange(keys.join('+'));
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        value={editingBinding.keys}
        onKeyDown={handleKeyDown}
        placeholder="Нажмите комбинацию..."
        className="w-32 font-mono"
        autoFocus
      />
      <Button size="sm" onClick={onSave}>
        ✓
      </Button>
      <Button size="sm" variant="outline" onClick={onCancel}>
        ✕
      </Button>
    </div>
  );
};
