'use client';

import { useEffect } from 'react';

interface KeyboardShortcutHandlers {
  onSave?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomReset?: () => void;
}

export function useKeyboardShortcuts({
  onSave,
  onZoomIn,
  onZoomOut,
  onZoomReset,
}: KeyboardShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? event.metaKey : event.ctrlKey;

      if (modifier) {
        switch (event.key.toLowerCase()) {
          case 's':
            if (onSave) {
              event.preventDefault();
              onSave();
            }
            break;
          case '=':
          case '+':
            if (onZoomIn) {
              event.preventDefault();
              onZoomIn();
            }
            break;
          case '-':
            if (onZoomOut) {
              event.preventDefault();
              onZoomOut();
            }
            break;
          case '0':
            if (onZoomReset) {
              event.preventDefault();
              onZoomReset();
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onSave, onZoomIn, onZoomOut, onZoomReset]);
}
