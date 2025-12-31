
'use client';
import type { ProjectProperties, ExternalContextProperties } from "@/lib/models";
import { localProjectService } from "../local-project-service";

/**
 * Adds a context file to a project in the local database.
 * This is a client-side only operation.
 * @param projectId The ID of the project to update.
 * @param contextFile The context file to add.
 * @returns The updated project properties.
 */
export async function addContextToProjectApi(variables: { projectId: string; contextFile: ExternalContextProperties, token?: string }): Promise<ProjectProperties> {
    const { projectId, contextFile } = variables;
    const project = await localProjectService.getProject(projectId);
    if (!project) {
        throw new Error('Project not found locally.');
    }
    const updatedContext = [...(project.externalContext || []), contextFile];
    const updatedProject = { ...project, externalContext: updatedContext };
    return localProjectService.saveProject(updatedProject);
}

export type { ProjectProperties };

    