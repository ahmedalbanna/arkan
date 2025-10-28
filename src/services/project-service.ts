
'use client';
import type { AnyProjectProposal, ProjectPlan, ExternalContext } from "@/ai/schemas";
import { app } from '@/lib/firebase/client-init';
import { getFirestore, collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import type { ProjectState, SavedProject } from "@/lib/models/project"; // Import from model
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';


// This represents the full state of a project that can be saved or loaded.
// It is a combination of states from various Zustand stores.
export type { ProjectState, SavedProject };


// Fetch all projects for the current user
export async function fetchProjectsApi(token: string): Promise<SavedProject[]> {
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
export async function fetchProjectApi(projectId: string, token: string): Promise<SavedProject> {
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

// Add a context file to a project
export async function addContextToProjectApi({ projectId, contextFile, token }: { projectId: string, contextFile: any, token: string }): Promise<{ message: string }> {
    if (!token) throw new Error("User not authenticated");
    const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(contextFile),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add context to project');
    }
    return await response.json();
}

/**
 * Uploads a file to a dedicated 'project_files' folder in Firebase Storage and returns the public URL.
 * @param {Object} variables - The variables for the upload.
 * @param {File} variables.file - The file to upload.
 * @param {string} variables.token - The user's authentication token.
 * @returns {Promise<{ publicUrl: string }>} - A promise that resolves to an object containing the public URL of the uploaded file.
 */
export async function uploadProjectFile(variables: { file: File; token: string }): Promise<{ publicUrl: string }> {
  const { file, token } = variables;
  if (!token) throw new Error("User not authenticated");

  const storage = getStorage(app);
  const fileId = uuidv4();
  const filePath = `project_files/${fileId}-${file.name}`;
  const storageRef = ref(storage, filePath);

  // Upload the file
  const snapshot = await uploadBytes(storageRef, file);

  // Get the download URL
  const publicUrl = await getDownloadURL(snapshot.ref);

  return { publicUrl };
}
