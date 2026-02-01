import React, { useEffect, useRef, useState } from 'react'
import { IContextMenu, IContextMenuItem } from '../../../domain/contextmenu/entities/ContextMenu'
import { ContextMenuItemComponent } from './ContextMenuItem'
import { logger } from '@/utils/logger'

interface ContextMenuComponentProps {
  menu: IContextMenu;
  onHide: () => void;
  onActionExecute: (actionId: string) => Promise<void>;
}

/**
 * Компонент контекстного меню
 */
export const ContextMenuComponent: React.FC<ContextMenuComponentProps> = ({
  menu,
  onHide,
  onActionExecute,
}) => {
  const menuRef = useRef<HTMLDivElement>(null)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onHide()
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onHide()
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onHide])

  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      let x = menu.position.x
      let y = menu.position.y

      // Коррекция позиции если меню выходит за пределы viewport
      if (x + rect.width > viewportWidth) {
        x = viewportWidth - rect.width - 8
      }
      if (y + rect.height > viewportHeight) {
        y = viewportHeight - rect.height - 8
      }

      // Убедиться что меню не выходит за левый и верхний края
      x = Math.max(8, x)
      y = Math.max(8, y)

      menuRef.current.style.left = `${x}px`
      menuRef.current.style.top = `${y}px`
    }
  }, [menu.position])

  const handleItemSelect = async (item: IContextMenuItem) => {
    try {
      if (item.submenu && item.submenu.length > 0) {
        setOpenSubmenu(openSubmenu === item.id ? null : item.id)
      } else if (item.action) {
        await onActionExecute(item.id)
        onHide()
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      logger.error(`Failed to execute menu action ${item.id}:`, { errorMessage })
    }
  }

  const renderMenuItem = (item: IContextMenuItem, depth: number = 0): React.ReactNode => {
    const isOpen = openSubmenu === item.id
    const hasSubmenu = item.submenu && item.submenu.length > 0

    return (
      <div key={item.id} style={{ position: 'relative' }}>
        <ContextMenuItemComponent
          item={item}
          onSelect={handleItemSelect}
          depth={depth}
        />

        {hasSubmenu && isOpen && (
          <div
            style={{
              position: 'absolute',
              left: '100%',
              top: 0,
              minWidth: '200px',
              backgroundColor: 'var(--bg-primary, white)',
              border: '1px solid var(--border-color, #e2e8f0)',
              borderRadius: '4px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              zIndex: 1000 + depth,
              marginLeft: '4px',
            }}
          >
            {item.submenu.map((subItem: IContextMenuItem) => renderMenuItem(subItem, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{
        position: 'fixed',
        backgroundColor: 'var(--bg-primary, white)',
        border: '1px solid var(--border-color, #e2e8f0)',
        borderRadius: '6px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        minWidth: '200px',
        maxWidth: '300px',
        padding: '4px 0',
        fontSize: '14px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {menu.items.map(item => renderMenuItem(item))}
    </div>
  )
}

