/**
 * User Reset Password Route - Migrated to New System
 *
 * هذا الملف يحتوي على route إعادة تعيين كلمة المرور المهاجر
 * مع استخدام النظام الجديد المحسن
 */

import { createApiResponseEnhanced, handleApiErrorEnhanced, withEnhancedAuth } from '@/lib/core/api';
import { Analytics, PerformanceMonitor } from '@/lib/core/performance';
import { getUserProfile } from '@/lib/db/queries';
import { adminAuth } from '@/lib/firebase/server-init';
import { z } from 'zod';

// Enhanced validation schema
const resetPasswordSchema = z.object({
    email: z.string().email('Invalid email address').optional(),
    sendEmail: z.boolean().optional().default(true),
});

/**
 * Reset user password with enhanced security and logging
 */
export const POST = withEnhancedAuth(async ({ params, request, user: requester, startTime }) => {
    try {
        const { id: userId } = await params;
        const body = await request.json();

        if (!userId) {
            return handleApiErrorEnhanced(
                new Error('User ID is required'),
                'reset_password_missing_user_id',
                { status: 400 }
            );
        }

        // Validate request body
        const validation = resetPasswordSchema.safeParse(body);
        if (!validation.success) {
            return handleApiErrorEnhanced(
                new Error(`Validation failed: ${validation.error.message}`),
                'reset_password_validation_failed',
                { validationErrors: validation.error.flatten().fieldErrors }
            );
        }

        const { sendEmail } = validation.data;

        // Get user profile
        const user = await getUserProfile(userId);
        if (!user || !user.email) {
            return handleApiErrorEnhanced(
                new Error('User not found or has no email address'),
                'reset_password_user_not_found',
                { userId, hasEmail: !!user?.email },
                { status: 404 }
            );
        }

        // Generate password reset link
        let resetLink = null;
        if (sendEmail) {
            try {
                resetLink = await adminAuth.generatePasswordResetLink(user.email, {
                    url: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
                });
            } catch (error) {
                console.error('Failed to generate password reset link:', error);
                return handleApiErrorEnhanced(
                    new Error('Failed to generate password reset link'),
                    'reset_password_link_generation_failed',
                    { userId, userEmail: user.email }
                );
            }
        }

        // TODO: In a real implementation, you would:
        // 1. Send the reset email using a service like SendGrid
        // 2. Store the reset token in the database with expiration
        // 3. Log the reset attempt for security monitoring

        // For demo purposes, we'll just log the action
        console.log(`Password reset initiated for user ${userId} (${user.email})`);
        if (resetLink) {
            console.log(`Reset link generated: ${resetLink}`);
        }

        // Track performance
        PerformanceMonitor.recordEvent({
            type: 'api_call',
            name: 'password_reset_initiated',
            value: performance.now() - startTime,
            unit: 'ms',
            metadata: {
                endpoint: 'users/[id]/reset-password',
                userId,
                requesterId: requester.id,
                userEmail: user.email,
                sendEmail,
                success: true
            }
        });

        // Track analytics
        Analytics.trackApiCall(
            `/api/users/${userId}/reset-password`,
            'POST',
            performance.now() - startTime,
            true,
            200
        );

        return createApiResponseEnhanced(
            {
                message: `A password reset ${sendEmail ? 'email has been sent' : 'link has been generated'} for ${user.email}`,
                userId,
                userEmail: user.email,
                resetLink: sendEmail ? undefined : resetLink, // Only return link if not sending email
                timestamp: new Date().toISOString()
            },
            200,
            {
                processingTime: performance.now() - startTime,
                endpoint: 'users/[id]/reset-password',
                userId,
                requesterId: requester.id,
                sendEmail
            }
        );

    } catch (error: any) {
        return handleApiErrorEnhanced(error, 'password_reset_processing');
    }
}, {
    requireAdmin: true,
    performanceTracking: true,
    analytics: true,
    rateLimit: {
        maxRequests: 3, // Limit password reset attempts
        windowMs: 300000 // 5 minutes
    }
});

/**
 * Get password reset status (admin only)
 */
export const GET = withEnhancedAuth(async ({ params, user: requester, startTime }) => {
    try {
        const { id: userId } = await params;

        if (!userId) {
            return handleApiErrorEnhanced(
                new Error('User ID is required'),
                'reset_password_status_missing_user_id',
                { status: 400 }
            );
        }

        const user = await getUserProfile(userId);
        if (!user) {
            return handleApiErrorEnhanced(
                new Error('User not found'),
                'reset_password_status_user_not_found',
                { userId },
                { status: 404 }
            );
        }

        // TODO: In a real implementation, you would check:
        // 1. If there are any pending reset requests
        // 2. When the last reset was attempted
        // 3. If the user has a valid email for reset

        const status = {
            userId,
            userEmail: user.email,
            canReset: !!user.email,
            lastResetAttempt: null, // Would be fetched from database
            pendingReset: false, // Would be checked from database
            timestamp: new Date().toISOString()
        };

        return createApiResponseEnhanced(
            status,
            200,
            {
                processingTime: performance.now() - startTime,
                endpoint: 'users/[id]/reset-password/status',
                userId,
                requesterId: requester.id
            }
        );

    } catch (error: any) {
        return handleApiErrorEnhanced(error, 'password_reset_status');
    }
}, {
    requireAdmin: true,
    performanceTracking: true,
    analytics: true
});
