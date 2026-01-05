
'use server';

import { adminDb, adminAuth } from '@/lib/firebase/server-init';
import type { ProjectProperties } from '@/lib/models';
import { cookies } from 'next/headers';

async function requireUserId() {
  const sessionCookie = (await cookies()).get('__session')?.value;
  if (!sessionCookie) throw new Error('Unauthorized');
  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    if (!decoded?.uid) throw new Error('Unauthorized');
    return decoded.uid as string;
  } catch {
    throw new Error('Unauthorized');
  }
}

export async function listProjectsAction(): Promise<ProjectProperties[]> {
  const uid = await requireUserId();
  const snapshot = await adminDb
    .collection('projects')
    .where('meta.author', '==', uid)
    .orderBy('meta.updated', 'desc')
    .get();
  if (snapshot.empty) return [];
  return snapshot.docs.map((d) => d.data() as ProjectProperties);
}

export async function getProjectAction(projectId: string): Promise<ProjectProperties | null> {
  const uid = await requireUserId();
  const doc = await adminDb.collection('projects').doc(projectId).get();
  if (!doc.exists) return null;
  const data = doc.data() as ProjectProperties;
  if (data.meta?.author !== uid) throw new Error('Forbidden');
  return data;
}

export async function saveProjectAction(input: ProjectProperties): Promise<ProjectProperties> {
  const uid = await requireUserId();
  const collection = adminDb.collection('projects');
  const docRef = input.id ? collection.doc(input.id) : collection.doc();

  const dataToSave: ProjectProperties = {
    ...input,
    id: docRef.id,
    meta: {
      ...(input.meta || ({} as any)),
      author: uid,
      updated: new Date().toISOString(),
    },
  } as ProjectProperties;

  await docRef.set(dataToSave, { merge: true });
  return dataToSave;
}

export async function deleteProjectAction(projectId: string): Promise<{ message: string }> {
  const uid = await requireUserId();
  const ref = adminDb.collection('projects').doc(projectId);
  const doc = await ref.get();
  if (!doc.exists) throw new Error('Not found');
  const data = doc.data() as ProjectProperties;
  if (data.meta?.author !== uid) throw new Error('Forbidden');
  await ref.delete();
  return { message: 'Project deleted successfully.' };
}
