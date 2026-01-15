

'use server';

import { adminDb } from '@/lib/firebase/server-init';
import type { ProjectProperties } from '@/lib/models';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

/**
 * Saves a project to Firestore. If the project has an ID, it updates it.
 * Otherwise, it creates a new document.
 * @param projectData The project data to save.
 * @returns The saved project data with a confirmed ID and updated timestamp.
 */
export async function saveProject(projectData: ProjectProperties): Promise<ProjectProperties> {
  const collectionRef = adminDb.collection('projects');
  
  const projectId = projectData.id || collectionRef.doc().id;
  const docRef = collectionRef.doc(projectId);

  const dataToSave = {
    ...projectData,
    id: projectId, // Ensure ID is part of the data
    meta: {
      ...projectData.meta,
      updated: new Date().toISOString(), // Update timestamp
    }
  };

  await docRef.set(dataToSave, { merge: true });
  return dataToSave;
}

/**
 * Fetches all projects for a given user from Firestore.
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
 * Fetches a single project by its ID from Firestore.
 * Note: Does not check for user ownership. Do that in the API route.
 * @param projectId The ID of the project to fetch.
 * @returns The project properties or null if not found.
 */
export async function getProject(userId: string, projectId: string): Promise<ProjectProperties | null> {
    const docRef = adminDb.collection('projects').doc(projectId);
    const doc = await docRef.get();

    if (!doc.exists) return null;

    const data = doc.data() as ProjectProperties;

    // Security check: ensure the project belongs to the user
    if (data.meta?.author !== userId) {
        throw new Error("Forbidden: User does not have access to this project.");
    }

    return data;
}


/**
 * Deletes a project from Firestore.
 * Note: Does not check for user ownership. Do that in the API route.
 * @param projectId The ID of the project to delete.
 */
export async function deleteProject(userId: string, projectId: string): Promise<void> {
    const docRef = adminDb.collection('projects').doc(projectId);
    const doc = await docRef.get();

    if (!doc.exists) {
        throw new Error("Project not found.");
    }
    const data = doc.data() as ProjectProperties;
    if (data.meta?.author !== userId) {
        throw new Error("Forbidden: User does not have access to delete this project.");
    }

    await docRef.delete();
}

/**
 * Updates the content of a specific section within a project in Firestore.
 * @param userId The ID of the user who owns the project.
 * @param projectId The ID of the project.
 * @param sectionId The ID of the section to update.
 * @param newContent The new markdown content for the section.
 * @returns A promise that resolves when the update is complete.
 */
export async function updateProjectSectionContent(userId: string, projectId: string, sectionId: string, newContent: string): Promise<void> {
  const projectRef = adminDb.collection('projects').doc(projectId);

  await adminDb.runTransaction(async (transaction) => {
    const projectDoc = await transaction.get(projectRef);
    if (!projectDoc.exists) {
      throw new Error(`Project with ID ${projectId} not found.`);
    }

    const projectData = projectDoc.data() as ProjectProperties;

    // Security check
    if (projectData.meta?.author !== userId) {
        throw new Error("Forbidden: User does not have access to modify this project.");
    }

    let sectionFound = false;
    const updatedContent = projectData.content?.map(item => {
        if ('sections' in item) { // It's a Chapter
            const updatedSections = item.sections.map(sec => {
                if (sec.id === sectionId) {
                    sectionFound = true;
                    return { ...sec, content: newContent };
                }
                return sec;
            });
            return { ...item, sections: updatedSections };
        } else if (item.id === sectionId) { // It's a top-level Section
            sectionFound = true;
            return { ...item, content: newContent };
        }
        return item;
    });

    if (!sectionFound) {
      throw new Error(`Section with ID ${sectionId} not found in project ${projectId}.`);
    }

    transaction.update(projectRef, {
      content: updatedContent,
      'meta.updated': new Date().toISOString(),
    });
  });
}
