import { useEffect, useRef } from 'react';
import { useTerminal } from '../../hooks/useTerminal';
import { useEditorStore } from '../../stores/editorStore';
import '@xterm/xterm/css/xterm.css';

interface TerminalProps {
  id: string;
  onExit?: () => void;
}

export function Terminal({ id, onExit }: TerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { initTerminal, focus, search, clearSearch } = useTerminal({ id, onExit });
  const { terminalSearchQuery, activeTerminalId } = useEditorStore();

  useEffect(() => {
    if (containerRef.current) {
      initTerminal(containerRef.current);
    }
  }, [initTerminal]);

  // Focus terminal when it becomes visible
  useEffect(() => {
    focus();
  }, [focus]);

  // Handle search when query changes (only for active terminal)
  useEffect(() => {
    if (id !== activeTerminalId) return;

    if (terminalSearchQuery) {
      search(terminalSearchQuery);
    } else {
      clearSearch();
    }
  }, [terminalSearchQuery, id, activeTerminalId, search, clearSearch]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full terminal-container"
      onClick={focus}
    />
  );
}
