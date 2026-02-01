/**
 * Типизированный диалог "О программе"
 * Пример простого диалога с полной типизацией
 */

import React from 'react';
import { TypedBaseDialog } from '../base/TypedBaseDialog';
import { useDialog } from '../context/TypedDialogContext';
import { AboutDialogData } from '@/types/dialog/IDialogRegistry';

/**
 * Компонент диалога "О программе"
 */
export const TypedAboutDialog: React.FC = () => {
  const { isOpen, state, close } = useDialog('about');

  if (!state) {
    return null;
  }

  const handleSubmit = async (_data: AboutDialogData): Promise<void> => {
    close();
  };

  const handleCancel = (): void => {
    close();
  };

  return (
    <TypedBaseDialog
      type="about"
      isOpen={isOpen}
      data={state.data}
      title="О программе ProjectLibre"
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      submitLabel="Закрыть"
      showFooter={true}
    >
      <div className="space-y-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-3xl font-bold text-primary-foreground">PL</span>
          </div>
          
          <div className="text-center">
            <h3 className="text-2xl font-bold text-slate-100 tracking-tight">ProjectLibre</h3>
            <p className="text-sm text-slate-400 mt-1">
              Версия {state.data.version}
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <p className="text-sm text-slate-300 leading-relaxed">
            ProjectLibre - это мощное приложение для управления проектами с открытым исходным кодом.
            Альтернатива Microsoft Project с полной поддержкой импорта/экспорта MPP файлов.
          </p>
        </div>

        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <h4 className="text-sm font-semibold text-slate-200 mb-2">Лицензия</h4>
          <p className="text-xs text-slate-400">
            Common Public Attribution License (CPAL) 1.0
          </p>
        </div>

        <div className="text-center text-xs text-slate-500">
          © 2024 ProjectLibre Community
        </div>
      </div>
    </TypedBaseDialog>
  );
};
