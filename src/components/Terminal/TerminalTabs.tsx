import { useRef, useEffect, useState } from "react";
import { useEditorStore } from "../../stores/editorStore";
import { themeNames, themeDisplayNames } from "../../lib/terminalThemes";

/**
 * Renders the terminal tabs UI with controls for adding, selecting, and removing terminals, a theme picker, and an inline search bar.
 *
 * Provides keyboard shortcuts (Cmd/Ctrl+Shift+F to toggle search, Escape to close the search or theme dropdown), outside-click dismissal for the theme dropdown, and focus management for the search input.
 */
export function TerminalTabs() {
  const {
    terminals,
    activeTerminalId,
    addTerminal,
    removeTerminal,
    setActiveTerminal,
    terminalSearchVisible,
    terminalSearchQuery,
    toggleTerminalSearch,
    setTerminalSearchQuery,
    terminalTheme,
    setTerminalTheme,
  } = useEditorStore();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const themeButtonRef = useRef<HTMLButtonElement>(null);
  const themeDropdownRef = useRef<HTMLDivElement>(null);

  // Focus search input when it becomes visible
  useEffect(() => {
    if (terminalSearchVisible && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [terminalSearchVisible]);

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "f") {
        e.preventDefault();
        toggleTerminalSearch();
      }
      // Only close one element at a time with Escape
      if (e.key === "Escape") {
        if (terminalSearchVisible) {
          toggleTerminalSearch();
        } else if (themeDropdownOpen) {
          setThemeDropdownOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    terminalSearchVisible,
    toggleTerminalSearch,
    themeDropdownOpen,
    setThemeDropdownOpen,
  ]);

  // Close theme dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        themeDropdownOpen &&
        themeDropdownRef.current &&
        themeButtonRef.current &&
        !themeDropdownRef.current.contains(e.target as Node) &&
        !themeButtonRef.current.contains(e.target as Node)
      ) {
        setThemeDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [themeDropdownOpen]);

  return (
    <div className="flex flex-col bg-editor-sidebar border-b border-editor-border">
      <div className="flex items-center h-8">
        <div className="flex-1 flex overflow-x-auto">
          {terminals.map((terminal) => {
            const isActive = terminal.id === activeTerminalId;

            return (
              <div
                key={terminal.id}
                className={`group flex items-center h-full px-3 cursor-pointer border-r border-editor-border transition-colors duration-75 ${
                  isActive
                    ? "bg-editor-bg text-editor-text"
                    : "text-editor-text-muted hover:bg-editor-hover hover:text-editor-text"
                }`}
                onClick={() => setActiveTerminal(terminal.id)}
              >
                <span className="mr-2 text-xs">⌘</span>
                <span className="text-xs max-w-[100px] truncate">
                  {terminal.title}
                </span>

                <button
                  className={`ml-2 p-0.5 rounded transition-opacity duration-75 ${
                    isActive
                      ? "opacity-60 hover:opacity-100 hover:bg-editor-hover"
                      : "opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-editor-hover"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTerminal(terminal.id);
                  }}
                  title="Kill Terminal"
                >
                  <svg
                    className="w-3 h-3"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <line x1="2" y1="2" x2="10" y2="10" />
                    <line x1="10" y1="2" x2="2" y2="10" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>

        {/* Theme picker button */}
        <div className="relative">
          <button
            ref={themeButtonRef}
            className={`h-full px-3 transition-colors ${
              themeDropdownOpen
                ? "text-editor-accent bg-editor-hover"
                : "text-editor-text-muted hover:text-editor-text hover:bg-editor-hover"
            }`}
            onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
            title="Terminal Theme"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="8" cy="8" r="5" />
              <path d="M8 3v5l3 3" />
            </svg>
          </button>

          {/* Theme dropdown */}
          {themeDropdownOpen && (
            <div
              ref={themeDropdownRef}
              className="absolute right-0 bottom-full mb-1 w-48 bg-editor-sidebar border border-editor-border rounded shadow-lg z-50 max-h-64 overflow-y-auto"
            >
              {themeNames.map((name) => (
                <button
                  key={name}
                  className={`w-full px-3 py-1.5 text-left text-xs transition-colors ${
                    terminalTheme === name
                      ? "bg-editor-accent/20 text-editor-accent"
                      : "text-editor-text hover:bg-editor-hover"
                  }`}
                  onClick={() => {
                    setTerminalTheme(name);
                    setThemeDropdownOpen(false);
                  }}
                >
                  {themeDisplayNames[name] || name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search button */}
        <button
          className={`h-full px-3 transition-colors ${
            terminalSearchVisible
              ? "text-editor-accent bg-editor-hover"
              : "text-editor-text-muted hover:text-editor-text hover:bg-editor-hover"
          }`}
          onClick={toggleTerminalSearch}
          title="Search Terminal (Cmd+Shift+F)"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="6.5" cy="6.5" r="4" />
            <line x1="10" y1="10" x2="14" y2="14" />
          </svg>
        </button>

        {/* Add terminal button */}
        <button
          className="h-full px-3 text-editor-text-muted hover:text-editor-text hover:bg-editor-hover transition-colors"
          onClick={addTerminal}
          title="New Terminal"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <line x1="8" y1="3" x2="8" y2="13" />
            <line x1="3" y1="8" x2="13" y2="8" />
          </svg>
        </button>

        {/* Trash/kill button for active terminal */}
        {activeTerminalId && (
          <button
            className="h-full px-3 text-editor-text-muted hover:text-red-400 hover:bg-editor-hover transition-colors"
            onClick={() => activeTerminalId && removeTerminal(activeTerminalId)}
            title="Kill Terminal"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M3 4h10M6 4V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1M12 4v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4" />
            </svg>
          </button>
        )}
      </div>

      {/* Search bar */}
      {terminalSearchVisible && (
        <div className="flex items-center h-8 px-2 bg-editor-bg border-t border-editor-border">
          <svg
            className="w-3.5 h-3.5 text-editor-text-muted mr-2"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="6.5" cy="6.5" r="4" />
            <line x1="10" y1="10" x2="14" y2="14" />
          </svg>
          <input
            ref={searchInputRef}
            type="text"
            value={terminalSearchQuery}
            onChange={(e) => setTerminalSearchQuery(e.target.value)}
            placeholder="Search terminal..."
            className="flex-1 bg-transparent text-xs text-editor-text placeholder:text-editor-text-muted outline-none"
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                toggleTerminalSearch();
              }
            }}
          />
          <button
            className="p-1 text-editor-text-muted hover:text-editor-text rounded"
            onClick={toggleTerminalSearch}
            title="Close"
          >
            <svg
              className="w-3 h-3"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <line x1="2" y1="2" x2="10" y2="10" />
              <line x1="10" y1="2" x2="2" y2="10" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}