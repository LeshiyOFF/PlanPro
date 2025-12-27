"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuTemplateService = void 0;
const FileMenuTemplate_1 = require("./menu-templates/FileMenuTemplate");
const EditMenuTemplate_1 = require("./menu-templates/EditMenuTemplate");
const ViewMenuTemplate_1 = require("./menu-templates/ViewMenuTemplate");
const ProjectMenuTemplate_1 = require("./menu-templates/ProjectMenuTemplate");
const WindowMenuTemplate_1 = require("./menu-templates/WindowMenuTemplate");
const HelpMenuTemplate_1 = require("./menu-templates/HelpMenuTemplate");
/**
 * Сервис для создания шаблонов меню
 * Отвечает только за генерацию структуры меню
 */
class MenuTemplateService {
    /**
     * Создание меню "Файл"
     */
    createFileMenu() {
        return FileMenuTemplate_1.FileMenuTemplate.create();
    }
    /**
     * Создание меню "Правка"
     */
    createEditMenu() {
        return EditMenuTemplate_1.EditMenuTemplate.create();
    }
    /**
     * Создание меню "Вид"
     */
    createViewMenu() {
        return ViewMenuTemplate_1.ViewMenuTemplate.create();
    }
    /**
     * Создание меню "Проект"
     */
    createProjectMenu() {
        return ProjectMenuTemplate_1.ProjectMenuTemplate.create();
    }
    /**
     * Создание меню "Окно"
     */
    createWindowMenu() {
        return WindowMenuTemplate_1.WindowMenuTemplate.create();
    }
    /**
     * Создание меню "Справка"
     */
    createHelpMenu(isMac) {
        return HelpMenuTemplate_1.HelpMenuTemplate.create(isMac);
    }
    /**
     * Получение полного шаблона меню
     */
    getFullTemplate(isMac) {
        return [
            this.createFileMenu(),
            this.createEditMenu(),
            this.createViewMenu(),
            this.createProjectMenu(),
            this.createWindowMenu(),
            this.createHelpMenu(isMac)
        ];
    }
}
exports.MenuTemplateService = MenuTemplateService;
//# sourceMappingURL=MenuTemplateService.js.map