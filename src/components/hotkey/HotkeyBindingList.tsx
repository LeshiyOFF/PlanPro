import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HotkeyDisplay } from './HotkeyDisplay'
import { HotkeyBindingEditor, EditingBinding } from './HotkeyBindingEditor'
import { hotkeyToString, type HotkeyBinding } from '@/types/HotkeyTypes'

interface HotkeyBindingListProps {
  bindings: HotkeyBinding[];
  editingBinding: EditingBinding | null;
  getActionName: (actionId: string) => string;
  onStartEdit: (actionId: string, keys: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onResetToDefault: (actionId: string) => void;
  onEditingKeysChange: (keys: string) => void;
}

/**
 * Компонент списка привязок горячих клавиш
 */
export const HotkeyBindingList: React.FC<HotkeyBindingListProps> = ({
  bindings,
  editingBinding,
  getActionName,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onResetToDefault,
  onEditingKeysChange,
}) => {
  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {bindings.map(binding => {
        const isEditing = editingBinding?.actionId === binding.actionId

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
                {isEditing && editingBinding ? (
                  <HotkeyBindingEditor
                    editingBinding={editingBinding}
                    onChange={onEditingKeysChange}
                    onSave={onSaveEdit}
                    onCancel={onCancelEdit}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <HotkeyDisplay hotkey={binding.keys} />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onStartEdit(binding.actionId, hotkeyToString(binding.keys))}
                    >
                      Изменить
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onResetToDefault(binding.actionId)}
                    >
                      Сброс
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
