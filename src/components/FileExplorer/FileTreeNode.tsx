import { useState } from 'react';
import { useEditorStore } from '../../stores/editorStore';
import { FileIcon } from './FileIcons';
import type { FileEntry } from '../../types';

interface FileTreeNodeProps {
  entry: FileEntry;
  depth: number;
  onContextMenu: (e: React.MouseEvent, path: string, isDirectory: boolean) => void;
  renamingPath: string | null;
  onRename: (oldPath: string, newName: string) => void;
  newItemPath: { parent: string; type: 'file' | 'folder' } | null;
  onNewItem: (name: string) => void;
}

export function FileTreeNode({
  entry,
  depth,
  onContextMenu,
  renamingPath,
  onRename,
  newItemPath,
  onNewItem,
}: FileTreeNodeProps) {
  const {
    expandedFolders,
    selectedPath,
    setSelectedPath,
    toggleFolder,
    openFile,
    fileTree,
  } = useEditorStore();
  const [renameValue, setRenameValue] = useState(entry.name);

  const isExpanded = expandedFolders.has(entry.path);
  const isSelected = selectedPath === entry.path;
  const isRenaming = renamingPath === entry.path;
  const children = entry.is_directory ? fileTree.get(entry.path) || [] : [];

  const handleClick = () => {
    setSelectedPath(entry.path);
    if (entry.is_directory) {
      toggleFolder(entry.path);
    } else {
      openFile(entry.path);
    }
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onRename(entry.path, renameValue);
    } else if (e.key === 'Escape') {
      setRenameValue(entry.name);
      onRename(entry.path, entry.name); // Cancel
    }
  };

  const paddingLeft = depth * 12 + 8;

  return (
    <>
      <div
        className={`flex items-center py-0.5 px-2 cursor-pointer text-sm group transition-colors duration-75 ${
          isSelected
            ? 'bg-editor-active text-editor-text'
            : 'hover:bg-editor-hover text-editor-text'
        }`}
        style={{ paddingLeft: `${paddingLeft}px` }}
        onClick={handleClick}
        onContextMenu={(e) => onContextMenu(e, entry.path, entry.is_directory)}
      >
        {entry.is_directory && (
          <span
            className={`mr-1 text-xs transition-transform duration-100 ${
              isExpanded ? 'rotate-90' : ''
            }`}
          >
            ▶
          </span>
        )}

        <FileIcon
          name={entry.name}
          isDirectory={entry.is_directory}
          className="mr-1.5 flex-shrink-0"
        />

        {isRenaming ? (
          <input
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={handleRenameKeyDown}
            onBlur={() => onRename(entry.path, renameValue)}
            className="flex-1 bg-editor-active border border-editor-accent text-sm px-1 outline-none"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="truncate">{entry.name}</span>
        )}
      </div>

      {entry.is_directory && isExpanded && (
        <>
          {children.map((child) => (
            <FileTreeNode
              key={child.path}
              entry={child}
              depth={depth + 1}
              onContextMenu={onContextMenu}
              renamingPath={renamingPath}
              onRename={onRename}
              newItemPath={newItemPath}
              onNewItem={onNewItem}
            />
          ))}

          {newItemPath?.parent === entry.path && (
            <NewItemInput
              type={newItemPath.type}
              depth={depth + 1}
              onSubmit={onNewItem}
              onCancel={() => onNewItem('')}
            />
          )}
        </>
      )}
    </>
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
      <span className="mr-1.5 text-editor-text-muted text-sm">
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
