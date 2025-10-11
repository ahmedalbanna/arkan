/**
 * Validators متخصصة لأنواع مختلفة من البيانات
 * توفر schemas جاهزة للاستخدام مع رسائل خطأ باللغة العربية
 */

import { z } from 'zod';

// Validators أساسية
export const StringValidators = {
    required: z.string().min(1, 'هذا الحقل مطلوب'),
    optional: z.string().optional(),
    email: z.string().email('البريد الإلكتروني غير صحيح'),
    url: z.string().url('الرابط غير صحيح'),
    phone: z.string().regex(/^[\+]?[0-9\s\-\(\)]{10,}$/, 'رقم الهاتف غير صحيح'),
    arabic: z.string().regex(/[\u0600-\u06FF]/, 'يجب أن يحتوي على نص عربي'),
    english: z.string().regex(/[a-zA-Z]/, 'يجب أن يحتوي على نص إنجليزي'),
    alphanumeric: z.string().regex(/^[a-zA-Z0-9\u0600-\u06FF\s]+$/, 'يجب أن يحتوي على أحرف وأرقام فقط'),
    minLength: (min: number) => z.string().min(min, `يجب أن يكون النص ${min} أحرف على الأقل`),
    maxLength: (max: number) => z.string().max(max, `يجب أن يكون النص ${max} أحرف على الأكثر`),
    length: (min: number, max: number) => z.string().min(min).max(max, `يجب أن يكون النص بين ${min} و ${max} أحرف`)
};

export const NumberValidators = {
    required: z.number({ required_error: 'هذا الحقل مطلوب', invalid_type_error: 'يجب أن يكون رقماً' }),
    optional: z.number().optional(),
    positive: z.number().positive('يجب أن يكون الرقم موجباً'),
    negative: z.number().negative('يجب أن يكون الرقم سالباً'),
    nonNegative: z.number().min(0, 'يجب أن يكون الرقم غير سالب'),
    nonPositive: z.number().max(0, 'يجب أن يكون الرقم غير موجب'),
    integer: z.number().int('يجب أن يكون الرقم صحيحاً'),
    float: z.number().finite('يجب أن يكون الرقم عشرياً صحيحاً'),
    min: (min: number) => z.number().min(min, `يجب أن يكون الرقم ${min} على الأقل`),
    max: (max: number) => z.number().max(max, `يجب أن يكون الرقم ${max} على الأكثر`),
    range: (min: number, max: number) => z.number().min(min).max(max, `يجب أن يكون الرقم بين ${min} و ${max}`)
};

export const DateValidators = {
    required: z.date({ required_error: 'هذا الحقل مطلوب', invalid_type_error: 'يجب أن يكون تاريخاً صحيحاً' }),
    optional: z.date().optional(),
    past: z.date().max(new Date(), 'يجب أن يكون التاريخ في الماضي'),
    future: z.date().min(new Date(), 'يجب أن يكون التاريخ في المستقبل'),
    min: (min: Date) => z.date().min(min, `يجب أن يكون التاريخ بعد ${min.toLocaleDateString('ar-SA')}`),
    max: (max: Date) => z.date().max(max, `يجب أن يكون التاريخ قبل ${max.toLocaleDateString('ar-SA')}`),
    range: (min: Date, max: Date) => z.date().min(min).max(max, `يجب أن يكون التاريخ بين ${min.toLocaleDateString('ar-SA')} و ${max.toLocaleDateString('ar-SA')}`)
};

export const BooleanValidators = {
    required: z.boolean({ required_error: 'هذا الحقل مطلوب', invalid_type_error: 'يجب أن يكون صحيح أو خطأ' }),
    optional: z.boolean().optional(),
    true: z.boolean().refine(val => val === true, 'يجب أن يكون صحيحاً'),
    false: z.boolean().refine(val => val === false, 'يجب أن يكون خطأ')
};

// Validators متقدمة
export const ArrayValidators = {
    required: z.array(z.any(), { required_error: 'هذا الحقل مطلوب', invalid_type_error: 'يجب أن يكون قائمة' }),
    optional: z.array(z.any()).optional(),
    minLength: (min: number) => z.array(z.any()).min(min, `يجب أن تحتوي القائمة على ${min} عنصر على الأقل`),
    maxLength: (max: number) => z.array(z.any()).max(max, `يجب أن تحتوي القائمة على ${max} عنصر على الأكثر`),
    length: (min: number, max: number) => z.array(z.any()).min(min).max(max, `يجب أن تحتوي القائمة على ${min} إلى ${max} عنصر`),
    nonEmpty: z.array(z.any()).min(1, 'يجب أن تحتوي القائمة على عنصر واحد على الأقل'),
    unique: z.array(z.any()).refine((arr) => new Set(arr).size === arr.length, 'يجب أن تكون العناصر فريدة')
};

