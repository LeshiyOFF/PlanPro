import React, { useState, useEffect, useMemo } from 'react'
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useProjectStore } from '@/store/projectStore'
import { Task, ResourceAssignment } from '@/store/project/interfaces'
import { useTranslation } from 'react-i18next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings2, Users, MessageSquare, Link2, X, Diamond, FolderTree, Settings, Info } from 'lucide-react'
import { normalizeFraction } from '@/utils/ProgressFormatter'
import { TaskType } from './task/ProgressSection'
import { GeneralTab } from './task/GeneralTab'
import { ResourceAssignmentTab } from './task/ResourceAssignmentTab'
import { LinksTab } from './task/LinksTab'
import { NotesTab } from './task/NotesTab'
import { AdvancedTab } from './task/AdvancedTab'
import { useUserPreferences } from '@/components/userpreferences/hooks/useUserPreferences'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

/** Если возвращает false, обновление не применено (показан диалог конфликта дат) — диалог не закрывать. */
export type UpdateTaskWithConflictCheck = (taskId: string, updates: Partial<Task>) => boolean

interface TaskPropertiesDialogProps {
  taskId: string | null;
  isOpen: boolean;
  onClose: () => void;
  /** При задании используется вместо store.updateTask при сохранении; при конфликте возвращает false — диалог остаётся открытым. */
  updateTaskOverride?: UpdateTaskWithConflictCheck;
}

/**
 * TaskPropertiesDialog - Диалог свойств задачи
 *
 * КРИТИЧНО V3.0: Исправлен переход на resourceAssignments вместо resourceIds.
 * Это устраняет баг с нулевыми трудозатратами в отчётах.
 *
 * Clean Architecture: UI Component (Presentation Layer)
 * SOLID: Single Responsibility - оркестрация вкладок свойств задачи
 *
 * @version 3.0 - Миграция на resourceAssignments
 */
