
'use client';

import { useEffect, useCallback } from 'react';
import ion from 'ion-sound';

// Initialize sounds once
if (typeof window !== 'undefined') {
    ion({
        sounds: [
            { name: "bell_ring", alias: "success" },
            { name: "button_tiny", alias: "error" }
        ],
        path: "/sounds/",
        preload: true,
        multiplay: true,
        volume: 0.9
    });
}

/**
 * A hook to play predefined UI sounds.
 * @returns An object with functions to play 'success' and 'error' sounds.
 */
export const useSound = () => {
  const playSuccess = useCallback(() => {
    if (typeof window !== 'undefined') {
        ion.sound.play('success');
    }
  }, []);

  const playError = useCallback(() => {
     if (typeof window !== 'undefined') {
        ion.sound.play('error');
    }
  }, []);

  return { playSuccess, playError };
};
