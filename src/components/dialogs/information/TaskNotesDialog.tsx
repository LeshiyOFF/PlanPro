import React from 'react';
import { BaseDialog, BaseDialogProps } from '../base/SimpleBaseDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDialogValidation } from '../hooks/useDialogValidation';

export interface TaskNote {
  id: string;
  taskId: string;
  taskName: string;
  date: string;
  author: string;
  category: 'general' | 'progress' | 'issue' | 'resolution';
  priority: 'low' | 'normal' | 'high' | 'critical';
  subject: string;
  content: string;
  isPublic: boolean;
}

export interface TaskNotesDialogProps extends Omit<BaseDialogProps, 'children'> {
  taskId: string;
  taskName: string;
  notes?: TaskNote[];
  authors?: string[];
  onSave?: (note: Omit<TaskNote, 'id'>) => void;
  onUpdate?: (note: TaskNote) => void;
  onDelete?: (noteId: string) => void;
}

const NOTE_CATEGORIES = [
  { value: 'general', label: 'General', description: 'General project notes' },
  { value: 'progress', label: 'Progress', description: 'Progress updates and milestones' },
  { value: 'issue', label: 'Issue', description: 'Problems and obstacles' },
  { value: 'resolution', label: 'Resolution', description: 'Solutions and fixes' }
];

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'text-gray-600' },
  { value: 'normal', label: 'Normal', color: 'text-primary' },
  { value: 'high', label: 'High', color: 'text-orange-600' },
  { value: 'critical', label: 'Critical', color: 'text-red-600' }
];