export const TaskPropertiesDialog: React.FC<TaskPropertiesDialogProps> = ({
  taskId, isOpen, onClose, updateTaskOverride,
}) => {
  const { t } = useTranslation()
  const { tasks, resources, updateTask } = useProjectStore()
  const task = tasks.find(tsk => tsk.id === taskId)
  const updateTaskToUse = updateTaskOverride ?? ((id: string, u: Partial<Task>) => {
    updateTask(id, u)
    return true
  })

  const [formData, setFormData] = useState<Partial<Task>>({})
  const [assignments, setAssignments] = useState<ResourceAssignment[]>([])
  const [predecessorsInput, setPredecessorsInput] = useState('')

  const taskType: TaskType = useMemo(() => {
    if (!task) return 'regular'
    if (task.isMilestone) return 'milestone'
    if (task.isSummary) return 'summary'
    return 'regular'
  }, [task])

  const successors = useMemo(() => {
    if (!taskId) return []
    return tasks.filter(tsk => tsk.predecessors?.includes(taskId)).map(tsk => tsk.id)
  }, [tasks, taskId])

  useEffect(() => {
    if (task && isOpen) {
      setFormData({
        name: task.name, progress: task.progress, notes: task.notes || '',
        startDate: new Date(task.startDate), endDate: new Date(task.endDate),
        constraint: task.constraint, constraintDate: task.constraintDate ? new Date(task.constraintDate) : undefined,
      })
      setAssignments(migrateToAssignments(task))
      setPredecessorsInput(task.predecessors?.join(', ') || '')
    }
  }, [task, isOpen])

  if (!task) return null

  const handleSave = () => {
    const predecessorsArray = predecessorsInput.split(',').map(s => s.trim()).filter(s => s !== '')
    const payload: Partial<Task> = {
      ...formData,
      resourceAssignments: assignments,
      predecessors: predecessorsArray,
      constraint: formData.constraint,
      constraintDate: formData.constraintDate,
    }
    const applied = updateTaskToUse(task.id, payload)
    if (applied === false) return
    onClose()
  }

  const handleProgressChange = (value: number) => {
    setFormData(prev => ({ ...prev, progress: normalizeFraction(value) }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="p-0 border-none overflow-hidden w-[600px] min-h-[650px] max-h-[85vh] rounded-2xl shadow-2xl bg-[hsl(var(--primary))] gap-0 flex flex-col" 
        hideClose
      >
        <DialogHeader task={task} taskType={taskType} onClose={onClose} t={t} />
        <DialogBody
          formData={formData} setFormData={setFormData} taskType={taskType}
          assignments={assignments} setAssignments={setAssignments}
          predecessorsInput={predecessorsInput} setPredecessorsInput={setPredecessorsInput}
          successors={successors} resources={resources} t={t} onProgressChange={handleProgressChange}
        />
        <DialogFooter className="p-6 px-8 bg-white flex flex-row gap-4 sm:space-x-0 border-t border-slate-200">
          <Button variant="ghost" onClick={onClose} className="flex-1 h-12 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl text-base border border-slate-200">
            {t('common.cancel', { defaultValue: 'Отмена' })}
          </Button>
          <Button onClick={handleSave} className="flex-1 h-12 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white font-bold shadow-md rounded-xl text-base">
            {t('common.save', { defaultValue: 'Сохранить' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** Преобразование назначений задачи в массив ResourceAssignment */
const migrateToAssignments = (task: Task): ResourceAssignment[] => {
  if (task.resourceAssignments?.length) return task.resourceAssignments
  return []
}

const DialogHeader: React.FC<{task: Task; taskType: TaskType; onClose: () => void; t: (k: string, o?: Record<string,string>) => string}> = ({ task, taskType, onClose, t }) => {
  const Icon = taskType === 'milestone' ? Diamond : taskType === 'summary' ? FolderTree : Settings2
  return (
    <div className="p-10 pb-8 text-white relative shadow-lg">
      <button onClick={onClose} className="absolute right-4 top-4 opacity-70 hover:opacity-100 transition-all p-2 rounded-full hover:bg-white/10 z-50"><X size={20} /></button>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center p-3 shadow-lg flex-shrink-0"><Icon className="h-5 w-5" /></div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-extrabold tracking-tight truncate mb-0.5">{t('task_props.title', { defaultValue: 'Свойства задачи' })}</h2>
          <p className="text-[10px] font-semibold text-white/80 uppercase tracking-wider truncate">{task.name}</p>
        </div>
      </div>
    </div>
  )
}

interface DialogBodyProps {
  formData: Partial<Task>; setFormData: React.Dispatch<React.SetStateAction<Partial<Task>>>;
  taskType: TaskType; assignments: ResourceAssignment[]; setAssignments: React.Dispatch<React.SetStateAction<ResourceAssignment[]>>;
  predecessorsInput: string; setPredecessorsInput: React.Dispatch<React.SetStateAction<string>>;
  successors: string[]; resources: import('@/types/resource-types').Resource[];
  t: (k: string, o?: Record<string,string>) => string; onProgressChange: (v: number) => void;
}

const DialogBody: React.FC<DialogBodyProps> = (props) => {
  const { preferences } = useUserPreferences()
  const honorRequiredDates = preferences.schedule?.honorRequiredDates ?? false

  return (
    <div className="bg-white rounded-t-2xl flex-1 flex flex-col overflow-hidden">
      <Tabs defaultValue="general" className="w-full flex flex-col flex-1">
        <TabsList className="flex w-full justify-center bg-slate-50 rounded-none border-b border-slate-200 p-1.5 gap-0.5 overflow-x-auto">
          <TabsTrigger value="general" className="flex-shrink-0 px-2.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap data-[state=active]:bg-white data-[state=active]:shadow-sm"><Settings2 className="h-3.5 w-3.5 mr-1" />{props.t('task_props.tab_general', { defaultValue: 'Общие' })}</TabsTrigger>
          <TabsTrigger value="resources" className="flex-shrink-0 px-2.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap data-[state=active]:bg-white data-[state=active]:shadow-sm"><Users className="h-3.5 w-3.5 mr-1" />{props.t('task_props.tab_resources', { defaultValue: 'Ресурсы' })}</TabsTrigger>
          <TabsTrigger value="links" className="flex-shrink-0 px-2.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap data-[state=active]:bg-white data-[state=active]:shadow-sm"><Link2 className="h-3.5 w-3.5 mr-1" />{props.t('task_props.tab_links', { defaultValue: 'Связи' })}</TabsTrigger>
          <TabsTrigger value="notes" className="flex-shrink-0 px-2.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap data-[state=active]:bg-white data-[state=active]:shadow-sm"><MessageSquare className="h-3.5 w-3.5 mr-1" />{props.t('task_props.tab_notes', { defaultValue: 'Заметки' })}</TabsTrigger>
          <AdvancedTabTrigger honorRequiredDates={honorRequiredDates} t={props.t} />
        </TabsList>
        <TabsContent value="general" className="p-6 space-y-4 mt-0 min-h-[500px] overflow-y-auto bg-slate-50">
          <GeneralTab formData={props.formData} setFormData={props.setFormData} taskType={props.taskType} onProgressChange={props.onProgressChange} t={props.t} />
        </TabsContent>
        <TabsContent value="resources" className="p-8 mt-0 min-h-[500px] bg-slate-50">
          {props.taskType === 'summary' ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
                <FolderTree className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-lg font-semibold text-slate-700 mb-2">
                {props.t('task_props.summary_no_resources_title', { defaultValue: 'Суммарная задача' })}
              </p>
              <p className="text-sm text-center max-w-md text-slate-500">
                {props.t('task_props.summary_no_resources_hint', { defaultValue: 'Назначение ресурсов на суммарные задачи недоступно. Назначайте ресурсы на дочерние задачи для корректного расчёта нагрузки.' })}
              </p>
            </div>
          ) : (
            <ResourceAssignmentTab resources={props.resources} assignments={props.assignments} onAssignmentsChange={props.setAssignments} t={props.t} />
          )}
        </TabsContent>
        <TabsContent value="links" className="p-8 space-y-6 mt-0 min-h-[500px] overflow-y-auto bg-slate-50">
          <LinksTab predecessorsInput={props.predecessorsInput} setPredecessorsInput={props.setPredecessorsInput} successors={props.successors} t={props.t} />
        </TabsContent>
        <TabsContent value="notes" className="p-8 mt-0 min-h-[500px] bg-slate-50">
          <NotesTab notes={props.formData.notes || ''} setNotes={(notes) => props.setFormData(prev => ({ ...prev, notes }))} t={props.t} />
        </TabsContent>
        <TabsContent value="advanced" className="p-8 space-y-6 mt-0 min-h-[500px] overflow-y-auto bg-slate-50">
          <AdvancedTab formData={props.formData} setFormData={props.setFormData} t={props.t} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface AdvancedTabTriggerProps {
  honorRequiredDates: boolean
  t: (k: string, o?: Record<string,string>) => string
}

const AdvancedTabTrigger: React.FC<AdvancedTabTriggerProps> = ({ honorRequiredDates, t }) => (
  <TabsTrigger value="advanced" className="flex-shrink-0 px-2.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap data-[state=active]:bg-white data-[state=active]:shadow-sm">
    <Settings className="h-3.5 w-3.5 mr-1" />
    {t('task_props.tab_advanced', { defaultValue: 'Дополнительно' })}
    {!honorRequiredDates && (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="ml-1 h-3.5 w-3.5 text-amber-500" />
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <p className="text-sm">{t('task_props.advanced_disabled_hint', { defaultValue: 'Включите "Соблюдать обязательные даты" для активации' })}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )}
  </TabsTrigger>
)

export default TaskPropertiesDialog
