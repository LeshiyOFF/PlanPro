/**
 * Индекс типизированных диалогов
 * Централизованный экспорт всех типизированных компонентов
 */

import { TypedAboutDialog } from '../information/TypedAboutDialog'
import { TypedWelcomeDialog } from '../information/TypedWelcomeDialog'
import { TypedTaskDetailsDialog } from '../task/TypedTaskDetailsDialog'
import { dialogService } from '@/services/dialog/TypedDialogService'

export { TypedBaseDialog } from '../base/TypedBaseDialog'
export { TypedDialogProvider, useTypedDialog, useDialog } from '../context/TypedDialogContext'
export { TypedAboutDialog } from '../information/TypedAboutDialog'
export { TypedWelcomeDialog } from '../information/TypedWelcomeDialog'
export { TypedTaskDetailsDialog } from '../task/TypedTaskDetailsDialog'
export { TypedWorkingTimeDialog } from '../calendar/components/WorkingTimeForm'

/**
 * Инициализация типизированных диалогов
 * Регистрирует все типизированные диалоги в сервисе
 */
export const initializeTypedDialogs = (): void => {
  // Регистрация About диалога
  dialogService.register({
    id: 'about-dialog',
    type: 'about' as const,
    component: TypedAboutDialog,
    config: { modal: true, resizable: false, width: 550, height: 600 },
  })

  // Регистрация Welcome диалога
  dialogService.register({
    id: 'welcome-dialog',
    type: 'welcome' as const,
    component: TypedWelcomeDialog,
    config: { modal: true, resizable: false, width: 600, height: 500 },
  })

  // Регистрация Task Details диалога
  dialogService.register({
    id: 'task-details-dialog',
    type: 'task-details' as const,
    component: TypedTaskDetailsDialog,
    config: { modal: true, resizable: true, width: 700, height: 600 },
  })
}
