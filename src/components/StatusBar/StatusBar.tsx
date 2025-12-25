import { useEditorStore } from '../../stores/editorStore';
import { useUpdateChecker } from '../../hooks/useUpdateChecker';

export function StatusBar() {
  const {
    sidebarVisible,
    toggleSidebar,
    gitPanelVisible,
    toggleGitPanel,
    terminalVisible,
    toggleTerminal,
    toggleQuickOpen,
  } = useEditorStore();

  const { updateAvailable, latestVersion, openReleases } = useUpdateChecker();

  return (
    <div className="h-7 bg-editor-sidebar border-t border-editor-border flex items-center justify-between px-2 text-[11px] text-editor-text-muted select-none">
      {/* Left side - panel toggles */}
      <div className="flex items-center">
        {/* Sidebar toggle */}
        <button
          onClick={toggleSidebar}
          className={`p-1.5 rounded transition-colors ${
            sidebarVisible ? 'text-editor-text' : 'text-editor-text-muted'
          } hover:bg-editor-hover hover:text-editor-text`}
          title="Toggle Sidebar (Cmd+B)"
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
            <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h11A1.5 1.5 0 0 1 15 2.5v11a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 13.5v-11zM2.5 2a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h3V2h-3zm4 0v12h7a.5.5 0 0 0 .5-.5v-11a.5.5 0 0 0-.5-.5h-7z" />
          </svg>
        </button>

        {/* Git panel toggle */}
        <button
          onClick={toggleGitPanel}
          className={`p-1.5 rounded transition-colors ${
            gitPanelVisible ? 'text-editor-text' : 'text-editor-text-muted'
          } hover:bg-editor-hover hover:text-editor-text`}
          title="Toggle Source Control (Cmd+Shift+G)"
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
            <path d="M11.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5zm-2.25.75a2.25 2.25 0 1 1 3 2.122V6A2.5 2.5 0 0 1 10 8.5H6a1 1 0 0 0-1 1v1.128a2.251 2.251 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.5 0v1.836A2.492 2.492 0 0 1 6 7h4a1 1 0 0 0 1-1v-.628A2.25 2.25 0 0 1 9.5 3.25zM4.25 12a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5zM3.5 3.25a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0z" />
          </svg>
        </button>

        {/* File list toggle */}
        <button
          onClick={() => {}}
          className="p-1.5 rounded transition-colors text-editor-text-muted hover:bg-editor-hover hover:text-editor-text"
          title="Open Editors"
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12.5v-9zM3.5 3a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-9z" />
            <path d="M4.5 5h7v1h-7zM4.5 7.5h7v1h-7zM4.5 10h4v1h-4z" />
          </svg>
        </button>

        {/* Collaborators placeholder */}
        <button
          onClick={() => {}}
          className="p-1.5 rounded transition-colors text-editor-text-muted hover:bg-editor-hover hover:text-editor-text"
          title="Collaborators"
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8 9a5 5 0 0 0-5 5h10a5 5 0 0 0-5-5z" />
          </svg>
        </button>
      </div>

      {/* Right side */}
      <div className="flex items-center">
        {/* Search */}
        <button
          onClick={toggleQuickOpen}
          className="p-1.5 rounded transition-colors text-editor-text-muted hover:bg-editor-hover hover:text-editor-text"
          title="Quick Open (Cmd+P)"
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="6.5" cy="6.5" r="4" />
            <line x1="10" y1="10" x2="14" y2="14" />
          </svg>
        </button>

        {/* Terminal toggle */}
        <button
          onClick={toggleTerminal}
          className={`p-1.5 rounded transition-colors ${
            terminalVisible ? 'text-editor-text' : 'text-editor-text-muted'
          } hover:bg-editor-hover hover:text-editor-text`}
          title="Toggle Terminal (Cmd+`)"
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3zm1 0v10h10V3H3z" />
            <path d="M4.5 5.5l2 2-2 2" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <path d="M7.5 10h3" fill="none" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>

        {/* Update available indicator */}
        {updateAvailable && (
          <button
            onClick={openReleases}
            className="p-1.5 rounded transition-colors text-blue-400 hover:bg-editor-hover hover:text-blue-300"
            title={`Update available: v${latestVersion}`}
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z" />
            </svg>
          </button>
        )}

        {/* Check/status indicator */}
        <button
          onClick={() => {}}
          className="p-1.5 rounded transition-colors text-green-500 hover:bg-editor-hover"
          title="No Problems"
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
            <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
