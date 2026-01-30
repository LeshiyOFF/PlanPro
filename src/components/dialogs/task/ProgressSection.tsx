import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/Input';
import { Slider } from '@/components/ui/slider';
import { Lock, Diamond, FolderTree, CheckCircle2 } from 'lucide-react';
import { toPercent, toFraction } from '@/utils/ProgressFormatter';

export type TaskType = 'milestone' | 'summary' | 'regular';

interface ProgressSectionProps {
  taskType: TaskType;
  progress: number;
  onProgressChange: (value: number) => void;
  t: (key: string, options?: Record<string, string>) => string;
}

/**
 * ProgressSection - Секция прогресса с учётом типа задачи
 * 
 * Clean Architecture: UI Component (Presentation Layer)
 * SOLID: Single Responsibility - управление прогрессом задачи
 * 
 * @version 1.0
 */
export const ProgressSection: React.FC<ProgressSectionProps> = ({ 
  taskType, progress, onProgressChange, t 
}) => {
  const [inputValue, setInputValue] = useState(String(toPercent(progress)));

  useEffect(() => {
    setInputValue(String(toPercent(progress)));
  }, [progress]);

  const handleInputChange = (val: string) => {
    setInputValue(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      const limited = Math.max(0, Math.min(100, num));
      onProgressChange(toFraction(limited));
    }
  };

  const handleSliderChange = (val: number[]) => {
    onProgressChange(toFraction(val[0]));
  };

  if (taskType === 'summary') {
    return <SummaryProgress progress={progress} t={t} />;
  }

  if (taskType === 'milestone') {
    return <MilestoneProgress progress={progress} onProgressChange={onProgressChange} t={t} />;
  }

  return (
    <RegularProgress 
      inputValue={inputValue}
      progress={progress}
      onInputChange={handleInputChange}
      onSliderChange={handleSliderChange}
      t={t}
    />
  );
};

const SummaryProgress: React.FC<{ progress: number; t: ProgressSectionProps['t'] }> = ({ 
  progress, t 
}) => (
  <div className="space-y-4 p-6 bg-amber-50 rounded-xl border border-amber-200 shadow-sm">
    <div className="flex items-center gap-3 text-amber-700">
      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
        <Lock size={20} />
      </div>
      <Label className="text-sm font-semibold tracking-wide">
        {t('task_props.progress_summary', { defaultValue: 'Прогресс суммарной задачи' })}
      </Label>
    </div>
    <div className="flex items-center justify-between py-4">
      <span className="text-5xl font-black text-slate-900">{toPercent(progress)}%</span>
      <FolderTree className="h-12 w-12 text-amber-300" />
    </div>
    <p className="text-sm text-amber-700 leading-relaxed bg-white p-3 rounded-lg border border-amber-100">
      {t('task_props.summary_hint', { defaultValue: 'Прогресс суммарной задачи рассчитывается автоматически' })}
    </p>
  </div>
);

interface MilestoneProgressProps {
  progress: number;
  onProgressChange: (value: number) => void;
  t: ProgressSectionProps['t'];
}

const MilestoneProgress: React.FC<MilestoneProgressProps> = ({ progress, onProgressChange, t }) => {
  const isCompleted = progress >= 0.5;
  
  return (
    <div className="space-y-4 p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
      <Label className="text-sm font-semibold text-slate-700 tracking-wide">
        {t('task_props.milestone_status', { defaultValue: 'Статус вехи' })}
      </Label>
      <div 
        className={`flex items-center gap-4 p-5 rounded-xl border-2 transition-all cursor-pointer ${
          isCompleted ? 'bg-green-50 border-green-300 hover:border-green-400' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
        }`}
        onClick={() => onProgressChange(isCompleted ? 0 : 1)}
      >
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all shadow-sm ${
          isCompleted ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400'
        }`}>
          {isCompleted ? <CheckCircle2 size={28} /> : <Diamond size={28} />}
        </div>
        <div className="flex-1">
          <p className={`font-bold text-base mb-1 ${isCompleted ? 'text-green-700' : 'text-slate-700'}`}>
            {isCompleted ? t('task_props.milestone_done', { defaultValue: 'Веха выполнена' }) : t('task_props.milestone_pending', { defaultValue: 'Веха не выполнена' })}
          </p>
          <p className="text-xs text-slate-500">{t('task_props.milestone_hint', { defaultValue: 'Нажмите для изменения' })}</p>
        </div>
      </div>
    </div>
  );
};

interface RegularProgressProps {
  inputValue: string;
  progress: number;
  onInputChange: (val: string) => void;
  onSliderChange: (val: number[]) => void;
  t: ProgressSectionProps['t'];
}

const RegularProgress: React.FC<RegularProgressProps> = ({ 
  inputValue, progress, onInputChange, onSliderChange, t 
}) => (
  <div className="space-y-4 p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
    <div className="flex justify-between items-center mb-2">
      <Label className="text-sm font-semibold text-slate-700 tracking-wide">
        {t('task_props.progress', { defaultValue: 'Прогресс выполнения' })}
      </Label>
      <div className="flex items-center gap-2">
        <Input 
          className="w-20 h-10 text-center font-bold text-base border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white" 
          type="text" value={inputValue} onChange={(e) => onInputChange(e.target.value)}
        />
        <span className="text-base font-semibold text-slate-500">%</span>
      </div>
    </div>
    <div className="py-2">
      <Slider value={[toPercent(progress)]} max={100} step={1} onValueChange={onSliderChange} className="py-3" />
    </div>
    <div className="flex justify-between text-xs text-slate-400 uppercase tracking-wider font-semibold pt-1">
      <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
    </div>
  </div>
);
