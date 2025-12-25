// File system types
export interface FileEntry {
  name: string;
  path: string;
  is_directory: boolean;
  is_symlink: boolean;
  size: number;
}

export interface FileInfo {
  size: number;
  is_binary: boolean;
  is_readonly: boolean;
}

// Editor types
export interface FileTab {
  id: string;
  path: string;
  name: string;
  language: string;
  content: string;
  originalContent: string;
  isDirty: boolean;
}

// Terminal types
export interface TerminalInstance {
  id: string;
  title: string;
}

// File tree types
export interface FileTreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  isExpanded?: boolean;
  children?: FileTreeNode[];
  isLoading?: boolean;
}

// Context menu types
export interface ContextMenuPosition {
  x: number;
  y: number;
}

export interface ContextMenuItem {
  label: string;
  action: () => void;
  disabled?: boolean;
  separator?: boolean;
}

// Quick open types
export interface QuickOpenItem {
  path: string;
  name: string;
  relativePath: string;
}
