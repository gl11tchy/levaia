import { useEditorStore } from '../../stores/editorStore';

export function StatusBar() {
  const { terminalVisible, toggleTerminal } = useEditorStore();

  return (
    <div className="h-6 bg-editor-sidebar border-t border-editor-border flex items-center justify-between px-3 text-[11px] text-editor-text-muted">
      <div className="flex items-center gap-3">
        {/* Left side - can add more items later */}
      </div>
      <div className="flex items-center">
        <button
          onClick={toggleTerminal}
          className="flex items-center gap-1.5 px-2 py-0.5 hover:bg-editor-hover rounded transition-colors"
          title="Toggle Terminal (Cmd+`)"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="4,17 10,11 4,5" />
            <line x1="12" y1="19" x2="20" y2="19" />
          </svg>
          <span>Terminal</span>
          <span className="text-[10px] opacity-60">{terminalVisible ? '▼' : '▲'}</span>
        </button>
      </div>
    </div>
  );
}
