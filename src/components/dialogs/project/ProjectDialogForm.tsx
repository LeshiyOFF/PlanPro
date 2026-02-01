/**
 * Форма диалога проекта (поля и настройки).
 * Presentational component для ProjectDialog.
 */

import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ProjectDialogData } from '@/types/calendar-types'

export interface ProjectDialogFormProps {
  data: ProjectDialogData;
  validationErrors: Record<string, string[]>;
  submitError: string | null;
  onFieldChange: (field: keyof ProjectDialogData, value: ProjectDialogData[keyof ProjectDialogData]) => void;
}

export const ProjectDialogForm: React.FC<ProjectDialogFormProps> = ({
  data,
  validationErrors,
  submitError,
  onFieldChange,
}) => (
  <div className="space-y-6 p-6">
    {submitError && (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {submitError}
      </div>
    )}
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Основная информация</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="project-name">Название проекта *</Label>
          <Input
            id="project-name"
            value={data.name}
            onChange={(e) => onFieldChange('name', e.target.value)}
            placeholder="Введите название проекта"
            className={validationErrors.name?.length ? 'border-destructive' : ''}
            autoFocus
          />
          {validationErrors.name?.length && (
            <div className="text-sm text-destructive">{validationErrors.name[0]}</div>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="project-manager">Менеджер проекта *</Label>
          <Input
            id="project-manager"
            value={data.manager}
            onChange={(e) => onFieldChange('manager', e.target.value)}
            placeholder="Имя менеджера"
            className={validationErrors.manager?.length ? 'border-destructive' : ''}
          />
          {validationErrors.manager?.length && (
            <div className="text-sm text-destructive">{validationErrors.manager[0]}</div>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="project-start-date">Дата начала *</Label>
        <Input
          id="project-start-date"
          type="date"
          value={data.startDate.toISOString().split('T')[0]}
          onChange={(e) => onFieldChange('startDate', new Date(e.target.value))}
          className={validationErrors.startDate?.length ? 'border-destructive' : ''}
        />
        {validationErrors.startDate?.length && (
          <div className="text-sm text-destructive">{validationErrors.startDate[0]}</div>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="project-notes">Заметки</Label>
        <Textarea
          id="project-notes"
          value={data.notes}
          onChange={(e) => onFieldChange('notes', e.target.value)}
          placeholder="Дополнительная информация о проекте"
          rows={3}
        />
      </div>
    </div>
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Настройки проекта</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="project-type">Тип проекта</Label>
          <Select
            value={data.projectType.toString()}
            onValueChange={(value) => onFieldChange('projectType', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите тип проекта" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Базовый проект</SelectItem>
              <SelectItem value="1">Шаблон проекта</SelectItem>
              <SelectItem value="2">Мастер-проект</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="project-status">Статус проекта</Label>
          <Select
            value={data.projectStatus.toString()}
            onValueChange={(value) => onFieldChange('projectStatus', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Планирование</SelectItem>
              <SelectItem value="1">В работе</SelectItem>
              <SelectItem value="2">Завершен</SelectItem>
              <SelectItem value="3">Приостановлен</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <input
          id="project-forward"
          type="checkbox"
          checked={data.forward}
          onChange={(e) => onFieldChange('forward', e.target.checked)}
          className="rounded border-gray-300"
        />
        <Label htmlFor="project-forward" className="text-sm">
          Планирование вперед
        </Label>
      </div>
    </div>
  </div>
)
