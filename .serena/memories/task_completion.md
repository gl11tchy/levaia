# Task Completion Checklist

When completing a task, ensure the following:

## Before Committing

1. **TypeScript Check**
   ```bash
   npx tsc --noEmit
   ```

2. **Build Frontend**
   ```bash
   npm run build
   ```

3. **Rust Check**
   ```bash
   cd src-tauri && cargo check
   ```

4. **Test the App**
   ```bash
   npm run tauri dev
   ```
   - Verify the feature works
   - Check for console errors
   - Test on the target platform

## Code Quality
- No unused imports or variables
- No `any` types in TypeScript
- Proper error handling
- Comments for complex logic only
