import { platform as getPlatform, type as getType } from '@tauri-apps/plugin-os';

let cachedPlatform: string | null = null;
let cachedType: string | null = null;

export async function getPlatformInfo(): Promise<{ platform: string; type: string }> {
  if (!cachedPlatform) {
    cachedPlatform = await getPlatform();
    cachedType = await getType();
  }
  return { platform: cachedPlatform, type: cachedType || 'unknown' };
}

export function isMac(): boolean {
  // Fallback for sync check
  return navigator.platform.toLowerCase().includes('mac');
}

export function isWindows(): boolean {
  return navigator.platform.toLowerCase().includes('win');
}

export function isLinux(): boolean {
  return navigator.platform.toLowerCase().includes('linux');
}

// Get the correct modifier key text for keyboard shortcuts
export function getModifierKey(): string {
  return isMac() ? '⌘' : 'Ctrl';
}

// Get keyboard shortcut display text
export function formatShortcut(shortcut: string): string {
  if (isMac()) {
    return shortcut
      .replace('Ctrl+', '⌘')
      .replace('Alt+', '⌥')
      .replace('Shift+', '⇧');
  }
  return shortcut;
}
