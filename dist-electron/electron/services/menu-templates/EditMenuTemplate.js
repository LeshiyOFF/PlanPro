"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditMenuTemplate = void 0;
/**
 * Шаблон меню "Правка"
 */
class EditMenuTemplate {
    /**
     * Создание меню "Правка"
     */
    static create() {
        return {
            label: 'Правка',
            submenu: [
                { role: 'undo', label: 'Отменить' },
                { role: 'redo', label: 'Повторить' },
                { type: 'separator' },
                { role: 'cut', label: 'Вырезать' },
                { role: 'copy', label: 'Копировать' },
                { role: 'paste', label: 'Вставить' },
                { role: 'selectAll', label: 'Выбрать все' }
            ]
        };
    }
}
exports.EditMenuTemplate = EditMenuTemplate;
//# sourceMappingURL=EditMenuTemplate.js.map