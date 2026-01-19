import React from 'react';
import { Button } from '@/components/ui/button';

interface WebImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Диалог импорта настроек для веб-окружения (fallback).
 * Вынесен в отдельный компонент для соблюдения лимита строк в родительском контейнере.
 */
export const WebImportDialog: React.FC<WebImportDialogProps> = ({ isOpen, onClose, onImport }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <h3 className="text-lg font-semibold mb-2">Импорт настроек (Web)</h3>
        <p className="text-gray-600 mb-4">Выберите файл с настройками (.json)</p>
        <input
          type="file"
          accept=".json"
          onChange={onImport}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-slate-800 hover:file:bg-slate-100"
        />
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
        </div>
      </div>
    </div>
  );
};
