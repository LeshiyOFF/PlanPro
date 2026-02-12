import React, { createContext, useCallback, useContext, useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type PromptResolve = (value: string | null) => void

interface PromptContextValue {
  showPrompt: (message: string, defaultValue?: string) => Promise<string | null>;
}

const PromptContext = createContext<PromptContextValue | null>(null)

interface PromptState {
  open: boolean;
  message: string;
  defaultValue: string;
}

/**
 * Провайдер диалога ввода (замена window.prompt).
 * Предоставляет showPrompt для использования в хуках и компонентах.
 */
export const PromptProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PromptState>({
    open: false,
    message: '',
    defaultValue: '',
  })
  const [inputValue, setInputValue] = useState('')
  const resolveRef = useRef<PromptResolve | null>(null)

  const showPrompt = useCallback((message: string, defaultValue = '') => {
    return new Promise<string | null>((resolve) => {
      resolveRef.current = resolve
      setState({ open: true, message, defaultValue })
      setInputValue(defaultValue)
    })
  }, [])

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open && resolveRef.current) {
      resolveRef.current(null)
      resolveRef.current = null
    }
    setState((prev) => ({ ...prev, open }))
  }, [])

  const handleConfirm = useCallback(() => {
    if (resolveRef.current) {
      resolveRef.current(inputValue.trim() || null)
      resolveRef.current = null
    }
    setState((prev) => ({ ...prev, open: false }))
  }, [inputValue])

  const handleCancel = useCallback(() => {
    if (resolveRef.current) {
      resolveRef.current(null)
      resolveRef.current = null
    }
    setState((prev) => ({ ...prev, open: false }))
  }, [])

  const value: PromptContextValue = { showPrompt }

  return (
    <PromptContext.Provider value={value}>
      {children}
      <Dialog open={state.open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ввод</DialogTitle>
            <DialogDescription>{state.message}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            <Label htmlFor="prompt-input">Значение</Label>
            <Input
              id="prompt-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirm()
                if (e.key === 'Escape') handleCancel()
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Отмена
            </Button>
            <Button onClick={handleConfirm}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PromptContext.Provider>
  )
}

export function usePrompt(): PromptContextValue | null {
  return useContext(PromptContext)
}
