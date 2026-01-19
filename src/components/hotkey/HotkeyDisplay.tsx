import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { SafeTooltip } from '@/components/ui/Tooltip';
import { hotkeyToString } from '@/types/HotkeyTypes';
import type { Hotkey, HotkeyConfig } from '@/types/HotkeyTypes';

interface HotkeyDisplayProps {
  hotkey?: Hotkey;
  config?: HotkeyConfig;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'secondary';
  className?: string;
}

/**
 * Компонент для отображения горячих клавиш
 */
export const HotkeyDisplay: React.FC<HotkeyDisplayProps> = ({
  hotkey,
  config,
  showLabel = false,
  size = 'md',
  variant = 'default',
  className = ''
}) => {
  const keys = config?.keys || hotkey;
  const label = config?.description;

  if (!keys) return null;

  const getKeyName = (key: string): string => {
    const keyMap: Record<string, string> = {
      'Control': 'Ctrl',
      'Meta': 'Cmd',
      'ArrowUp': '↑',
      'ArrowDown': '↓',
      'ArrowLeft': '←',
      'ArrowRight': '→',
      ' ': 'Space'
    };
    return keyMap[key] || key;
  };

  const keyElements = [
    ...(keys.ctrl ? ['Ctrl'] : []),
    ...(keys.alt ? ['Alt'] : []),
    ...(keys.shift ? ['Shift'] : []),
    ...(keys.meta ? ['Cmd'] : []),
    [getKeyName(keys.key)]
  ];

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const keySizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs min-w-[20px]',
    md: 'px-2 py-1 text-sm min-w-[24px]',
    lg: 'px-3 py-1.5 text-base min-w-[28px]'
  };

  const separator = (
    <span className={`mx-1 text-muted-foreground ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'}`}>
      +
    </span>
  );

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className={`inline-flex items-center gap-1 font-mono ${sizeClasses[size]}`}>
        {keyElements.map((key, index) => (
          <React.Fragment key={index}>
            {index > 0 && separator}
            <Badge 
              variant={variant}
              className={`${keySizeClasses[size]} border-2 bg-background font-semibold shadow-sm`}
            >
              {key}
            </Badge>
          </React.Fragment>
        ))}
      </div>
      {showLabel && label && (
        <span className="text-sm text-muted-foreground ml-2">
          {label}
        </span>
      )}
    </div>
  );
};

interface HotkeyListProps {
  configs: HotkeyConfig[];
  groupBy?: 'category' | 'none';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Список горячих клавиш
 */
export const HotkeyList: React.FC<HotkeyListProps> = ({
  configs,
  groupBy = 'category',
  size = 'md',
  className = ''
}) => {
  if (groupBy === 'category') {
    const grouped = configs.reduce((acc, config) => {
      if (!acc[config.category]) {
        acc[config.category] = [];
      }
      acc[config.category].push(config);
      return acc;
    }, {} as Record<string, HotkeyConfig[]>);

    return (
      <div className={`space-y-6 ${className}`}>
        {Object.entries(grouped).map(([category, categoryConfigs]) => (
          <Card key={category} className="p-4">
            <h3 className="font-semibold mb-3 capitalize">{category}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {categoryConfigs.map(config => (
                <div key={config.id} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {config.description}
                  </span>
                  <HotkeyDisplay 
                    config={config} 
                    size={size}
                    variant="outline"
                  />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ${className}`}>
      {configs.map(config => (
        <div key={config.id} className="flex items-center justify-between p-2 rounded border">
          <span className="text-sm text-muted-foreground">
            {config.description}
          </span>
          <HotkeyDisplay 
            config={config} 
            size={size}
            variant="outline"
          />
        </div>
      ))}
    </div>
  );
};

interface HotkeyTooltipProps {
  hotkey?: Hotkey;
  config?: HotkeyConfig;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
}

/**
 * Tooltip с горячими клавишами
 */
export const HotkeyTooltip: React.FC<HotkeyTooltipProps> = ({
  hotkey,
  config,
  children,
  side = 'top',
  align = 'center'
}) => {
  const keys = config?.keys || hotkey;
  
  if (!keys) {
    return <>{children}</>;
  }

  const content = (
    <div className="p-1">
      <HotkeyDisplay hotkey={keys} size="sm" variant="secondary" />
      {config?.description && (
        <div className="text-xs text-muted-foreground mt-1 whitespace-nowrap">
          {config.description}
        </div>
      )}
    </div>
  );

  return (
    <SafeTooltip content={content} side={side} align={align}>
      {children}
    </SafeTooltip>
  );
};

