import { SheetColumnType } from '../interfaces/ISheetColumn'
import { IValidationResult } from '../interfaces/IValidation'
import { CellValue } from '@/types/sheet/CellValueTypes'
import { ProgressValidator } from './validators/ProgressValidator'
import { DateValidator } from './validators/DateValidator'
import type { JsonValue } from '@/types/json-types'

/**
 * Тип данных строки для валидации
 */
type RowData = Record<string, JsonValue>;

/**
 * Сервис валидации данных таблицы.
 * Реализует паттерн Strategy для выбора нужного валидатора.
 */
export class SheetValidationService {
  private progressValidator = new ProgressValidator()
  private dateValidator = new DateValidator()

  public validate(
    value: CellValue,
    type: SheetColumnType,
    field: string,
    row?: RowData,
  ): IValidationResult {
    switch (type) {
      case SheetColumnType.PERCENT:
        return this.progressValidator.validate(value)

      case SheetColumnType.DATE: {
        const otherDateField = field === 'startDate' ? 'endDate' : 'startDate'
        return this.dateValidator.validate(value, {
          field,
          otherDate: row ? (row[otherDateField] as Date | string | undefined) : undefined,
        })
      }

      default:
        return { isValid: true }
    }
  }
}
