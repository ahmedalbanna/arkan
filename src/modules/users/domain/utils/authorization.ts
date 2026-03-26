import { handleApiError } from '@/lib/utils/api-utils';
import type { UserProfile } from '@/modules/users/domain/entities/User';

/**
 * Authorization utility functions for API routes.
 */

/**
 * Checks if a user can access another user's data (either admin or self).
 * @param requester The user making the request
 * @param targetUserId The ID of the user being accessed
 * @returns Response if unauthorized, null if authorized
 */
export function checkUserAccessPermission(requester: UserProfile, targetUserId: string) {
    if (requester.role !== 'admin' && requester.id !== targetUserId) {
        return handleApiError({ message: "Forbidden: You can only access your own profile." }, 403);
    }
    return null;
}

/**
 * Checks if a user is an admin.
 * @param requester The user making the request
 * @returns Response if not admin, null if authorized
 */
export function checkAdminPermission(requester: UserProfile) {
    if (requester.role !== 'admin') {
        return handleApiError({ message: "Forbidden: Admin access required." }, 403);
    }
    return null;
}

/**
 * Checks if a user can update another user (admin or self with restrictions).
 * @param requester The user making the request
 * @param targetUserId The ID of the user being updated
 * @param allowSelfUpdate Whether to allow self-updates with restrictions
 * @returns Response if unauthorized, null if authorized
 */
export function checkUserUpdatePermission(
    requester: UserProfile,
    targetUserId: string,
    allowSelfUpdate: boolean = true
) {
    const isAdmin = requester.role === 'admin';
    const isSelf = requester.id === targetUserId;

    if (!isAdmin && (!allowSelfUpdate || !isSelf)) {
        return handleApiError(
            { message: "Forbidden: Users can only update their own profile." },
            403
        );
    }
    return null;
}
