import { useEditorStore } from '../../stores/editorStore';
import { Terminal } from './Terminal';

export function TerminalPanel() {
  const { terminals, activeTerminalId, removeTerminal } = useEditorStore();

  const activeTerminal = terminals.find(t => t.id === activeTerminalId);

  if (!activeTerminal) {
    return (
      <div className="h-full flex items-center justify-center bg-editor-bg text-editor-text-muted">
        <p className="text-sm">No terminal</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-editor-bg">
      {terminals.map((terminal) => (
        <div
          key={terminal.id}
          className={`h-full w-full ${
            terminal.id === activeTerminalId ? 'block' : 'hidden'
          }`}
        >
          <Terminal
            id={terminal.id}
            onExit={() => removeTerminal(terminal.id)}
          />
        </div>
      ))}
    </div>
  );
}
