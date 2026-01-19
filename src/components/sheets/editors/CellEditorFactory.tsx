import React from 'react';
import { SheetColumnType } from '@/domain/sheets/interfaces/ISheetColumn';
import { TextCellEditor } from './TextCellEditor';
import { DateCellEditor } from './DateCellEditor';
import { ICellEditorProps } from './ICellEditorProps';

/**
 * Фабрика редакторов ячеек.
 * Реализует паттерн Factory Method для выбора компонента редактирования.
 */
export class CellEditorFactory {
  /**
   * Возвращает компонент редактора для указанного типа колонки.
   */
  public static getEditor(type: SheetColumnType): React.FC<ICellEditorProps> {
    switch (type) {
      case SheetColumnType.TEXT:
      case SheetColumnType.NUMBER:
      case SheetColumnType.PERCENT:
      case SheetColumnType.DURATION:
        return TextCellEditor;
      
      case SheetColumnType.DATE:
        return DateCellEditor;
      
      // Будут добавлены по мере реализации:
      // case SheetColumnType.SELECT: return SelectCellEditor;
      
      default:
        return TextCellEditor;
    }
  }
}


