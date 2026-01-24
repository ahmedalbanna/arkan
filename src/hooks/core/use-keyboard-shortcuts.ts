/**
 * Keyboard Shortcuts Hook
 * Provides keyboard navigation and shortcuts for flow builder
 */

'use client';

import { useCallback, useEffect } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
  category?: string;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  preventDefault?: boolean;
}

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutsOptions = {}
) {
  const { enabled = true, preventDefault = true } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Find matching shortcut
      const shortcut = shortcuts.find((s) => {
        const keyMatch = s.key.toLowerCase() === event.key.toLowerCase();
        const ctrlMatch = s.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = s.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = s.alt ? event.altKey : !event.altKey;

        return keyMatch && ctrlMatch && shiftMatch && altMatch;
      });

      if (shortcut) {
        if (preventDefault) {
          event.preventDefault();
        }
        shortcut.action();
      }
    },
    [shortcuts, enabled, preventDefault]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);

  return {
    shortcuts,
    enabled,
  };
}

// Predefined shortcut helpers
export const COMMON_SHORTCUTS = {
  SAVE: { key: 's', ctrl: true, description: 'Save flow' },
  UNDO: { key: 'z', ctrl: true, description: 'Undo' },
  REDO: { key: 'z', ctrl: true, shift: true, description: 'Redo' },
  DELETE: { key: 'Delete', description: 'Delete selected step' },
  BACKSPACE: { key: 'Backspace', description: 'Delete selected step' },
  ESCAPE: { key: 'Escape', description: 'Deselect/Close' },
  COPY: { key: 'c', ctrl: true, description: 'Copy step' },
  PASTE: { key: 'v', ctrl: true, description: 'Paste step' },
  DUPLICATE: { key: 'd', ctrl: true, description: 'Duplicate step' },
  NEW: { key: 'n', ctrl: true, description: 'New flow' },
  SEARCH: { key: 'k', ctrl: true, description: 'Search steps' },
  HELP: { key: '?', shift: true, description: 'Show help' },
};
