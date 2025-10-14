/**
 * API Middleware المبسط
 *
 * يحتوي على الوظائف الأساسية فقط
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// أنواع البيانات الأساسية
export interface ApiMiddlewareOptions {
    requireAuth?: boolean;
    requireAdmin?: boolean;
    logging?: boolean;
}

export interface TypedApiHandler {
    handle(context: any): Promise<Response>;
}

/**
 * Middleware الرئيسي المبسط
 */
export const withApiMiddleware = (
    handler: TypedApiHandler,
    options: ApiMiddlewareOptions = {}
) => {
    return async (request: NextRequest, context: { params: { [key: string]: string } }) => {
        try {
            // تسجيل الطلب إذا كان مطلوباً
            if (options.logging) {
                console.log(`API Request: ${request.method} ${request.url}`);
            }

            // تنفيذ الـ handler
            const response = await handler.handle({
                request,
                params: context.params,
            });

            return response;
        } catch (error) {
            console.error('API Middleware Error:', error);
            return NextResponse.json(
                { success: false, error: 'Internal server error' },
                { status: 500 }
            );
        }
    };
};

// دوال مساعدة للاستخدام السريع
export const withAuth = (handler: TypedApiHandler) =>
    withApiMiddleware(handler, { requireAuth: true });

export const withAdmin = (handler: TypedApiHandler) =>
    withApiMiddleware(handler, { requireAdmin: true });

export const withLogging = (handler: TypedApiHandler) =>
    withApiMiddleware(handler, { logging: true });
