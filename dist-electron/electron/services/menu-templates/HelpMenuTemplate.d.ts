import { MenuItemConstructorOptions } from 'electron';
/**
 * Шаблон меню "Справка"
 */
export declare class HelpMenuTemplate {
    /**
     * Создание меню "Справка"
     */
    static create(isMac: boolean): MenuItemConstructorOptions;
    /**
     * Обработчик действий меню
     */
    private static handleMenuAction;
}
