import { useState, useEffect } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';

export function WindowControls() {
  const [isMaximized, setIsMaximized] = useState(false);
  const appWindow = getCurrentWindow();

  useEffect(() => {
    // Check initial state
    appWindow.isMaximized().then(setIsMaximized);

    // Listen for changes
    const unlisten = appWindow.onResized(() => {
      appWindow.isMaximized().then(setIsMaximized);
    });

    return () => {
      unlisten.then(fn => fn());
    };
  }, []);

  return (
    <div className="flex h-full">
      <button
        className="w-12 h-full flex items-center justify-center hover:bg-editor-hover transition-colors"
        onClick={() => appWindow.minimize()}
        title="Minimize"
      >
        <svg
          width="10"
          height="1"
          viewBox="0 0 10 1"
          fill="currentColor"
        >
          <rect width="10" height="1" />
        </svg>
      </button>

      <button
        className="w-12 h-full flex items-center justify-center hover:bg-editor-hover transition-colors"
        onClick={() => appWindow.toggleMaximize()}
        title={isMaximized ? 'Restore' : 'Maximize'}
      >
        {isMaximized ? (
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            stroke="currentColor"
          >
            <rect x="2" y="0" width="8" height="8" strokeWidth="1" />
            <rect x="0" y="2" width="8" height="8" strokeWidth="1" fill="#1e1e1e" />
          </svg>
        ) : (
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            stroke="currentColor"
          >
            <rect x="0" y="0" width="10" height="10" strokeWidth="1" />
          </svg>
        )}
      </button>

      <button
        className="w-12 h-full flex items-center justify-center hover:bg-red-600 transition-colors"
        onClick={() => appWindow.close()}
        title="Close"
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        >
          <line x1="0" y1="0" x2="10" y2="10" />
          <line x1="10" y1="0" x2="0" y2="10" />
        </svg>
      </button>
    </div>
  );
}
