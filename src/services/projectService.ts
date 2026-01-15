

'use server';

import { adminDb, adminRealtimeDb } from '@/lib/firebase/server-init';
import type { ProjectProperties } from '@/lib/models';

/**
 * Saves a project to RTDB. If the project has an ID, it updates it.
 * Otherwise, it creates a new entry.
 * @param projectData The project data to save.
 * @returns The saved project data with a confirmed ID and updated timestamp.
 */
export async function saveProject(projectData: ProjectProperties): Promise<ProjectProperties> {
  const db = adminRealtimeDb;
  const userId = projectData.meta?.author;
  if (!userId) {
    throw new Error("Author ID is required to save a project.");
  }
  
  const projectId = projectData.id || db.ref(`projects/${userId}`).push().key;
  if (!projectId) {
    throw new Error("Failed to generate a project ID.");
  }

  const docRef = db.ref(`projects/${userId}/${projectId}`);
  
  const dataToSave = {
    ...projectData,
    id: projectId,
    meta: {
      ...projectData.meta,
      updated: new Date().toISOString(),
    }
  };

  await docRef.set(dataToSave);
  return dataToSave;
}

/**
 * Fetches all projects for a given user from RTDB.
 * @param userId The ID of the user whose projects to fetch.
 * @returns An array of project properties.
 */
export async function getProjects(userId: string): Promise<ProjectProperties[]> {
  const db = adminRealtimeDb;
  const projectsRef = db.ref(`projects/${userId}`);
  const snapshot = await projectsRef.orderByChild('meta/updated').get();
  
  if (!snapshot.exists()) {
    return [];
  }

  const projects: ProjectProperties[] = [];
  snapshot.forEach(childSnapshot => {
    projects.push(childSnapshot.val() as ProjectProperties);
  });
  
  // Firebase RTDB returns items in ascending order, so we reverse for descending
  return projects.reverse();
}

/**
 * Fetches a single project by its ID from RTDB.
 * @param projectId The ID of the project to fetch.
 * @returns The project properties or null if not found.
 */
export async function getProject(userId: string, projectId: string): Promise<ProjectProperties | null> {
  const db = adminRealtimeDb;
  const projectRef = db.ref(`projects/${userId}/${projectId}`);
  const snapshot = await projectRef.get();
  
  if (!snapshot.exists()) {
    return null;
  }
  return snapshot.val() as ProjectProperties;
}

/**
 * Deletes a project from RTDB.
 * @param projectId The ID of the project to delete.
 */
export async function deleteProject(userId: string, projectId: string): Promise<void> {
  const db = adminRealtimeDb;
  const projectRef = db.ref(`projects/${userId}/${projectId}`);
  await projectRef.remove();
}

/**
 * Updates the content of a specific section within a project in RTDB.
 * @param userId The ID of the user who owns the project.
 * @param projectId The ID of the project.
 * @param sectionId The ID of the section to update.
 * @param newContent The new markdown content for the section.
 * @returns A promise that resolves when the update is complete.
 */
export async function updateProjectSectionContent(userId: string, projectId: string, sectionId: string, newContent: string): Promise<void> {
    const db = adminRealtimeDb;
    const projectRef = db.ref(`projects/${userId}/${projectId}`);
    const projectSnapshot = await projectRef.get();

    if (!projectSnapshot.exists()) {
        throw new Error(`Project with ID ${projectId} not found.`);
    }

    const projectData = projectSnapshot.val();
    let sectionPath: string | null = null;

    // Find the path to the section
    projectData.content?.forEach((chapter: any, chapterIndex: number) => {
        chapter.sections?.forEach((section: any, sectionIndex: number) => {
            if (section.id === sectionId) {
                sectionPath = `content/${chapterIndex}/sections/${sectionIndex}/content`;
            }
        });
    });

    if (!sectionPath) {
        // Handle top-level sections if necessary
        projectData.content?.forEach((item: any, index: number) => {
            if (item.id === sectionId) {
                sectionPath = `content/${index}/content`;
            }
        });
    }

    if (!sectionPath) {
        throw new Error(`Section with ID ${sectionId} not found in project ${projectId}.`);
    }

    // Update the specific section's content and the project's updated timestamp
    const updates: { [key: string]: any } = {};
    updates[sectionPath] = newContent;
    updates['meta/updated'] = new Date().toISOString();

    await projectRef.update(updates);
}

