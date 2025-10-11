/**
 * نظام Validation موحد - ملف الفهرس الرئيسي
 * يوفر واجهة موحدة لجميع عمليات التحقق من صحة البيانات
 */

// Export النظام الرئيسي
export {
    UnifiedValidator,
    unifiedValidator,
    validate, validateAndTransform,
    validateMultiple, validatePartial, validateWithRetry
} from './unified-validator';

// Export أنواع البيانات
export type {
    ValidationError, ValidationOptions, ValidationResult, ValidationWarning
} from './unified-validator';

// Export Error Formatter
export {
    FormattedValidationError,
    FormattedValidationWarning, ValidationErrorFormatter
} from './error-formatter';

// Export Validators المتخصصة
export {
    AdvancedValidators, ArrayValidators, BooleanValidators, BusinessValidators,
    ContentValidators, DateValidators, FileValidators,
    FormValidators, NumberValidators, ObjectValidators, StringValidators, UserValidators
} from './validators';

// Export Schemas الأساسية من validation-schemas
export {
    AIRequestSchema, ComplexityLevelSchema, ContentTypeSchema, ContextAnalysisSchema, EmailSchema, EnhancedErrorSchema,
    // Error Schemas
    ErrorCategorySchema,
    ErrorSeveritySchema,
    // Export Schemas
    ExportConfigSchema, FormDataSchema, ISODateSchema, MemoryConfigSchema,
    // Memory Schemas
    MemoryStatsSchema,
    // AI Schemas
    ModelConfigSchema,
    // Common Schemas
    NonEmptyStringSchema, NonNegativeNumberSchema, PDFExportSchema, PercentageSchema,
    // Performance Schemas
    PerformanceMetricsSchema, PositiveNumberSchema, TargetAudienceSchema, UploadConfigSchema,
    // File Schemas
    UploadedFileSchema, UrlSchema,
    // User Input Schemas
    UserInputSchema, WordExportSchema, mergeSchemas, partialValidate,
    // Utility Functions
    safeValidate,
    validateWithArabicErrors
} from '../schemas/validation-schemas';

// دوال مساعدة للاستخدام السريع
export const QuickValidators = {
    // التحقق من صحة البريد الإلكتروني
    email: (value: string) => {
        const schema = StringValidators.email;
        return schema.safeParse(value);
    },

    // التحقق من صحة الرقم
    number: (value: any) => {
        const schema = NumberValidators.required;
        return schema.safeParse(value);
    },

    // التحقق من صحة التاريخ
    date: (value: any) => {
        const schema = DateValidators.required;
        return schema.safeParse(value);
    },

    // التحقق من صحة النص المطلوب
    requiredString: (value: string) => {
        const schema = StringValidators.required;
        return schema.safeParse(value);
    },

    // التحقق من صحة كلمة المرور
    password: (value: string) => {
        const schema = AdvancedValidators.password;
        return schema.safeParse(value);
    },

    // التحقق من صحة اسم المستخدم
    username: (value: string) => {
        const schema = AdvancedValidators.username;
        return schema.safeParse(value);
    },

    // التحقق من صحة الرابط
    url: (value: string) => {
        const schema = StringValidators.url;
        return schema.safeParse(value);
    },

    // التحقق من صحة رقم الهاتف
    phone: (value: string) => {
        const schema = StringValidators.phone;
        return schema.safeParse(value);
    }
};

// دوال مساعدة للتحقق من صحة النماذج
export const FormValidators = {
    // التحقق من صحة نموذج المستخدم
    userRegistration: (data: any) => {
        return UserValidators.registration.safeParse(data);
    },

    // التحقق من صحة نموذج تسجيل الدخول
    userLogin: (data: any) => {
        return UserValidators.login.safeParse(data);
    },

    // التحقق من صحة نموذج الشركة
    company: (data: any) => {
        return BusinessValidators.company.safeParse(data);
    },

    // التحقق من صحة نموذج المشروع
    project: (data: any) => {
        return BusinessValidators.project.safeParse(data);
    },

    // التحقق من صحة نموذج المقال
    article: (data: any) => {
        return ContentValidators.article.safeParse(data);
    },

    // التحقق من صحة نموذج التعليق
    comment: (data: any) => {
        return ContentValidators.comment.safeParse(data);
    },

    // التحقق من صحة نموذج الاتصال
    contact: (data: any) => {
        return FormValidators.contact.safeParse(data);
    },

    // التحقق من صحة نموذج التغذية الراجعة
    feedback: (data: any) => {
        return FormValidators.feedback.safeParse(data);
    }
};

