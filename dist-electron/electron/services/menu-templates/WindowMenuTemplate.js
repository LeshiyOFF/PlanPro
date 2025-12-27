"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WindowMenuTemplate = void 0;
/**
 * Шаблон меню "Окно"
 */
class WindowMenuTemplate {
    /**
     * Создание меню "Окно"
     */
    static create() {
        return {
            label: 'Окно',
            submenu: [
                { role: 'minimize', label: 'Свернуть' },
                { role: 'close', label: 'Закрыть' }
            ]
        };
    }
}
exports.WindowMenuTemplate = WindowMenuTemplate;
//# sourceMappingURL=WindowMenuTemplate.js.map