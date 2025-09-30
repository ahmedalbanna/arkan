/**
 * معالج API الأساسي
 *
 * هذا الملف يحتوي على معالج API الأساسي
 * مع دعم للـ middleware والتحقق من البيانات
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema } from 'zod';
import { withAuth, withCors, withLogging, withRateLimit, withValidation } from '../middleware';

/**
 * خيارات معالج API
 */
export interface ApiHandlerOptions {
    /** هل يتطلب مصادقة */
    requireAuth?: boolean;
    /** خيارات المصادقة */
    authOptions?: {
        requireAdmin?: boolean;
        requireSelf?: boolean;
        allowedRoles?: string[];
    };
    /** Schema للتحقق من البيانات */
    validationSchema?: ZodSchema;
    /** حقل البيانات للتحقق */
    validationField?: 'body' | 'query' | 'params';
    /** خيارات الحد من معدل الطلبات */
    rateLimit?: {
        maxRequests: number;
        windowMs: number;
        errorMessage?: string;
    };
    /** خيارات CORS */
    cors?: {
        origins?: string[];
        methods?: string[];
        allowedHeaders?: string[];
    };
    /** خيارات التسجيل */
    logging?: {
        logRequests?: boolean;
        logResponses?: boolean;
        logErrors?: boolean;
        logPerformance?: boolean;
    };
}

/**
 * معالج API مع middleware
 */
export type ApiHandler<T = any> = (
    request: NextRequest,
    context: { params: { [key: string]: string } },
    validatedData?: T
) => Promise<NextResponse | Response>;

/**
 * إنشاء معالج API مع middleware
 */
export function createApiHandler<T = any>(
    handler: ApiHandler<T>,
    options: ApiHandlerOptions = {}
): (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response> {
    let wrappedHandler = handler;

    // تطبيق middleware بالترتيب الصحيح
    const {
        requireAuth = false,
        authOptions = {},
        validationSchema,
        validationField = 'body',
        rateLimit,
        cors,
        logging = {},
    } = options;

    // 1. التسجيل (أولاً)
    if (logging.logRequests || logging.logResponses || logging.logErrors || logging.logPerformance) {
        wrappedHandler = withLogging(wrappedHandler, logging);
    }

    // 2. CORS
    if (cors) {
        wrappedHandler = withCors(wrappedHandler, cors);
    }

    // 3. الحد من معدل الطلبات
    if (rateLimit) {
        wrappedHandler = withRateLimit(wrappedHandler, rateLimit);
    }

    // 4. التحقق من البيانات
    if (validationSchema) {
        wrappedHandler = withValidation(wrappedHandler, {
            schema: validationSchema,
            dataField: validationField,
        });
    }

    // 5. المصادقة (أخيراً)
    if (requireAuth) {
        wrappedHandler = withAuth(wrappedHandler, authOptions);
    }

    return wrappedHandler;
}

/**
 * معالج API بسيط
 */
export function createSimpleApiHandler(
    handler: (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response>
): (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response> {
    return createApiHandler(handler, {
        requireAuth: false,
        logging: {
            logRequests: true,
            logResponses: true,
            logErrors: true,
            logPerformance: false,
        },
    });
}

/**
 * معالج API مع مصادقة
 */
export function createAuthApiHandler(
    handler: (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response>,
    authOptions: ApiHandlerOptions['authOptions'] = {}
): (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response> {
    return createApiHandler(handler, {
        requireAuth: true,
        authOptions,
        logging: {
            logRequests: true,
            logResponses: true,
            logErrors: true,
            logPerformance: true,
        },
    });
}

/**
 * معالج API مع تحقق من البيانات
 */
export function createValidatedApiHandler<T = any>(
    handler: ApiHandler<T>,
    validationSchema: ZodSchema<T>,
    validationField: 'body' | 'query' | 'params' = 'body',
    options: Omit<ApiHandlerOptions, 'validationSchema' | 'validationField'> = {}
): (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response> {
    return createApiHandler(handler, {
        ...options,
        validationSchema,
        validationField,
    });
}

/**
 * معالج API مع حد من معدل الطلبات
 */
export function createRateLimitedApiHandler(
    handler: (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response>,
    rateLimit: ApiHandlerOptions['rateLimit'],
    options: Omit<ApiHandlerOptions, 'rateLimit'> = {}
): (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response> {
    return createApiHandler(handler, {
        ...options,
        rateLimit,
    });
}

/**
 * معالج API كامل
 */
export function createFullApiHandler<T = any>(
    handler: ApiHandler<T>,
    options: ApiHandlerOptions
): (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response> {
    return createApiHandler(handler, options);
}
