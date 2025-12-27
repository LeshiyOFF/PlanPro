import { MenuItemConstructorOptions } from 'electron'
import { FileMenuTemplate } from './menu-templates/FileMenuTemplate'
import { EditMenuTemplate } from './menu-templates/EditMenuTemplate'
import { ViewMenuTemplate } from './menu-templates/ViewMenuTemplate'
import { ProjectMenuTemplate } from './menu-templates/ProjectMenuTemplate'
import { WindowMenuTemplate } from './menu-templates/WindowMenuTemplate'
import { HelpMenuTemplate } from './menu-templates/HelpMenuTemplate'

/**
 * Сервис для создания шаблонов меню
 * Отвечает только за генерацию структуры меню
 */
export class MenuTemplateService {
  
  /**
   * Создание меню "Файл"
   */
  public createFileMenu(): MenuItemConstructorOptions {
    return FileMenuTemplate.create()
  }

  /**
   * Создание меню "Правка"
   */
  public createEditMenu(): MenuItemConstructorOptions {
    return EditMenuTemplate.create()
  }

  /**
   * Создание меню "Вид"
   */
  public createViewMenu(): MenuItemConstructorOptions {
    return ViewMenuTemplate.create()
  }

  /**
   * Создание меню "Проект"
   */
  public createProjectMenu(): MenuItemConstructorOptions {
    return ProjectMenuTemplate.create()
  }

  /**
   * Создание меню "Окно"
   */
  public createWindowMenu(): MenuItemConstructorOptions {
    return WindowMenuTemplate.create()
  }

  /**
   * Создание меню "Справка"
   */
  public createHelpMenu(isMac: boolean): MenuItemConstructorOptions {
    return HelpMenuTemplate.create(isMac)
  }

  /**
   * Получение полного шаблона меню
   */
  public getFullTemplate(isMac: boolean): MenuItemConstructorOptions[] {
    return [
      this.createFileMenu(),
      this.createEditMenu(),
      this.createViewMenu(),
      this.createProjectMenu(),
      this.createWindowMenu(),
      this.createHelpMenu(isMac)
    ]
  }
}