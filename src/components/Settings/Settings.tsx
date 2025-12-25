import { useEditorStore } from '../../stores/editorStore';

export function Settings() {
  const {
    settingsVisible,
    toggleSettings,
    wordWrap,
    toggleWordWrap,
    fontSize,
    setFontSize,
    tabSize,
    setTabSize,
  } = useEditorStore();

  if (!settingsVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-editor-sidebar border border-editor-border rounded-lg shadow-xl w-[400px] max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-editor-border">
          <h2 className="text-sm font-medium text-editor-text">Settings</h2>
          <button
            onClick={toggleSettings}
            className="p-1 rounded hover:bg-editor-hover text-editor-text-muted hover:text-editor-text"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.28 3.22a.75.75 0 0 0-1.06 1.06L6.94 8l-3.72 3.72a.75.75 0 1 0 1.06 1.06L8 9.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L9.06 8l3.72-3.72a.75.75 0 0 0-1.06-1.06L8 6.94 4.28 3.22z" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Editor Section */}
          <div>
            <h3 className="text-xs font-medium text-editor-text-muted uppercase tracking-wide mb-3">
              Editor
            </h3>

            {/* Font Size */}
            <div className="flex items-center justify-between py-2">
              <label className="text-sm text-editor-text">Font Size</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFontSize(Math.max(8, fontSize - 1))}
                  className="px-2 py-1 rounded bg-editor-hover hover:bg-editor-accent text-editor-text text-sm"
                >
                  -
                </button>
                <span className="text-sm text-editor-text w-8 text-center">{fontSize}</span>
                <button
                  onClick={() => setFontSize(Math.min(24, fontSize + 1))}
                  className="px-2 py-1 rounded bg-editor-hover hover:bg-editor-accent text-editor-text text-sm"
                >
                  +
                </button>
              </div>
            </div>

            {/* Tab Size */}
            <div className="flex items-center justify-between py-2">
              <label className="text-sm text-editor-text">Tab Size</label>
              <select
                value={tabSize}
                onChange={(e) => setTabSize(Number(e.target.value))}
                className="bg-editor-hover border border-editor-border rounded px-2 py-1 text-sm text-editor-text"
              >
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces</option>
                <option value={8}>8 spaces</option>
              </select>
            </div>

            {/* Word Wrap */}
            <div className="flex items-center justify-between py-2">
              <label className="text-sm text-editor-text">Word Wrap</label>
              <button
                onClick={toggleWordWrap}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  wordWrap ? 'bg-blue-500' : 'bg-editor-hover'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                    wordWrap ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-editor-border text-xs text-editor-text-muted">
          Settings are saved automatically
        </div>
      </div>
    </div>
  );
}