export const TaskNotesDialog: React.FC<TaskNotesDialogProps> = ({
  taskId,
  taskName,
  notes = [],
  authors = [],
  onSave,
  onUpdate,
  onDelete,
  onClose,
  ...props
}) => {
  const [mode, setMode] = React.useState<'view' | 'add' | 'edit'>('view');
  const [selectedNoteId, setSelectedNoteId] = React.useState('');
  const [noteData, setNoteData] = React.useState({
    date: new Date().toISOString().split('T')[0],
    author: authors[0] || '',
    category: 'general' as const,
    priority: 'normal' as const,
    subject: '',
    content: '',
    isPublic: true
  });

  const { validate, errors, isValid } = useDialogValidation({
    subject: {
      required: true,
      minLength: 1,
      maxLength: 255,
      validate: (value) => value.trim() ? null : 'Subject is required'
    },
    content: {
      required: true,
      minLength: 1,
      validate: (value) => value.trim() ? null : 'Content is required'
    },
    author: {
      required: true,
      validate: (value) => value ? null : 'Author is required'
    }
  });

  React.useEffect(() => {
    Object.keys(noteData).forEach(key => {
      validate(key, noteData[key as keyof typeof noteData]);
    });
  }, [noteData]);

  const handleFieldChange = (field: keyof typeof noteData, value: any) => {
    setNoteData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddNote = () => {
    if (isValid()) {
      onSave?.({
        taskId,
        taskName,
        ...noteData
      });
      
      // Reset form
      setNoteData({
        date: new Date().toISOString().split('T')[0],
        author: authors[0] || '',
        category: 'general',
        priority: 'normal',
        subject: '',
        content: '',
        isPublic: true
      });
      setMode('view');
    }
  };

  const handleEditNote = (note: TaskNote) => {
    setSelectedNoteId(note.id);
    setNoteData({
      date: note.date,
      author: note.author,
      category: note.category,
      priority: note.priority,
      subject: note.subject,
      content: note.content,
      isPublic: note.isPublic
    });
    setMode('edit');
  };

  const handleUpdateNote = () => {
    if (isValid() && selectedNoteId) {
      const noteToUpdate = notes.find(n => n.id === selectedNoteId);
      if (noteToUpdate) {
        onUpdate?.({
          ...noteToUpdate,
          ...noteData
        });
        setMode('view');
        setSelectedNoteId('');
      }
    }
  };

  const handleDeleteNote = (noteId: string) => {
    onDelete?.(noteId);
  };

  const canSave = isValid();
  const selectedNote = notes.find(n => n.id === selectedNoteId);
  const getCategoryDescription = (category: string) => {
    return NOTE_CATEGORIES.find(c => c.value === category)?.description || '';
  };
  const getPriorityColor = (priority: string) => {
    return PRIORITY_LEVELS.find(p => p.value === priority)?.color || 'text-gray-600';
  };

  return (
    <BaseDialog
      title={`Task Notes - ${taskName}`}
      size="fullscreen"
      {...props}
      onClose={onClose}
      footer={
        <div className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            {notes.length} note(s) total
          </div>
          <div className="flex space-x-2">
            {mode !== 'view' && (
              <Button variant="outline" onClick={() => setMode('view')}>
                Cancel
              </Button>
            )}
            <Button onClick={() => setMode('add')} disabled={mode === 'add'}>
              Add Note
            </Button>
            {mode === 'add' && (
              <Button onClick={handleAddNote} disabled={!canSave}>
                Save Note
              </Button>
            )}
            {mode === 'edit' && (
              <Button onClick={handleUpdateNote} disabled={!canSave}>
                Update Note
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Note Form */}
        {(mode === 'add' || mode === 'edit') && (
          <div className="border rounded-lg p-4 bg-primary/10">
            <Label className="text-sm font-medium mb-3">
              {mode === 'add' ? 'Add New Note' : 'Edit Note'}
            </Label>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={noteData.subject}
                  onChange={(e) => handleFieldChange('subject', e.target.value)}
                  className={errors.subject ? 'border-red-500' : ''}
                />
                {errors.subject && (
                  <div className="text-sm text-red-500">{errors.subject}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={noteData.date}
                  onChange={(e) => handleFieldChange('date', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Author *</Label>
                <Select
                  value={noteData.author}
                  onValueChange={(value) => handleFieldChange('author', value)}
                >
                  <SelectTrigger className={errors.author ? 'border-red-500' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {authors.map(author => (
                      <SelectItem key={author} value={author}>
                        {author}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.author && (
                  <div className="text-sm text-red-500">{errors.author}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={noteData.category}
                  onValueChange={(value) => handleFieldChange('category', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTE_CATEGORIES.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        <div>
                          <div className="font-medium">{category.label}</div>
                          <div className="text-sm text-muted-foreground">
                            {category.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={noteData.priority}
                  onValueChange={(value) => handleFieldChange('priority', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_LEVELS.map(priority => (
                      <SelectItem key={priority.value} value={priority.value}>
                        <span className={priority.color}>{priority.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 mt-6">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={noteData.isPublic}
                    onChange={(e) => handleFieldChange('isPublic', e.target.checked)}
                  />
                  <Label htmlFor="isPublic">Public note (visible to all users)</Label>
                </div>
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={noteData.content}
                  onChange={(e) => handleFieldChange('content', e.target.value)}
                  rows={6}
                  className={errors.content ? 'border-red-500' : ''}
                />
                {errors.content && (
                  <div className="text-sm text-red-500">{errors.content}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Notes List */}
        {mode === 'view' && notes.length > 0 && (
          <div className="space-y-3">
            <Label>All Notes</Label>
            <div className="space-y-3">
              {notes.map(note => (
                <div key={note.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{note.subject}</span>
                      <span className={`text-sm ${getPriorityColor(note.priority)}`}>
                        {note.priority}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {note.category}
                      </span>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditNote(note)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-2">
                    {note.date} • {note.author}
                    {note.isPublic && ' • Public'}
                  </div>
                  
                  <div className="text-sm whitespace-pre-wrap">{note.content}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {mode === 'view' && notes.length === 0 && (
          <div className="text-center py-8 border rounded-lg bg-muted/30">
            <div className="text-lg font-medium text-muted-foreground mb-2">
              No notes yet
            </div>
            <div className="text-sm text-muted-foreground mb-4">
              Add your first note to track important information about this task.
            </div>
            <Button onClick={() => setMode('add')}>
              Add First Note
            </Button>
          </div>
        )}
      </div>
    </BaseDialog>
  );
};

