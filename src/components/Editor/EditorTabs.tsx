import { useEditorStore } from '../../stores/editorStore';

export function EditorTabs() {
  const { tabs, activeTabId, setActiveTab, closeTab } = useEditorStore();

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="flex bg-editor-tab border-b border-editor-border overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;

        return (
          <div
            key={tab.id}
            className={`group flex items-center h-9 px-3 cursor-pointer border-r border-editor-border transition-colors duration-75 ${
              isActive
                ? 'bg-editor-bg text-editor-text'
                : 'bg-editor-tab text-editor-text-muted hover:bg-editor-hover hover:text-editor-text'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {/* Dirty indicator or file icon */}
            <span className="mr-2 flex items-center justify-center w-3">
              {tab.isDirty ? (
                <span className="w-2 h-2 bg-white rounded-full" />
              ) : (
                <span className="text-xs opacity-60">
                  {getFileEmoji(tab.name)}
                </span>
              )}
            </span>

            {/* Tab name */}
            <span
              className={`text-sm max-w-[120px] truncate ${
                tab.isDirty ? 'italic' : ''
              }`}
            >
              {tab.name}
            </span>

            {/* Close button */}
            <button
              className={`ml-2 p-0.5 rounded transition-opacity duration-75 ${
                isActive
                  ? 'opacity-60 hover:opacity-100 hover:bg-editor-hover'
                  : 'opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-editor-hover'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
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

            {/* Active indicator line */}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-editor-accent" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function getFileEmoji(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();

  const emojiMap: Record<string, string> = {
    js: '📜',
    jsx: '⚛️',
    ts: '📘',
    tsx: '⚛️',
    json: '📋',
    html: '🌐',
    css: '🎨',
    scss: '🎨',
    md: '📝',
    py: '🐍',
    rs: '🦀',
    go: '🐹',
    java: '☕',
    rb: '💎',
    php: '🐘',
    sh: '🐚',
    yml: '⚙️',
    yaml: '⚙️',
    toml: '⚙️',
    sql: '🗃️',
    svg: '🖼️',
    png: '🖼️',
    jpg: '🖼️',
  };

  return emojiMap[ext || ''] || '📄';
}
