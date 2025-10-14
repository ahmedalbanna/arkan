/**
 * API Handlers المبسطة
 *
 * يحتوي على الوظائف الأساسية فقط
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// أنواع البيانات الأساسية
export interface ApiHandlerContext {
    request: NextRequest;
    user?: {
        id: string;
        email: string;
        role: string;
    };
    params: { [key: string]: string };
}

export interface ApiHandlerOptions {
    requireAuth?: boolean;
    requireAdmin?: boolean;
    validationSchema?: z.ZodSchema;
}

export type ApiHandler<T = any> = (
    request: NextRequest,
    context: { params: { [key: string]: string } },
    validatedData?: T
) => Promise<NextResponse | Response>;

/**
 * إنشاء API handler بسيط
 */
export function createApiHandler<T = any>(
    handler: ApiHandler<T>,
    options: ApiHandlerOptions = {}
): (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response> {
    return async (request: NextRequest, context: { params: { [key: string]: string } }) => {
        try {
            let validatedData: T | undefined;

            // التحقق من البيانات إذا كان مطلوباً
            if (options.validationSchema) {
                const body = await request.json().catch(() => ({}));
                const result = options.validationSchema.safeParse(body);

                if (!result.success) {
                    return NextResponse.json(
                        { success: false, error: 'Validation failed', details: result.error.errors },
                        { status: 400 }
                    );
                }

                validatedData = result.data;
            }

            // تنفيذ الـ handler
            return await handler(request, context, validatedData);
        } catch (error) {
            console.error('API Handler Error:', error);
            return NextResponse.json(
                { success: false, error: 'Internal server error' },
                { status: 500 }
            );
        }
    };
}

/**
 * Handler بسيط بدون تحقق
 */
export function createSimpleApiHandler(
    handler: (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response>
): (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response> {
    return async (request: NextRequest, context: { params: { [key: string]: string } }) => {
        try {
            return await handler(request, context);
        } catch (error) {
            console.error('Simple API Handler Error:', error);
            return NextResponse.json(
                { success: false, error: 'Internal server error' },
                { status: 500 }
            );
        }
    };
}

/**
 * Handler مع التحقق من البيانات
 */
export function createValidatedApiHandler<T = any>(
    handler: ApiHandler<T>,
    validationSchema: z.ZodSchema<T>
): (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response> {
    return createApiHandler(handler, { validationSchema });
}

/**
 * Handler أساسي للعمليات المعقدة
 */
export abstract class BaseApiHandler<TInput = unknown, TOutput = unknown> {
    protected abstract inputSchema: z.ZodSchema<TInput>;
    protected abstract processRequest(
        data: TInput,
        context: ApiHandlerContext
    ): Promise<TOutput>;

    async handle(context: ApiHandlerContext): Promise<Response> {
        try {
            // التحقق من البيانات
            const body = await context.request.json().catch(() => ({}));
            const result = this.inputSchema.safeParse(body);

            if (!result.success) {
                return new Response(
                    JSON.stringify({
                        success: false,
                        error: 'Validation failed',
                        details: result.error.errors
                    }),
                    {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' }
                    }
                );
            }

            // معالجة الطلب
            const output = await this.processRequest(result.data, context);

            return new Response(
                JSON.stringify({ success: true, data: output }),
                {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        } catch (error) {
            console.error('Base API Handler Error:', error);
            return new Response(
                JSON.stringify({ success: false, error: 'Internal server error' }),
                {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }
    }
}

/**
 * Handler بسيط للعمليات البسيطة
 */
export abstract class SimpleApiHandler<TOutput = unknown> {
    protected abstract processRequest(context: ApiHandlerContext): Promise<TOutput>;

    async handle(context: ApiHandlerContext): Promise<Response> {
        try {
            const output = await this.processRequest(context);

            return new Response(
                JSON.stringify({ success: true, data: output }),
                {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        } catch (error) {
            console.error('Simple API Handler Error:', error);
            return new Response(
                JSON.stringify({ success: false, error: 'Internal server error' }),
                {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }
    }
}
