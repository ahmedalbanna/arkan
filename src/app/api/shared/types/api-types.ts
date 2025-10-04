/**
 * أنواع البيانات الموحدة لـ API
 *
 * هذا الملف يحتوي على جميع أنواع البيانات المستخدمة في نظام API الموحد
 */

import { z } from 'zod';

// أنواع الاستجابة الموحدة
export interface ApiResponse<T = unknown> {
    success: true;
    data: T;
    message?: string;
    timestamp: string;
    requestId: string;
}

export interface ApiError {
    success: false;
    error: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
    timestamp: string;
    requestId: string;
}

// أنواع الطلبات الموحدة
export interface ApiRequest<T = unknown> {
    data: T;
    timestamp: string;
    requestId: string;
}

// أنواع المصادقة
export interface AuthContext {
    user: {
        id: string;
        email: string;
        role: 'user' | 'admin';
        teams?: string[];
    };
    token: string;
}

// أنواع معالجة الأخطاء
export interface ValidationError {
    field: string;
    message: string;
    value?: unknown;
}

export interface AuthError {
    code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'INVALID_TOKEN';
    message: string;
}

export interface BusinessError {
    code: 'INSUFFICIENT_CREDITS' | 'RATE_LIMIT_EXCEEDED' | 'RESOURCE_NOT_FOUND';
    message: string;
    details?: Record<string, unknown>;
}

// أنواع Middleware
export interface ApiMiddlewareOptions {
    requireAuth?: boolean;
    requireAdmin?: boolean;
    rateLimit?: {
        windowMs: number;
        maxRequests: number;
    };
    creditCost?: number;
    logging?: boolean;
}

// أنواع المعالجات
export interface ApiHandlerContext {
    request: Request;
    user: AuthContext['user'];
    params?: Record<string, string>;
    searchParams?: URLSearchParams;
}

export type ApiHandler = (context: ApiHandlerContext) => Promise<Response>;

// أنواع التحقق من صحة البيانات
export const RequestIdSchema = z.string().uuid();
export const TimestampSchema = z.string().datetime();

export const BaseApiRequestSchema = z.object({
    requestId: RequestIdSchema.optional(),
    timestamp: TimestampSchema.optional(),
});

export const BaseApiResponseSchema = z.object({
    success: z.boolean(),
    timestamp: TimestampSchema,
    requestId: RequestIdSchema,
});

// أنواع الخدمات
export interface ServiceConfig {
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    requiresAuth: boolean;
    timeout?: number;
}

export interface ServiceResponse<T = unknown> {
    data: T;
    success: boolean;
    message?: string;
}

// أنواع التسجيل
export interface ApiLogEntry {
    requestId: string;
    userId: string;
    endpoint: string;
    method: string;
    timestamp: string;
    duration: number;
    statusCode: number;
    error?: string;
}

// أنواع Rate Limiting
export interface RateLimitInfo {
    userId: string;
    windowStart: number;
    requestCount: number;
    maxRequests: number;
    windowMs: number;
}

// أنواع Credit Management
export interface CreditTransaction {
    userId: string;
    amount: number;
    type: 'deduct' | 'add';
    reason: string;
    timestamp: string;
    requestId: string;
}

// أنواع التحقق من الصلاحيات
export interface PermissionCheck {
    userId: string;
    resource: string;
    action: 'read' | 'write' | 'delete' | 'admin';
    context?: Record<string, unknown>;
}

export interface PermissionResult {
    allowed: boolean;
    reason?: string;
}
