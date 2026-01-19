import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

export interface CalendarException {
  id: string;
  name: string;
  date: string;
  type: 'holiday' | 'working';
  startTime?: string;
  endTime?: string;
}

export interface CalendarExceptionsProps {
  exceptions: CalendarException[];
  onExceptionsChange: (exceptions: CalendarException[]) => void;
}

export const CalendarExceptions: React.FC<CalendarExceptionsProps> = ({ 
  exceptions, 
  onExceptionsChange 
}) => {
  const addException = () => {
    const newException: CalendarException = {
      id: Date.now().toString(),
      name: '',
      date: '',
      type: 'holiday'
    };
    onExceptionsChange([...exceptions, newException]);
  };

  const updateException = (id: string, field: keyof CalendarException, value: any) => {
    const updatedExceptions = exceptions.map(exc => 
      exc.id === id ? { ...exc, [field]: value } : exc
    );
    onExceptionsChange(updatedExceptions);
  };

  const removeException = (id: string) => {
    const updatedExceptions = exceptions.filter(exc => exc.id !== id);
    onExceptionsChange(updatedExceptions);
  };

  const getExceptionColor = (type: string) => {
    switch (type) {
      case 'holiday':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'working':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">
          Исключения и особые дни
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addException}
        >
          <Plus className="h-4 w-4 mr-2" />
          Добавить
        </Button>
      </div>

      {exceptions.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground text-sm">
          Нет исключений
        </div>
      ) : (
        <div className="space-y-2">
          {exceptions.map((exception, index) => (
            <div key={exception.id} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getExceptionColor(exception.type)}`}>
                    {exception.type === 'holiday' ? 'Выходной' : 'Рабочий день'}
                  </span>
                  <span className="text-sm font-medium">
                    Исключение #{index + 1}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeException(exception.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor={`name-${exception.id}`} className="text-xs">
                    Название
                  </Label>
                  <Input
                    id={`name-${exception.id}`}
                    value={exception.name}
                    onChange={(e) => updateException(exception.id, 'name', e.target.value)}
                    placeholder="Например: Новый год"
                    className="text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor={`date-${exception.id}`} className="text-xs">
                    Дата
                  </Label>
                  <Input
                    id={`date-${exception.id}`}
                    type="date"
                    value={exception.date}
                    onChange={(e) => updateException(exception.id, 'date', e.target.value)}
                    className="text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor={`type-${exception.id}`} className="text-xs">
                    Тип
                  </Label>
                  <select
                    id={`type-${exception.id}`}
                    value={exception.type}
                    onChange={(e) => updateException(exception.id, 'type', e.target.value as 'holiday' | 'working')}
                    className="w-full p-1 text-sm border rounded"
                  >
                    <option value="holiday">Выходной</option>
                    <option value="working">Рабочий день</option>
                  </select>
                </div>

                {exception.type === 'working' && (
                  <div>
                    <Label htmlFor={`hours-${exception.id}`} className="text-xs">
                      Часы работы
                    </Label>
                    <div className="flex space-x-1">
                      <Input
                        id={`hours-${exception.id}-start`}
                        type="time"
                        value={exception.startTime || ''}
                        onChange={(e) => updateException(exception.id, 'startTime', e.target.value)}
                        placeholder="Начало"
                        className="text-sm"
                      />
                      <Input
                        id={`hours-${exception.id}-end`}
                        type="time"
                        value={exception.endTime || ''}
                        onChange={(e) => updateException(exception.id, 'endTime', e.target.value)}
                        placeholder="Конец"
                        className="text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
