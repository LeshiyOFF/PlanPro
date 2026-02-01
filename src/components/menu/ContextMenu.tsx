import React, { useEffect, useRef } from 'react'
import { ContextMenuConfig, ContextMenuItem } from '@/providers/MenuProvider'

/**
 * Конфигурация ContextMenu компонента
 */
interface ContextMenuProps {
  config: ContextMenuConfig;
  onHide: () => void;
}

/**
 * Компонент контекстного меню
 */
export const ContextMenu: React.FC<ContextMenuProps> = ({ config, onHide }) => {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onHide()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onHide])

  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      let x = config.x
      let y = config.y

      // Adjust position if menu goes outside viewport
      if (x + rect.width > viewportWidth) {
        x = viewportWidth - rect.width - 8
      }
      if (y + rect.height > viewportHeight) {
        y = viewportHeight - rect.height - 8
      }

      menuRef.current.style.left = `${x}px`
      menuRef.current.style.top = `${y}px`
    }
  }, [config.x, config.y])

  if (!config.visible) {
    return null
  }

  const handleItemClick = (item: ContextMenuItem) => {
    if (item.disabled) return

    item.handler()
    onHide()
  }

  return (
    <div
      ref={menuRef}
      className="context-menu fixed z-50 min-w-48 bg-popover border border-border rounded-md shadow-lg py-1"
      style={{ left: config.x, top: config.y }}
    >
      {config.items.map((item, index) => (
        item.separator ? (
          <div
            key={`separator-${index}`}
            className="h-px bg-border my-1 mx-2"
          />
        ) : (
          <button
            key={item.id}
            className={`
              context-menu-item w-full text-left px-3 py-2 text-sm
              hover:bg-accent hover:text-accent-foreground
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-between
            `}
            onClick={() => handleItemClick(item)}
            disabled={item.disabled}
          >
            <span className="flex items-center">
              {item.icon && <span className="mr-2">{item.icon}</span>}
              {item.label}
            </span>
            {item.shortcut && (
              <span className="text-xs text-muted-foreground ml-4">
                {item.shortcut}
              </span>
            )}
          </button>
        )
      ))}
    </div>
  )
}

export default ContextMenu

