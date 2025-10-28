
'use server';

import { z } from 'zod';
import { adminDb } from '@/lib/firebase/server-init';
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';

// Schema for creating a new category
const createCategorySchema = z.object({
  id: z.string().min(3, "ID must be at least 3 characters").regex(/^[a-z0-9-]+$/, "ID must be lowercase, and can only contain letters, numbers, and hyphens."),
  name: z.string().min(1, "Name is required"),
});

// GET /api/admin/agent-categories
export const GET = withAuth(async () => {
    try {
        const snapshot = await adminDb.collection('agent_categories').orderBy('name').get();
        const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return createApiResponse(categories, 200);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });


// POST /api/admin/agent-categories
export const POST = withAuth(async ({ request }) => {
    try {
        const body = await request.json();
        const validation = createCategorySchema.safeParse(body);
        if (!validation.success) {
            return handleApiError(validation.error);
        }

        const { id, name } = validation.data;
        const categoryRef = adminDb.collection('agent_categories').doc(id);
        const doc = await categoryRef.get();

        if (doc.exists) {
            return handleApiError({ message: 'A category with this ID already exists.' }, 409);
        }

        const newCategory = { name };
        await categoryRef.set(newCategory);

        return createApiResponse({ id, ...newCategory }, 201);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
