
'use client';

import { useEffect, useCallback } from 'react';

// Dynamically import ion-sound inside a useEffect to ensure it only runs on the client
const useSound = () => {
  useEffect(() => {
    // This check is belt-and-suspenders, as useEffect only runs on the client.
    if (typeof window !== 'undefined') {
      import('ion-sound').then(ion => {
        ion.default({
          sounds: [
            { name: "bell_ring", alias: "success" },
            { name: "button_tiny", alias: "error" }
          ],
          path: "/sounds/",
          preload: true,
          multiplay: true,
          volume: 0.9
        });
      });
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  const playSuccess = useCallback(() => {
    if (typeof window !== 'undefined') {
        import('ion-sound').then(ion => {
            ion.default.sound.play('success');
        });
    }
  }, []);

  const playError = useCallback(() => {
     if (typeof window !== 'undefined') {
        import('ion-sound').then(ion => {
            ion.default.sound.play('error');
        });
    }
  }, []);

  return { playSuccess, playError };
};

export { useSound };
