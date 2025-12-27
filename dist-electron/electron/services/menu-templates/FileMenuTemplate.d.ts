import { MenuItemConstructorOptions } from 'electron';
/**
 * Шаблон меню "Файл"
 */
export declare class FileMenuTemplate {
    /**
     * Создание меню "Файл"
     */
    static create(): MenuItemConstructorOptions;
    /**
     * Обработчик действий меню
     */
    private static handleMenuAction;
}
