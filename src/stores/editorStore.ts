import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { invoke } from '@tauri-apps/api/core';
import type { FileTab, TerminalInstance, FileEntry, GitStatus, GitBranches, GitCommit } from '../types';
import { detectLanguage, getFileName } from '../lib/fileUtils';

interface EditorState {
  // File Explorer
  rootPath: string | null;
  expandedFolders: Set<string>;
  selectedPath: string | null;
  fileTree: Map<string, FileEntry[]>;

  // Editor Tabs
  tabs: FileTab[];
  activeTabId: string | null;

  // Terminal
  terminals: TerminalInstance[];
  activeTerminalId: string | null;
  terminalSearchVisible: boolean;
  terminalSearchQuery: string;

  // UI State
  sidebarVisible: boolean;
  terminalVisible: boolean;
  quickOpenVisible: boolean;
  settingsVisible: boolean;
  wordWrap: boolean;
  fontSize: number;
  tabSize: number;

  // Panel sizes (percentages)
  sidebarWidth: number;
  terminalHeight: number;

  // Git State
  gitStatus: GitStatus | null;
  gitBranches: GitBranches | null;
  gitCommits: GitCommit[];
  gitPanelVisible: boolean;
  gitPanelSection: 'changes' | 'branches' | 'history';

  // Actions - File Explorer
  setRootPath: (path: string | null) => void;
  toggleFolder: (path: string) => Promise<void>;
  setSelectedPath: (path: string | null) => void;
  refreshFolder: (path: string) => Promise<void>;

  // Actions - Editor
  openFile: (path: string) => Promise<void>;
  closeTab: (id: string) => void;
  closeAllTabs: () => void;
  setActiveTab: (id: string) => void;
  updateContent: (id: string, content: string) => void;
  saveFile: (id: string) => Promise<void>;
  saveAllFiles: () => Promise<void>;
  nextTab: () => void;
  previousTab: () => void;

  // Actions - Terminal
  addTerminal: () => string;
  removeTerminal: (id: string) => void;
  setActiveTerminal: (id: string) => void;
  renameTerminal: (id: string, title: string) => void;
  toggleTerminalSearch: () => void;
  setTerminalSearchQuery: (query: string) => void;

  // Actions - UI
  toggleSidebar: () => void;
  toggleTerminal: () => void;
  toggleQuickOpen: () => void;
  toggleSettings: () => void;
  toggleWordWrap: () => void;
  setFontSize: (size: number) => void;
  setTabSize: (size: number) => void;
  setSidebarWidth: (width: number) => void;
  setTerminalHeight: (height: number) => void;

  // Actions - Git
  toggleGitPanel: () => void;
  setGitPanelSection: (section: 'changes' | 'branches' | 'history') => void;
  refreshGitStatus: () => Promise<void>;
  refreshGitBranches: () => Promise<void>;
  refreshGitCommits: (limit?: number) => Promise<void>;
  refreshAllGitData: () => Promise<void>;
}

