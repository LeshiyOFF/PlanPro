import React from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { Task } from '@/store/project/interfaces'
import { useUserPreferences } from '@/components/userpreferences/hooks/useUserPreferences'
import { 
  CONSTRAINT_OPTIONS, 
  ConstraintType, 
  constraintRequiresDate, 
  getConstraintCategory,
  getConstraintHintKey,
} from '@/domain/constraints/ConstraintTypes'
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Info, Circle, AlertTriangle, AlertCircle, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdvancedTabProps {
  formData: Partial<Task>
  setFormData: React.Dispatch<React.SetStateAction<Partial<Task>>>
  t: (key: string, options?: Record<string, string>) => string
}

/**
 * AdvancedTab - Вкладка дополнительных настроек задачи (ограничения дат).
 * 
 * Clean Architecture: UI Component (Presentation Layer)
 * SOLID: Single Responsibility - управление constraints задачи
 */
export const AdvancedTab: React.FC<AdvancedTabProps> = ({ formData, setFormData, t }) => {
  const { preferences } = useUserPreferences()
  const honorRequiredDates = preferences.schedule?.honorRequiredDates ?? false
  const isDisabled = !honorRequiredDates

  const currentConstraint = formData.constraint as ConstraintType | undefined
  const showDatePicker = constraintRequiresDate(currentConstraint)

  const handleConstraintChange = (value: string) => {
    const newConstraint = value as ConstraintType
    setFormData(prev => ({
      ...prev,
      constraint: newConstraint,
      constraintDate: constraintRequiresDate(newConstraint) ? prev.constraintDate : undefined,
    }))
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, constraintDate: date }))
    }
  }

  return (
    <div className="space-y-6">
      <ConstraintSection
        constraint={currentConstraint}
        constraintDate={formData.constraintDate}
        showDatePicker={showDatePicker}
        isDisabled={isDisabled}
        onConstraintChange={handleConstraintChange}
        onDateChange={handleDateChange}
        t={t}
      />
      <ConstraintHint isDisabled={isDisabled} currentConstraint={currentConstraint} t={t} />
    </div>
  )
}

interface ConstraintSectionProps {
  constraint: ConstraintType | undefined
  constraintDate: Date | undefined
  showDatePicker: boolean
  isDisabled: boolean
  onConstraintChange: (value: string) => void
  onDateChange: (date: Date | undefined) => void
  t: (key: string, options?: Record<string, string>) => string
}

const ConstraintSection: React.FC<ConstraintSectionProps> = ({
  constraint, constraintDate, showDatePicker, isDisabled,
  onConstraintChange, onDateChange, t,
}) => (
  <div className="space-y-4 p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
    <div className="flex items-center gap-2">
      <Lock className="h-5 w-5 text-slate-500" />
      <Label className="text-sm font-semibold text-slate-700 tracking-wide">
        {t('task_props.constraints_section', { defaultValue: 'Ограничения даты' })}
      </Label>
    </div>

    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-500 uppercase">
          {t('task_props.constraint_type', { defaultValue: 'Тип ограничения' })}
        </Label>
        <Select
          value={constraint || 'AsSoonAsPossible'}
          onValueChange={onConstraintChange}
          disabled={isDisabled}
        >
          <SelectTrigger className={cn('h-11', isDisabled && 'opacity-60 cursor-not-allowed')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CONSTRAINT_OPTIONS.map(opt => (
              <ConstraintSelectItem key={opt.value} option={opt} t={t} />
            ))}
          </SelectContent>
        </Select>
      </div>

      {showDatePicker && (
        <div className="space-y-2">
          <Label className="text-xs font-medium text-slate-500 uppercase">
            {t('task_props.constraint_date', { defaultValue: 'Дата ограничения' })}
          </Label>
          <DatePicker
            date={constraintDate}
            onChange={onDateChange}
            disabled={isDisabled}
          />
        </div>
      )}
    </div>

  </div>
)

interface ConstraintSelectItemProps {
  option: typeof CONSTRAINT_OPTIONS[number]
  t: (key: string, options?: Record<string, string>) => string
}

const ConstraintSelectItem: React.FC<ConstraintSelectItemProps> = ({ option, t }) => {
  const Icon = getCategoryIcon(option.category)
  const colorClass = getCategoryColorClass(option.category)

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <SelectItem value={option.value} className="cursor-pointer">
            <div className="flex items-center gap-2">
              <Icon className={cn('h-4 w-4', colorClass)} />
              <span>{t(option.labelKey, { defaultValue: option.value })}</span>
            </div>
          </SelectItem>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs p-3">
          <p className="text-sm whitespace-pre-line">
            {t(option.descriptionKey, { defaultValue: '' })}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface ConstraintHintProps {
  isDisabled: boolean
  currentConstraint: ConstraintType | undefined
  t: (k: string, o?: Record<string, string>) => string
}

const ConstraintHint: React.FC<ConstraintHintProps> = ({ isDisabled, currentConstraint, t }) => {
  if (isDisabled) {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            {t('task_props.constraint_disabled_full_hint', {
              defaultValue: 'Включите настройку "Соблюдать обязательные даты" в параметрах проекта для использования ограничений дат.',
            })}
          </p>
        </div>
      </div>
    )
  }

  const hintKey = getConstraintHintKey(currentConstraint)

  return (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
      <div className="flex items-start gap-2">
        <Info className="h-5 w-5 text-slate-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-slate-600">{t(hintKey)}</p>
      </div>
    </div>
  )
}

function getCategoryIcon(category: 'flexible' | 'semi' | 'strict') {
  switch (category) {
    case 'flexible': return Circle
    case 'semi': return AlertCircle
    case 'strict': return AlertTriangle
  }
}

function getCategoryColorClass(category: 'flexible' | 'semi' | 'strict'): string {
  switch (category) {
    case 'flexible': return 'text-emerald-500'
    case 'semi': return 'text-amber-500'
    case 'strict': return 'text-red-500'
  }
}

export default AdvancedTab
