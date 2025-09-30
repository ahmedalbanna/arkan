
'use server';

import { adminDb } from '@/lib/firebase/server-init';
import { z } from 'zod';

// Schema for creating a new category
const createCategorySchema = z.object({
    id: z.string().min(3, "ID must be at least 3 characters").regex(/^[a-z0-9-]+$/, "ID must be lowercase, and can only contain letters, numbers, and hyphens."),
    name: z.string().min(1, "Name is required"),
});

// GET /api/admin/agent-categories
export const GET = withEnhancedAuth(async () => {
    try {
        const snapshot = await adminDb.collection('agent_categories').orderBy('name').get();
        const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return createApiResponseEnhanced(categories, 200);
    } catch (error) {
        return handleApiErrorEnhanced(error);
    }
}, { requireAdmin: true });


// POST /api/admin/agent-categories
export const POST = withEnhancedAuth(async ({ request }) => {
    try {
        const body = await request.json();
        const validation = createCategorySchema.safeParse(body);
        if (!validation.success) {
            return handleApiErrorEnhanced(validation.error);
        }

        const { id, name } = validation.data;
        const categoryRef = adminDb.collection('agent_categories').doc(id);
        const doc = await categoryRef.get();

        if (doc.exists) {
            return handleApiErrorEnhanced({ message: 'A category with this ID already exists.' }, 409);
        }

        const newCategory = { name };
        await categoryRef.set(newCategory);

        return createApiResponseEnhanced({ id, ...newCategory }, 201);
    } catch (error) {
        return handleApiErrorEnhanced(error);
    }
}, { requireAdmin: true });
