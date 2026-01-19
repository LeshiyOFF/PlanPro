import React, { createContext, useContext, useCallback, useState, ReactNode } from 'react';
import { DialogType } from './DialogManager';

interface DialogData {
  type: DialogType;
  data?: any;
  projectId?: string;
  taskId?: string;
  resourceId?: string;
}

interface DialogContextType {
  currentDialog: DialogData | null;
  openDialog: (type: DialogType, data?: any) => void;
  closeDialog: () => void;
  isDialogOpen: (type: DialogType) => boolean;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

interface DialogProviderProps {
  children: ReactNode;
}

export const DialogProvider: React.FC<DialogProviderProps> = ({ children }) => {
  const [currentDialog, setCurrentDialog] = useState<DialogData | null>(null);

  const openDialog = useCallback((type: DialogType, data?: any) => {
    setCurrentDialog({ type, data });
  }, []);

  const closeDialog = useCallback(() => {
    setCurrentDialog(null);
  }, []);

  const isDialogOpen = useCallback((type: DialogType) => {
    return currentDialog?.type === type;
  }, [currentDialog]);

  const value: DialogContextType = {
    currentDialog,
    openDialog,
    closeDialog,
    isDialogOpen
  };

  return (
    <DialogContext.Provider value={value}>
      {children}
    </DialogContext.Provider>
  );
};

export const useDialogContext = (): DialogContextType => {
  const context = useContext(DialogContext);
  if (context === undefined) {
    throw new Error('useDialogContext must be used within a DialogProvider');
  }
  return context;
};

