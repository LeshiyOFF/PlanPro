import React from 'react';
import { IContextMenuItem } from '../../../domain/contextmenu/entities/ContextMenu';

interface ContextMenuItemProps {
  item: IContextMenuItem;
  onSelect: (item: IContextMenuItem) => void;
  depth?: number;
}

/**
 * Компонент пункта контекстного меню
 */
export const ContextMenuItemComponent: React.FC<ContextMenuItemProps> = ({ 
  item, 
  onSelect, 
  depth = 0 
}) => {
  if (item.separator) {
    return (
      <div 
        className="context-menu-separator"
        style={{ 
          margin: '4px 8px',
          height: '1px',
          backgroundColor: '#e2e8f0',
        }}
      />
    );
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.disabled && !item.separator) {
      onSelect(item);
    }
  };

  const hasSubmenu = item.submenu && item.submenu.length > 0;

  return (
    <div
      className={`
        context-menu-item group
        ${item.disabled ? 'disabled opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-100'}
        ${hasSubmenu ? 'has-submenu' : ''}
      `}
      onClick={handleClick}
      style={{
        padding: '6px 12px',
        color: item.disabled ? '#94a3b8' : '#334155',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '13px',
        borderRadius: '0',
        transition: 'all 0.1s ease',
      }}
    >
      <div className="flex items-center gap-2.5">
        {item.icon && (
          <span className="w-4 h-4 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
            {item.icon}
          </span>
        )}
        {!item.icon && <div className="w-4" />} {/* Spacer if no icon */}
        <span className="font-medium">{item.label}</span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {item.shortcut && (
          <span 
            style={{ 
              fontSize: '12px', 
              color: 'var(--text-secondary, #64748b)',
              opacity: 0.7
            }}
          >
            {item.shortcut}
          </span>
        )}
        {hasSubmenu && (
          <span style={{ fontSize: '12px', marginLeft: '4px' }}>
            ▶
          </span>
        )}
      </div>
    </div>
  );
};
