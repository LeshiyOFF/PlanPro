import { Menu } from 'electron'
import { MenuTemplateService } from './MenuTemplateService'

/**
 * Сервис управления меню приложения
 * Реализует установку меню и делегирует обработчики событий
 */
export class MenuService {
  private readonly templateService: MenuTemplateService

  constructor() {
    this.templateService = new MenuTemplateService()
  }

  /**
   * Установка меню приложения
   */
  public setupMenu(): void {
    const isMac = process.platform === 'darwin'
    const template = this.templateService.getFullTemplate(isMac)
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
  }
}