/**
 * Типизированный диалог деталей задачи
 * Пример сложного диалога с формой редактирования
 */

import React, { useState } from 'react'
import { TypedBaseDialog } from '../base/TypedBaseDialog'
import { useDialog } from '../context/TypedDialogContext'
import { TaskDetailsDialogData, TaskDetailsResult } from '@/types/dialog/IDialogRegistry'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/**
 * Компонент диалога деталей задачи
 */
export const TypedTaskDetailsDialog: React.FC = () => {
  const { isOpen, state, close } = useDialog('task-details')

  const [formData, setFormData] = useState<{
    name: string;
    duration: number;
    startDate: Date;
  }>({
    name: state?.data.name || '',
    duration: state?.data.duration || 0,
    startDate: state?.data.startDate || new Date(),
  })

  if (!state) {
    return null
  }

  const handleSubmit = async (_data: TaskDetailsDialogData): Promise<TaskDetailsResult> => {
    const result: TaskDetailsResult = {
      success: true,
      name: formData.name,
      duration: formData.duration,
      startDate: formData.startDate,
    }
    close(result)
    return result
  }

  const handleCancel = (): void => {
    close()
  }

  const handleValidate = (_data: TaskDetailsDialogData): boolean | string => {
    if (!formData.name.trim()) {
      return 'Название задачи обязательно'
    }
    if (formData.duration <= 0) {
      return 'Длительность должна быть больше нуля'
    }
    return true
  }

  return (
    <TypedBaseDialog
      type="task-details"
      isOpen={isOpen}
      data={state.data}
      isSubmitting={state.isSubmitting}
      error={state.error}
      title="Детали задачи"
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      onValidate={handleValidate}
      submitLabel="Сохранить"
      showFooter={true}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="task-name" className="text-xs font-bold text-slate-400 uppercase tracking-widest opacity-70">
            Название задачи
          </Label>
          <Input
            id="task-name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="h-12 bg-slate-800/50 border-slate-600 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
            placeholder="Введите название задачи"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="task-duration" className="text-xs font-bold text-slate-400 uppercase tracking-widest opacity-70">
            Длительность (дни)
          </Label>
          <Input
            id="task-duration"
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
            className="h-12 bg-slate-800/50 border-slate-600 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
            min={1}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="task-start-date" className="text-xs font-bold text-slate-400 uppercase tracking-widest opacity-70">
            Дата начала
          </Label>
          <Input
            id="task-start-date"
            type="date"
            value={formData.startDate.toISOString().split('T')[0]}
            onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value) })}
            className="h-12 bg-slate-800/50 border-slate-600 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
          />
        </div>

        <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700">
          <p className="text-xs text-slate-400">
            ID задачи: <span className="font-mono text-slate-300">{state.data.taskId}</span>
          </p>
        </div>
      </div>
    </TypedBaseDialog>
  )
}
