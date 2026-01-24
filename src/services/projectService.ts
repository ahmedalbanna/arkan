
'use server';

import { adminDb } from '@/lib/firebase/server-init';
import type { ProjectProperties } from '@/lib/models';

/**
 * Saves a project to Firestore. If the project has an ID, it updates it.
 * Otherwise, it creates a new document.
 * @param projectData The project data to save.
 * @returns The saved project data with a confirmed ID and updated timestamp.
 */
export async function saveProject(projectData: ProjectProperties): Promise<ProjectProperties> {
  const collection = adminDb.collection('projects');
  const docRef = projectData.id ? collection.doc(projectData.id) : collection.doc();

  const dataToSave = {
    ...projectData,
    id: docRef.id,
    meta: {
      ...projectData.meta,
      updated: new Date().toISOString(),
    }
  };

  await docRef.set(dataToSave, { merge: true });
  return dataToSave;
}

/**
 * Fetches all projects for a given user.
 * @param userId The ID of the user whose projects to fetch.
 * @returns An array of project properties.
 */
export async function getProjects(userId: string): Promise<ProjectProperties[]> {
  const snapshot = await adminDb.collection('projects')
    .where('meta.author', '==', userId)
    .orderBy('meta.updated', 'desc')
    .get();

  if (snapshot.empty) {
    return [];
  }

  return snapshot.docs.map(doc => doc.data() as ProjectProperties);
}

/**
 * Fetches a single project by its ID.
 * @param projectId The ID of the project to fetch.
 * @returns The project properties or null if not found.
 */
export async function getProject(projectId: string): Promise<ProjectProperties | null> {
  const doc = await adminDb.collection('projects').doc(projectId).get();
  if (!doc.exists) {
    return null;
  }
  return doc.data() as ProjectProperties;
}

/**
 * Deletes a project from Firestore.
 * @param projectId The ID of the project to delete.
 */
export async function deleteProject(projectId: string): Promise<void> {
  await adminDb.collection('projects').doc(projectId).delete();
}
