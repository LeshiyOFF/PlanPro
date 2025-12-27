"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileMenuTemplate = void 0;
/**
 * Шаблон меню "Файл"
 */
class FileMenuTemplate {
    /**
     * Создание меню "Файл"
     */
    static create() {
        return {
            label: 'Файл',
            submenu: [
                {
                    label: 'Новый проект',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => this.handleMenuAction('new-project')
                },
                {
                    label: 'Открыть проект...',
                    accelerator: 'CmdOrCtrl+O',
                    click: () => this.handleMenuAction('open-project')
                },
                { type: 'separator' },
                {
                    label: 'Сохранить',
                    accelerator: 'CmdOrCtrl+S',
                    click: () => this.handleMenuAction('save-project')
                },
                {
                    label: 'Сохранить как...',
                    accelerator: 'CmdOrCtrl+Shift+S',
                    click: () => this.handleMenuAction('save-project-as')
                },
                { type: 'separator' },
                {
                    label: 'Импорт',
                    submenu: [
                        {
                            label: 'Из Microsoft Project...',
                            click: () => this.handleMenuAction('import-msproject')
                        },
                        {
                            label: 'Из Excel...',
                            click: () => this.handleMenuAction('import-excel')
                        }
                    ]
                },
                {
                    label: 'Экспорт',
                    submenu: [
                        {
                            label: 'В Microsoft Project...',
                            click: () => this.handleMenuAction('export-msproject')
                        },
                        {
                            label: 'В PDF...',
                            click: () => this.handleMenuAction('export-pdf')
                        },
                        {
                            label: 'В Excel...',
                            click: () => this.handleMenuAction('export-excel')
                        }
                    ]
                },
                { type: 'separator' },
                {
                    label: 'Выход',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                    click: () => this.handleMenuAction('quit')
                }
            ]
        };
    }
    /**
     * Обработчик действий меню
     */
    static handleMenuAction(action) {
        console.log(`File menu action: ${action}`);
    }
}
exports.FileMenuTemplate = FileMenuTemplate;
//# sourceMappingURL=FileMenuTemplate.js.map