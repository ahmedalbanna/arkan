/**
 * Middleware للمصادقة
 *
 * هذا الملف يحتوي على middleware موحد للمصادقة
 * والتفويض في جميع API routes
 */

import { getUserProfile } from '@/lib/db/queries';
import { adminAuth } from '@/lib/firebase/server-init';
import { NextRequest, NextResponse } from 'next/server';
import { handleServerError } from '../../error-handling';

/**
 * خيارات middleware المصادقة
 */
export interface AuthMiddlewareOptions {
    /** هل يتطلب صلاحيات إدارية */
    requireAdmin?: boolean;
    /** هل يتطلب مصادقة فقط */
    requireAuth?: boolean;
    /** الأدوار المسموحة */
    allowedRoles?: string[];
    /** الصلاحيات المطلوبة */
    requiredPermissions?: string[];
    /** السماح بالوصول للمالك فقط */
    requireOwnership?: boolean;
    /** حقل معرف المالك */
    ownerField?: string;
}

/**
 * سياق المصادقة
 */
export interface AuthContext {
    request: NextRequest;
    user: any;
    token: string;
    params: { [key: string]: string };
    isAdmin: boolean;
    hasPermission: (permission: string) => boolean;
    isOwner: (resourceId: string) => boolean;
}

/**
 * معالج API مع المصادقة
 */
export type AuthenticatedApiHandler = (context: AuthContext) => Promise<NextResponse | Response>;

/**
 * Middleware للمصادقة
 */
export function withAuth(
    handler: AuthenticatedApiHandler,
    options: AuthMiddlewareOptions = {}
): (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response> {
    return async (request: NextRequest, { params }: { params: { [key: string]: string } }) => {
        try {
            const {
                requireAdmin = false,
                requireAuth = true,
                allowedRoles = [],
                requiredPermissions = [],
                requireOwnership = false,
                ownerField = 'userId',
            } = options;

            // التحقق من وجود رمز المصادقة
            if (requireAuth) {
                const authorization = request.headers.get('Authorization');
                if (!authorization?.startsWith('Bearer ')) {
                    return handleServerError(
                        { message: 'Unauthorized: Missing token' },
                        'Authentication'
                    );
                }

                const token = authorization.substring(7);

                try {
                    const decodedToken = await adminAuth.verifyIdToken(token, true);

                    if (!decodedToken || !decodedToken.uid) {
                        return handleServerError(
                            { message: 'Unauthorized: Invalid token' },
                            'Authentication'
                        );
                    }

                    // الحصول على ملف المستخدم
                    const user = await getUserProfile(decodedToken.uid);
                    if (!user) {
                        return handleServerError(
                            { message: 'Forbidden: User profile not found' },
                            'Authentication'
                        );
                    }

                    // التحقق من الصلاحيات الإدارية
                    if (requireAdmin && user.role !== 'admin') {
                        return handleServerError(
                            { message: 'Forbidden: Admin access required' },
                            'Authorization'
                        );
                    }

                    // التحقق من الأدوار المسموحة
                    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
                        return handleServerError(
                            { message: 'Forbidden: Insufficient role' },
                            'Authorization'
                        );
                    }

                    // التحقق من الصلاحيات المطلوبة
                    if (requiredPermissions.length > 0) {
                        const userPermissions = user.permissions || [];
                        const hasAllPermissions = requiredPermissions.every(permission =>
                            userPermissions.includes(permission)
                        );

                        if (!hasAllPermissions) {
                            return handleServerError(
                                { message: 'Forbidden: Insufficient permissions' },
                                'Authorization'
                            );
                        }
                    }

                    // إنشاء سياق المصادقة
                    const authContext: AuthContext = {
                        request,
                        user,
                        token,
                        params,
                        isAdmin: user.role === 'admin',
                        hasPermission: (permission: string) => {
                            const userPermissions = user.permissions || [];
                            return userPermissions.includes(permission);
                        },
                        isOwner: (resourceId: string) => {
                            if (user.role === 'admin') return true;
                            return user.id === resourceId;
                        },
                    };

                    // التحقق من الملكية إذا لزم الأمر
                    if (requireOwnership) {
                        const resourceId = params[ownerField] || params.id;
                        if (!authContext.isOwner(resourceId)) {
                            return handleServerError(
                                { message: 'Forbidden: Access denied to this resource' },
                                'Authorization'
                            );
                        }
                    }

                    return await handler(authContext);

                } catch (error) {
                    return handleServerError(
                        { message: 'Unauthorized: Invalid token' },
                        'Authentication'
                    );
                }
            } else {
                // لا يتطلب مصادقة
                const authContext: AuthContext = {
                    request,
                    user: null,
                    token: '',
                    params,
                    isAdmin: false,
                    hasPermission: () => false,
                    isOwner: () => false,
                };

                return await handler(authContext);
            }

        } catch (error) {
            return handleServerError(error, 'Authentication Middleware');
        }
    };
}

/**
 * Middleware للمصادقة الإدارية فقط
 */
export function withAdminAuth(handler: AuthenticatedApiHandler): (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response> {
    return withAuth(handler, { requireAdmin: true });
}

/**
 * Middleware للمصادقة العادية
 */
export function withUserAuth(handler: AuthenticatedApiHandler): (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response> {
    return withAuth(handler, { requireAuth: true });
}

/**
 * Middleware بدون مصادقة
 */
export function withoutAuth(handler: AuthenticatedApiHandler): (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response> {
    return withAuth(handler, { requireAuth: false });
}

/**
 * Middleware مع أدوار محددة
 */
export function withRoleAuth(
    handler: AuthenticatedApiHandler,
    roles: string[]
): (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response> {
    return withAuth(handler, { allowedRoles: roles });
}

/**
 * Middleware مع صلاحيات محددة
 */
export function withPermissionAuth(
    handler: AuthenticatedApiHandler,
    permissions: string[]
): (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response> {
    return withAuth(handler, { requiredPermissions: permissions });
}

/**
 * Middleware مع ملكية المورد
 */
export function withOwnershipAuth(
    handler: AuthenticatedApiHandler,
    ownerField: string = 'userId'
): (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response> {
    return withAuth(handler, { requireOwnership: true, ownerField });
}
