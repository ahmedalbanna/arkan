// code explantion in docs/hooks/use-sound.md

"use client";

import { useEffect, useCallback } from "react";

// This hook encapsulates the logic for playing UI sounds.
// It ensures that the sound library is only initialized on the client-side.

let ion: any = null; // To hold the ion-sound instance

export function useSound() {
  useEffect(() => {
    // Dynamically import ion-sound only on the client
    import("ion-sound").then((module) => {
      ion = module.default;
      if (ion && typeof ion.sound === "function") {
        ion.sound({
          sounds: [
            { name: "button_tiny" }, // Using a subtle click for success
            { name: "button_unpress" }, // Using another subtle sound for error
          ],
          volume: 0.5,
          path: "https://cdn.jsdelivr.net/npm/ion-sound@3.0.7/sounds/",
          preload: true,
        });
      }
    });
  }, []);

  const playSound = useCallback((sound: "success" | "error") => {
    if (ion && typeof ion.play === "function") {
      if (sound === "success") {
        ion.play("button_tiny");
      } else if (sound === "error") {
        ion.play("button_unpress");
      }
    }
  }, []);

  return { playSound };
}
