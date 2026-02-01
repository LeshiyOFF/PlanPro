import React, { createContext, useContext } from 'react';
import { cn } from '@/utils/cn';

/**
 * Контекст для Select
 */
interface SelectContextValue {
  value?: string;
  displayValue?: React.ReactNode;
  onValueChange?: (value: string, displayValue?: React.ReactNode) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

const SelectContext = createContext<SelectContextValue | undefined>(undefined);

/**
 * Компонент Select
 */
interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onValueChange,
  defaultValue: _defaultValue,
  placeholder: _placeholder,
  disabled = false,
  className,
  children
}) => {
  const [open, setOpen] = React.useState(false);
  const [displayValue, setDisplayValue] = React.useState<React.ReactNode>(null);

  // Эффект для поиска текстового представления значения при изменении value или children
  React.useEffect(() => {
    if (!value) {
      setDisplayValue(null);
      return;
    }

    // Ищем SelectItem с нужным value среди children
    let foundLabel: React.ReactNode = null;
    
    const findLabel = (nodes: React.ReactNode) => {
      React.Children.forEach(nodes, (child) => {
        if (foundLabel) return;
        if (!React.isValidElement(child)) return;

        // Если это SelectItem и его value совпадает
        if (child.props.value === value) {
          foundLabel = child.props.children;
          return;
        }

        // Если у элемента есть свои children (например, SelectContent), ищем в них
        if (child.props.children) {
          findLabel(child.props.children);
        }
      });
    };

    findLabel(children);
    setDisplayValue(foundLabel);
  }, [value, children]);

  const handleValueChange = (newValue: string) => {
    onValueChange?.(newValue);
    setOpen(false);
  };

  const contextValue = {
    value,
    displayValue,
    onValueChange: handleValueChange,
    open,
    onOpenChange: setOpen,
    disabled
  };

  return (
    <SelectContext.Provider value={contextValue}>
      <div className={cn('relative w-full', className)}>
        {children}
      </div>
    </SelectContext.Provider>
  );
};

/**
 * Компонент SelectTrigger
 */
interface SelectTriggerProps {
  className?: string;
  children: React.ReactNode;
  /** Идентификатор для связи с Label (a11y). */
  id?: string;
}

export const SelectTrigger: React.FC<SelectTriggerProps> = ({ className, children, id }) => {
  const context = useContext(SelectContext);

  const handleClick = () => {
    if (!context?.disabled) {
      context?.onOpenChange?.(!context?.open);
    }
  };

  return (
    <button
      id={id}
      type="button"
      onClick={handleClick}
      disabled={context?.disabled}
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors soft-border',
        className
      )}
    >
      {children}
      <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
};

/**
 * Компонент SelectValue
 */
interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

export const SelectValue: React.FC<SelectValueProps> = ({ placeholder, className }) => {
  const context = useContext(SelectContext);
  
  // Если у нас есть выбранный текст (displayValue), показываем его.
  // Иначе пытаемся показать сырое значение или placeholder.
  return (
    <span className={cn('block truncate', className)}>
      {context?.displayValue || context?.value || placeholder}
    </span>
  );
};

/**
 * Компонент SelectContent
 */
interface SelectContentProps {
  className?: string;
  children: React.ReactNode;
}

export const SelectContent: React.FC<SelectContentProps> = ({ className, children }) => {
  const context = useContext(SelectContext);

  if (!context?.open) {
    return null;
  }

  return (
    <div className={cn(
      'absolute top-full left-0 right-0 z-50 mt-1 w-full rounded-md border bg-popover p-1 text-popover-foreground shadow-lg soft-border',
      className
    )}>
      {children}
    </div>
  );
};

/**
 * Компонент SelectItem
 */
interface SelectItemProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export const SelectItem: React.FC<SelectItemProps> = ({ value, className, children }) => {
  const context = useContext(SelectContext);
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    context?.onValueChange?.(value);
  };

  // Подсветка выбранного элемента
  const isSelected = context?.value === value;

  return (
    <div
      onClick={handleClick}
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
        isSelected && 'bg-accent text-accent-foreground',
        className
      )}
    >
      {children}
    </div>
  );
};

