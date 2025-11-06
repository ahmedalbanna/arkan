
'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * A hook to interact with the browser's SpeechSynthesis API.
 */
export function useBrowserSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const handleVoicesChanged = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
    handleVoicesChanged(); // Initial load
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      stop(); // Stop any speech on unmount
    };
  }, []);

  const speak = useCallback((text: string, lang: string = 'en-US') => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = voices.find(voice => voice.lang.startsWith(lang));
    
    utterance.voice = selectedVoice || voices.find(v => v.lang.startsWith('en')) || voices[0];
    utterance.pitch = 1;
    utterance.rate = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [voices, isSpeaking]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return { speak, stop, isSpeaking, availableVoices: voices };
}
