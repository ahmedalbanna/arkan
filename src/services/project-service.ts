'use client';

import type { SavedProject, ProjectState } from "@/lib/types";

// Fetch all projects for the current user
export async function fetchProjects(token: string): Promise<SavedProject[]> {
    if (!token) throw new Error("User not authenticated");
    const response = await fetch('/api/projects', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
        throw new Error('Failed to fetch projects');
    }
    return response.json();
}

// Create a new project
export async function createProject(data: ProjectState, token: string): Promise<SavedProject> {
    if (!token) throw new Error("User not authenticated");
    const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Failed to save project');
    }
    return response.json();
}

// Update an existing project
export async function updateProject(projectId: string, data: ProjectState, token: string): Promise<SavedProject> {
    if (!token) throw new Error("User not authenticated");
    const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Failed to update project');
    }
    return response.json();
}

// Delete a project
export async function deleteProject(projectId: string, token: string): Promise<{ message: string }> {
    if (!token) throw new Error("User not authenticated");
    const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
        throw new Error('Failed to delete project');
    }
    return response.json();
}