export const ObjectValidators = {
    required: z.object({}, { required_error: 'هذا الحقل مطلوب', invalid_type_error: 'يجب أن يكون كائناً' }),
    optional: z.object({}).optional(),
    strict: z.object({}).strict('يجب أن يحتوي الكائن على الحقول المحددة فقط'),
    passthrough: z.object({}).passthrough(),
    catchall: z.object({}).catchall(z.any())
};

// Validators مخصصة للتطبيق
export const UserValidators = {
    profile: z.object({
        firstName: StringValidators.minLength(2).maxLength(50),
        lastName: StringValidators.minLength(2).maxLength(50),
        email: StringValidators.email,
        phone: StringValidators.phone.optional(),
        dateOfBirth: DateValidators.optional,
        gender: z.enum(['male', 'female', 'other'], { errorMap: () => ({ message: 'يجب أن يكون الجنس ذكر أو أنثى أو آخر' }) }).optional(),
        country: StringValidators.optional,
        city: StringValidators.optional,
        bio: StringValidators.optional
    }),

    login: z.object({
        email: StringValidators.email,
        password: StringValidators.minLength(6)
    }),

    registration: z.object({
        firstName: StringValidators.minLength(2).maxLength(50),
        lastName: StringValidators.minLength(2).maxLength(50),
        email: StringValidators.email,
        password: StringValidators.minLength(8).maxLength(100),
        confirmPassword: z.string(),
        agreeToTerms: BooleanValidators.true
    }).refine((data) => data.password === data.confirmPassword, {
        message: 'كلمة المرور وتأكيدها غير متطابقتين',
        path: ['confirmPassword']
    }),

    passwordReset: z.object({
        email: StringValidators.email,
        newPassword: StringValidators.minLength(8).maxLength(100),
        confirmPassword: z.string()
    }).refine((data) => data.newPassword === data.confirmPassword, {
        message: 'كلمة المرور الجديدة وتأكيدها غير متطابقتين',
        path: ['confirmPassword']
    })
};

export const BusinessValidators = {
    company: z.object({
        name: StringValidators.minLength(2).maxLength(100),
        description: StringValidators.optional,
        website: StringValidators.url.optional(),
        email: StringValidators.email.optional(),
        phone: StringValidators.phone.optional(),
        address: StringValidators.optional,
        city: StringValidators.optional,
        country: StringValidators.optional,
        zipCode: StringValidators.optional,
        industry: StringValidators.optional,
        size: z.enum(['startup', 'small', 'medium', 'large', 'enterprise'], {
            errorMap: () => ({ message: 'يجب أن يكون حجم الشركة من الخيارات المتاحة' })
        }).optional(),
        foundedYear: z.number().int().min(1800).max(new Date().getFullYear()).optional()
    }),

    project: z.object({
        title: StringValidators.minLength(3).maxLength(100),
        description: StringValidators.minLength(10).maxLength(2000),
        startDate: DateValidators.required,
        endDate: DateValidators.optional,
        budget: NumberValidators.positive.optional(),
        status: z.enum(['planning', 'active', 'completed', 'cancelled'], {
            errorMap: () => ({ message: 'يجب أن تكون حالة المشروع من الخيارات المتاحة' })
        }),
        priority: z.enum(['low', 'medium', 'high', 'critical'], {
            errorMap: () => ({ message: 'يجب أن تكون أولوية المشروع من الخيارات المتاحة' })
        }),
        tags: ArrayValidators.optional,
        teamMembers: ArrayValidators.optional
    }).refine((data) => {
        if (data.endDate && data.startDate) {
            return data.endDate > data.startDate;
        }
        return true;
    }, {
        message: 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية',
        path: ['endDate']
    })
};

export const ContentValidators = {
    article: z.object({
        title: StringValidators.minLength(5).maxLength(200),
        content: StringValidators.minLength(100),
        excerpt: StringValidators.optional,
        tags: ArrayValidators.optional,
        category: StringValidators.maxLength(50),
        author: StringValidators.maxLength(100),
        publishDate: DateValidators.optional,
        featured: BooleanValidators.optional,
        status: z.enum(['draft', 'published', 'archived'], {
            errorMap: () => ({ message: 'يجب أن تكون حالة المقال من الخيارات المتاحة' })
        })
    }),

    comment: z.object({
        content: StringValidators.minLength(10).maxLength(1000),
        author: StringValidators.maxLength(100),
        email: StringValidators.email.optional(),
        website: StringValidators.url.optional(),
        parentId: z.string().optional()
    })
};

