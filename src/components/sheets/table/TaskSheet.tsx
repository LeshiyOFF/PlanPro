import React, { forwardRef } from 'react'
import { ProfessionalSheet, type ProfessionalSheetHandle } from './ProfessionalSheet'
import { Task } from '@/store/project/interfaces'
import { CellValue } from '@/types/sheet/CellValueTypes'
import { toFraction } from '@/utils/ProgressFormatter'
import { useTaskSheetCompactColumns } from '@/hooks/sheets/useTaskSheetCompactColumns'
import { useTaskSheetFullColumns } from '@/hooks/sheets/useTaskSheetFullColumns'
import type { JsonObject } from '@/types/json-types'

/** Тип строки для ProfessionalSheet: Task с индексной сигнатурой для generic T */
type TaskRow = Task & Record<string, JsonObject>;

interface TaskSheetProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onContextMenu?: (event: React.MouseEvent, task: Task) => void;
  onRowSelect?: (task: Task) => void;
  onDeleteTasks?: (taskIds: string[]) => void;
  disabledTaskIds?: string[];
  className?: string;
  variant?: 'compact' | 'full';
}

/**
 * TaskSheet - Специализированная таблица задач.
 * Поддерживает compact (для панелей) и full (для основного вида) варианты.
 */
export const TaskSheet = forwardRef<ProfessionalSheetHandle, TaskSheetProps>(({
  tasks,
  onTaskUpdate,
  onContextMenu,
  onRowSelect,
  onDeleteTasks,
  disabledTaskIds = [],
  className = '',
  variant = 'full',
}, ref) => {
  const compactColumns = useTaskSheetCompactColumns(disabledTaskIds)
  const fullColumns = useTaskSheetFullColumns()
  const columns = variant === 'compact' ? compactColumns : fullColumns

  const handleDataChange = (rowId: string, field: string, value: CellValue) => {
    let finalValue: CellValue | string[] = value
    if (field === 'progress' && typeof value === 'string') {
      finalValue = toFraction(parseFloat(value) || 0)
    } else if (field === 'predecessors' && typeof value === 'string') {
      finalValue = value.split(',').map(s => s.trim()).filter(s => s !== '')
    } else if ((field === 'startDate' || field === 'endDate') && value) {
      const date = new Date(value as string | number | Date)
      if (!isNaN(date.getTime())) {
        if (field === 'startDate') {
          date.setHours(0, 0, 0, 0)
        } else {
          date.setHours(23, 59, 59, 999)
        }
        finalValue = date
      }
    }
    onTaskUpdate(rowId, { [field]: finalValue } as Partial<Task>)
  }

  const data = tasks as TaskRow[]

  return (
    <div className={`h-full flex flex-col bg-white overflow-hidden ${className}`}>
      <ProfessionalSheet<TaskRow>
        ref={ref}
        data={data}
        columns={columns}
        rowIdField="id"
        onDataChange={handleDataChange}
        onContextMenu={onContextMenu}
        onRowSelect={onRowSelect}
        onDeleteRows={onDeleteTasks}
        disabledRowIds={disabledTaskIds}
        className="border-none rounded-none"
      />
    </div>
  )
})
