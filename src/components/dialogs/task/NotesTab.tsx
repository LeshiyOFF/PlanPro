import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface NotesTabProps {
  notes: string;
  setNotes: (notes: string) => void;
  t: (key: string, options?: Record<string, string>) => string;
}

/**
 * NotesTab - Вкладка заметок задачи
 * 
 * Clean Architecture: UI Component (Presentation Layer)
 * SOLID: Single Responsibility - управление заметками
 * 
 * @version 1.0
 */
export const NotesTab: React.FC<NotesTabProps> = ({ notes, setNotes, t }) => (
  <div className="space-y-3 p-6 bg-white border border-slate-200 rounded-xl shadow-sm h-full flex flex-col">
    <Label className="text-sm font-semibold text-slate-700">
      {t('task_props.notes_label', { defaultValue: 'Заметки к задаче' })}
    </Label>
    <Textarea 
      placeholder={t('task_props.notes_placeholder', { defaultValue: 'Добавьте заметки...' })} 
      className="flex-1 min-h-[380px] resize-none text-base" 
      value={notes} 
      onChange={e => setNotes(e.target.value)} 
    />
  </div>
);
