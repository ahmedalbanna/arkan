/**
 * نظام API مبسط وموحد
 *
 * يحتوي على جميع الوظائف الأساسية المطلوبة لـ API
 * بدون التعقيدات غير الضرورية
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// أنواع البيانات الأساسية
export interface ApiContext {
  request: NextRequest;
  user?: {
    id: string;
    email: string;
    role: string;
  };
  params: { [key: string]: string };
}

export interface ApiOptions {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  validateBody?: z.ZodSchema;
  validateQuery?: z.ZodSchema;
  validateParams?: z.ZodSchema;
}

export type ApiHandler = (context: ApiContext) => Promise<NextResponse>;

// نظام المصادقة المبسط
async function authenticateRequest(request: NextRequest): Promise<ApiContext['user'] | null> {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return null;

    // هنا يمكن إضافة منطق التحقق من الرمز المميز
    // للآن سنعود بـ null للتبسيط
    return null;
  } catch {
    return null;
  }
}

// نظام التحقق من البيانات المبسط
async function validateData<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>,
  source: 'body' | 'query' | 'params' = 'body',
  params?: { [key: string]: string }
): Promise<T> {
  let data: unknown;

  switch (source) {
    case 'body':
      data = await request.json().catch(() => ({}));
      break;
    case 'query':
      const url = new URL(request.url);
      data = Object.fromEntries(url.searchParams);
      break;
    case 'params':
      data = params || {};
      break;
  }

  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`Validation error: ${result.error.errors.map(e => e.message).join(', ')}`);
  }

  return result.data;
}

// نظام الاستجابات المبسط
export const ApiResponse = {
  success: <T>(data: T, status = 200) =>
    NextResponse.json({ success: true, data }, { status }),

  error: (message: string, status = 500, code?: string) =>
    NextResponse.json({
      success: false,
      error: { message, code, status }
    }, { status }),

  created: <T>(data: T) =>
    NextResponse.json({ success: true, data }, { status: 201 }),

  notFound: (message = 'Not found') =>
    NextResponse.json({
      success: false,
      error: { message, code: 'NOT_FOUND', status: 404 }
    }, { status: 404 }),

  unauthorized: (message = 'Unauthorized') =>
    NextResponse.json({
      success: false,
      error: { message, code: 'UNAUTHORIZED', status: 401 }
    }, { status: 401 }),

  forbidden: (message = 'Forbidden') =>
    NextResponse.json({
      success: false,
      error: { message, code: 'FORBIDDEN', status: 403 }
    }, { status: 403 }),

  badRequest: (message = 'Bad request') =>
    NextResponse.json({
      success: false,
      error: { message, code: 'BAD_REQUEST', status: 400 }
    }, { status: 400 }),
};

// الدالة الرئيسية لإنشاء API handlers
export function createApiHandler(
  handler: ApiHandler,
  options: ApiOptions = {}
): (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse> {
  return async (request: NextRequest, context: { params: { [key: string]: string } }) => {
    try {
      // التحقق من المصادقة
      if (options.requireAuth || options.requireAdmin) {
        const user = await authenticateRequest(request);
        if (!user) {
          return ApiResponse.unauthorized();
        }

        // التحقق من الصلاحيات الإدارية
        if (options.requireAdmin && user.role !== 'admin') {
          return ApiResponse.forbidden();
        }

        // إضافة المستخدم إلى السياق
        context.user = user;
      }

      // التحقق من البيانات
      if (options.validateBody) {
        await validateData(request, options.validateBody, 'body');
      }
      if (options.validateQuery) {
        await validateData(request, options.validateQuery, 'query');
      }
      if (options.validateParams) {
        await validateData(request, options.validateParams, 'params', context.params);
      }

      // تنفيذ الـ handler
      return await handler(context);
    } catch (error) {
      console.error('API Error:', error);

      if (error instanceof Error) {
        if (error.message.includes('Validation error')) {
          return ApiResponse.badRequest(error.message);
        }
        return ApiResponse.error(error.message);
      }

      return ApiResponse.error('Internal server error');
    }
  };
}

// دوال مساعدة للاستخدام السريع
export const withAuth = (handler: ApiHandler) =>
  createApiHandler(handler, { requireAuth: true });

export const withAdmin = (handler: ApiHandler) =>
  createApiHandler(handler, { requireAdmin: true });

export const withValidation = <T>(handler: ApiHandler, schema: z.ZodSchema<T>) =>
  createApiHandler(handler, { validateBody: schema });

export const withAuthAndValidation = <T>(handler: ApiHandler, schema: z.ZodSchema<T>) =>
  createApiHandler(handler, { requireAuth: true, validateBody: schema });

export const withAdminAndValidation = <T>(handler: ApiHandler, schema: z.ZodSchema<T>) =>
  createApiHandler(handler, { requireAdmin: true, validateBody: schema });

// دوال مساعدة للتحقق من البيانات
export const validateBody = async <T>(request: NextRequest, schema: z.ZodSchema<T>): Promise<T> => {
  return validateData(request, schema, 'body');
};

export const validateQuery = async <T>(request: NextRequest, schema: z.ZodSchema<T>): Promise<T> => {
  return validateData(request, schema, 'query');
};

export const validateParams = async <T>(params: { [key: string]: string }, schema: z.ZodSchema<T>): Promise<T> => {
  const result = schema.safeParse(params);
  if (!result.success) {
    throw new Error(`Validation error: ${result.error.errors.map(e => e.message).join(', ')}`);
  }
  return result.data;
};
