/**
 * Типизированный приветственный диалог
 */

import React, { useState } from 'react';
import { TypedBaseDialog } from '../base/TypedBaseDialog';
import { useDialog } from '../context/TypedDialogContext';
import { WelcomeDialogData } from '@/types/dialog/IDialogRegistry';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

/**
 * Компонент приветственного диалога
 */
export const TypedWelcomeDialog: React.FC = () => {
  const { isOpen, state, close } = useDialog('welcome');
  const [showOnStartup, setShowOnStartup] = useState(true);

  if (!state) {
    return null;
  }

  const handleSubmit = async (_data: WelcomeDialogData): Promise<void> => {
    close();
  };

  const handleCancel = (): void => {
    close();
  };

  return (
    <TypedBaseDialog
      type="welcome"
      isOpen={isOpen}
      data={state.data}
      title="Добро пожаловать в ProjectLibre"
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      submitLabel="Начать работу"
      showFooter={true}
    >
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/20">
            <span className="text-4xl font-bold text-primary-foreground">PL</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-100 tracking-tight">ProjectLibre</h2>
            <p className="text-slate-400 mt-2">
              Профессиональное управление проектами с открытым исходным кодом
            </p>
          </div>
        </div>

        <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700 space-y-4">
          <h3 className="text-lg font-semibold text-slate-200">Быстрый старт</h3>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary text-xs font-bold">1</span>
              </span>
              <span>Создайте новый проект или откройте существующий</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary text-xs font-bold">2</span>
              </span>
              <span>Добавьте задачи и ресурсы</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary text-xs font-bold">3</span>
              </span>
              <span>Настройте зависимости и назначьте исполнителей</span>
            </li>
          </ul>
        </div>

        <div className="flex items-center gap-3 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
          <Checkbox
            id="show-on-startup"
            checked={showOnStartup}
            onCheckedChange={(checked) => setShowOnStartup(checked as boolean)}
            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <Label 
            htmlFor="show-on-startup" 
            className="text-sm text-slate-300 cursor-pointer hover:text-slate-100 transition-colors"
          >
            Показывать это окно при запуске
          </Label>
        </div>
      </div>
    </TypedBaseDialog>
  );
};
