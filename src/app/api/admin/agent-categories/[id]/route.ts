
'use server';

import { z } from 'zod';
import { adminDb } from '@/lib/firebase/server-init';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

const updateCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
});

// PUT /api/admin/agent-categories/[id]
export const PUT = withAuth(async ({ request, params }) => {
    try {
        const id = params.id;
        const body = await request.json();
        const validation = updateCategorySchema.safeParse(body);
        if (!validation.success) {
            return handleApiError(validation.error);
        }

        const categoryRef = adminDb.collection('agent_categories').doc(id);
        const doc = await categoryRef.get();

        if (!doc.exists) {
            return handleApiError({ message: 'Category not found.' }, 404);
        }

        await categoryRef.update({ name: validation.data.name });
        
        const updatedDoc = await categoryRef.get();

        return createApiResponse({ id: updatedDoc.id, ...updatedDoc.data() }, 200);

    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });


// DELETE /api/admin/agent-categories/[id]
export const DELETE = withAuth(async ({ params }) => {
    try {
        const id = params.id;
        const categoryRef = adminDb.collection('agent_categories').doc(id);
        const doc = await categoryRef.get();

        if (!doc.exists) {
            return handleApiError({ message: 'Category not found.' }, 404);
        }

        await categoryRef.delete();
        return createApiResponse({ message: `Category '${id}' deleted successfully.` }, 200);

    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
