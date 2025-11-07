
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
    // The 'voiceschanged' event is fired when the list of supported voices is ready.
    window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
    // Also call it directly in case the voices are already available.
    handleVoicesChanged();
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      stop(); // Stop any speech on unmount
    };
  }, []); // The empty dependency array ensures this effect runs once on mount.

  // A simple language detection function based on character ranges.
  const detectLanguage = (text: string): 'ar' | 'en' => {
    // Basic check for Arabic characters. If any are found, assume Arabic.
    if (/[\u0600-\u06FF]/.test(text)) {
      return 'ar';
    }
    return 'en';
  };

  const speak = useCallback((text: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const detectedLang = detectLanguage(text);

    // Find the best voice for the detected language.
    // We prioritize voices that match the language exactly, then by prefix.
    const selectedVoice = voices.find(voice => voice.lang === detectedLang)
      || voices.find(voice => voice.lang.startsWith(detectedLang));

    // Fallback logic if no specific voice is found.
    utterance.voice = selectedVoice || voices.find(v => v.lang.startsWith('en')) || voices[0];
    utterance.lang = selectedVoice ? selectedVoice.lang : (detectedLang === 'ar' ? 'ar-SA' : 'en-US');
    utterance.pitch = 1.42;
    utterance.rate = 0.85;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error('SpeechSynthesis Error:', e);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [voices, isSpeaking]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return { speak, stop, isSpeaking, availableVoices: voices };
}
