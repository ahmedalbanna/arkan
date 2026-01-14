/**
 * Undo/Redo Hook
 * Provides undo/redo functionality for state management
 */

'use client';

import { useState, useCallback, useRef } from 'react';

interface UseUndoRedoOptions<T> {
  maxHistory?: number;
  onUndo?: (state: T) => void;
  onRedo?: (state: T) => void;
}

export function useUndoRedo<T>(
  initialState: T,
  options: UseUndoRedoOptions<T> = {}
) {
  const { maxHistory = 50, onUndo, onRedo } = options;

  const [state, setState] = useState<T>(initialState);
  const [history, setHistory] = useState<T[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isUndoRedoAction = useRef(false);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  // Set state and update history
  const set = useCallback(
    (newState: T | ((prev: T) => T)) => {
      // Don't add to history if this is an undo/redo action
      if (isUndoRedoAction.current) {
        isUndoRedoAction.current = false;
        return;
      }

      setState((prevState) => {
        const nextState =
          typeof newState === 'function'
            ? (newState as (prev: T) => T)(prevState)
            : newState;

        // Add to history
        setHistory((prevHistory) => {
          // Remove any "future" history when making a new change
          const newHistory = prevHistory.slice(0, currentIndex + 1);
          newHistory.push(nextState);

          // Limit history size
          if (newHistory.length > maxHistory) {
            newHistory.shift();
            setCurrentIndex((prev) => prev - 1);
          }

          return newHistory;
        });

        setCurrentIndex((prev) => Math.min(prev + 1, maxHistory - 1));

        return nextState;
      });
    },
    [currentIndex, maxHistory]
  );

  // Undo to previous state
  const undo = useCallback(() => {
    if (!canUndo) return;

    isUndoRedoAction.current = true;
    const prevIndex = currentIndex - 1;
    const prevState = history[prevIndex];

    setCurrentIndex(prevIndex);
    setState(prevState);
    onUndo?.(prevState);
  }, [canUndo, currentIndex, history, onUndo]);

  // Redo to next state
  const redo = useCallback(() => {
    if (!canRedo) return;

    isUndoRedoAction.current = true;
    const nextIndex = currentIndex + 1;
    const nextState = history[nextIndex];

    setCurrentIndex(nextIndex);
    setState(nextState);
    onRedo?.(nextState);
  }, [canRedo, currentIndex, history, onRedo]);

  // Reset history
  const reset = useCallback((newState?: T) => {
    const resetState = newState ?? initialState;
    setState(resetState);
    setHistory([resetState]);
    setCurrentIndex(0);
  }, [initialState]);

  // Clear future history
  const clearRedo = useCallback(() => {
    setHistory((prevHistory) => prevHistory.slice(0, currentIndex + 1));
  }, [currentIndex]);

  return {
    state,
    setState: set,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
    clearRedo,
    history,
    currentIndex,
    historyLength: history.length,
  };
}
