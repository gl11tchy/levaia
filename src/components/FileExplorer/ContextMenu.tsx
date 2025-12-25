import { useEffect, useRef } from 'react';
import type { ContextMenuPosition, ContextMenuItem } from '../../types';

interface ContextMenuProps {
  position: ContextMenuPosition;
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ position, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Adjust position to stay within viewport
  const adjustedPosition = { ...position };
  if (menuRef.current) {
    const rect = menuRef.current.getBoundingClientRect();
    if (position.x + rect.width > window.innerWidth) {
      adjustedPosition.x = window.innerWidth - rect.width - 8;
    }
    if (position.y + rect.height > window.innerHeight) {
      adjustedPosition.y = window.innerHeight - rect.height - 8;
    }
  }

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`,
      }}
    >
      {items.map((item, index) => {
        if (item.separator) {
          return <div key={index} className="context-menu-separator" />;
        }

        return (
          <div
            key={index}
            className={`context-menu-item ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => {
              if (!item.disabled) {
                item.action();
                onClose();
              }
            }}
          >
            {item.label}
          </div>
        );
      })}
    </div>
  );
}
