"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuService = void 0;
const electron_1 = require("electron");
const MenuTemplateService_1 = require("./MenuTemplateService");
/**
 * Сервис управления меню приложения
 * Реализует установку меню и делегирует обработчики событий
 */
class MenuService {
    templateService;
    constructor() {
        this.templateService = new MenuTemplateService_1.MenuTemplateService();
    }
    /**
     * Установка меню приложения
     */
    setupMenu() {
        const isMac = process.platform === 'darwin';
        const template = this.templateService.getFullTemplate(isMac);
        const menu = electron_1.Menu.buildFromTemplate(template);
        electron_1.Menu.setApplicationMenu(menu);
    }
}
exports.MenuService = MenuService;
//# sourceMappingURL=MenuService.js.map