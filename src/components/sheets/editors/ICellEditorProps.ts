import { CellValue } from '@/types/sheet/CellValueTypes';

/**
 * Опция для выбора в редакторе
 */
export interface CellEditorOption {
  label: string;
  value: CellValue;
}

/**
 * Общие пропсы для всех редакторов ячеек
 */
export interface ICellEditorProps {
  value: CellValue;
  onChange: (value: CellValue) => void;
  onCommit: (value?: CellValue) => void;
  onCancel: () => void;
  autoFocus?: boolean;
  isValid?: boolean;
  errorMessage?: string;
  options?: CellEditorOption[];
}
