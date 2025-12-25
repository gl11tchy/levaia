import { useState, useRef, useEffect } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { useEditorStore } from '../../stores/editorStore';
import { useFileSystem } from '../../hooks/useFileSystem';
import { isMac, formatShortcut } from '../../lib/platform';
import { WindowControls } from './WindowControls';

type MenuItem = {
  label: string;
  shortcut?: string;
  action?: () => void;
  disabled?: boolean;
  separator?: false;
} | {
  separator: true;
  label?: never;
  shortcut?: never;
  action?: never;
  disabled?: never;
};

interface MenuProps {
  label: string;
  items: MenuItem[];
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

function Menu({ label, items, isOpen, onOpen, onClose }: MenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        className={`px-3 py-1 text-sm hover:bg-editor-hover rounded ${
          isOpen ? 'bg-editor-hover' : ''
        }`}
        onClick={() => (isOpen ? onClose() : onOpen())}
        onMouseEnter={() => isOpen && onOpen()}
      >
        {label}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-editor-sidebar border border-editor-border rounded shadow-lg py-1 min-w-[200px] z-50">
          {items.map((item, index) => {
            if (item.separator) {
              return (
                <div
                  key={index}
                  className="h-[1px] bg-editor-border my-1 mx-2"
                />
              );
            }

            return (
              <button
                key={index}
                className={`w-full px-4 py-1.5 text-sm text-left flex justify-between items-center ${
                  item.disabled
                    ? 'text-editor-text-muted cursor-not-allowed'
                    : 'hover:bg-editor-accent'
                }`}
                onClick={() => {
                  if (!item.disabled && item.action) {
                    item.action();
                    onClose();
                  }
                }}
                disabled={item.disabled}
              >
                <span>{item.label}</span>
                {item.shortcut && (
                  <span className="text-editor-text-muted text-xs">
                    {formatShortcut(item.shortcut)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function MenuBar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const { openFolder, closeFolder, rootPath } = useFileSystem();
  const {
    toggleSidebar,
    toggleTerminal,
    toggleWordWrap,
    wordWrap,
    saveFile,
    saveAllFiles,
    activeTabId,
    tabs,
    closeTab,
    closeAllTabs,
  } = useEditorStore();

  const isMacOS = isMac();
  const activeTab = tabs.find(t => t.id === activeTabId);

  const fileMenuItems: MenuItem[] = [
    {
      label: 'New File',
      shortcut: 'Ctrl+N',
      action: () => {
        // TODO: Create new untitled file
      },
    },
    {
      label: 'Open Folder...',
      shortcut: 'Ctrl+O',
      action: openFolder,
    },
    { separator: true },
    {
      label: 'Save',
      shortcut: 'Ctrl+S',
      action: () => activeTabId && saveFile(activeTabId),
      disabled: !activeTab?.isDirty,
    },
    {
      label: 'Save All',
      shortcut: 'Ctrl+Shift+S',
      action: saveAllFiles,
      disabled: !tabs.some(t => t.isDirty),
    },
    { separator: true },
    {
      label: 'Close Editor',
      shortcut: 'Ctrl+W',
      action: () => activeTabId && closeTab(activeTabId),
      disabled: !activeTabId,
    },
    {
      label: 'Close All Editors',
      action: closeAllTabs,
      disabled: tabs.length === 0,
    },
    {
      label: 'Close Folder',
      action: closeFolder,
      disabled: !rootPath,
    },
    { separator: true },
    {
      label: 'Exit',
      shortcut: 'Alt+F4',
      action: () => getCurrentWindow().close(),
    },
  ];

  const editMenuItems: MenuItem[] = [
    {
      label: 'Undo',
      shortcut: 'Ctrl+Z',
      action: () => document.execCommand('undo'),
    },
    {
      label: 'Redo',
      shortcut: 'Ctrl+Shift+Z',
      action: () => document.execCommand('redo'),
    },
    { separator: true },
    {
      label: 'Cut',
      shortcut: 'Ctrl+X',
      action: () => document.execCommand('cut'),
    },
    {
      label: 'Copy',
      shortcut: 'Ctrl+C',
      action: () => document.execCommand('copy'),
    },
    {
      label: 'Paste',
      shortcut: 'Ctrl+V',
      action: () => document.execCommand('paste'),
    },
    { separator: true },
    {
      label: 'Find',
      shortcut: 'Ctrl+F',
      // Monaco handles this
    },
    {
      label: 'Replace',
      shortcut: 'Ctrl+H',
      // Monaco handles this
    },
  ];

  const viewMenuItems: MenuItem[] = [
    {
      label: 'Toggle Sidebar',
      shortcut: 'Ctrl+B',
      action: toggleSidebar,
    },
    {
      label: 'Toggle Terminal',
      shortcut: 'Ctrl+`',
      action: toggleTerminal,
    },
    { separator: true },
    {
      label: wordWrap ? '✓ Word Wrap' : 'Word Wrap',
      shortcut: 'Alt+Z',
      action: toggleWordWrap,
    },
    { separator: true },
    {
      label: 'Quick Open',
      shortcut: 'Ctrl+P',
      action: () => useEditorStore.getState().toggleQuickOpen(),
    },
    {
      label: 'Go to Line',
      shortcut: 'Ctrl+G',
      // Monaco handles this
    },
  ];

  // On macOS, show minimal title bar (native menu handles the rest)
  if (isMacOS) {
    return (
      <div
        data-tauri-drag-region
        className="h-9 bg-editor-bg flex items-center justify-center border-b border-editor-border"
      >
        <span className="text-sm text-editor-text-muted">Lite</span>
      </div>
    );
  }

  // Windows/Linux: Custom menu bar
  return (
    <div
      data-tauri-drag-region
      className="h-9 bg-editor-bg flex items-center border-b border-editor-border select-none"
    >
      <div className="flex items-center px-2">
        <Menu
          label="File"
          items={fileMenuItems}
          isOpen={openMenu === 'file'}
          onOpen={() => setOpenMenu('file')}
          onClose={() => setOpenMenu(null)}
        />
        <Menu
          label="Edit"
          items={editMenuItems}
          isOpen={openMenu === 'edit'}
          onOpen={() => setOpenMenu('edit')}
          onClose={() => setOpenMenu(null)}
        />
        <Menu
          label="View"
          items={viewMenuItems}
          isOpen={openMenu === 'view'}
          onOpen={() => setOpenMenu('view')}
          onClose={() => setOpenMenu(null)}
        />
      </div>

      <div data-tauri-drag-region className="flex-1 h-full" />

      <WindowControls />
    </div>
  );
}
