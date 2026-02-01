import React from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { CalendarExceptionsProps } from './CalendarExceptionsTypes';

/**
 * Типизированные props
 */
export interface TypedCalendarExceptionsProps extends CalendarExceptionsProps {}

/**
 * Компонент списка исключений
 */
export const CalendarExceptions: React.FC<TypedCalendarExceptionsProps> = ({ 
  exceptions
}) => {
  const { t } = useTranslation();

  const getExceptionColor = (type: string) => {
    switch (type) {
      case 'holiday': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'working': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {exceptions.length === 0 ? (
        <div className="text-center text-gray-500">
          {t('calendar.exceptions_empty')}
        </div>
      ) : (
        <ul className="space-y-2">
          {exceptions.map((exception) => (
            <li key={exception.id} className="flex justify-between items-center p-3 border rounded-lg bg-white dark:bg-slate-800 dark:border-slate-700">
              <div>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${getExceptionColor(exception.type)}`}>
                  <span className="text-white font-bold text-xs">
                    {exception.type === 'holiday' ? 'H' : 'W'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="font-medium">
                    {exception.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {exception.date}
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="font-medium">
                  {exception.type === 'working' ? (
                    <>
                      <span className="text-xs">{exception.startTime || '00:00'}</span>
                      -
                      <span className="text-xs">{exception.endTime || '00:00'}</span>
                    </>
                  ) : null}
                </div>
                <div className="text-xs text-gray-500">
                  {exception.type === 'working' ? 'Рабочее время' : 'Выходной'}
                </div>
              </div>
              <button
                className="text-red-500 hover:text-red-700 dark:hover:bg-red-900 dark:text-red-900 p-1 rounded"
                onClick={() => {
                  // Обработчик будет добавлен в родительский компонент
                }}
              >
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};