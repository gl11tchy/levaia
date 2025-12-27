import { useEffect, useRef, useCallback } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { SearchAddon } from "@xterm/addon-search";
import { WebglAddon } from "@xterm/addon-webgl";
import { LigaturesAddon } from "@xterm/addon-ligatures";
import { ImageAddon } from "@xterm/addon-image";
import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { getTheme } from "../lib/terminalThemes";
import { useEditorStore } from "../stores/editorStore";

interface UseTerminalOptions {
  id: string;
  onExit?: () => void;
  remote?: { sessionId: string };
}

export function useTerminal({ id, onExit, remote }: UseTerminalOptions) {
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const searchAddonRef = useRef<SearchAddon | null>(null);
  const unlistenersRef = useRef<UnlistenFn[]>([]);
  const initializedRef = useRef(false);
  const isRemote = !!remote;

  const initTerminal = useCallback(
    async (container: HTMLDivElement) => {
      // Prevent double initialization (React StrictMode)
      if (initializedRef.current) return;
      initializedRef.current = true;

      // Get theme from store
      const terminalTheme = useEditorStore.getState().terminalTheme;
      const theme = getTheme(terminalTheme);

      const terminal = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily:
          '"Fira Code", "JetBrains Mono", Menlo, Monaco, Consolas, monospace',
        allowProposedApi: true,
        theme,
        scrollback: 10000,
        // Performance optimizations
        fastScrollModifier: "alt",
        fastScrollSensitivity: 5,
        scrollSensitivity: 1,
        smoothScrollDuration: 0,
      });

      const fitAddon = new FitAddon();
      const searchAddon = new SearchAddon();
      const webLinksAddon = new WebLinksAddon();
      const ligaturesAddon = new LigaturesAddon();
      const imageAddon = new ImageAddon();

      terminal.loadAddon(fitAddon);
      terminal.loadAddon(searchAddon);
      terminal.loadAddon(webLinksAddon);
      terminal.loadAddon(ligaturesAddon);
      terminal.loadAddon(imageAddon);

      terminal.open(container);

      // Try to load WebGL addon for GPU acceleration, fall back to canvas
      try {
        const webglAddon = new WebglAddon();
        webglAddon.onContextLoss(() => {
          webglAddon.dispose();
        });
        terminal.loadAddon(webglAddon);
      } catch (e) {
        console.warn("WebGL not supported, using canvas renderer");
      }

      fitAddon.fit();

      terminalRef.current = terminal;
      fitAddonRef.current = fitAddon;
      searchAddonRef.current = searchAddon;

      // Listen for PTY output
      const dataUnlisten = await listen<string>(`pty-data-${id}`, (event) => {
        terminal.write(event.payload);
      });

      const exitUnlisten = await listen(`pty-exit-${id}`, () => {
        terminal.write("\r\n[Process exited]\r\n");
        onExit?.();
      });

      unlistenersRef.current = [dataUnlisten, exitUnlisten];

      // Send input to PTY
      terminal.onData((data) => {
        if (isRemote && remote) {
          invoke("ssh_write_to_shell", { ptyId: id, data }).catch(
            console.error,
          );
        } else {
          invoke("write_to_pty", { id, data }).catch(console.error);
        }
      });

      // Spawn shell
      try {
        if (isRemote && remote) {
          await invoke("ssh_spawn_shell", {
            sessionId: remote.sessionId,
            ptyId: id,
          });
        } else {
          await invoke("spawn_shell", { id });
        }
      } catch (err) {
        terminal.write(`\x1b[31mFailed to spawn shell: ${err}\x1b[0m\r\n`);
      }

      // Initial resize
      const { rows, cols } = terminal;
      if (isRemote && remote) {
        invoke("ssh_resize_shell", { ptyId: id, rows, cols }).catch(
          console.error,
        );
      } else {
        invoke("resize_pty", { id, rows, cols }).catch(console.error);
      }

      // Handle resize
      const resizeObserver = new ResizeObserver(() => {
        fitAddon.fit();
        const { rows, cols } = terminal;
        if (isRemote && remote) {
          invoke("ssh_resize_shell", { ptyId: id, rows, cols }).catch(
            console.error,
          );
        } else {
          invoke("resize_pty", { id, rows, cols }).catch(console.error);
        }
      });
      resizeObserver.observe(container);

      // Subscribe to theme changes
      let currentTheme = terminalTheme;
      const unsubscribeTheme = useEditorStore.subscribe((state) => {
        if (state.terminalTheme !== currentTheme) {
          currentTheme = state.terminalTheme;
          terminal.options.theme = getTheme(currentTheme);
        }
      });
      unlistenersRef.current.push(unsubscribeTheme);
    },
    [id, onExit, isRemote, remote],
  );

  const focus = useCallback(() => {
    terminalRef.current?.focus();
  }, []);

  const search = useCallback((query: string) => {
    searchAddonRef.current?.findNext(query, { caseSensitive: false });
  }, []);

  const clearSearch = useCallback(() => {
    searchAddonRef.current?.clearDecorations();
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      unlistenersRef.current.forEach((fn) => fn());
      if (isRemote && remote) {
        invoke("ssh_kill_shell", { ptyId: id }).catch(() => {});
      } else {
        invoke("kill_pty", { id }).catch(() => {});
      }
      terminalRef.current?.dispose();
    };
  }, [id, isRemote, remote]);

  return { initTerminal, focus, search, clearSearch };
}
