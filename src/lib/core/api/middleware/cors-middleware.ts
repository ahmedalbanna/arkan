/**
 * Middleware للتعامل مع CORS
 *
 * هذا الملف يحتوي على middleware للتعامل مع CORS
 * (Cross-Origin Resource Sharing)
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleServerError } from '../../error-handling';

/**
 * خيارات CORS
 */
export interface CorsOptions {
    /** الأصول المسموح بها */
    origins?: string[];
    /** الطرق المسموح بها */
    methods?: string[];
    /** Headers المسموح بها */
    allowedHeaders?: string[];
    /** Headers المعرضة */
    exposedHeaders?: string[];
    /** هل السماح بالـ credentials */
    credentials?: boolean;
    /** مدة cache للـ preflight */
    maxAge?: number;
}

/**
 * خيارات CORS الافتراضية
 */
const DEFAULT_CORS_OPTIONS: CorsOptions = {
    origins: ['http://localhost:3000', 'https://arkan.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'X-User-ID',
        'X-API-Key',
    ],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    credentials: true,
    maxAge: 86400, // 24 ساعة
};

/**
 * Middleware للتعامل مع CORS
 */
export function withCors(
    handler: (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response>,
    options: CorsOptions = {}
): (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response> {
    return async (request: NextRequest, context: { params: { [key: string]: string } }) => {
        try {
            const corsOptions = { ...DEFAULT_CORS_OPTIONS, ...options };
            const origin = request.headers.get('origin');

            // التعامل مع preflight requests
            if (request.method === 'OPTIONS') {
                const response = new NextResponse(null, { status: 200 });

                // التحقق من الأصل
                if (origin && corsOptions.origins?.includes(origin)) {
                    response.headers.set('Access-Control-Allow-Origin', origin);
                } else if (corsOptions.origins?.includes('*')) {
                    response.headers.set('Access-Control-Allow-Origin', '*');
                }

                // إضافة headers
                if (corsOptions.methods) {
                    response.headers.set('Access-Control-Allow-Methods', corsOptions.methods.join(', '));
                }

                if (corsOptions.allowedHeaders) {
                    response.headers.set('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
                }

                if (corsOptions.exposedHeaders) {
                    response.headers.set('Access-Control-Expose-Headers', corsOptions.exposedHeaders.join(', '));
                }

                if (corsOptions.credentials) {
                    response.headers.set('Access-Control-Allow-Credentials', 'true');
                }

                if (corsOptions.maxAge) {
                    response.headers.set('Access-Control-Max-Age', corsOptions.maxAge.toString());
                }

                return response;
            }

            // تنفيذ المعالج الأصلي
            const response = await handler(request, context);

            // إضافة CORS headers للاستجابة
            if (response instanceof NextResponse) {
                // التحقق من الأصل
                if (origin && corsOptions.origins?.includes(origin)) {
                    response.headers.set('Access-Control-Allow-Origin', origin);
                } else if (corsOptions.origins?.includes('*')) {
                    response.headers.set('Access-Control-Allow-Origin', '*');
                }

                // إضافة headers
                if (corsOptions.exposedHeaders) {
                    response.headers.set('Access-Control-Expose-Headers', corsOptions.exposedHeaders.join(', '));
                }

                if (corsOptions.credentials) {
                    response.headers.set('Access-Control-Allow-Credentials', 'true');
                }
            }

            return response;

        } catch (error) {
            return handleServerError(error, 'CORS Middleware');
        }
    };
}

/**
 * Middleware للتعامل مع CORS للمصادقة
 */
export function withAuthCors(
    handler: (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response>
): (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response> {
    return withCors(handler, {
        origins: ['http://localhost:3000', 'https://arkan.app'],
        methods: ['POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'Accept',
            'Origin',
            'X-User-ID',
        ],
        credentials: true,
    });
}

/**
 * Middleware للتعامل مع CORS للكتابة
 */
export function withWritingCors(
    handler: (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response>
): (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response> {
    return withCors(handler, {
        origins: ['http://localhost:3000', 'https://arkan.app'],
        methods: ['POST', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'Accept',
            'Origin',
            'X-User-ID',
        ],
        credentials: true,
    });
}

/**
 * Middleware للتعامل مع CORS للتصدير
 */
export function withExportCors(
    handler: (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response>
): (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response> {
    return withCors(handler, {
        origins: ['http://localhost:3000', 'https://arkan.app'],
        methods: ['POST', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'Accept',
            'Origin',
            'X-User-ID',
        ],
        credentials: true,
    });
}

/**
 * Middleware للتعامل مع CORS العام
 */
export function withGeneralCors(
    handler: (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response>
): (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response> {
    return withCors(handler, {
        origins: ['http://localhost:3000', 'https://arkan.app'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'Accept',
            'Origin',
            'X-User-ID',
            'X-API-Key',
        ],
        credentials: true,
    });
}

/**
 * Middleware للتعامل مع CORS المخصص
 */
export function withCustomCors(
    handler: (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response>,
    origins: string[],
    methods: string[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: string[] = [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'X-User-ID',
    ]
): (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response> {
    return withCors(handler, {
        origins,
        methods,
        allowedHeaders,
        credentials: true,
    });
}