// Helper to generate unique IDs
const generateId = () => crypto.randomUUID();

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      // Initial state
      rootPath: null,
      expandedFolders: new Set<string>(),
      selectedPath: null,
      fileTree: new Map(),

      tabs: [],
      activeTabId: null,

      terminals: [],
      activeTerminalId: null,
      terminalSearchVisible: false,
      terminalSearchQuery: '',

      sidebarVisible: true,
      terminalVisible: false,
      quickOpenVisible: false,
      settingsVisible: false,
      wordWrap: true,
      fontSize: 13,
      tabSize: 2,

      sidebarWidth: 20,
      terminalHeight: 30,

      // Git State
      gitStatus: null,
      gitBranches: null,
      gitCommits: [],
      gitPanelVisible: false,
      gitPanelSection: 'changes',

      // File Explorer Actions
      setRootPath: (path) => {
        set({
          rootPath: path,
          expandedFolders: new Set(),
          fileTree: new Map(),
          selectedPath: null,
        });
        if (path) {
          get().toggleFolder(path);
        }
      },

      toggleFolder: async (path) => {
        const { expandedFolders, fileTree } = get();
        const newExpanded = new Set(expandedFolders);

        if (newExpanded.has(path)) {
          newExpanded.delete(path);
        } else {
          newExpanded.add(path);

          // Load folder contents if not cached
          if (!fileTree.has(path)) {
            try {
              const entries = await invoke<FileEntry[]>('read_directory', { path });
              const newFileTree = new Map(fileTree);
              newFileTree.set(path, entries);
              set({ fileTree: newFileTree });
            } catch (error) {
              console.error('Failed to read directory:', error);
            }
          }
        }

        set({ expandedFolders: newExpanded });
      },

      setSelectedPath: (path) => set({ selectedPath: path }),

      refreshFolder: async (path) => {
        try {
          const entries = await invoke<FileEntry[]>('read_directory', { path });
          const { fileTree } = get();
          const newFileTree = new Map(fileTree);
          newFileTree.set(path, entries);
          set({ fileTree: newFileTree });
        } catch (error) {
          console.error('Failed to refresh directory:', error);
        }
      },

      // Editor Actions
      openFile: async (path) => {
        const { tabs } = get();

        // Check if file is already open
        const existingTab = tabs.find(t => t.path === path);
        if (existingTab) {
          set({ activeTabId: existingTab.id });
          return;
        }

        try {
          const content = await invoke<string>('read_file_content', { path });
          const name = getFileName(path);
          const language = detectLanguage(name);

          const newTab: FileTab = {
            id: generateId(),
            path,
            name,
            language,
            content,
            originalContent: content,
            isDirty: false,
          };

          set(state => ({
            tabs: [...state.tabs, newTab],
            activeTabId: newTab.id,
          }));
        } catch (error) {
          console.error('Failed to open file:', error);
          // Could show error toast here
        }
      },

      closeTab: (id) => {
        const { tabs, activeTabId } = get();
        const tabIndex = tabs.findIndex(t => t.id === id);

        if (tabIndex === -1) return;

        const newTabs = tabs.filter(t => t.id !== id);
        let newActiveId = activeTabId;

        if (activeTabId === id) {
          // Activate adjacent tab
          if (newTabs.length > 0) {
            const newIndex = Math.min(tabIndex, newTabs.length - 1);
            newActiveId = newTabs[newIndex].id;
          } else {
            newActiveId = null;
          }
        }

        set({ tabs: newTabs, activeTabId: newActiveId });
      },

      closeAllTabs: () => set({ tabs: [], activeTabId: null }),

      setActiveTab: (id) => set({ activeTabId: id }),

      updateContent: (id, content) => {
        set(state => ({
          tabs: state.tabs.map(tab =>
            tab.id === id
              ? { ...tab, content, isDirty: content !== tab.originalContent }
              : tab
          ),
        }));
      },

      saveFile: async (id) => {
        const { tabs } = get();
        const tab = tabs.find(t => t.id === id);

        if (!tab || !tab.isDirty) return;

        try {
          await invoke('write_file_content', { path: tab.path, content: tab.content });

          set(state => ({
            tabs: state.tabs.map(t =>
              t.id === id
                ? { ...t, isDirty: false, originalContent: t.content }
                : t
            ),
          }));
        } catch (error) {
          console.error('Failed to save file:', error);
        }
      },

      saveAllFiles: async () => {
        const { tabs, saveFile } = get();
        const dirtyTabs = tabs.filter(t => t.isDirty);

        for (const tab of dirtyTabs) {
          await saveFile(tab.id);
        }
      },

      nextTab: () => {
        const { tabs, activeTabId } = get();
        if (tabs.length <= 1) return;

        const currentIndex = tabs.findIndex(t => t.id === activeTabId);
        const nextIndex = (currentIndex + 1) % tabs.length;
        set({ activeTabId: tabs[nextIndex].id });
      },

      previousTab: () => {
        const { tabs, activeTabId } = get();
        if (tabs.length <= 1) return;

        const currentIndex = tabs.findIndex(t => t.id === activeTabId);
        const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        set({ activeTabId: tabs[prevIndex].id });
      },

      // Terminal Actions
      addTerminal: () => {
        const id = generateId();
        const { terminals } = get();
        const number = terminals.length + 1;

        const newTerminal: TerminalInstance = {
          id,
          title: `Terminal ${number}`,
        };

        set(state => ({
          terminals: [...state.terminals, newTerminal],
          activeTerminalId: id,
          terminalVisible: true,
        }));

        return id;
      },

      removeTerminal: (id) => {
        const { terminals, activeTerminalId } = get();
        const termIndex = terminals.findIndex(t => t.id === id);

        if (termIndex === -1) return;

        const newTerminals = terminals.filter(t => t.id !== id);
        let newActiveId = activeTerminalId;

        if (activeTerminalId === id) {
          if (newTerminals.length > 0) {
            const newIndex = Math.min(termIndex, newTerminals.length - 1);
            newActiveId = newTerminals[newIndex].id;
          } else {
            newActiveId = null;
          }
        }

        set({
          terminals: newTerminals,
          activeTerminalId: newActiveId,
          terminalVisible: newTerminals.length > 0,
        });
      },

      setActiveTerminal: (id) => set({ activeTerminalId: id }),

      renameTerminal: (id, title) => {
        set(state => ({
          terminals: state.terminals.map(t =>
            t.id === id ? { ...t, title } : t
          ),
        }));
      },

      toggleTerminalSearch: () => set(state => ({
        terminalSearchVisible: !state.terminalSearchVisible,
        terminalSearchQuery: state.terminalSearchVisible ? '' : state.terminalSearchQuery,
      })),

      setTerminalSearchQuery: (query) => set({ terminalSearchQuery: query }),

      // UI Actions
      toggleSidebar: () => set(state => ({ sidebarVisible: !state.sidebarVisible })),
      toggleTerminal: () => {
        const { terminalVisible, terminals, addTerminal } = get();

        if (!terminalVisible && terminals.length === 0) {
          addTerminal();
        } else {
          set({ terminalVisible: !terminalVisible });
        }
      },
      toggleQuickOpen: () => set(state => ({ quickOpenVisible: !state.quickOpenVisible })),
      toggleSettings: () => set(state => ({ settingsVisible: !state.settingsVisible })),
      toggleWordWrap: () => set(state => ({ wordWrap: !state.wordWrap })),
      setFontSize: (size) => set({ fontSize: size }),
      setTabSize: (size) => set({ tabSize: size }),
      setSidebarWidth: (width) => set({ sidebarWidth: width }),
      setTerminalHeight: (height) => set({ terminalHeight: height }),

      // Git Actions
      toggleGitPanel: () => set(state => ({ gitPanelVisible: !state.gitPanelVisible })),
      setGitPanelSection: (section) => set({ gitPanelSection: section }),

      refreshGitStatus: async () => {
        const { rootPath } = get();
        if (!rootPath) {
          set({ gitStatus: null });
          return;
        }
        try {
          const status = await invoke<GitStatus | null>('git_status', { rootPath });
          set({ gitStatus: status });
        } catch (error) {
          console.error('Failed to get git status:', error);
          set({ gitStatus: null });
        }
      },

      refreshGitBranches: async () => {
        const { rootPath } = get();
        if (!rootPath) {
          set({ gitBranches: null });
          return;
        }
        try {
          const branches = await invoke<GitBranches | null>('git_branches', { rootPath });
          set({ gitBranches: branches });
        } catch (error) {
          console.error('Failed to get git branches:', error);
          set({ gitBranches: null });
        }
      },

      refreshGitCommits: async (limit = 50) => {
        const { rootPath } = get();
        if (!rootPath) {
          set({ gitCommits: [] });
          return;
        }
        try {
          const commits = await invoke<GitCommit[]>('git_log', { rootPath, limit });
          set({ gitCommits: commits });
        } catch (error) {
          console.error('Failed to get git log:', error);
          set({ gitCommits: [] });
        }
      },

      refreshAllGitData: async () => {
        const { refreshGitStatus, refreshGitBranches, refreshGitCommits } = get();
        await Promise.all([
          refreshGitStatus(),
          refreshGitBranches(),
          refreshGitCommits(),
        ]);
      },
    }),
    {
      name: 'lite-editor-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        rootPath: state.rootPath,
        sidebarWidth: state.sidebarWidth,
        terminalHeight: state.terminalHeight,
        wordWrap: state.wordWrap,
        fontSize: state.fontSize,
        tabSize: state.tabSize,
        sidebarVisible: state.sidebarVisible,
        gitPanelVisible: state.gitPanelVisible,
      }),
    }
  )
);
