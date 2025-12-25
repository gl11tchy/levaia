# Lite - Lightweight Code Editor

## Purpose
A lightweight, VS Code-inspired code editor built with Tauri v2. Designed to be minimal, fast, and focused on core editing functionality without LSP, extensions, or heavy features.

## Tech Stack

### Frontend
- **React 18** + TypeScript
- **Vite** - Build tool
- **Monaco Editor** (@monaco-editor/react) - Code editing
- **xterm.js** (@xterm/xterm + @xterm/addon-fit) - Integrated terminal
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **react-resizable-panels** - Resizable layout panels

### Backend (Rust)
- **Tauri v2** - Desktop app framework
- **portable-pty** - PTY management for terminal
- Plugins: tauri-plugin-fs, tauri-plugin-shell, tauri-plugin-os, tauri-plugin-dialog, tauri-plugin-process

## Key Features
- File explorer with recursive directory tree
- Monaco editor with syntax highlighting (no diagnostics)
- Integrated terminal (bash/zsh on Mac/Linux, PowerShell on Windows)
- Tab management with dirty indicators
- Quick file open (Ctrl+P) with fuzzy search
- Custom titlebar on Windows/Linux, native on macOS
- Dark theme only
