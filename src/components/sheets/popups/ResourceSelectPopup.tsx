import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Resource } from '@/types/resource-types'
import { ResourceAssignment } from '@/store/project/interfaces'
import { Users, X, Percent, Info } from 'lucide-react'

interface ResourceSelectPopupProps {
  isOpen: boolean;
  onClose: () => void;
  resources: Resource[];
  assignments: ResourceAssignment[];
  onSave: (assignments: ResourceAssignment[]) => void;
  taskName?: string;
}

/** Локальное состояние для ввода процентов (строка для редактирования) */
interface LocalUnitsInput {
  [resourceId: string]: string;
}

/**
 * ResourceSelectPopup - Диалог назначения ресурсов на задачу.
 * Дизайн соответствует TaskPropertiesDialog (акцентная шапка).
 */
export const ResourceSelectPopup: React.FC<ResourceSelectPopupProps> = ({
  isOpen, onClose, resources, assignments, onSave, taskName,
}) => {
  const { t } = useTranslation()
  const [localAssignments, setLocalAssignments] = useState<ResourceAssignment[]>([])
  const [inputValues, setInputValues] = useState<LocalUnitsInput>({})

  useEffect(() => {
    if (isOpen) {
      setLocalAssignments([...assignments])
      const inputs: LocalUnitsInput = {}
      assignments.forEach(a => {
        inputs[a.resourceId] = String(Math.round(a.units * 100))
      })
      setInputValues(inputs)
    }
  }, [isOpen, assignments])

  const isSelected = useCallback((resourceId: string) => {
    return localAssignments.some(a => a.resourceId === resourceId)
  }, [localAssignments])

  const handleToggle = useCallback((resourceId: string) => {
    setLocalAssignments(prev => {
      if (prev.some(a => a.resourceId === resourceId)) {
        const newInputs = { ...inputValues }
        delete newInputs[resourceId]
        setInputValues(newInputs)
        return prev.filter(a => a.resourceId !== resourceId)
      }
      setInputValues(v => ({ ...v, [resourceId]: '100' }))
      return [...prev, { resourceId, units: 1.0 }]
    })
  }, [inputValues])

  const handleInputChange = useCallback((resourceId: string, value: string) => {
    setInputValues(prev => ({ ...prev, [resourceId]: value }))
  }, [])

  const handleInputBlur = useCallback((resourceId: string) => {
    const raw = inputValues[resourceId] || ''
    const parsed = parseInt(raw, 10)
    const finalValue = isNaN(parsed) ? 100 : Math.max(1, Math.min(100, parsed))

    setInputValues(prev => ({ ...prev, [resourceId]: String(finalValue) }))
    setLocalAssignments(prev =>
      prev.map(a => a.resourceId === resourceId ? { ...a, units: finalValue / 100 } : a),
    )
  }, [inputValues])

  const handleSave = useCallback(() => {
    Object.keys(inputValues).forEach(resourceId => {
      handleInputBlur(resourceId)
    })

    const finalAssignments = localAssignments.map(a => {
      const raw = inputValues[a.resourceId] || '100'
      const parsed = parseInt(raw, 10)
      const finalValue = isNaN(parsed) ? 100 : Math.max(1, Math.min(100, parsed))
      return { ...a, units: finalValue / 100 }
    })

    onSave(finalAssignments)
    onClose()
  }, [localAssignments, inputValues, onSave, onClose, handleInputBlur])

  const handleCancel = useCallback(() => {
    setLocalAssignments([...assignments])
    onClose()
  }, [assignments, onClose])

  const selectedCount = localAssignments.length

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent
        className="p-0 border-none overflow-hidden w-[550px] max-h-[85vh] rounded-2xl shadow-2xl bg-[hsl(var(--primary))] gap-0 flex flex-col"
        hideClose={true}
      >
        {/* Акцентная шапка */}
        <div className="p-8 pb-6 text-white relative shadow-lg">
          <button
            onClick={handleCancel}
            className="absolute right-4 top-4 opacity-70 hover:opacity-100 transition-all p-2 rounded-full hover:bg-white/10 z-50"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shadow-lg">
              <Users className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-extrabold tracking-tight truncate mb-1">
                {t('task_props.assign_resources', { defaultValue: 'Назначение ресурсов' })}
              </h2>
              {taskName && (
                <p className="text-xs font-semibold text-white/80 uppercase tracking-wider truncate">
                  {taskName}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Основной контент */}
        <div className="bg-white rounded-t-2xl flex-1 flex flex-col overflow-hidden">
          {/* Информационный блок */}
          <div className="p-6 pb-4 bg-slate-50 border-b border-slate-200">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700 leading-relaxed">
                <p className="font-semibold mb-1">
                  {t('task_props.units_explanation_title', { defaultValue: 'Что означает процент?' })}
                </p>
                <p>
                  {t('task_props.units_explanation', {
                    defaultValue: 'Процент показывает долю рабочего времени ресурса на этой задаче. 100% = полная занятость, 50% = половина рабочего дня.',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Список ресурсов */}
          <div className="flex-1 overflow-y-auto p-6 pt-4">
            <Label className="text-sm font-semibold text-slate-700 tracking-wide mb-4 block">
              {t('task_props.available_resources', { defaultValue: 'Доступные ресурсы' })}
              {selectedCount > 0 && (
                <span className="ml-2 text-xs font-normal text-slate-500">
                  ({t('task_props.selected_count', { defaultValue: 'выбрано' })}: {selectedCount})
                </span>
              )}
            </Label>

            <div className="space-y-2">
              {resources.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">{t('task_props.no_resources', { defaultValue: 'Нет доступных ресурсов' })}</p>
                </div>
              ) : (
                resources.map(resource => {
                  const selected = isSelected(resource.id)
                  return (
                    <div
                      key={resource.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                        selected
                          ? 'bg-primary/5 border-primary/30'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Checkbox
                        checked={selected}
                        onCheckedChange={() => handleToggle(resource.id)}
                        className="w-5 h-5"
                      />
                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleToggle(resource.id)}>
                        <span className="font-semibold text-base text-slate-900 block truncate">
                          {resource.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          {t(`sheets.${resource.type?.toLowerCase()}`, { defaultValue: resource.type })}
                        </span>
                      </div>

                      {selected && (
                        <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2">
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={inputValues[resource.id] || '100'}
                            onChange={(e) => handleInputChange(resource.id, e.target.value)}
                            onBlur={() => handleInputBlur(resource.id)}
                            className="w-16 h-9 text-center font-bold text-base border-slate-300 focus:border-primary"
                          />
                          <Percent className="w-4 h-4 text-slate-500" />
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Футер */}
        <DialogFooter className="p-6 px-8 bg-white flex flex-row gap-4 sm:space-x-0 border-t border-slate-200">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="flex-1 h-12 text-slate-600 font-semibold hover:bg-slate-100 hover:text-slate-900 transition-all rounded-xl text-base border border-slate-200"
          >
            {t('common.cancel', { defaultValue: 'Отмена' })}
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 h-12 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white font-bold shadow-md transition-all active:scale-[0.98] rounded-xl text-base"
          >
            {t('common.save', { defaultValue: 'Сохранить' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
