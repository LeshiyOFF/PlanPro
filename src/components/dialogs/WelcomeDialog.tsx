import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { FilePlus, FolderOpen, History, Info } from 'lucide-react'
import { useUserPreferences } from '@/components/userpreferences/hooks/useUserPreferences'
import { AboutDialog } from '@/components/dialogs/information/AboutDialog'

interface WelcomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateNew?: () => void;
  onOpenExisting?: () => void;
  onShowRecent?: () => void;
}

/**
 * Диалог приветствия (Welcome Dialog)
 * Отображается при старте приложения, если включен в настройках
 */
export const WelcomeDialog: React.FC<WelcomeDialogProps> = ({
  open,
  onOpenChange,
  onCreateNew,
  onOpenExisting,
  onShowRecent,
}) => {
  const { t } = useTranslation()
  const { preferences, updateDisplayPreferences } = useUserPreferences()
  const [showAgain, setShowAgain] = React.useState(preferences.display.showWelcomeScreen)
  const [isAboutOpen, setIsAboutOpen] = React.useState(false)

  const handleShowAgainChange = (checked: boolean) => {
    setShowAgain(checked)
    updateDisplayPreferences({ showWelcomeScreen: checked })
  }

  const handleAction = (callback?: () => void) => {
    onOpenChange(false)
    if (callback) callback()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl bg-primary"
        closeClassName="text-primary-foreground opacity-80 hover:opacity-100 transition-opacity"
        aria-describedby={undefined}
      >
        {/* Невидимый заголовок для Radix UI */}
        <DialogTitle className="sr-only">ПланПро Welcome</DialogTitle>

        <div className="bg-primary p-8 text-primary-foreground relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2 tracking-tight">ПланПро</h2>
            <p className="text-primary-foreground/80 text-sm font-medium uppercase tracking-widest">
              {t('welcome.subtitle')}
            </p>
          </div>
          {/* Декоративный элемент - теперь более нейтральный */}
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        </div>

        <div className="p-6 space-y-6 bg-white">
          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => handleAction(onCreateNew)}
              className="group flex items-center p-4 rounded-xl border border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-all text-left"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mr-4 group-hover:bg-primary group-hover:text-white transition-colors">
                <FilePlus className="h-6 w-6 text-primary group-hover:text-white" />
              </div>
              <div>
                <div className="font-semibold text-slate-900">{t('welcome.createNew')}</div>
                <div className="text-sm text-slate-500">{t('welcome.createNewDesc')}</div>
              </div>
            </button>

            <button
              onClick={() => handleAction(onOpenExisting)}
              className="group flex items-center p-4 rounded-xl border border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-all text-left"
            >
              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center mr-4 group-hover:bg-primary group-hover:text-white transition-colors">
                <FolderOpen className="h-6 w-6 text-slate-600 group-hover:text-white" />
              </div>
              <div>
                <div className="font-semibold text-slate-900">{t('welcome.openExisting')}</div>
                <div className="text-sm text-slate-500">{t('welcome.openExistingDesc')}</div>
              </div>
            </button>

            <button
              onClick={() => handleAction(onShowRecent)}
              className="group flex items-center p-4 rounded-xl border border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-all text-left"
            >
              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center mr-4 group-hover:bg-primary group-hover:text-white transition-colors">
                <History className="h-6 w-6 text-slate-600 group-hover:text-white" />
              </div>
              <div>
                <div className="font-semibold text-slate-900">{t('welcome.recentProjects')}</div>
                <div className="text-sm text-slate-500">{t('welcome.recentProjectsDesc')}</div>
              </div>
            </button>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/30">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="welcome-show-again"
                checked={showAgain}
                onCheckedChange={(checked) => handleShowAgainChange(!!checked)}
              />
              <Label
                htmlFor="welcome-show-again"
                className="text-xs text-slate-500 cursor-pointer select-none"
              >
                {t('welcome.showAtStartup')}
              </Label>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-slate-400 hover:text-primary"
              onClick={() => setIsAboutOpen(true)}
            >
              <Info className="h-3 w-3 mr-1" /> {t('welcome.about')}
            </Button>
          </div>
        </div>
        <AboutDialog isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

