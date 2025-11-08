
'use client';
import { app } from '@/lib/firebase/client-init';
import type { ProjectProperties } from "@/lib/models/project";
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

export type { ProjectProperties };


// This service is now only used for uploading project-related files (like images in the editor),
// not for managing the project data itself.

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
