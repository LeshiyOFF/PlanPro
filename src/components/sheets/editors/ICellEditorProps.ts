import React from 'react';

/**
 * Общие пропсы для всех редакторов ячеек
 */
export interface ICellEditorProps {
  value: any;
  onChange: (value: any) => void;
  onCommit: (value?: any) => void;
  onCancel: () => void;
  autoFocus?: boolean;
  isValid?: boolean;
  errorMessage?: string;
  options?: Array<{ label: string; value: any }>;
}


