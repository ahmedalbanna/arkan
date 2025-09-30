
import { deleteUser, getUserProfile } from "@/lib/db/queries";
import { adminDb } from '@/lib/firebase/server-init';
import { revalidatePath } from "next/cache";
import { z } from "zod";


// GET a single user profile.
// This route is now protected by the verifyAccess logic within withEnhancedAuth,
// but for simplicity, we'll keep the direct GET like this.
// A more robust implementation might move the ownership check into withEnhancedAuth itself.
export const GET = withEnhancedAuth(async ({ params, user: requester, token }) => {
    try {
        const targetUserId = params.id;

        // Authorization check: either admin or self
        if (requester.role !== 'admin' && requester.id !== targetUserId) {
            return handleApiErrorEnhanced({ message: "Forbidden" }, 403);
        }

        const user = await getUserProfile(targetUserId);
        if (!user) {
            return handleApiErrorEnhanced({ message: "User not found." }, 404);
        }
        return createApiResponseEnhanced(user, 200);
    } catch (error) {
        return handleApiErrorEnhanced(error);
    }
});


const updateUserSchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    email: z.string().email('Invalid email address').optional(),
    bio: z.string().optional(),
    credits: z.coerce.number().int().min(0).optional(),
    role: z.enum(['user', 'admin']).optional(),
    hasCompletedOnboarding: z.boolean().optional(),
});

// PUT (update) a user profile
export const PUT = withEnhancedAuth(async ({ request, params, user: requester }) => {
    try {
        const userId = params.id;
        const body = await request.json();

        // An admin can update any field. A regular user can only update their own name/bio.
        if (requester.role !== 'admin') {
            if (userId !== requester.id) {
                return handleApiErrorEnhanced({ message: "Forbidden" }, 403);
            }
            // If not admin, only allow name and bio updates
            const { name, bio, hasCompletedOnboarding } = body;
            const validation = updateUserSchema.safeParse({ name, bio, hasCompletedOnboarding });
            if (!validation.success) {
                return handleApiErrorEnhanced(validation.error);
            }
            const updateData = { ...validation.data, updatedAt: new Date().toISOString() };
            await adminDb.collection("users").doc(userId).update(updateData);
        } else {
            const validation = updateUserSchema.safeParse(body);
            if (!validation.success) {
                return handleApiErrorEnhanced(validation.error);
            }
            const updateData = { ...validation.data, updatedAt: new Date().toISOString() };
            await adminDb.collection("users").doc(userId).update(updateData);
        }


        revalidatePath(`/profile/${userId}`);
        revalidatePath('/admin/manage-users');

        const updatedUser = await getUserProfile(userId);
        return createApiResponseEnhanced(updatedUser, 200);
    } catch (error) {
        return handleApiErrorEnhanced(error);
    }
});


export const DELETE = withEnhancedAuth(async ({ params }) => {
    try {
        const targetUserId = params.id;
        if (!targetUserId) {
            return handleApiErrorEnhanced({ message: "User ID is required" }, 400);
        }
        await deleteUser(targetUserId);
        revalidatePath("/admin/manage-users");
        return createApiResponseEnhanced({ message: `User ${targetUserId} deleted successfully` }, 200);
    } catch (error) {
        return handleApiErrorEnhanced(error);
    }
}, { requireAdmin: true });
