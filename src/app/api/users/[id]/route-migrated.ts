/**
 * User Profile Route - Migrated to New System
 *
 * هذا الملف يحتوي على route ملف المستخدم المهاجر
 * مع استخدام النظام الجديد المحسن
 */

import { handleApiErrorEnhanced, withEnhancedAuth } from '@/lib/core/api';
import { Analytics, PerformanceMonitor } from '@/lib/core/performance';
import { deleteUser, getUserProfile } from "@/lib/db/queries";
import { adminDb } from '@/lib/firebase/server-init';
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Enhanced validation schemas
const adminUpdateUserSchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    email: z.string().email('Invalid email address').optional(),
    bio: z.string().optional(),
    credits: z.coerce.number().int().min(0).optional(),
    role: z.enum(['user', 'admin']).optional(),
    hasCompletedOnboarding: z.boolean().optional(),
});

const userUpdateSchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    bio: z.string().optional(),
    hasCompletedOnboarding: z.boolean().optional(),
});

/**
 * Get user profile with enhanced authorization
 */
export const GET = withEnhancedAuth(async ({ params, user: requester, startTime }) => {
    try {
        const { id: targetUserId } = await params;

        // Enhanced authorization check
        if (requester.role !== 'admin' && requester.id !== targetUserId) {
            return handleApiErrorEnhanced(
                new Error("Forbidden: You can only access your own profile"),
                'user_profile_access_denied',
                {
                    requesterId: requester.id,
                    targetUserId,
                    requesterRole: requester.role
                }
            );
        }

        const user = await getUserProfile(targetUserId);
        if (!user) {
            return handleApiErrorEnhanced(
                new Error("User not found"),
                'user_profile_not_found',
                { targetUserId },
                { status: 404 }
            );
        }

        // Track performance
        PerformanceMonitor.recordEvent({
            type: 'api_call',
            name: 'user_profile_retrieved',
            value: performance.now() - startTime,
            unit: 'ms',
            metadata: {
                endpoint: 'users/[id]',
                targetUserId,
                requesterId: requester.id,
                success: true
            }
        });

        // Track analytics
        Analytics.trackApiCall(
            `/api/users/${targetUserId}`,
            'GET',
            performance.now() - startTime,
            true,
            200
        );

        return createApiResponseEnhanced(
            user,
            200,
            {
                processingTime: performance.now() - startTime,
                endpoint: 'users/[id]',
                targetUserId,
                requesterId: requester.id
            }
        );

    } catch (error: any) {
        return handleApiErrorEnhanced(error, 'user_profile_retrieval');
    }
}, {
    performanceTracking: true,
    analytics: true,
    rateLimit: {
        maxRequests: 100, // Allow frequent profile checks
        windowMs: 60000
    }
});

/**
 * Update user profile with enhanced validation and authorization
 */
export const PUT = withEnhancedAuth(async ({ request, params, user: requester, startTime }) => {
    try {
        const { id: userId } = await params;
        const body = await request.json();

        // Enhanced authorization check
        if (requester.role !== 'admin' && userId !== requester.id) {
            return handleApiErrorEnhanced(
                new Error("Forbidden: Users can only update their own profile"),
                'user_profile_update_denied',
                {
                    requesterId: requester.id,
                    targetUserId: userId,
                    requesterRole: requester.role
                }
            );
        }

        let validation;
        let updateType;

        // Determine validation schema based on user role
        if (requester.role !== 'admin') {
            validation = userUpdateSchema.safeParse(body);
            updateType = 'self';
        } else {
            validation = adminUpdateUserSchema.safeParse(body);
            updateType = 'admin';
        }

        if (!validation.success) {
            return handleApiErrorEnhanced(
                new Error(`Validation failed: ${validation.error.message}`),
                'user_profile_validation_failed',
                {
                    validationErrors: validation.error.flatten().fieldErrors,
                    updateType
                }
            );
        }

        // Prepare update data
        const updateData = {
            ...validation.data,
            updatedAt: new Date().toISOString()
        };

        // Update user profile
        await adminDb.collection("users").doc(userId).update(updateData);

        // Revalidate relevant paths
        revalidatePath(`/profile/${userId}`);
        revalidatePath('/admin/manage-users');

        // Get updated user profile
        const updatedUser = await getUserProfile(userId);

        // Track performance
        PerformanceMonitor.recordEvent({
            type: 'api_call',
            name: 'user_profile_updated',
            value: performance.now() - startTime,
            unit: 'ms',
            metadata: {
                endpoint: 'users/[id]',
                userId,
                requesterId: requester.id,
                updateType,
                updatedFields: Object.keys(updateData),
                success: true
            }
        });

        // Track analytics
        Analytics.trackApiCall(
            `/api/users/${userId}`,
            'PUT',
            performance.now() - startTime,
            true,
            200
        );

        return createApiResponseEnhanced(
            updatedUser,
            200,
            {
                processingTime: performance.now() - startTime,
                endpoint: 'users/[id]',
                userId,
                requesterId: requester.id,
                updateType,
                updatedFields: Object.keys(updateData)
            }
        );

    } catch (error: any) {
        return handleApiErrorEnhanced(error, 'user_profile_update');
    }
}, {
    performanceTracking: true,
    analytics: true,
    rateLimit: {
        maxRequests: 20, // Limit profile updates
        windowMs: 60000
    }
});

/**
 * Delete user profile (admin only)
 */
export const DELETE = withEnhancedAuth(async ({ params, user: requester, startTime }) => {
    try {
        const { id: targetUserId } = await params;

        if (!targetUserId) {
            return handleApiErrorEnhanced(
                new Error("User ID is required"),
                'user_deletion_missing_id',
                { status: 400 }
            );
        }

        // Prevent self-deletion
        if (requester.id === targetUserId) {
            return handleApiErrorEnhanced(
                new Error("Cannot delete your own account"),
                'user_deletion_self_denied',
                { targetUserId, requesterId: requester.id }
            );
        }

        // Check if user exists before deletion
        const userToDelete = await getUserProfile(targetUserId);
        if (!userToDelete) {
            return handleApiErrorEnhanced(
                new Error("User not found"),
                'user_deletion_not_found',
                { targetUserId },
                { status: 404 }
            );
        }

        // Delete user
        await deleteUser(targetUserId);

        // Revalidate admin paths
        revalidatePath("/admin/manage-users");

        // Track performance
        PerformanceMonitor.recordEvent({
            type: 'api_call',
            name: 'user_profile_deleted',
            value: performance.now() - startTime,
            unit: 'ms',
            metadata: {
                endpoint: 'users/[id]',
                targetUserId,
                requesterId: requester.id,
                deletedUserRole: userToDelete.role,
                success: true
            }
        });

        // Track analytics
        Analytics.trackApiCall(
            `/api/users/${targetUserId}`,
            'DELETE',
            performance.now() - startTime,
            true,
            200
        );

        return createApiResponseEnhanced(
            {
                message: `User ${targetUserId} deleted successfully`,
                deletedUser: {
                    id: targetUserId,
                    name: userToDelete.name,
                    email: userToDelete.email,
                    role: userToDelete.role
                },
                timestamp: new Date().toISOString()
            },
            200,
            {
                processingTime: performance.now() - startTime,
                endpoint: 'users/[id]',
                targetUserId,
                requesterId: requester.id
            }
        );

    } catch (error: any) {
        return handleApiErrorEnhanced(error, 'user_profile_deletion');
    }
}, {
    requireAdmin: true,
    performanceTracking: true,
    analytics: true,
    rateLimit: {
        maxRequests: 5, // Limit user deletions
        windowMs: 300000 // 5 minutes
    }
});
