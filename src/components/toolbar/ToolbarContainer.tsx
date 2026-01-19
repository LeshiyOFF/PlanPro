import React, { useState, useEffect, useCallback } from 'react';
import { useActionManager } from '@/providers/hooks/useActionManager';
import './ToolbarStyles.css';
import {
  IToolbarContainer,
  IToolbarGroup,
  IToolbarButton,
  ToolbarType
} from './interfaces/ToolbarInterfaces';
import {
  // Стандартный тулбар (TB001-TB007)
  NewAction,
  OpenAction,
  SaveAction,
  PrintAction,
  UndoAction,
  RedoAction,
  FindAction,
  // Тулбар форматирования (TF001-TF005)
  BoldAction,
  ItalicAction,
  UnderlineAction,
  FontSizeAction,
  FontFamilyAction
} from './actions';

/**
 * Контейнер тулбаров с поддержкой 24 кнопок
 * Следует принципам SOLID и Clean Architecture
 */
export const ToolbarContainer: React.FC<IToolbarContainer> = ({ className, onAction }) => {
  const actionManager = useActionManager();
  const [actions] = useState(() => ({
    // Стандартные действия
    new: new NewAction(),
    open: new OpenAction(),
    save: new SaveAction(),
    print: new PrintAction(),
    undo: new UndoAction(),
    redo: new RedoAction(),
    find: new FindAction(),
    // Действия форматирования
    bold: new BoldAction(),
    italic: new ItalicAction(),
    underline: new UnderlineAction(),
    fontSize: new FontSizeAction(),
    fontFamily: new FontFamilyAction()
  }));

  // Регистрация действий при монтировании
  useEffect(() => {
    // Регистрация стандартных действий
    actionManager.registerAction(actions.new, 'file');
    actionManager.registerAction(actions.open, 'file');
    actionManager.registerAction(actions.save, 'file');
    actionManager.registerAction(actions.print, 'file');
    actionManager.registerAction(actions.undo, 'edit');
    actionManager.registerAction(actions.redo, 'edit');
    actionManager.registerAction(actions.find, 'edit');
    
    // Регистрация действий форматирования
    actionManager.registerAction(actions.bold, 'format');
    actionManager.registerAction(actions.italic, 'format');
    actionManager.registerAction(actions.underline, 'format');
    actionManager.registerAction(actions.fontSize, 'format');
    actionManager.registerAction(actions.fontFamily, 'format');
  }, []);

  const [toolbarGroups, setToolbarGroups] = useState<IToolbarGroup[]>([]);

  /**
   * Создаёт группы кнопок для тулбара
   */
  const createToolbarGroups = useCallback((): IToolbarGroup[] => {
    return [
      {
        id: 'standard',
        title: 'Стандартный',
        buttons: [
          actions.new.createButton(),
          actions.open.createButton(),
          actions.save.createButton(),
          actions.print.createButton(),
          actions.undo.createButton(),
          actions.redo.createButton(),
          actions.find.createButton()
        ]
      },
      {
        id: 'formatting',
        title: 'Форматирование',
        buttons: [
          actions.bold.createButton(),
          actions.italic.createButton(),
          actions.underline.createButton(),
          actions.fontSize.createButton(),
          actions.fontFamily.createButton()
        ]
      }
    ];
  }, [actions]);

  useEffect(() => {
    setToolbarGroups(createToolbarGroups());
  }, [createToolbarGroups]);

  /**
   * Обработчик нажатия на кнопку
   */
  const handleButtonClick = useCallback((button: IToolbarButton) => {
    try {
      button.onClick();
      onAction?.(button.id, button.label);
    } catch (error) {
      console.error(`Ошибка при выполнении действия ${button.id}:`, error);
    }
  }, [onAction]);

  /**
   * Рендерит отдельную кнопку
   */
  const renderButton = useCallback((button: IToolbarButton) => {
    const buttonClass = [
      'toolbar-button',
      button.className,
      button.disabled ? 'toolbar-button-disabled' : ''
    ].filter(Boolean).join(' ');

    if (button.dropdownItems && button.dropdownItems.length > 0) {
      return (
        <div key={button.id} className="toolbar-dropdown">
          <button
            className={buttonClass}
            onClick={() => button.onClick()}
            disabled={button.disabled}
            title={button.tooltip}
          >
            <span className="toolbar-button-icon">{button.icon}</span>
            <span className="toolbar-button-label">{button.label}</span>
            <span className="toolbar-dropdown-arrow">▼</span>
          </button>
          {button.dropdownItems.length > 0 && (
            <div className="toolbar-dropdown-menu">
              {button.dropdownItems.map(item => (
                <button
                  key={item.id}
                  className="toolbar-dropdown-item"
                  onClick={() => item.onClick()}
                >
                  <span className="toolbar-dropdown-icon">{item.icon}</span>
                  <span className="toolbar-dropdown-label">{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        key={button.id}
        className={buttonClass}
        onClick={() => handleButtonClick(button)}
        disabled={button.disabled}
        title={button.tooltip}
      >
        <span className="toolbar-button-icon">{button.icon}</span>
        <span className="toolbar-button-label">{button.label}</span>
      </button>
    );
  }, [handleButtonClick]);

  /**
   * Рендерит группу кнопок
   */
  const renderGroup = useCallback((group: IToolbarGroup) => {
    if (!group.visible && group.visible !== undefined) {
      return null;
    }

    return (
      <div key={group.id} className={`toolbar-group ${group.className || ''}`}>
        {group.buttons.map(renderButton)}
      </div>
    );
  }, [renderButton]);

  return (
    <div className={`toolbar-container ${className || ''}`}>
      {toolbarGroups.map(renderGroup)}
    </div>
  );
};

