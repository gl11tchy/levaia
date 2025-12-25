import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useEditorStore } from '../../stores/editorStore';
import { fuzzyMatch, fuzzyScore, getFileName } from '../../lib/fileUtils';
import type { FileEntry } from '../../types';

export function QuickOpen() {
  const { rootPath, toggleQuickOpen, openFile } = useEditorStore();
  const [query, setQuery] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Collect all files recursively
  const collectFiles = useCallback(async (dirPath: string, collected: string[] = []): Promise<string[]> => {
    try {
      const entries = await invoke<FileEntry[]>('read_directory', { path: dirPath });

      for (const entry of entries) {
        // Skip hidden files and common excluded directories
        if (entry.name.startsWith('.')) continue;
        if (['node_modules', 'target', 'dist', 'build', '.git', '__pycache__', 'vendor'].includes(entry.name)) {
          continue;
        }

        if (entry.is_directory) {
          await collectFiles(entry.path, collected);
        } else {
          collected.push(entry.path);
        }
      }

      return collected;
    } catch {
      return collected;
    }
  }, []);

  // Load all files on open
  useEffect(() => {
    if (rootPath) {
      setIsLoading(true);
      collectFiles(rootPath).then((allFiles) => {
        setFiles(allFiles);
        setIsLoading(false);
      });
    }

    // Focus input
    inputRef.current?.focus();
  }, [rootPath, collectFiles]);

  // Fuzzy filter and sort
  const filteredFiles = useMemo(() => {
    if (!query.trim()) {
      return files.slice(0, 50);
    }

    return files
      .filter((f) => fuzzyMatch(f, query))
      .sort((a, b) => fuzzyScore(b, query) - fuzzyScore(a, query))
      .slice(0, 50);
  }, [files, query]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filteredFiles.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredFiles[selectedIndex]) {
          openFile(filteredFiles[selectedIndex]);
          toggleQuickOpen();
        }
        break;
      case 'Escape':
        e.preventDefault();
        toggleQuickOpen();
        break;
    }
  };

  const getRelativePath = (fullPath: string): string => {
    if (rootPath && fullPath.startsWith(rootPath)) {
      return fullPath.substring(rootPath.length + 1);
    }
    return fullPath;
  };

  // Highlight matching characters
  const highlightMatch = (text: string, query: string): React.ReactNode => {
    if (!query) return text;

    const result: React.ReactNode[] = [];
    let queryIndex = 0;
    const textLower = text.toLowerCase();
    const queryLower = query.toLowerCase();

    for (let i = 0; i < text.length; i++) {
      if (queryIndex < queryLower.length && textLower[i] === queryLower[queryIndex]) {
        result.push(
          <span key={i} className="text-editor-accent font-medium">
            {text[i]}
          </span>
        );
        queryIndex++;
      } else {
        result.push(text[i]);
      }
    }

    return result;
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50"
      onClick={toggleQuickOpen}
    >
      <div
        className="w-[600px] max-w-[90vw] bg-editor-sidebar rounded-lg shadow-2xl border border-editor-border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="p-3 border-b border-editor-border">
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-editor-bg text-editor-text px-3 py-2 rounded outline-none border border-editor-border focus:border-editor-accent"
            placeholder="Search files by name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="px-4 py-8 text-center text-editor-text-muted">
              <div className="animate-spin w-6 h-6 border-2 border-editor-accent border-t-transparent rounded-full mx-auto mb-2" />
              <span className="text-sm">Indexing files...</span>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="px-4 py-8 text-center text-editor-text-muted text-sm">
              {query ? 'No files found' : 'No files in workspace'}
            </div>
          ) : (
            filteredFiles.map((file, index) => {
              const relativePath = getRelativePath(file);
              const fileName = getFileName(file);
              const dirPath = relativePath.replace(fileName, '');

              return (
                <div
                  key={file}
                  className={`px-4 py-2 cursor-pointer flex items-center ${
                    index === selectedIndex
                      ? 'bg-editor-accent text-white'
                      : 'hover:bg-editor-hover'
                  }`}
                  onClick={() => {
                    openFile(file);
                    toggleQuickOpen();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <span className="mr-2 text-sm opacity-60">📄</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">
                      {highlightMatch(fileName, query)}
                    </div>
                    {dirPath && (
                      <div
                        className={`text-xs truncate ${
                          index === selectedIndex
                            ? 'text-white/70'
                            : 'text-editor-text-muted'
                        }`}
                      >
                        {dirPath}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-editor-border text-xs text-editor-text-muted flex justify-between">
          <span>
            {filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''}
          </span>
          <span>
            <kbd className="px-1 bg-editor-bg rounded">↑↓</kbd> to navigate
            <kbd className="px-1 bg-editor-bg rounded ml-2">Enter</kbd> to open
            <kbd className="px-1 bg-editor-bg rounded ml-2">Esc</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
}
