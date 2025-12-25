import { useRef, useCallback } from 'react';
import MonacoEditor, { type OnMount, type BeforeMount } from '@monaco-editor/react';
import { useEditorStore } from '../../stores/editorStore';

export function Editor() {
  const { tabs, activeTabId, updateContent, wordWrap } = useEditorStore();
  const editorRef = useRef<any>(null);

  const activeTab = tabs.find(t => t.id === activeTabId);

  const handleBeforeMount: BeforeMount = useCallback((monaco) => {
    // Disable all TypeScript/JavaScript diagnostics
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
    });
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
    });

    // Disable all language diagnostics/validation by overriding the diagnostics adapter
    // This is a more aggressive approach to disable ALL squiggly lines
    monaco.languages.json?.jsonDefaults?.setDiagnosticsOptions({
      validate: false,
    });

    // Set editor theme
    monaco.editor.defineTheme('lite-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#cccccc',
        'editorCursor.foreground': '#cccccc',
        'editor.lineHighlightBackground': '#2a2d2e',
        'editor.selectionBackground': '#264f78',
        'editor.inactiveSelectionBackground': '#3a3d41',
        'editorLineNumber.foreground': '#858585',
        'editorLineNumber.activeForeground': '#cccccc',
        'editorGutter.background': '#1e1e1e',
        'editorWidget.background': '#252526',
        'editorWidget.border': '#3c3c3c',
        'input.background': '#3c3c3c',
        'input.foreground': '#cccccc',
        'input.border': '#3c3c3c',
        'focusBorder': '#007acc',
      },
    });
  }, []);

  const handleMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;

    // Focus editor
    editor.focus();

    // Add save action
    editor.addAction({
      id: 'save-file',
      label: 'Save File',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run: () => {
        const { activeTabId, saveFile } = useEditorStore.getState();
        if (activeTabId) {
          saveFile(activeTabId);
        }
      },
    });
  }, []);

  const handleChange = useCallback((value: string | undefined) => {
    if (activeTabId && value !== undefined) {
      updateContent(activeTabId, value);
    }
  }, [activeTabId, updateContent]);

  if (!activeTab) {
    return (
      <div className="h-full flex items-center justify-center bg-editor-bg">
        <div className="text-center text-editor-text-muted">
          <svg
            className="w-16 h-16 mx-auto mb-4 opacity-50"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14,2 14,8 20,8" />
          </svg>
          <p className="text-sm">No file open</p>
          <p className="text-xs mt-1">Open a file from the explorer or use Ctrl+P</p>
        </div>
      </div>
    );
  }

  return (
    <MonacoEditor
      key={activeTab.id}
      height="100%"
      language={activeTab.language}
      value={activeTab.content}
      theme="lite-dark"
      beforeMount={handleBeforeMount}
      onMount={handleMount}
      onChange={handleChange}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        lineHeight: 20,
        letterSpacing: 0.5,
        wordWrap: wordWrap ? 'on' : 'off',
        automaticLayout: true,
        scrollBeyondLastLine: false,
        renderLineHighlight: 'line',
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        smoothScrolling: true,
        padding: { top: 8, bottom: 8 },

        // Disable validation/diagnostics UI
        renderValidationDecorations: 'off',
        lightbulb: { enabled: 'off' as any },
        quickSuggestions: { other: true, strings: true, comments: false },
        suggestOnTriggerCharacters: true,
        acceptSuggestionOnEnter: 'on',
        tabCompletion: 'on',
        wordBasedSuggestions: 'currentDocument',

        // Disable features we don't need
        codeLens: false,
        folding: true,
        foldingHighlight: false,
        showFoldingControls: 'mouseover',
        matchBrackets: 'always',
        bracketPairColorization: { enabled: true },
        guides: {
          bracketPairs: true,
          indentation: true,
        },

        // Scrollbar
        scrollbar: {
          verticalScrollbarSize: 10,
          horizontalScrollbarSize: 10,
          useShadows: false,
        },

        // Hide certain UI elements
        overviewRulerBorder: false,
        hideCursorInOverviewRuler: true,
        overviewRulerLanes: 0,

        // Parameters hints and hover
        parameterHints: { enabled: true },
        hover: { enabled: true, delay: 300 },
      }}
    />
  );
}
