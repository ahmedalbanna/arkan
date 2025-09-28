// code explantion in docs/hooks/use-debounces.md

"use client";

import { createUIHook } from '@/core';
import { useEffect, useState } from "react";

/**
 * A custom hook that debounces a value.
 * @param value The value to debounce.
 * @param delay The delay in milliseconds.
 * @returns The debounced value.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set debouncedValue to value (passed in) after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Return a cleanup function that will be called every time ...
    // ... useEffect is re-called. useEffect will only be re-called ...
    // ... if value or delay changes (see the inputs array below).
    // This is how we prevent debouncedValue from changing if value is ...
    // ... changed within the delay period.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Only re-call effect if value or delay changes

  return debouncedValue;
}

/**
 * Hook محسن للـ debounce مع ميزات متقدمة
 * يستخدم النظام الجديد لتقليل التكرار وتحسين الأداء
 */
export function useAdvancedDebounce<T>(value: T, delay: number, options?: {
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}) {
  const uiHook = createUIHook({
    hookName: 'advanced-debounce',
    initialState: {
      value,
      delay,
      debouncedValue: value,
      isDebouncing: false,
      lastCallTime: 0,
      maxWait: options?.maxWait || delay * 2,
    },
    customLogic: (state, setState, toast) => {
      const handleDebounce = (newValue: T) => {
        setState(prev => ({
          ...prev,
          value: newValue,
          isDebouncing: true,
          lastCallTime: Date.now()
        }));
      };

      const handleImmediate = (newValue: T) => {
        setState(prev => ({
          ...prev,
          value: newValue,
          debouncedValue: newValue,
          isDebouncing: false
        }));
      };

      const handleCancel = () => {
        setState(prev => ({
          ...prev,
          isDebouncing: false
        }));
      };

      const handleFlush = () => {
        setState(prev => ({
          ...prev,
          debouncedValue: prev.value,
          isDebouncing: false
        }));
      };

      return {
        handleDebounce,
        handleImmediate,
        handleCancel,
        handleFlush,
        isDebouncing: state.isDebouncing,
        debouncedValue: state.debouncedValue,
        lastCallTime: state.lastCallTime,
      };
    }
  })();

  return {
    debouncedValue: state.debouncedValue,
    isDebouncing: state.isDebouncing,
    ...uiHook,
  };
}
