import { useEffect } from 'react';
import { useEditorStore } from '../stores/editorStore';
import { isMac } from '../lib/platform';

export function useKeybindings() {
  const {
    toggleSidebar,
    toggleTerminal,
    toggleQuickOpen,
    toggleGitPanel,
    saveFile,
    saveAllFiles,
    closeTab,
    nextTab,
    previousTab,
    activeTabId,
  } = useEditorStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMacOS = isMac();
      const modifier = isMacOS ? e.metaKey : e.ctrlKey;
      const key = e.key.toLowerCase();

      // Don't handle if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        // But still allow global shortcuts like save
        if (modifier && key === 's') {
          e.preventDefault();
          if (activeTabId) {
            saveFile(activeTabId);
          }
        }
        return;
      }

      // Ctrl/Cmd + S: Save
      if (modifier && key === 's') {
        e.preventDefault();
        if (e.shiftKey) {
          saveAllFiles();
        } else if (activeTabId) {
          saveFile(activeTabId);
        }
        return;
      }

      // Ctrl/Cmd + W: Close tab
      if (modifier && key === 'w') {
        e.preventDefault();
        if (activeTabId) {
          closeTab(activeTabId);
        }
        return;
      }

      // Ctrl/Cmd + B: Toggle sidebar
      if (modifier && key === 'b') {
        e.preventDefault();
        toggleSidebar();
        return;
      }

      // Ctrl/Cmd + `: Toggle terminal
      if (modifier && key === '`') {
        e.preventDefault();
        toggleTerminal();
        return;
      }

      // Ctrl/Cmd + P: Quick open
      if (modifier && key === 'p') {
        e.preventDefault();
        toggleQuickOpen();
        return;
      }

      // Ctrl/Cmd + Tab: Next tab
      if (modifier && key === 'tab') {
        e.preventDefault();
        if (e.shiftKey) {
          previousTab();
        } else {
          nextTab();
        }
        return;
      }

      // Ctrl/Cmd + Shift + E: Focus file explorer
      if (modifier && e.shiftKey && key === 'e') {
        e.preventDefault();
        // Focus file explorer - this would need a ref or focus management
        const explorer = document.querySelector('[data-file-explorer]');
        if (explorer instanceof HTMLElement) {
          explorer.focus();
        }
        return;
      }

      // Ctrl/Cmd + Shift + G: Toggle git panel
      if (modifier && e.shiftKey && key === 'g') {
        e.preventDefault();
        toggleGitPanel();
        return;
      }

      // Escape: Close quick open
      if (key === 'escape') {
        const { quickOpenVisible } = useEditorStore.getState();
        if (quickOpenVisible) {
          e.preventDefault();
          toggleQuickOpen();
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    toggleSidebar,
    toggleTerminal,
    toggleQuickOpen,
    toggleGitPanel,
    saveFile,
    saveAllFiles,
    closeTab,
    nextTab,
    previousTab,
    activeTabId,
  ]);
}
