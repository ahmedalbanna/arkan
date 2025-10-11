/**
 * نظام Validation موحد
 * يوفر واجهة موحدة لجميع عمليات التحقق من صحة البيانات
 */

import { z } from 'zod';
import { EnhancedError } from '../types/error-types';
import { EnhancedErrorHandler } from '../utils/enhanced-error-handler';
import { ErrorMonitoringService } from '../utils/error-monitoring';

// أنواع البيانات الأساسية
export interface ValidationResult<T = any> {
    success: boolean;
    data?: T;
    errors?: ValidationError[];
    warnings?: ValidationWarning[];
}

export interface ValidationError {
    field: string;
    message: string;
    code: string;
    severity: 'error' | 'warning';
    path?: (string | number)[];
    value?: any;
}

export interface ValidationWarning {
    field: string;
    message: string;
    code: string;
    suggestion?: string;
}

export interface ValidationOptions {
    strict?: boolean;
    allowUnknown?: boolean;
    stripUnknown?: boolean;
    abortEarly?: boolean;
    enableWarnings?: boolean;
    customMessages?: Record<string, string>;
    context?: any;
}

// فئة رئيسية للتحقق من الصحة
export class UnifiedValidator {
    private errorMonitoringService: ErrorMonitoringService;

    constructor() {
        this.errorMonitoringService = ErrorMonitoringService.getInstance();
    }

    /**
     * التحقق من صحة البيانات باستخدام Zod schema
     */
    async validate<T>(
        schema: z.ZodSchema<T>,
        data: unknown,
        options: ValidationOptions = {}
    ): Promise<ValidationResult<T>> {
        const {
            strict = false,
            allowUnknown = false,
            stripUnknown = false,
            abortEarly = false,
            enableWarnings = true,
            customMessages = {},
            context = {}
        } = options;

        try {
            // التحقق من الصحة
            const result = schema.safeParse(data);

            if (result.success) {
                const warnings = enableWarnings ? this.generateWarnings(result.data, schema) : [];

                return {
                    success: true,
                    data: result.data,
                    warnings
                };
            } else {
                const errors = this.formatZodErrors(result.error, customMessages);

                // تسجيل الأخطاء
                await this.logValidationErrors(errors, context);

                return {
                    success: false,
                    errors
                };
            }
        } catch (error) {
            // معالجة الأخطاء غير المتوقعة
            const unexpectedError = await this.handleUnexpectedError(error, context);

            return {
                success: false,
                errors: [unexpectedError]
            };
        }
    }

    /**
     * التحقق من صحة البيانات مع إعادة المحاولة
     */
    async validateWithRetry<T>(
        schema: z.ZodSchema<T>,
        data: unknown,
        options: ValidationOptions & { maxRetries?: number } = {}
    ): Promise<ValidationResult<T>> {
        const { maxRetries = 3, ...validationOptions } = options;

        const result = await EnhancedErrorHandler.handleWithRetry(
            async () => {
                return await this.validate(schema, data, validationOptions);
            },
            {
                operationId: 'validation-with-retry',
                category: 'ai_generation',
                severity: 'low'
            }
        );

        if (!result.success) {
            return {
                success: false,
                errors: [{
                    field: 'validation',
                    message: 'فشل التحقق من صحة البيانات',
                    code: 'VALIDATION_FAILED',
                    severity: 'error'
                }]
            };
        }

        return result;
    }

    /**
     * التحقق من صحة البيانات الجزئية
     */
    async validatePartial<T>(
        schema: z.ZodSchema<T>,
        data: unknown,
        options: ValidationOptions = {}
    ): Promise<ValidationResult<Partial<T>>> {
        // استخدام schema جزئي مبسط
        const partialSchema = z.object({}).partial();
        const result = await this.validate(partialSchema, data, options);
        return result as unknown as ValidationResult<Partial<T>>;
    }

    /**
     * التحقق من صحة البيانات مع تحويل الأنواع
     */
    async validateAndTransform<T, U>(
        schema: z.ZodSchema<T>,
        transformFn: (data: T) => U,
        data: unknown,
        options: ValidationOptions = {}
    ): Promise<ValidationResult<U>> {
        const validationResult = await this.validate(schema, data, options);

        if (!validationResult.success) {
            return validationResult as unknown as ValidationResult<U>;
        }

        try {
            const transformedData = transformFn(validationResult.data!);
            return {
                success: true,
                data: transformedData,
                warnings: validationResult.warnings
            };
        } catch (transformError) {
            return {
                success: false,
                errors: [{
                    field: 'transform',
                    message: 'فشل تحويل البيانات',
                    code: 'TRANSFORM_FAILED',
                    severity: 'error'
                }]
            };
        }
    }

    /**
     * التحقق من صحة البيانات المتعددة
     */
    async validateMultiple<T>(
        validations: Array<{
            schema: z.ZodSchema<T>;
            data: unknown;
            options?: ValidationOptions;
        }>
    ): Promise<ValidationResult<T[]>> {
        const results = await Promise.all(
            validations.map(({ schema, data, options }) =>
                this.validate(schema, data, options)
            )
        );

        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];
        const validData: T[] = [];

