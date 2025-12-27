"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectMenuTemplate = void 0;
/**
 * Шаблон меню "Проект"
 */
class ProjectMenuTemplate {
    /**
     * Создание меню "Проект"
     */
    static create() {
        return {
            label: 'Проект',
            submenu: [
                {
                    label: 'Свойства проекта...',
                    click: () => this.handleMenuAction('project-properties')
                },
                { type: 'separator' },
                {
                    label: 'Календарь...',
                    click: () => this.handleMenuAction('calendar-settings')
                },
                {
                    label: 'Ресурсы...',
                    click: () => this.handleMenuAction('resources')
                },
                { type: 'separator' },
                {
                    label: 'Статистика проекта',
                    click: () => this.handleMenuAction('project-statistics')
                }
            ]
        };
    }
    /**
     * Обработчик действий меню
     */
    static handleMenuAction(action) {
        console.log(`Project menu action: ${action}`);
    }
}
exports.ProjectMenuTemplate = ProjectMenuTemplate;
//# sourceMappingURL=ProjectMenuTemplate.js.map