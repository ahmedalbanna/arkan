
'use server';

import {
  getProjectHelper,
  listProjectsByAuthorHelper,
  saveProjectHelper,
  deleteProjectHelper,
} from '@/lib/firebase/db-helpers';
import type { ProjectProperties } from '@/lib/models';

/**
 * Saves a project to Firestore. If the project has an ID, it updates it.
 * Otherwise, it creates a new document.
 * @param projectData The project data to save.
 * @returns The saved project data with a confirmed ID and updated timestamp.
 */
export async function saveProject(projectData: ProjectProperties): Promise<ProjectProperties> {
  return saveProjectHelper(projectData);
}

/**
 * Fetches all projects for a given user.
 * @param userId The ID of the user whose projects to fetch.
 * @returns An array of project properties.
 */
export async function getProjects(userId: string): Promise<ProjectProperties[]> {
  return listProjectsByAuthorHelper(userId);
}

/**
 * Fetches a single project by its ID.
 * @param projectId The ID of the project to fetch.
 * @returns The project properties or null if not found.
 */
export async function getProject(projectId: string): Promise<ProjectProperties | null> {
  return getProjectHelper(projectId);
}

/**
 * Deletes a project from Firestore.
 * @param projectId The ID of the project to delete.
 */
export async function deleteProject(projectId: string): Promise<void> {
  return deleteProjectHelper(projectId);
}
