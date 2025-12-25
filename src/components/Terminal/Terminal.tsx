import { useEffect, useRef } from 'react';
import { useTerminal } from '../../hooks/useTerminal';
import '@xterm/xterm/css/xterm.css';

interface TerminalProps {
  id: string;
  onExit?: () => void;
}

export function Terminal({ id, onExit }: TerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { initTerminal, focus } = useTerminal({ id, onExit });

  useEffect(() => {
    if (containerRef.current) {
      initTerminal(containerRef.current);
    }
  }, [initTerminal]);

  // Focus terminal when it becomes visible
  useEffect(() => {
    focus();
  }, [focus]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full terminal-container"
      onClick={focus}
    />
  );
}
