import { ISheetColumn } from '@/domain/sheets/interfaces/ISheetColumn'
import { extractTextFromFormatted } from './ProfessionalSheetTypes'
import type { JsonValue } from '@/types/json-types'
import type { CellValue } from '@/types/sheet/CellValueTypes'

/**
 * Сервис для экспорта таблицы в CSV
 */
export class ProfessionalSheetExport {
  public static async exportToCSV<T extends Record<string, JsonValue>>(
    processedData: T[],
    columns: ISheetColumn<T>[],
  ): Promise<Blob> {
    const visibleColumns = columns.filter((c) => c.visible)

    const headers = visibleColumns
      .map((c) => `"${String(c.title).replace(/"/g, '""')}"`)
      .join(';')

    const rows = processedData.map((row) => {
      return visibleColumns
        .map((col) => {
          let value: JsonValue = row[col.field as string]

          if (col.formatter) {
            try {
              const formatted = col.formatter(value as CellValue, row)
              value = extractTextFromFormatted(formatted)
            } catch (e) {
              console.warn(`Export: Failed to format field ${String(col.field)}`, e)
            }
          } else {
            if (value instanceof Date) {
              value = value.toLocaleDateString()
            } else if (value === null || value === undefined) {
              value = ''
            }
          }

          return `"${String(value).replace(/"/g, '""').replace(/[\r\n]+/g, ' ')}"`
        })
        .join(';')
    })

    const csvContent = [headers, ...rows].join('\r\n')
    const BOM = new Uint8Array([0xef, 0xbb, 0xbf])
    return new Blob([BOM, csvContent], { type: 'text/csv;charset=utf-8;' })
  }
}
