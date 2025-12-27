"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelpMenuTemplate = void 0;
/**
 * Шаблон меню "Справка"
 */
class HelpMenuTemplate {
    /**
     * Создание меню "Справка"
     */
    static create(isMac) {
        const helpMenu = {
            label: 'Справка',
            submenu: [
                {
                    label: 'Документация',
                    click: () => this.handleMenuAction('documentation')
                },
                {
                    label: 'Сообщить о проблеме',
                    click: () => this.handleMenuAction('report-issue')
                },
                { type: 'separator' },
                {
                    label: 'Проверить обновления',
                    click: () => this.handleMenuAction('check-updates')
                },
                { type: 'separator' },
                {
                    label: 'О ProjectLibre',
                    click: () => this.handleMenuAction('about')
                }
            ]
        };
        if (isMac && Array.isArray(helpMenu.submenu)) {
            helpMenu.submenu.push({ type: 'separator' }, {
                label: 'Привлечь ProjectLibre',
                click: () => this.handleMenuAction('donate')
            });
        }
        return helpMenu;
    }
    /**
     * Обработчик действий меню
     */
    static handleMenuAction(action) {
        console.log(`Help menu action: ${action}`);
    }
}
exports.HelpMenuTemplate = HelpMenuTemplate;
//# sourceMappingURL=HelpMenuTemplate.js.map