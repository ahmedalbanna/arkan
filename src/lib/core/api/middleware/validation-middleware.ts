/**
 * Middleware للتحقق من البيانات
 *
 * هذا الملف يحتوي على middleware موحد للتحقق من البيانات
 * باستخدام Zod schemas
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError, ZodSchema } from 'zod';
import { handleServerError } from '../../error-handling/server-errors';

/**
 * خيارات middleware التحقق
 */
export interface ValidationMiddlewareOptions {
    /** Schema للتحقق من البيانات */
    schema: ZodSchema;
    /** حقل البيانات في الطلب */
    dataField?: 'body' | 'query' | 'params';
    /** هل التحقق اختياري */
    optional?: boolean;
    /** رسالة خطأ مخصصة */
    errorMessage?: string;
}

/**
 * معالج API مع التحقق
 */
export type ValidatedApiHandler<T = any> = (
    request: NextRequest,
    context: { params: { [key: string]: string } },
    validatedData: T
) => Promise<NextResponse | Response>;

/**
 * Middleware للتحقق من البيانات
 */
export function withValidation<T = any>(
    handler: ValidatedApiHandler<T>,
    options: ValidationMiddlewareOptions
): (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response> {
    return async (request: NextRequest, context: { params: { [key: string]: string } }) => {
        try {
            const { schema, dataField = 'body', optional = false, errorMessage } = options;

            let dataToValidate: any;

            // الحصول على البيانات حسب الحقل المحدد
            switch (dataField) {
                case 'body':
                    try {
                        dataToValidate = await request.json();
                    } catch (error) {
                        if (!optional) {
                            return handleServerError(
                                'Invalid JSON in request body',
                                'Validation'
                            );
                        }
                        dataToValidate = {};
                    }
                    break;

                case 'query':
                    const url = new URL(request.url);
                    dataToValidate = Object.fromEntries(url.searchParams);
                    break;

                case 'params':
                    dataToValidate = context.params;
                    break;

                default:
                    dataToValidate = {};
            }

            // التحقق من البيانات إذا لم تكن اختيارية أو موجودة
            if (!optional || (dataToValidate && Object.keys(dataToValidate).length > 0)) {
                try {
                    const validatedData = schema.parse(dataToValidate);
                    return await handler(request, context, validatedData);
                } catch (error) {
                    if (error instanceof ZodError) {
                        const errorResponse = {
                            message: errorMessage || 'Validation failed',
                            errors: error.errors.map(err => ({
                                field: err.path.join('.'),
                                message: err.message,
                                code: err.code,
                            })),
                        };

                        return handleServerError(
                            errorResponse.message,
                            'Validation'
                        );
                    }
                    throw error;
                }
            } else {
                // البيانات اختيارية ولا توجد
                return await handler(request, context, {} as T);
            }

        } catch (error) {
            return handleServerError(error as Error, 'Validation Middleware');
        }
    };
}

/**
 * Middleware للتحقق من body
 */
export function withBodyValidation<T = any>(
    handler: ValidatedApiHandler<T>,
    schema: ZodSchema<T>,
    options: Partial<ValidationMiddlewareOptions> = {}
): (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response> {
    return withValidation(handler, {
        schema,
        dataField: 'body',
        ...options,
    });
}

/**
 * Middleware للتحقق من query parameters
 */
export function withQueryValidation<T = any>(
    handler: ValidatedApiHandler<T>,
    schema: ZodSchema<T>,
    options: Partial<ValidationMiddlewareOptions> = {}
): (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response> {
    return withValidation(handler, {
        schema,
        dataField: 'query',
        ...options,
    });
}

/**
 * Middleware للتحقق من params
 */
export function withParamsValidation<T = any>(
    handler: ValidatedApiHandler<T>,
    schema: ZodSchema<T>,
    options: Partial<ValidationMiddlewareOptions> = {}
): (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response> {
    return withValidation(handler, {
        schema,
        dataField: 'params',
        ...options,
    });
}

/**
 * Middleware للتحقق الاختياري
 */
export function withOptionalValidation<T = any>(
    handler: ValidatedApiHandler<T>,
    schema: ZodSchema<T>,
    dataField: 'body' | 'query' | 'params' = 'body'
): (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response> {
    return withValidation(handler, {
        schema,
        dataField,
        optional: true,
    });
}

/**
 * Middleware للتحقق من عدة حقول
 */
export function withMultiValidation<T = any>(
    handler: ValidatedApiHandler<T>,
    validations: Array<{
        field: 'body' | 'query' | 'params';
        schema: ZodSchema;
        optional?: boolean;
    }>
): (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response> {
    return async (request: NextRequest, context: { params: { [key: string]: string } }) => {
        try {
            const validatedData: any = {};

            for (const validation of validations) {
                const { field, schema, optional = false } = validation;

                let dataToValidate: any;

                switch (field) {
                    case 'body':
                        try {
                            dataToValidate = await request.json();
                        } catch (error) {
                            if (!optional) {
                                return handleServerError(
                                    'Invalid JSON in request body',
                                    'Validation'
                                );
                            }
                            dataToValidate = {};
                        }
                        break;

                    case 'query':
                        const url = new URL(request.url);
                        dataToValidate = Object.fromEntries(url.searchParams);
                        break;

                    case 'params':
                        dataToValidate = context.params;
                        break;

                    default:
                        dataToValidate = {};
                }

                if (!optional || (dataToValidate && Object.keys(dataToValidate).length > 0)) {
                    try {
                        const fieldData = schema.parse(dataToValidate);
                        validatedData[field] = fieldData;
                    } catch (error) {
                        if (error instanceof ZodError) {
                            const errorResponse = {
                                message: `Validation failed for ${field}`,
                                errors: error.errors.map(err => ({
                                    field: err.path.join('.'),
                                    message: err.message,
                                    code: err.code,
                                })),
                            };

                            return handleServerError(
                                errorResponse.message,
                                'Validation'
                            );
                        }
                        throw error;
                    }
                }
            }

            return await handler(request, context, validatedData as T);

        } catch (error) {
            return handleServerError(error, 'Multi-Validation Middleware');
        }
    };
}
