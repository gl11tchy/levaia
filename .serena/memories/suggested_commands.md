# Suggested Commands

## Development
```bash
# Start development server (frontend + backend hot reload)
npm run tauri dev

# Build frontend only
npm run build

# Build production app
npm run tauri build
```

## Rust Backend
```bash
cd src-tauri

# Check compilation
cargo check

# Build debug
cargo build

# Build release
cargo build --release
```

## Testing/Linting
```bash
# TypeScript type checking
npx tsc --noEmit

# Rust linting
cd src-tauri && cargo clippy
```

## Utilities
```bash
# Kill running app
pkill -f "target/debug/lite"

# Clean build artifacts
rm -rf dist/ src-tauri/target/
```
