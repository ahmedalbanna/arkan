/**
 * Admin Users Route - Migrated to New System
 *
 * هذا الملف يحتوي على route إدارة المستخدمين المهاجر
 * مع استخدام النظام الجديد المحسن
 */

import { createApiResponseEnhanced, handleApiErrorEnhanced, withEnhancedAuth } from '@/lib/core/api';
import { Analytics, PerformanceMonitor } from '@/lib/core/performance';
import { createUser, getPaginatedUsers } from '@/lib/db/queries';
import { z } from 'zod';

// Enhanced validation schemas
const userListQuerySchema = z.object({
    limit: z.coerce.number().int().min(1).max(100).default(10), // Increased max limit
    lastVisibleId: z.string().optional(),
    search: z.string().optional(),
    role: z.enum(['user', 'admin']).optional(),
    sortBy: z.enum(['createdAt', 'name', 'email', 'credits']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
});

const createUserSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name too long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long").max(128, "Password too long"),
    role: z.enum(['user', 'admin']).default('user'),
    credits: z.coerce.number().int().min(0).max(10000).default(10),
    bio: z.string().max(500, "Bio too long").optional(),
    phoneNumber: z.string().max(20, "Phone number too long").optional(),
});

/**
 * Get paginated users with enhanced filtering and sorting
 */
export const GET = withEnhancedAuth(async ({ request, user: requester, startTime }) => {
    try {
        const { searchParams } = new URL(request.url);
        const queryValidation = userListQuerySchema.safeParse(Object.fromEntries(searchParams));

        if (!queryValidation.success) {
            return handleApiErrorEnhanced(
                new Error(`Query validation failed: ${queryValidation.error.message}`),
                'admin_users_query_validation_failed',
                {
                    validationErrors: queryValidation.error.flatten().fieldErrors,
                    queryParams: Object.fromEntries(searchParams)
                }
            );
        }

        const {
            limit,
            lastVisibleId,
            search,
            role,
            sortBy,
            sortOrder,
            dateFrom,
            dateTo
        } = queryValidation.data;

        // Enhanced query parameters
        const queryParams = {
            limit,
            lastVisibleId,
            search,
            role,
            sortBy,
            sortOrder,
            dateFrom: dateFrom ? new Date(dateFrom) : undefined,
            dateTo: dateTo ? new Date(dateTo) : undefined,
        };

        const results = await getPaginatedUsers(queryParams);

        // Track performance
        PerformanceMonitor.recordEvent({
            type: 'api_call',
            name: 'admin_users_listed',
            value: performance.now() - startTime,
            unit: 'ms',
            metadata: {
                endpoint: 'admin/users',
                requesterId: requester.id,
                queryParams,
                resultCount: results.users.length,
                hasMore: results.hasMore,
                success: true
            }
        });

        // Track analytics
        Analytics.trackApiCall(
            '/api/admin/users',
            'GET',
            performance.now() - startTime,
            true,
            200
        );

        return createApiResponseEnhanced(
            {
                ...results,
                metadata: {
                    queryParams,
                    totalReturned: results.users.length,
                    hasMore: results.hasMore,
                    timestamp: new Date().toISOString()
                }
            },
            200,
            {
                processingTime: performance.now() - startTime,
                endpoint: 'admin/users',
                requesterId: requester.id,
                resultCount: results.users.length
            }
        );

    } catch (error: any) {
        return handleApiErrorEnhanced(error, 'admin_users_listing');
    }
}, {
    requireAdmin: true,
    performanceTracking: true,
    analytics: true,
    rateLimit: {
        maxRequests: 100, // Allow frequent admin queries
        windowMs: 60000
    }
});

/**
 * Create new user with enhanced validation and logging
 */
export const POST = withEnhancedAuth(async ({ request, user: requester, startTime }) => {
    try {
        const body = await request.json();
        const validation = createUserSchema.safeParse(body);

        if (!validation.success) {
            return handleApiErrorEnhanced(
                new Error(`Validation failed: ${validation.error.message}`),
                'admin_users_create_validation_failed',
                {
                    validationErrors: validation.error.flatten().fieldErrors,
                    requesterId: requester.id
                }
            );
        }

        const userData = validation.data;

        // Check if user already exists
        // TODO: Add email uniqueness check here

        const newUser = await createUser(userData);

        // Track performance
        PerformanceMonitor.recordEvent({
            type: 'api_call',
            name: 'admin_user_created',
            value: performance.now() - startTime,
            unit: 'ms',
            metadata: {
                endpoint: 'admin/users',
                requesterId: requester.id,
                newUserId: newUser.id,
                newUserRole: newUser.role,
                newUserCredits: newUser.credits,
                success: true
            }
        });

        // Track analytics
        Analytics.trackApiCall(
            '/api/admin/users',
            'POST',
            performance.now() - startTime,
            true,
            201
        );

        return createApiResponseEnhanced(
            {
                ...newUser,
                metadata: {
                    createdBy: requester.id,
                    createdAt: new Date().toISOString(),
                    initialCredits: userData.credits
                }
            },
            201,
            {
                processingTime: performance.now() - startTime,
                endpoint: 'admin/users',
                requesterId: requester.id,
                newUserId: newUser.id
            }
        );

    } catch (error: any) {
        return handleApiErrorEnhanced(error, 'admin_user_creation');
    }
}, {
    requireAdmin: true,
    performanceTracking: true,
    analytics: true,
    rateLimit: {
        maxRequests: 10, // Limit user creation
        windowMs: 300000 // 5 minutes
    }
});

/**
 * Get user statistics (admin only)
 */
export const OPTIONS = withEnhancedAuth(async ({ user: requester, startTime }) => {
    try {
        // Get user statistics
        const stats = await getPaginatedUsers({ limit: 1 }); // Get total count
        const totalUsers = stats.totalCount || 0;

        // Get role distribution
        const userStats = await getPaginatedUsers({ limit: 1000 }); // Get sample for stats
        const roleDistribution = userStats.users.reduce((acc, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const statistics = {
            totalUsers,
            roleDistribution,
            averageCredits: userStats.users.reduce((sum, user) => sum + (user.credits || 0), 0) / userStats.users.length || 0,
            timestamp: new Date().toISOString()
        };

        return createApiResponseEnhanced(
            statistics,
            200,
            {
                processingTime: performance.now() - startTime,
                endpoint: 'admin/users/stats',
                requesterId: requester.id
            }
        );

    } catch (error: any) {
        return handleApiErrorEnhanced(error, 'admin_users_statistics');
    }
}, {
    requireAdmin: true,
    performanceTracking: true,
    analytics: true
});
