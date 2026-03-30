
'use server';

import { z } from 'zod';
import { withAuth, handleApiError, handleAdminResult } from '@/infrastructure/api/api-utils';
import { container } from '@/infrastructure/di/container';
import { AdminController } from '@/modules/admin/adapters/controllers/AdminController';
import { paymentMethodSchema } from '@/modules/billing/domain/schemas';

const settingsSchema = z.object({
  newUserCredits: z.coerce.number().int().min(0),
  paymentMethods: z.array(paymentMethodSchema).optional(),
});


// GET /api/settings - This endpoint is public to allow fetching bank details
export async function GET() {
    try {
        const controller = container.resolve(AdminController);
        const result = await controller.getSettings();
        return handleAdminResult(result);
    } catch (error) {
        return handleApiError(error);
    }
}

// PUT /api/settings - This endpoint remains admin-only
export const PUT = withAuth(async ({ request }) => {
    try {
        const body = await request.json();
        const validation = settingsSchema.safeParse(body);
        if (!validation.success) {
            return handleApiError(validation.error);
        }

        const controller = container.resolve(AdminController);
        const result = await controller.updateSettings(validation.data);

        return handleAdminResult(result);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
