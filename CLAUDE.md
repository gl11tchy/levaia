# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## MANDATORY: Use Serena MCP Tools

**You MUST use Serena MCP tools for all code operations in this project.**

### Required Tools
- **Navigation**: `get_symbols_overview`, `find_symbol`, `find_referencing_symbols`, `search_for_pattern`
- **Editing**: `replace_symbol_body`, `replace_content`, `insert_after_symbol`, `insert_before_symbol`
- **Files**: `list_dir`, `read_file`, `find_file`, `create_text_file`
- **Project**: `read_memory`, `write_memory`, `check_onboarding_performed`

### Workflow
1. Before editing: Use `get_symbols_overview` or `find_symbol` to understand context
2. For modifications: Use `replace_symbol_body` for functions, `replace_content` for smaller edits
3. After editing: Call `think_about_collected_information` and `think_about_task_adherence`
4. When done: Call `think_about_whether_you_are_done`

**DO NOT use** Claude Code's `Read`, `Edit`, or `Write` tools when Serena equivalents work.

---

## Build Commands

```bash
# Development (runs Vite dev server + Tauri)
npm run tauri dev

# Production build
npm run tauri build

# Frontend only
npm run build

# Type checking
npx tsc --noEmit              # TypeScript
cd src-tauri && cargo check   # Rust
```

---

## Architecture

### Frontend-Backend Communication
- Frontend (React) calls Rust backend via Tauri commands using `@tauri-apps/api`
- Commands are defined in `src-tauri/src/commands/` and registered in `lib.rs`
- Invoke pattern: `invoke('command_name', { args })`

### State Management (Zustand)
The single store in `src/stores/editorStore.ts` manages:
- **File tree**: `rootPath`, `fileTree`, `expandedFolders`
- **Editor tabs**: `tabs`, `activeTabId`, dirty state tracking
- **Terminals**: `terminals`, `activeTerminalId`
- **UI state**: `sidebarVisible`, `terminalVisible`, panel sizes

Persisted to localStorage: `rootPath`, `sidebarWidth`, `terminalHeight`, `wordWrap`

### Terminal PTY Architecture
- Frontend (`useTerminal` hook) connects xterm.js to Tauri events
- Backend (`commands/pty.rs`) manages PTY instances via `portable-pty`
- Communication: `spawn_shell` → reader thread emits `pty-data-{id}` → xterm.js displays
- Write path: xterm.js → `write_to_pty` command → PTY writer

### Monaco Editor Configuration
Monaco is configured to run without LSP/diagnostics:
- All TypeScript/JavaScript validation disabled in `beforeMount`
- Language detection based on file extension in `lib/fileUtils.ts`
- Custom VS Code dark theme applied

---

## Key Files

| File | Purpose |
|------|---------|
| `src/stores/editorStore.ts` | Central state management |
| `src/hooks/useTerminal.ts` | Terminal PTY lifecycle |
| `src/hooks/useKeybindings.ts` | Global keyboard shortcuts |
| `src-tauri/src/lib.rs` | Tauri plugin registration |
| `src-tauri/src/commands/pty.rs` | PTY spawn/resize/kill |
| `src-tauri/src/commands/filesystem.rs` | File CRUD operations |

---

## Code Style

- **TypeScript**: Functional components, explicit types, avoid `any`
- **Rust**: snake_case functions, `Result<T, String>` for errors
- **Components**: PascalCase names, one component per file
- Dark theme only, VS Code-inspired aesthetics