
'use client';

import { Project, type ProjectProperties } from "@/lib/models/project";
import { authenticatedFetch } from "@/lib/api-client";
import { ProjectStateSchema } from "@/ai/schemas/state"; // Import the schema for validation

// Re-exporting for clarity. SavedProject is likely the raw properties.
export type { ProjectProperties as SavedProject };

/**
 * Sanitizes project data before sending it to the API to ensure it conforms to the backend schema.
 * This prevents validation errors for fields that might be null in the frontend state
 * but are expected as objects or are structured differently in the backend.
 */
function sanitizeProjectData(data: Partial<ProjectProperties>): Partial<ProjectProperties> {
    // Create a deep copy to avoid mutating the original state object.
    const sanitizedData = JSON.parse(JSON.stringify(data));

    // 1. Sanitize `codeGenerator`
    // The backend expects an object, but the frontend state can be null.
    if (sanitizedData.codeGenerator === null) {
        delete sanitizedData.codeGenerator;
    }

    // 2. Sanitize `diagrams`
    // The backend expects a record, but the frontend might have an empty object or invalid structure.
    // If it's an empty object, it's safer to remove it and let the backend handle the default.
    if (sanitizedData.diagrams && Object.keys(sanitizedData.diagrams).length === 0) {
        delete sanitizedData.diagrams;
    }
    
    // 3. Sanitize `academicSolver`
    // Ensure it is not null if it is expected to be an object
    if (sanitizedData.academicSolver === null) {
        delete sanitizedData.academicSolver;
    }

    // 4. Sanitize `proposal`
    // If the proposal is null, it should be stripped.
    if (sanitizedData.proposal === null) {
        delete sanitizedData.proposal;
    }
    
    return sanitizedData;
}

/**
 * Fetches all projects for the current user and returns them as Project instances.
 */
export async function fetchProjectsApi(): Promise<Project[]> {
    const projectsData = await authenticatedFetch<ProjectProperties[]>('/api/projects');
    if (!Array.isArray(projectsData)) {
        console.error("fetchProjectsApi did not return an array:", projectsData);
        return [];
    }
    return projectsData.map(data => new Project(data));
}

/**
 * Fetches a single project by its ID and returns it as a Project instance.
 */
export async function fetchProjectApi(projectId: string): Promise<Project> {
    const projectData = await authenticatedFetch<ProjectProperties>(`/api/projects/${projectId}`);
    return new Project(projectData);
}

/**
 * Creates a new project and returns it as a Project instance.
 * It sanitizes the data before sending it to the API.
 */
export async function createProjectApi(data: Partial<ProjectProperties>): Promise<Project> {
    const sanitizedData = sanitizeProjectData(data);
    const newProjectData = await authenticatedFetch<ProjectProperties>('/api/projects', {
        method: 'POST',
        body: JSON.stringify(sanitizedData),
    });
    return new Project(newProjectData);
}

/**
 * Updates an existing project and returns it as a Project instance.
 * The data passed can be a partial object. It sanitizes the data before sending.
 */
export async function updateProjectApi(projectId: string, data: Partial<ProjectProperties>): Promise<Project> {
    const sanitizedData = sanitizeProjectData(data);
    const updatedProjectData = await authenticatedFetch<ProjectProperties>(`/api/projects/${projectId}`, {
        method: 'PUT',
        body: JSON.stringify(sanitizedData),
    });
    return new Project(updatedProjectData);
}

/**
 * Deletes a project.
 */
export async function deleteProjectApi(projectId: string): Promise<{ message: string }> {
    return authenticatedFetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
    });
}

/**
 * Adds a context file to a project.
 */
export async function addContextToProjectApi({ projectId, contextFile }: { projectId: string, contextFile: any }): Promise<{ message: string }> {
    return authenticatedFetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        body: JSON.stringify(contextFile),
    });
}
