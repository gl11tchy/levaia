# Lite - Lightweight Code Editor

A minimal, fast code editor built with Tauri v2, React, and Monaco Editor.

## Features

- **File Explorer** - Recursive directory tree with expand/collapse
- **Monaco Editor** - Syntax highlighting, code formatting (no LSP/diagnostics)
- **Integrated Terminal** - xterm.js with PTY support (bash/zsh on Mac/Linux, PowerShell on Windows)
- **Tab Management** - Multiple file tabs with dirty indicators
- **Quick Open** - Fuzzy file search (Ctrl+P)
- **Dark Theme** - VS Code-inspired dark aesthetic

## Prerequisites

1. **Node.js 18+** - https://nodejs.org/
2. **Rust** - https://rustup.rs/
3. **Platform-specific dependencies**:
   - **macOS**: Xcode Command Line Tools (`xcode-select --install`)
   - **Linux**: `sudo apt install libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf`
   - **Windows**: Microsoft Visual Studio C++ Build Tools

## Setup

```bash
# Install dependencies
npm install

# Development mode
npm run tauri dev

# Build for production
npm run tauri build
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+S | Save file |
| Ctrl+W | Close tab |
| Ctrl+Tab | Next tab |
| Ctrl+P | Quick file open |
| Ctrl+B | Toggle sidebar |
| Ctrl+` | Toggle terminal |
| Ctrl+Shift+E | Focus file explorer |
| Ctrl+F | Find |
| Ctrl+H | Replace |
| Shift+Alt+F | Format document |

## Project Structure

```
src/                    # React frontend
  components/           # UI components
    FileExplorer/       # File tree
    Editor/             # Monaco editor + tabs
    Terminal/           # xterm.js terminal
    MenuBar/            # Menu and window controls
    QuickOpen/          # File search modal
  hooks/                # Custom React hooks
  stores/               # Zustand state management
  lib/                  # Utility functions

src-tauri/              # Rust backend
  src/
    main.rs             # Entry point
    lib.rs              # Plugin registration
    commands/           # Tauri commands
      filesystem.rs     # File operations
      pty.rs            # Terminal PTY management
```

## Tech Stack

- [Tauri v2](https://v2.tauri.app/) - Desktop app framework
- [React](https://react.dev/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Code editor
- [xterm.js](https://xtermjs.org/) - Terminal emulator
- [Zustand](https://zustand.docs.pmnd.rs/) - State management
- [Tailwind CSS](https://tailwindcss.com/) - Styling

## License

MIT
