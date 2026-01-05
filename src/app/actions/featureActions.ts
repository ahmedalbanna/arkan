'use server';

import { adminDb } from '@/lib/firebase/server-init';
import { defaultFeatures } from '@/lib/db/seed-data/features';
import { z } from 'zod';
import { requireAdmin } from './_utils/auth';
import type { Feature } from '@/lib/types';

export async function fetchFeaturesAction(): Promise<Feature[]> {
  const featuresCollection = adminDb.collection('features');
  let snapshot = await featuresCollection.get();
  if (snapshot.empty) {
    const batch = adminDb.batch();
    defaultFeatures.forEach(f => batch.set(featuresCollection.doc(f.id), f));
    await batch.commit();
    snapshot = await featuresCollection.get();
  }
  return snapshot.docs.map(doc => doc.data() as Feature);
}

const UpdateFeatureSchema = z.object({ isEnabled: z.boolean() });
export async function updateFeatureAction(featureId: string, payload: { isEnabled: boolean }): Promise<Feature> {
  await requireAdmin();
  const { isEnabled } = UpdateFeatureSchema.parse(payload);
  const ref = adminDb.collection('features').doc(featureId);
  const doc = await ref.get();
  if (!doc.exists) throw new Error('Feature not found.');
  await ref.update({ isEnabled });
  const updated = await ref.get();
  return { id: updated.id, ...(updated.data() as any) } as Feature;
}