export const FileValidators = {
    image: z.object({
        name: z.string(),
        size: NumberValidators.positive.max(10 * 1024 * 1024, 'يجب أن يكون حجم الصورة أقل من 10 ميجابايت'),
        type: z.string().refine((type) => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(type), {
            message: 'يجب أن يكون نوع الملف صورة (JPEG, PNG, GIF, WebP)'
        }),
        url: StringValidators.url.optional()
    }),

    document: z.object({
        name: z.string(),
        size: NumberValidators.positive.max(50 * 1024 * 1024, 'يجب أن يكون حجم المستند أقل من 50 ميجابايت'),
        type: z.string().refine((type) => ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(type), {
            message: 'يجب أن يكون نوع الملف مستند (PDF, DOC, DOCX)'
        }),
        url: StringValidators.url.optional()
    })
};

export const FormValidators = {
    contact: z.object({
        name: StringValidators.minLength(2).maxLength(100),
        email: StringValidators.email,
        subject: StringValidators.minLength(5).maxLength(200),
        message: StringValidators.minLength(10).maxLength(2000),
        phone: StringValidators.phone.optional(),
        company: StringValidators.optional
    }),

    feedback: z.object({
        rating: NumberValidators.integer.min(1).max(5),
        comment: StringValidators.optional.maxLength(1000),
        category: z.enum(['bug', 'feature', 'improvement', 'other'], {
            errorMap: () => ({ message: 'يجب أن تكون فئة التعليق من الخيارات المتاحة' })
        }),
        email: StringValidators.email.optional()
    }),

    newsletter: z.object({
        email: StringValidators.email,
        name: StringValidators.optional.maxLength(100),
        interests: ArrayValidators.optional.maxLength(5),
        frequency: z.enum(['daily', 'weekly', 'monthly'], {
            errorMap: () => ({ message: 'يجب أن تكون تكرار النشرة من الخيارات المتاحة' })
        }).optional()
    })
};

// Validators للتحقق من الصحة المتقدمة
export const AdvancedValidators = {
    password: z.string()
        .min(8, 'يجب أن تكون كلمة المرور 8 أحرف على الأقل')
        .max(100, 'يجب أن تكون كلمة المرور 100 حرف على الأكثر')
        .regex(/[A-Z]/, 'يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل')
        .regex(/[a-z]/, 'يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل')
        .regex(/[0-9]/, 'يجب أن تحتوي كلمة المرور على رقم واحد على الأقل')
        .regex(/[^A-Za-z0-9]/, 'يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل'),

    username: z.string()
        .min(3, 'يجب أن يكون اسم المستخدم 3 أحرف على الأقل')
        .max(30, 'يجب أن يكون اسم المستخدم 30 حرف على الأكثر')
        .regex(/^[a-zA-Z0-9_]+$/, 'يجب أن يحتوي اسم المستخدم على أحرف وأرقام وشرطة سفلية فقط'),

    slug: z.string()
        .min(1, 'يجب أن يكون الرابط المختصر حرف واحد على الأقل')
        .max(100, 'يجب أن يكون الرابط المختصر 100 حرف على الأكثر')
        .regex(/^[a-z0-9-]+$/, 'يجب أن يحتوي الرابط المختصر على أحرف صغيرة وأرقام وشرطات فقط'),

    color: z.string()
        .regex(/^#[0-9A-Fa-f]{6}$/, 'يجب أن يكون اللون بصيغة HEX صحيحة (#RRGGBB)'),

    timezone: z.string()
        .refine((tz) => {
            try {
                Intl.DateTimeFormat(undefined, { timeZone: tz });
                return true;
            } catch {
                return false;
            }
        }, 'يجب أن يكون المنطقة الزمنية صحيحة'),

    language: z.string()
        .refine((lang) => {
            try {
                Intl.getCanonicalLocales(lang);
                return true;
            } catch {
                return false;
            }
        }, 'يجب أن تكون اللغة صحيحة')
};

export default {
    StringValidators,
    NumberValidators,
    DateValidators,
    BooleanValidators,
    ArrayValidators,
    ObjectValidators,
    UserValidators,
    BusinessValidators,
    ContentValidators,
    FileValidators,
    FormValidators,
    AdvancedValidators
};
