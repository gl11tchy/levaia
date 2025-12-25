import { useEffect, useRef, useCallback } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { invoke } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';

interface UseTerminalOptions {
  id: string;
  onExit?: () => void;
}

export function useTerminal({ id, onExit }: UseTerminalOptions) {
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isSpawnedRef = useRef(false);
  const unlistenersRef = useRef<UnlistenFn[]>([]);

  const initTerminal = useCallback(async (container: HTMLDivElement) => {
    if (terminalRef.current || isSpawnedRef.current) return;

    containerRef.current = container;

    // Create terminal
    const terminal = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#cccccc',
        cursor: '#cccccc',
        cursorAccent: '#1e1e1e',
        selectionBackground: '#264f78',
        black: '#1e1e1e',
        red: '#f44747',
        green: '#6a9955',
        yellow: '#dcdcaa',
        blue: '#569cd6',
        magenta: '#c586c0',
        cyan: '#4ec9b0',
        white: '#d4d4d4',
        brightBlack: '#808080',
        brightRed: '#f44747',
        brightGreen: '#6a9955',
        brightYellow: '#dcdcaa',
        brightBlue: '#569cd6',
        brightMagenta: '#c586c0',
        brightCyan: '#4ec9b0',
        brightWhite: '#ffffff',
      },
      scrollback: 10000,
      convertEol: true,
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(container);

    // Delay fit to ensure container has proper dimensions
    setTimeout(() => fitAddon.fit(), 0);

    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;
    isSpawnedRef.current = true;

    // Set up event listeners for PTY data
    const dataUnlisten = await listen<string>(`pty-data-${id}`, (event) => {
      terminal.write(event.payload);
    });

    const exitUnlisten = await listen(`pty-exit-${id}`, () => {
      terminal.write('\r\n\x1b[90m[Process exited]\x1b[0m\r\n');
      onExit?.();
    });

    unlistenersRef.current = [dataUnlisten, exitUnlisten];

    // Send terminal input to PTY
    terminal.onData((data) => {
      invoke('write_to_pty', { id, data }).catch(console.error);
    });

    // Spawn the shell
    try {
      await invoke('spawn_shell', { id });
    } catch (error) {
      terminal.write(`\x1b[31mFailed to spawn shell: ${error}\x1b[0m\r\n`);
    }
  }, [id, onExit]);

  const resize = useCallback(() => {
    if (fitAddonRef.current && terminalRef.current) {
      fitAddonRef.current.fit();
      const { rows, cols } = terminalRef.current;
      invoke('resize_pty', { id, rows, cols }).catch(console.error);
    }
  }, [id]);

  const dispose = useCallback(() => {
    // Kill PTY
    invoke('kill_pty', { id }).catch(() => {
      // Ignore errors if already dead
    });

    // Unlisten events
    unlistenersRef.current.forEach(unlisten => unlisten());
    unlistenersRef.current = [];

    // Dispose terminal
    if (terminalRef.current) {
      terminalRef.current.dispose();
      terminalRef.current = null;
    }

    fitAddonRef.current = null;
    isSpawnedRef.current = false;
  }, [id]);

  const write = useCallback((data: string) => {
    terminalRef.current?.write(data);
  }, []);

  const focus = useCallback(() => {
    terminalRef.current?.focus();
  }, []);

  // Handle container resize
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(() => {
      resize();
    });

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [resize]);

  // Cleanup on unmount
  useEffect(() => {
    return () => dispose();
  }, [dispose]);

  return {
    initTerminal,
    resize,
    dispose,
    write,
    focus,
  };
}
