import React, { useMemo, useImperativeHandle, forwardRef } from 'react'
import { useSheetEditing } from '@/hooks/sheets/useSheetEditing'
import { useSheetSelection } from '@/hooks/sheets/useSheetSelection'
import { useSheetDataProcessor } from '@/hooks/sheets/useSheetDataProcessor'
import { SheetValidationService } from '@/domain/sheets/services/SheetValidationService'
import { SheetBatchService } from '@/domain/sheets/services/SheetBatchService'
import { SheetHeader } from './SheetHeader'
import { SheetBody } from './SheetBody'
import { SheetFilterRow } from './SheetFilterRow'
import type { ProfessionalSheetHandle, ProfessionalSheetProps } from './ProfessionalSheetTypes'
import { ProfessionalSheetExport } from './ProfessionalSheetExport'
import { CellValue } from '@/types/sheet/CellValueTypes'
import type { SheetBodyProps } from './SheetBody'
import type { JsonValue } from '@/types/json-types'

/**
 * Professional Sheet - Универсальный движок таблиц.
 */
const ProfessionalSheetRender = <T extends Record<string, JsonValue>>(
  {
    data,
    columns,
    exportOnlyColumns,
    rowIdField,
    onDataChange,
    onBatchChange,
    onContextMenu,
    onRowSelect,
    onDeleteRows,
    disabledRowIds = [],
    className = '',
    scrollRef,
    onScroll,
  }: ProfessionalSheetProps<T>,
  ref: React.Ref<ProfessionalSheetHandle>,
) => {
  const validationService = useMemo(() => new SheetValidationService(), [])
  const batchService = useMemo(() => new SheetBatchService(), [])

  const { processedData, sortRules, toggleSort, setFilter } =
    useSheetDataProcessor(data, columns)

  const exportColumns = useMemo(
    () => [...columns, ...(exportOnlyColumns ?? [])],
    [columns, exportOnlyColumns],
  )

  useImperativeHandle(ref, () => ({
    exportToCSV: async () => ProfessionalSheetExport.exportToCSV(processedData, exportColumns),
  }))

  const allIds = useMemo(
    () => processedData.map((r) => String(r[rowIdField])),
    [processedData, rowIdField],
  )

  const { selectedIds, isSelected, toggleSelection } =
    useSheetSelection(allIds)

  const handleValidate = (value: CellValue, columnId: string, rowId: string) => {
    const column = columns.find((c) => c.id === columnId)
    const row = data.find((r) => String(r[rowIdField]) === rowId)
    if (!column || !row) return { isValid: true }
    return validationService.validate(value, column.type, String(column.field), row)
  }

  const { editState, startEditing, updateEditValue, commitEditing, cancelEditing, isEditing } =
    useSheetEditing(
      (rowId, columnId, value) => {
        const column = columns.find((c) => c.id === columnId)
        if (!column) return

        if (selectedIds.length > 1 && selectedIds.includes(rowId)) {
          if (onBatchChange) {
            onBatchChange(selectedIds, String(column.field), value)
          } else if (onDataChange) {
            batchService.applyUpdate(selectedIds, String(column.field), value, onDataChange)
          }
        } else if (onDataChange) {
          onDataChange(rowId, String(column.field), value)
        }
      },
      handleValidate,
    )

  const visibleColumns = useMemo(() => columns.filter((c) => c.visible), [columns])

  const handleRowClick = (rowId: string, isMulti: boolean, isRange: boolean) => {
    toggleSelection(rowId, isMulti, isRange)
    const row = data.find((r) => String(r[rowIdField]) === rowId)
    if (row && onRowSelect) onRowSelect(row)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Delete' && selectedIds.length > 0 && onDeleteRows) {
      onDeleteRows(selectedIds)
    }
  }

  return (
    <div
      className={`professional-sheet flex flex-col h-full bg-white border border-gray-200 rounded-md overflow-hidden ${className}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div 
        ref={scrollRef}
        className="flex-1 overflow-auto custom-scrollbar"
        onScroll={onScroll}
      >
        <table className="w-full border-collapse table-fixed text-xs select-none min-w-max">
          <SheetHeader columns={visibleColumns} sortRules={sortRules} onSort={toggleSort} />
          <thead className="bg-gray-50">
            <SheetFilterRow columns={visibleColumns} onFilter={setFilter} />
          </thead>
          {(() => {
            const bodyProps: SheetBodyProps<T> = {
              data: processedData,
              columns: visibleColumns,
              rowIdField,
              isEditing,
              isSelected,
              onRowClick: handleRowClick,
              editValue: editState?.currentValue ?? null,
              isValid: editState?.isValid ?? true,
              errorMessage: editState?.errorMessage,
              onStartEdit: startEditing,
              onValueChange: updateEditValue,
              onCommit: commitEditing,
              onCancel: cancelEditing,
              onContextMenu,
              disabledRowIds,
            }
            return <SheetBody<T> {...bodyProps} />
          })()}
        </table>
      </div>
    </div>
  )
}

export const ProfessionalSheet = forwardRef(ProfessionalSheetRender) as <
  T extends Record<string, JsonValue>
>(
  props: ProfessionalSheetProps<T> & { ref?: React.Ref<ProfessionalSheetHandle> }
) => React.ReactElement

export type { ProfessionalSheetHandle } from './ProfessionalSheetTypes'
