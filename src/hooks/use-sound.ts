
// code explantion in docs/hooks/use-sound.md

"use client";

import { createUIHook } from '@/core';
import { useCallback, useEffect } from "react";

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

/**
 * Hook محسن للأصوات مع ميزات متقدمة
 * يستخدم النظام الجديد لتقليل التكرار وتحسين الأداء
 */
export function useAdvancedSound() {
  const uiHook = createUIHook({
    hookName: 'advanced-sound',
    initialState: {
      isEnabled: true,
      volume: 0.5,
      currentSound: null,
      soundHistory: [],
      isPlaying: false,
    },
    customLogic: (state, setState, toast) => {
      const handlePlaySound = (sound: "success" | "error" | "notification" | "click") => {
        if (!state.isEnabled) return;

        setState(prev => ({
          ...prev,
          currentSound: sound,
          isPlaying: true,
          soundHistory: [...prev.soundHistory.slice(-9), { sound, timestamp: Date.now() }]
        }));

        // Play the sound
        if (ion && typeof ion.play === "function") {
          let soundName = "button_tiny";
          if (sound === "success") soundName = "button_tiny";
          else if (sound === "error") soundName = "button_unpress";
          else if (sound === "notification") soundName = "button_tiny";
          else if (sound === "click") soundName = "button_tiny";

          ion.play(soundName);
        }

        // Reset playing state after a short delay
        setTimeout(() => {
          setState(prev => ({ ...prev, isPlaying: false }));
        }, 100);
      };

      const handleToggleSound = () => {
        setState(prev => ({ ...prev, isEnabled: !prev.isEnabled }));
        toast({
          title: state.isEnabled ? 'Sound disabled' : 'Sound enabled',
          description: state.isEnabled ? 'UI sounds are now disabled' : 'UI sounds are now enabled'
        });
      };

      const handleSetVolume = (volume: number) => {
        setState(prev => ({ ...prev, volume: Math.max(0, Math.min(1, volume)) }));
        if (ion && typeof ion.volume === "function") {
          ion.volume(volume);
        }
      };

      const handleClearHistory = () => {
        setState(prev => ({ ...prev, soundHistory: [] }));
      };

      const handlePlayHistory = (index: number) => {
        const soundEntry = state.soundHistory[index];
        if (soundEntry) {
          handlePlaySound(soundEntry.sound);
        }
      };

      return {
        handlePlaySound,
        handleToggleSound,
        handleSetVolume,
        handleClearHistory,
        handlePlayHistory,
        isEnabled: state.isEnabled,
        volume: state.volume,
        currentSound: state.currentSound,
        soundHistory: state.soundHistory,
        isPlaying: state.isPlaying,
      };
    }
  })();

  return {
    // الوظائف الأساسية
    playSound: uiHook.handlePlaySound,

    // الوظائف الجديدة من UI Hook
    ...uiHook,
  };
}
