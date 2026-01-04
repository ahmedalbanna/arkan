

'use server';

import { adminDb } from '@/lib/firebase/server-init';

export async function createGenerativeTemplate(templateType: 'docx' | 'pptx', id: string, data: any) {
  const collectionRef = adminDb.collection('templates').doc(templateType).collection('styles');
  const docRef = collectionRef.doc(id);
  const doc = await docRef.get();

  if (doc.exists) {
    throw new Error(`A ${templateType} template with this ID already exists.`);
  }

  await docRef.set({ ...data, id, createdAt: new Date().toISOString() });
  return { id, ...data };
}

// You can add more template-related server functions here in the future.
