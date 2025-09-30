/**
 * Base API Handler
 *
 * هذا الملف يحتوي على المعالج الأساسي لجميع API endpoints
 * يوفر بنية موحدة لمعالجة الطلبات والاستجابات
 */

import { createApiResponseEnhanced, handleApiErrorEnhanced } from '@/lib/core/api';
import { z } from 'zod';
import type {
    ApiHandlerContext,
    AuthContext,
    ValidationError
} from './types/api-types';

export abstract class BaseApiHandler<TInput = any, TOutput = any> {
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
            return createApiResponseEnhanced(result, 200);
        } catch (error) {
            return handleApiErrorEnhanced(error);
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
        details?: any
    ): Promise<void> {
        // يمكن إضافة نظام تسجيل هنا
        console.log(`Operation: ${operation}`, {
            userId: context.user.id,
            endpoint: context.request.url,
            details
        });
    }
}

/**
 * معالج API للعمليات البسيطة (GET)
 */
export abstract class SimpleApiHandler<TOutput = any> {
    protected abstract processRequest(context: ApiHandlerContext): Promise<TOutput>;

    async handle(context: ApiHandlerContext): Promise<Response> {
        try {
            const result = await this.processRequest(context);
            return createApiResponseEnhanced(result, 200);
        } catch (error) {
            return handleApiErrorEnhanced(error);
        }
    }
}

/**
 * معالج API للعمليات المعقدة (POST/PUT/DELETE)
 */
export abstract class ComplexApiHandler<TInput = any, TOutput = any> extends BaseApiHandler<TInput, TOutput> {
    protected abstract creditCost?: number;
    protected abstract requiresAdmin?: boolean;

    async handle(context: ApiHandlerContext): Promise<Response> {
        try {
            // التحقق من الصلاحيات الإدارية
            if (this.requiresAdmin && context.user.role !== 'admin') {
                return handleApiErrorEnhanced({
                    code: 'FORBIDDEN',
                    message: 'Admin access required'
                }, 403);
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

            return createApiResponseEnhanced(result, 200);
        } catch (error) {
            return handleApiErrorEnhanced(error);
        }
    }
}

/**
 * معالج API للعمليات التي تتطلب خصم ائتمانات
 */
export abstract class CreditBasedApiHandler<TInput = any, TOutput = any> extends ComplexApiHandler<TInput, TOutput> {
    protected abstract creditCost: number;

    async handle(context: ApiHandlerContext): Promise<Response> {
        try {
            // التحقق من صحة البيانات
            const validatedData = await this.validateInput(context.request);

            // خصم الائتمانات
            if (this.creditCost > 0) {
                await this.deductCredits(context.user.id, this.creditCost);
            }

            // معالجة الطلب
            const result = await this.processRequest(validatedData, context);

            // تسجيل العملية
            await this.logOperation(context, 'credit_based_api_call', {
                creditCost: this.creditCost
            });

            return createApiResponseEnhanced(result, 200);
        } catch (error) {
            return handleApiErrorEnhanced(error);
        }
    }

    /**
     * خصم الائتمانات
     */
    private async deductCredits(userId: string, amount: number): Promise<void> {
        // يمكن استيراد خدمة الائتمانات هنا
        // await deductCredit(userId, amount);
        console.log(`Deducting ${amount} credits from user ${userId}`);
    }
}
