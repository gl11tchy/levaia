# Code Style & Conventions

## TypeScript/React

### File Organization
- Components in `src/components/<ComponentName>/<ComponentName>.tsx`
- Hooks in `src/hooks/use<Name>.ts`
- State stores in `src/stores/<name>Store.ts`
- Utilities in `src/lib/<name>.ts`
- Types in `src/types/index.ts`

### Naming Conventions
- **Components**: PascalCase (`FileExplorer`, `EditorTabs`)
- **Hooks**: camelCase with `use` prefix (`useFileSystem`, `useTerminal`)
- **Files**: PascalCase for components, camelCase for utilities
- **CSS classes**: Tailwind utility classes, kebab-case for custom

### React Patterns
- Functional components only
- Zustand for global state
- Custom hooks for reusable logic
- Props destructuring in function signature

### TypeScript
- Explicit return types on exported functions
- Interfaces for object shapes
- Type unions for discriminated unions
- No `any` - use `unknown` if needed

## Rust

### File Organization
- Commands in `src/commands/<module>.rs`
- Main entry in `src/lib.rs`

### Naming
- snake_case for functions and variables
- PascalCase for types and structs
- SCREAMING_SNAKE_CASE for constants

### Tauri Commands
- Use `#[tauri::command]` attribute
- Return `Result<T, String>` for error handling
- Serialize with serde
