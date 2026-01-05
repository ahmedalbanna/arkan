'use server';

import { z } from 'zod';
import { adminDb } from '@/lib/firebase/server-init';
import { requireAdmin } from './_utils/auth';
import type { SectionProperties } from '@/lib/models';

const SectionSchema = z.object({
  id: z.string().min(3),
  title: z.string().min(1),
  type: z.enum(['report','diagram','presentation']),
  prompt: z.string().optional(),
  guidelines: z.array(z.string()).optional(),
  model: z.string().optional(),
});

const SectionUpdateSchema = SectionSchema.partial().extend({ id: z.never().optional() });

export async function listSectionsAction(): Promise<SectionProperties[]> {
  await requireAdmin();
  const snapshot = await adminDb.collection('sections').orderBy('title').get();
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SectionProperties));
}

export async function createSectionAction(data: z.infer<typeof SectionSchema>): Promise<SectionProperties> {
  await requireAdmin();
  const parsed = SectionSchema.parse(data);
  const { id, ...rest } = parsed;
  const docRef = adminDb.collection('sections').doc(id);
  await docRef.set(rest);
  return { id, ...rest } as SectionProperties;
}

export async function updateSectionAction(sectionId: string, data: z.infer<typeof SectionUpdateSchema>): Promise<SectionProperties> {
  await requireAdmin();
  const parsed = SectionUpdateSchema.parse(data);
  const ref = adminDb.collection('sections').doc(sectionId);
  await ref.update(parsed);
  const updated = await ref.get();
  return { id: updated.id, ...(updated.data() as any) } as SectionProperties;
}

export async function deleteSectionAction(sectionId: string): Promise<{ message: string }> {
  await requireAdmin();
  await adminDb.collection('sections').doc(sectionId).delete();
  return { message: 'Section deleted successfully' };
}
