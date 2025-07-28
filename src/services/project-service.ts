
'use client';
import type { AnyProjectProposal } from "@/ai/schemas";

// This represents the full state of a project that can be saved or loaded.
// It is a combination of states from various Zustand stores.
export interface ProjectState {
    agents: any;
    projectPlan: any;
    name?: string;
    projectIdea?: string;
    proposal: AnyProjectProposal | null;
    sections?: Record<string, string>;
    diagrams?: Record<string, { plantUmlCode: string; imageUrl: string; }>;
    presentation?: any; // Define a more specific type if needed
    externalContext?: any[]; // Define a more specific type if needed
    teamId?: string;
    codeGenerator?: any;
    academicSolver?: any;
    codebase?: any;

}

// Represents a project document saved in Firestore
export interface SavedProject extends ProjectState {
    id: string;
    userId: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    proposal: AnyProjectProposal | null;
}


// Fetch all projects for the current user
export async function fetchProjects(token: string): Promise<SavedProject[]> {
    if (!token) throw new Error("User not authenticated");
    const response = await fetch('/api/projects', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
        throw new Error('Failed to fetch projects');
    }
    return await response.json();
}

// Fetch a single project by its ID
export async function fetchProject(projectId: string, token: string): Promise<SavedProject> {
    if (!token) throw new Error("User not authenticated");
    const response = await fetch(`/api/projects/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
        if(response.status === 404) throw new Error("Project not found.");
        throw new Error('Failed to fetch project');
    }
    return await response.json();
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
    return await response.json();
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
    return await response.json();
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
    return await response.json();
}