// دوال مساعدة للتحقق من صحة الملفات
export const FileValidators = {
    // التحقق من صحة الصورة
    image: (file: any) => {
        return FileValidators.image.safeParse(file);
    },

    // التحقق من صحة المستند
    document: (file: any) => {
        return FileValidators.document.safeParse(file);
    }
};

// دوال مساعدة للتحقق من صحة البيانات المتقدمة
export const AdvancedValidators = {
    // التحقق من صحة كلمة المرور القوية
    strongPassword: (password: string) => {
        return AdvancedValidators.password.safeParse(password);
    },

    // التحقق من صحة الرابط المختصر
    slug: (slug: string) => {
        return AdvancedValidators.slug.safeParse(slug);
    },

    // التحقق من صحة اللون
    color: (color: string) => {
        return AdvancedValidators.color.safeParse(color);
    },

    // التحقق من صحة المنطقة الزمنية
    timezone: (timezone: string) => {
        return AdvancedValidators.timezone.safeParse(timezone);
    },

    // التحقق من صحة اللغة
    language: (language: string) => {
        return AdvancedValidators.language.safeParse(language);
    }
};

// دوال مساعدة للتحقق من صحة البيانات المخصصة
export const CustomValidators = {
    // التحقق من صحة البيانات مع رسائل مخصصة
    withCustomMessages: <T>(schema: z.ZodSchema<T>, messages: Record<string, string>) => {
        return schema.refine(() => true, {
            message: (ctx) => messages[ctx.path.join('.')] || 'خطأ في التحقق من الصحة'
        });
    },

    // التحقق من صحة البيانات مع التحقق المخصص
    withCustomValidation: <T>(schema: z.ZodSchema<T>, validator: (data: T) => boolean, message: string) => {
        return schema.refine(validator, { message });
    },

    // التحقق من صحة البيانات مع التحقق غير المتزامن
    withAsyncValidation: <T>(schema: z.ZodSchema<T>, validator: (data: T) => Promise<boolean>, message: string) => {
        return schema.refine(validator, { message });
    }
};

// دوال مساعدة للتحقق من صحة البيانات الجماعية
export const BatchValidators = {
    // التحقق من صحة عدة بيانات
    validateMultiple: async <T>(validations: Array<{
        schema: z.ZodSchema<T>;
        data: unknown;
        options?: ValidationOptions;
    }>) => {
        return await validateMultiple(validations);
    },

    // التحقق من صحة البيانات مع إعادة المحاولة
    validateWithRetry: async <T>(
        schema: z.ZodSchema<T>,
        data: unknown,
        options?: ValidationOptions & { maxRetries?: number }
    ) => {
        return await validateWithRetry(schema, data, options);
    },

    // التحقق من صحة البيانات الجزئية
    validatePartial: async <T>(
        schema: z.ZodSchema<T>,
        data: unknown,
        options?: ValidationOptions
    ) => {
        return await validatePartial(schema, data, options);
    }
};

// دوال مساعدة للتحقق من صحة البيانات مع التحويل
export const TransformValidators = {
    // التحقق من صحة البيانات مع التحويل
    validateAndTransform: async <T, U>(
        schema: z.ZodSchema<T>,
        transformFn: (data: T) => U,
        data: unknown,
        options?: ValidationOptions
    ) => {
        return await validateAndTransform(schema, transformFn, data, options);
    },

    // التحقق من صحة البيانات مع التحويل غير المتزامن
    validateAndTransformAsync: async <T, U>(
        schema: z.ZodSchema<T>,
        transformFn: (data: T) => Promise<U>,
        data: unknown,
        options?: ValidationOptions
    ) => {
        const validationResult = await validate(schema, data, options);

        if (!validationResult.success) {
            return validationResult as ValidationResult<U>;
        }

        try {
            const transformedData = await transformFn(validationResult.data!);
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
};

// Export جميع الدوال المساعدة
export {
    AdvancedValidators, BatchValidators, CustomValidators, FileValidators, FormValidators, QuickValidators, TransformValidators
};

// Export النظام ككل
export default {
    UnifiedValidator,
    unifiedValidator,
    ValidationErrorFormatter,
    validate,
    validateWithRetry,
    validatePartial,
    validateAndTransform,
    validateMultiple,
    QuickValidators,
    FormValidators,
    FileValidators,
    AdvancedValidators,
    CustomValidators,
    BatchValidators,
    TransformValidators
};
