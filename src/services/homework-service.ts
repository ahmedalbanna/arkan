
'use client';

import type { AnalyzedHomework, SolvedHomework } from "@/ai/flows/homework-solver.shared";

// This interface must match what the API returns for a history entry
export interface HomeworkHistoryEntry {
  id: string;
  userId: string;
  analyzedHomework: AnalyzedHomework | null;
  solvedHomework: SolvedHomework | null;
  homeworkFiles: { name: string; type: string; url: string }[];
  curriculumFiles: { name: string; type: string; url: string }[];
  createdAt: string;
}


/**
 * Fetches all homework history entries for the authenticated user.
 * @param token The user's auth token.
 * @returns A promise that resolves to an array of history entries.
 */
export async function fetchHomeworkHistory(token: string): Promise<HomeworkHistoryEntry[]> {
    if (!token) throw new Error("User not authenticated");
    const response = await fetch('/api/homework-solver/history', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        if (response.status === 404) return []; // If history doesn't exist yet, return empty array
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch homework history');
    }
    return response.json();
}

/**
 * Saves a new homework session to the user's history.
 * @param variables An object containing the FormData and the user's auth token.
 * @returns A promise that resolves when the save is complete.
 */
export async function saveHomeworkHistory(variables: { formData: FormData, token: string }): Promise<any> {
    const { formData, token } = variables;
    if (!token) throw new Error("User not authenticated");

    const response = await fetch('/api/homework-solver/history', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData,
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save homework session');
    }
    return response.json();
}

/**
 * Clears all homework history for the authenticated user.
 * @param variables An object containing the user's auth token.
 * @returns A promise that resolves when the history is cleared.
 */
export async function clearHomeworkHistory(variables: { token: string }): Promise<any> {
    if (!variables.token) throw new Error("User not authenticated");

    const response = await fetch('/api/homework-solver/history', {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${variables.token}`
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to clear history');
    }
    return response.json();
}
