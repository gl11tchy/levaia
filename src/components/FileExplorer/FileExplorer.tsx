import { useState } from 'react';
import { useEditorStore } from '../../stores/editorStore';
import { useFileSystem } from '../../hooks/useFileSystem';
import { useGitBranch } from '../../hooks/useGitBranch';
import { FileTreeNode } from './FileTreeNode';
import { ContextMenu } from './ContextMenu';
import type { ContextMenuPosition, ContextMenuItem } from '../../types';

export function FileExplorer() {
  const {
    rootPath,
    fileTree,
    setSelectedPath,
    gitPanelVisible,
    toggleGitPanel,
    // Remote state
    activeRemoteId,
    remoteRootPath,
    remoteFileTree,
    disconnectRemote,
    toggleRemoteDialog,
    remoteConnections,
  } = useEditorStore();
  const gitBranch = useGitBranch(rootPath);
  const { openFolder, createFile, createDirectory, renameItem, deleteItem } = useFileSystem();
  const [contextMenu, setContextMenu] = useState<{
    position: ContextMenuPosition;
    items: ContextMenuItem[];
  } | null>(null);
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [newItemPath, setNewItemPath] = useState<{ parent: string; type: 'file' | 'folder' } | null>(null);

  const handleContextMenu = (e: React.MouseEvent, path: string, isDirectory: boolean) => {
    e.preventDefault();
    e.stopPropagation();

    setSelectedPath(path);

    const items: ContextMenuItem[] = isDirectory
      ? [
          {
            label: 'New File',
            action: () => setNewItemPath({ parent: path, type: 'file' }),
          },
          {
            label: 'New Folder',
            action: () => setNewItemPath({ parent: path, type: 'folder' }),
          },
          { label: '', action: () => {}, separator: true },
          {
            label: 'Rename',
            action: () => setRenamingPath(path),
          },
          {
            label: 'Delete',
            action: async () => {
              if (confirm(`Delete "${path.split('/').pop()}"?`)) {
                await deleteItem(path);
              }
            },
          },
        ]
      : [
          {
            label: 'Rename',
            action: () => setRenamingPath(path),
          },
          {
            label: 'Delete',
            action: async () => {
              if (confirm(`Delete "${path.split('/').pop()}"?`)) {
                await deleteItem(path);
              }
            },
          },
        ];

    setContextMenu({ position: { x: e.clientX, y: e.clientY }, items });
  };

  const handleRootContextMenu = (e: React.MouseEvent) => {
    if (!rootPath) return;
    e.preventDefault();

    const items: ContextMenuItem[] = [
      {
        label: 'New File',
        action: () => setNewItemPath({ parent: rootPath, type: 'file' }),
      },
      {
        label: 'New Folder',
        action: () => setNewItemPath({ parent: rootPath, type: 'folder' }),
      },
    ];

    setContextMenu({ position: { x: e.clientX, y: e.clientY }, items });
  };

  const handleNewItem = async (name: string) => {
    if (!newItemPath || !name.trim()) {
      setNewItemPath(null);
      return;
    }

    const fullPath = `${newItemPath.parent}/${name.trim()}`;

    if (newItemPath.type === 'file') {
      await createFile(fullPath);
    } else {
      await createDirectory(fullPath);
    }

    setNewItemPath(null);
  };

  const handleRename = async (oldPath: string, newName: string) => {
    if (!newName.trim()) {
      setRenamingPath(null);
      return;
    }

    const parentDir = oldPath.substring(0, oldPath.lastIndexOf('/'));
    const newPath = `${parentDir}/${newName.trim()}`;

    await renameItem(oldPath, newPath);
    setRenamingPath(null);
  };

  // Determine if we're in remote mode
  const isRemoteMode = !!activeRemoteId;
  const effectiveRootPath = isRemoteMode ? remoteRootPath : rootPath;
  const effectiveFileTree = isRemoteMode ? remoteFileTree : fileTree;

  const rootEntries = effectiveRootPath ? effectiveFileTree.get(effectiveRootPath) || [] : [];
  const rootName = effectiveRootPath?.split('/').pop() || '';

  // Get connected server name
  const connectedServer = isRemoteMode
    ? remoteConnections.find(c => c.id === activeRemoteId)?.name || 'Remote'
    : null;

  if (!effectiveRootPath) {
    return (
      <div
        className="h-full flex flex-col items-center justify-center bg-editor-sidebar p-4"
        data-file-explorer
      >
        <p className="text-editor-text-muted text-sm mb-4 text-center">
          No folder opened
        </p>
        <div className="flex flex-col gap-2">
          <button
            className="px-4 py-2 bg-editor-accent text-white rounded hover:bg-blue-600 transition-colors"
            onClick={openFolder}
          >
            Open Folder
          </button>
          <button
            className="px-4 py-2 bg-editor-hover text-editor-text rounded hover:bg-editor-border transition-colors"
            onClick={toggleRemoteDialog}
          >
            Connect Remote
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full flex flex-col bg-editor-sidebar overflow-hidden"
      data-file-explorer
      tabIndex={0}
      onContextMenu={handleRootContextMenu}
    >
      <div className="px-4 py-2 text-xs uppercase tracking-wider text-editor-text-muted font-medium border-b border-editor-border">
        Explorer
      </div>

      {/* Remote connection indicator */}
      {isRemoteMode && (
        <div className="px-3 py-2 bg-blue-500/10 border-b border-editor-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-xs text-blue-400 truncate">{connectedServer}</span>
          </div>
          <button
            onClick={disconnectRemote}
            className="text-xs px-2 py-0.5 bg-editor-hover rounded hover:bg-red-500/20 text-editor-text-muted hover:text-red-400"
          >
            Disconnect
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto overflow-x-hidden py-1">
        <div className="px-2 py-1 text-sm font-medium text-editor-text truncate">
          {rootName}
        </div>

        {rootEntries.map((entry) => (
          <FileTreeNode
            key={entry.path}
            entry={entry}
            depth={1}
            onContextMenu={handleContextMenu}
            renamingPath={renamingPath}
            onRename={handleRename}
            newItemPath={newItemPath}
            onNewItem={handleNewItem}
          />
        ))}

        {newItemPath?.parent === rootPath && (
          <NewItemInput
            type={newItemPath.type}
            depth={1}
            onSubmit={handleNewItem}
            onCancel={() => setNewItemPath(null)}
          />
        )}
      </div>

      {gitBranch && (
        <div
          className="px-3 py-2 border-t border-editor-border flex items-center justify-between text-xs cursor-pointer hover:bg-editor-hover transition-colors"
          onClick={toggleGitPanel}
          title={gitPanelVisible ? 'Hide Source Control' : 'Show Source Control'}
        >
          <span className="text-editor-text-muted truncate flex items-center gap-1.5">
            <span className="text-[10px]">⎇</span>
            {gitBranch}
          </span>
          <span className="text-editor-text-muted">{gitPanelVisible ? '−' : '+'}</span>
        </div>
      )}

      {contextMenu && (
        <ContextMenu
          position={contextMenu.position}
          items={contextMenu.items}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}

interface NewItemInputProps {
  type: 'file' | 'folder';
  depth: number;
  onSubmit: (name: string) => void;
  onCancel: () => void;
}

function NewItemInput({ type, depth, onSubmit, onCancel }: NewItemInputProps) {
  const [name, setName] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSubmit(name);
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div
      className="flex items-center px-2 py-0.5"
      style={{ paddingLeft: `${depth * 12 + 8}px` }}
    >
      <span className="mr-1.5 text-editor-text-muted">
        {type === 'folder' ? '📁' : '📄'}
      </span>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => onSubmit(name)}
        className="flex-1 bg-editor-active border border-editor-accent text-sm px-1 py-0.5 outline-none"
        autoFocus
        placeholder={type === 'folder' ? 'Folder name' : 'File name'}
      />
    </div>
  );
}