        results.forEach((result, index) => {
            if (result.success) {
                validData.push(result.data!);
                if (result.warnings) {
                    warnings.push(...result.warnings);
                }
            } else {
                if (result.errors) {
                    errors.push(...result.errors.map(error => ({
                        ...error,
                        field: `${index}.${error.field}`
                    })));
                }
            }
        });

        if (errors.length > 0) {
            return {
                success: false,
                errors
            };
        }

        return {
            success: true,
            data: validData,
            warnings
        };
    }

    /**
     * تنسيق أخطاء Zod
     */
    private formatZodErrors(
        error: z.ZodError,
        customMessages: Record<string, string> = {}
    ): ValidationError[] {
        return error.errors.map(zodError => {
            const field = zodError.path.join('.');
            const code = zodError.code;
            const message = customMessages[field] || zodError.message;

            return {
                field,
                message,
                code,
                severity: 'error',
                path: zodError.path,
                value: undefined // ZodIssue لا يحتوي على input property مباشرة
            };
        });
    }

    /**
     * توليد تحذيرات للبيانات
     */
    private generateWarnings<T>(
        data: T,
        schema: z.ZodSchema<T>
    ): ValidationWarning[] {
        const warnings: ValidationWarning[] = [];

        // تحذيرات عامة
        if (typeof data === 'object' && data !== null) {
            const obj = data as Record<string, any>;

            // تحذير للبيانات الفارغة
            Object.entries(obj).forEach(([key, value]) => {
                if (value === null || value === undefined || value === '') {
                    warnings.push({
                        field: key,
                        message: 'هذا الحقل فارغ',
                        code: 'EMPTY_FIELD',
                        suggestion: 'تأكد من ملء جميع الحقول المطلوبة'
                    });
                }
            });
        }

        return warnings;
    }

    /**
     * تسجيل أخطاء التحقق من الصحة
     */
    private async logValidationErrors(
        errors: ValidationError[],
        context: any
    ): Promise<void> {
        try {
            const enhancedError: EnhancedError = {
                code: 'VALIDATION_ERROR' as keyof typeof import('../types/error-types').ERROR_MESSAGES,
                message: `فشل التحقق من صحة البيانات: ${errors.length} خطأ`,
                category: 'ai_generation',
                severity: 'low',
                userMessage: 'البيانات المدخلة غير صحيحة',
                userGuidance: 'يرجى مراجعة البيانات المدخلة والمحاولة مرة أخرى',
                suggestedActions: ['مراجعة البيانات المدخلة', 'التأكد من صحة التنسيق', 'المحاولة مرة أخرى'],
                technicalDetails: JSON.stringify(errors, null, 2),
                isRetryable: true,
                retryAfter: 1,
                fallbackAvailable: false,
                timestamp: new Date().toISOString(),
                context: {
                    validationErrors: errors,
                    userContext: context,
                    validationSystem: true
                }
            };

            this.errorMonitoringService.recordError(enhancedError);
        } catch (loggingError) {
            console.error('Failed to log validation errors:', loggingError);
        }
    }

    /**
     * معالجة الأخطاء غير المتوقعة
     */
    private async handleUnexpectedError(
        error: unknown,
        context: any
    ): Promise<ValidationError> {
        const errorMessage = error instanceof Error ? error.message : String(error);

        return {
            field: 'unexpected',
            message: `خطأ غير متوقع في التحقق من الصحة: ${errorMessage}`,
            code: 'UNEXPECTED_ERROR',
            severity: 'error'
        };
    }
}

// إنشاء instance واحد للنظام
export const unifiedValidator = new UnifiedValidator();

// دوال مساعدة للاستخدام المباشر
export async function validate<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    options?: ValidationOptions
): Promise<ValidationResult<T>> {
    return await unifiedValidator.validate(schema, data, options);
}

export async function validateWithRetry<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    options?: ValidationOptions & { maxRetries?: number }
): Promise<ValidationResult<T>> {
    return await unifiedValidator.validateWithRetry(schema, data, options);
}

export async function validatePartial<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    options?: ValidationOptions
): Promise<ValidationResult<Partial<T>>> {
    return await unifiedValidator.validatePartial(schema, data, options);
}

export async function validateAndTransform<T, U>(
    schema: z.ZodSchema<T>,
    transformFn: (data: T) => U,
    data: unknown,
    options?: ValidationOptions
): Promise<ValidationResult<U>> {
    return await unifiedValidator.validateAndTransform(schema, transformFn, data, options);
}

export async function validateMultiple<T>(
    validations: Array<{
        schema: z.ZodSchema<T>;
        data: unknown;
        options?: ValidationOptions;
    }>
): Promise<ValidationResult<T[]>> {
    return await unifiedValidator.validateMultiple(validations);
}

export default unifiedValidator;
