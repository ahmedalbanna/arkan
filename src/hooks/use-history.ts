// code explantion in docs/hooks/use-history.md

"use client";

import type { AnyProjectProposal } from "@/ai/schemas";
import type { ProjectState } from '@/lib/types'; // For ProjectState
import { useCallback, useEffect, useState } from "react";


export interface HistoryEntry {
  id: string;
  createdAt: string;
  type: 'proposal' | 'diagram' | 'section' | 'project' | 'presentation'; // Added 'project' and 'presentation'
  title: string; // e.g., "Project Proposal" or "Use Case Diagram"
  data: ProjectState | any; // More specific types
  projectIdea?: string;
  proposal?: AnyProjectProposal | null; // The proposal at the time of generation
}

const HISTORY_KEY = "arkan-generation-history";

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load history from localStorage", error);
      setHistory([]);
    }
    setIsLoaded(true);
  }, []);

  const addHistoryEntry = useCallback((entry: Omit<HistoryEntry, 'id' | 'createdAt'>) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    setHistory((prevHistory) => {
      const updatedHistory = [newEntry, ...prevHistory];
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
      } catch (error) {
        console.error("Failed to save history to localStorage", error);
      }
      return updatedHistory;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (error) {
      console.error("Failed to clear history from localStorage", error);
    }
  }, []);

  return { history, addHistoryEntry, isLoaded, clearHistory };
}
