import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface GanttNavigationWarningsProps {
  showEmptyDateWarning: boolean;
  setShowEmptyDateWarning: (show: boolean) => void;
  showLargeJumpWarning: boolean;
  setShowLargeJumpWarning: (show: boolean) => void;
  onConfirmEmptyDate: () => void;
  onConfirmLargeJump: () => void;
}

export const GanttNavigationWarnings: React.FC<GanttNavigationWarningsProps> = ({
  showEmptyDateWarning,
  setShowEmptyDateWarning,
  showLargeJumpWarning,
  setShowLargeJumpWarning,
  onConfirmEmptyDate,
  onConfirmLargeJump,
}) => {
  const { t } = useTranslation()

  return (
    <>
      <Dialog open={showEmptyDateWarning} onOpenChange={setShowEmptyDateWarning}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('gantt.empty_date_title', { defaultValue: 'Пустая область' })}</DialogTitle>
            <DialogDescription>
              {t('gantt.empty_date_message', {
                defaultValue: 'На выбранную дату задач не запланировано. Перейти всё равно?',
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowEmptyDateWarning(false)}>
              {t('common.cancel', { defaultValue: 'Отмена' })}
            </Button>
            <Button onClick={onConfirmEmptyDate}>
              {t('common.continue', { defaultValue: 'Перейти' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showLargeJumpWarning} onOpenChange={setShowLargeJumpWarning}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('gantt.large_jump_title', { defaultValue: 'Большой интервал' })}</DialogTitle>
            <DialogDescription>
              {t('gantt.large_jump_message', {
                defaultValue: 'Выбранная дата находится очень далеко. Рекомендуется переключиться в режим месяца для сохранения производительности. Переключить и перейти?',
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowLargeJumpWarning(false)}>
              {t('common.cancel', { defaultValue: 'Отмена' })}
            </Button>
            <Button onClick={onConfirmLargeJump}>
              {t('common.continue', { defaultValue: 'Переключить и перейти' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
