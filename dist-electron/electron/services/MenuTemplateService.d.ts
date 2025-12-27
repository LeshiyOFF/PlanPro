import { MenuItemConstructorOptions } from 'electron';
/**
 * Сервис для создания шаблонов меню
 * Отвечает только за генерацию структуры меню
 */
export declare class MenuTemplateService {
    /**
     * Создание меню "Файл"
     */
    createFileMenu(): MenuItemConstructorOptions;
    /**
     * Создание меню "Правка"
     */
    createEditMenu(): MenuItemConstructorOptions;
    /**
     * Создание меню "Вид"
     */
    createViewMenu(): MenuItemConstructorOptions;
    /**
     * Создание меню "Проект"
     */
    createProjectMenu(): MenuItemConstructorOptions;
    /**
     * Создание меню "Окно"
     */
    createWindowMenu(): MenuItemConstructorOptions;
    /**
     * Создание меню "Справка"
     */
    createHelpMenu(isMac: boolean): MenuItemConstructorOptions;
    /**
     * Получение полного шаблона меню
     */
    getFullTemplate(isMac: boolean): MenuItemConstructorOptions[];
}
