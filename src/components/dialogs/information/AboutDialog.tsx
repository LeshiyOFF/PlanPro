import React from 'react';
import { useTranslation } from 'react-i18next';
import { BaseDialog } from '@/components/dialogs/base/BaseDialog';
import { 
  IDialogData, 
  IDialogActions 
} from '@/types/dialog/DialogTypes';
import { Info } from 'lucide-react';

export interface AboutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * AboutDialog - Диалог "О программе" с юридической информацией.
 */
export const AboutDialog: React.FC<AboutDialogProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  const aboutData: IDialogData = {
    id: 'about-dialog',
    title: t('welcome.about_title'),
    timestamp: new Date()
  };

  const actions: IDialogActions = {
    onOk: async () => {
      onClose();
    },
    onCancel: () => {
      onClose();
    }
  };

  return (
    <BaseDialog
      data={aboutData}
      actions={actions}
      isOpen={isOpen}
      onClose={() => onClose()}
      config={{
        width: 550,
        height: 600,
        modal: true,
        showHelp: false
      }}
    >
      <div className="flex flex-col items-center p-8 space-y-6 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-2">
          <Info className="w-10 h-10 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{t('welcome.about_title')}</h2>
          <p className="text-base text-muted-foreground">{t('welcome.about_version')}</p>
          <p className="text-[11px] text-muted-foreground uppercase tracking-widest">{t('welcome.about_build')}</p>
        </div>

        <div className="w-full bg-primary/[0.03] p-6 rounded-xl border-2 border-primary/20 text-left transition-colors">
          <p className="text-[13px] leading-relaxed text-slate-600 whitespace-pre-wrap italic">
            {t('welcome.about_legal')}
          </p>
        </div>

        <div className="pt-6 border-t border-border/30 w-full">
          <p className="text-[11px] text-muted-foreground italic">
            {t('welcome.about_copyright')}
          </p>
        </div>
      </div>
    </BaseDialog>
  );
};

