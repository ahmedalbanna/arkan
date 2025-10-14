/**
 * معالج API الأساسي
 *
 * هذا الملف يحتوي على معالج API الأساسي
 * مع دعم للـ middleware والتحقق من البيانات
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema, z } from 'zod';
import { TypedApiHandler } from '../../types/api-types';
import { withAuth, withCors, withLogging, withRateLimit, withValidation } from '../middleware';

// أنواع محلية للبيانات
interface ApiHandlerContext {
    request: Request;
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

interface AuthContext {
    user: {
        id: string;
        email: string;
        role: string;
    };
}

interface ValidationError {
    field: string;
    message: string;
    value?: any;
}

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
        wrappedHandler = withAuth(wrappedHandler as any, authOptions);
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
export function createAuthApiHandler<T = any>(
    handler: ApiHandler<T>,
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

/**
 * معالج API الأساسي المجرد
 */
export abstract class BaseApiHandler<TInput = unknown, TOutput = unknown> implements TypedApiHandler<TInput, TOutput> {
    protected abstract inputSchema: z.ZodSchema<TInput>;
    protected abstract processRequest(
        data: TInput,
        context: ApiHandlerContext
    ): Promise<TOutput>;

    /**
     * معالجة الطلب الرئيسية
     */
    async handle(context: ApiHandlerContext): Promise<Response> {
        try {
            // التحقق من صحة البيانات
            const validatedData = await this.validateInput(context.request);

            // معالجة الطلب
            const result = await this.processRequest(validatedData, context);

            // إرجاع الاستجابة
            return new Response(JSON.stringify({ success: true, data: result }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            return new Response(JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    /**
     * التحقق من صحة البيانات المدخلة
     */
    protected async validateInput(request: Request): Promise<TInput> {
        try {
            const body = await request.json();
            const validation = this.inputSchema.safeParse(body);

            if (!validation.success) {
                const validationError: ValidationError = {
                    field: 'input',
                    message: 'Invalid input data',
                    value: validation.error.errors
                };
                throw validationError;
            }

            return validation.data;
        } catch (error) {
            if (error instanceof SyntaxError) {
                const validationError: ValidationError = {
                    field: 'json',
                    message: 'Invalid JSON format',
                    value: null
                };
                throw validationError;
            }
            throw error;
        }
    }

    /**
     * التحقق من الصلاحيات
     */
    protected async checkPermissions(
        user: AuthContext['user'],
        resource: string,
        action: string
    ): Promise<boolean> {
        // يمكن توسيع هذا لاحقاً لإضافة نظام صلاحيات معقد
        return true;
    }

    /**
     * تسجيل العملية
     */
    protected async logOperation(
        context: ApiHandlerContext,
        operation: string,
        details?: Record<string, unknown>
    ): Promise<void> {
        // يمكن إضافة نظام تسجيل هنا
        console.log(`Operation: ${operation}`, {
            userId: context.user?.id || 'anonymous',
            endpoint: context.request.url,
            details
        });
    }
}

/**
 * معالج API للعمليات البسيطة (GET)
 */
export abstract class SimpleApiHandler<TOutput = unknown> implements TypedApiHandler<unknown, TOutput> {
    protected abstract processRequest(context: ApiHandlerContext): Promise<TOutput>;

    async handle(context: ApiHandlerContext): Promise<Response> {
        try {
            const result = await this.processRequest(context);
            return new Response(JSON.stringify({ success: true, data: result }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            return new Response(JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }
}

/**
 * معالج API للعمليات المعقدة (POST/PUT/DELETE)
 */
export abstract class ComplexApiHandler<TInput = unknown, TOutput = unknown> extends BaseApiHandler<TInput, TOutput> {
    protected abstract creditCost?: number;
    protected abstract requiresAdmin?: boolean;

    async handle(context: ApiHandlerContext): Promise<Response> {
        try {
            // التحقق من الصلاحيات الإدارية
            if (this.requiresAdmin && context.user && context.user.role !== 'admin') {
                return new Response(JSON.stringify({
                    success: false,
                    error: {
                        code: 'FORBIDDEN',
                        message: 'Admin access required'
                    }
                }), {
                    status: 403,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            // التحقق من صحة البيانات
            const validatedData = await this.validateInput(context.request);

            // معالجة الطلب
            const result = await this.processRequest(validatedData, context);

            // تسجيل العملية
            await this.logOperation(context, 'api_call', {
                creditCost: this.creditCost,
                requiresAdmin: this.requiresAdmin
            });

            return new Response(JSON.stringify({ success: true, data: result }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            return new Response(JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }
}

/**
 * معالج API للعمليات التي تتطلب خصم ائتمانات
 */
export abstract class CreditBasedApiHandler<TInput = unknown, TOutput = unknown> extends ComplexApiHandler<TInput, TOutput> {
    protected abstract creditCost: number;

    async handle(context: ApiHandlerContext): Promise<Response> {
        try {
            // التحقق من صحة البيانات
            const validatedData = await this.validateInput(context.request);

            // خصم الائتمانات
            if (this.creditCost > 0 && context.user) {
                await this.deductCredits(context.user.id, this.creditCost);
            }

            // معالجة الطلب
            const result = await this.processRequest(validatedData, context);

            // تسجيل العملية
            await this.logOperation(context, 'credit_based_api_call', {
                creditCost: this.creditCost
            });

            return new Response(JSON.stringify({ success: true, data: result }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            return new Response(JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    /**
     * خصم الائتمانات
     */
    private async deductCredits(userId: string, amount: number): Promise<void> {
        try {
            const { deductCredit } = await import('@/services/payment/credit-service');
            await deductCredit(userId, amount);
        } catch (error) {
            console.error(`Failed to deduct ${amount} credits from user ${userId}:`, error);
            throw error;
        }
    }
}
