import { ReactNode } from 'react';

/**
 * Интерфейс для ViewHeader (Tier 1: Title Bar)
 * Отображает заголовок представления с опциональными иконкой, описанием и помощью
 */
export interface ViewHeaderProps {
  /** Заголовок представления (обязательно) */
  title: string;
  
  /** Краткое описание под заголовком (опционально) */
  description?: string;
  
  /** Иконка слева от заголовка (опционально) */
  icon?: ReactNode;
  
  /** Контекстная помощь (опционально) */
  help?: {
    title: string;
    content: ReactNode;
  };
  
  /** Дополнительные CSS классы */
  className?: string;
}

/**
 * Интерфейс для кнопки действия
 */
export interface ActionButton {
  /** Текст кнопки */
  label: string;
  
  /** Обработчик клика */
  onClick: () => void;
  
  /** Иконка перед текстом (опционально) */
  icon?: ReactNode;
  
  /** Вариант кнопки (для secondary actions) */
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  
  /** Отключить кнопку */
  disabled?: boolean;
  
  /** Tooltip при наведении */
  title?: string;
}

/**
 * Интерфейс для ActionBar (Tier 2: Action Bar)
 * Панель действий с primary/secondary кнопками и контролами
 */
export interface ActionBarProps {
  /** Основное действие (одна кнопка с акцентом) */
  primaryAction?: ActionButton;
  
  /** Вторичные действия (2-3 кнопки) */
  secondaryActions?: ActionButton[];
  
  /** Кастомные контролы справа (фильтры, zoom и т.д.) */
  controls?: ReactNode;
  
  /** Дополнительные CSS классы */
  className?: string;
}

/**
 * Интерфейс для TwoTierHeader (композитный компонент)
 * Объединяет ViewHeader + ActionBar
 */
export interface TwoTierHeaderProps extends ViewHeaderProps {
  /** Настройки для Action Bar */
  actionBar?: ActionBarProps;
}
