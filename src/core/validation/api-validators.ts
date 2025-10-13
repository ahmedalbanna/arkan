/**
 * نظام التحقق من صحة البيانات الموحد
 *
 * هذا الملف يحتوي على جميع schemas المستخدمة في نظام API الموحد
 */

import { z } from 'zod';

/**
 * Schemas أساسية مشتركة
 */
export const BaseSchemas = {
    // معرف المستخدم
    userId: z.string().min(1, 'User ID is required'),

    // معرف المشروع
    projectId: z.string().min(1, 'Project ID is required'),

    // معرف الفريق
    teamId: z.string().min(1, 'Team ID is required'),

    // البريد الإلكتروني
    email: z.string().email('Invalid email address'),

    // كلمة المرور
    password: z.string().min(6, 'Password must be at least 6 characters'),

    // الاسم
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),

    // العنوان
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),

    // الوصف
    description: z.string().max(1000, 'Description too long'),

    // النص
    text: z.string().min(1, 'Text is required'),

    // التاريخ
    date: z.string().datetime('Invalid date format'),

    // الرقم
    number: z.number().int('Must be an integer'),

    // الرقم الإيجابي
    positiveNumber: z.number().positive('Must be a positive number'),

    // الرقم غير السالب
    nonNegativeNumber: z.number().min(0, 'Must be non-negative'),

    // القائمة
    array: z.array(z.any()),

    // القائمة غير الفارغة
    nonEmptyArray: z.array(z.any()).min(1, 'Array cannot be empty'),

    // الكائن
    object: z.object({}),

    // المعرف الفريد
    uuid: z.string().uuid('Invalid UUID format'),

    // معرف فريد مخصص
    customId: z.string().regex(/^[a-zA-Z0-9_-]+$/, 'Invalid ID format'),

    // الرابط
    url: z.string().url('Invalid URL format'),

    // الهاتف
    phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number'),

    // اللغة
    language: z.enum(['ar', 'en']),

    // الدور
    role: z.enum(['user', 'admin']),

    // الحالة
    status: z.enum(['active', 'inactive', 'pending']),

    // نوع الملف
    fileType: z.enum(['pdf', 'docx', 'txt', 'md']),

    // حجم الملف (بالبايت)
    fileSize: z.number().max(10 * 1024 * 1024, 'File too large (max 10MB)'),

    // الصفحة
    page: z.number().int().min(1, 'Page must be at least 1').default(1),

    // الحد الأقصى للعناصر
    limit: z.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit too high').default(10),

    // البحث
    search: z.string().max(100, 'Search term too long'),

    // الفرز
    sortBy: z.string().max(50, 'Sort field too long'),

    // اتجاه الفرز
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
};

/**
 * Schemas للمصادقة
 */
export const AuthSchemas = {
    // تسجيل الدخول
    login: z.object({
        email: BaseSchemas.email,
        password: BaseSchemas.password,
    }),

    // التسجيل
    signup: z.object({
        name: BaseSchemas.name,
        email: BaseSchemas.email,
        password: BaseSchemas.password,
        language: BaseSchemas.language.default('en'),
    }),

    // إعادة تعيين كلمة المرور
    resetPassword: z.object({
        email: BaseSchemas.email,
    }),

    // تغيير كلمة المرور
    changePassword: z.object({
        currentPassword: BaseSchemas.password,
        newPassword: BaseSchemas.password,
    }),
};

/**
 * Schemas للمستخدمين
 */
export const UserSchemas = {
    // إنشاء مستخدم
    createUser: z.object({
        name: BaseSchemas.name,
        email: BaseSchemas.email,
        password: BaseSchemas.password,
        role: BaseSchemas.role,
        credits: BaseSchemas.nonNegativeNumber,
    }),

    // تحديث المستخدم
    updateUser: z.object({
        name: BaseSchemas.name.optional(),
        email: BaseSchemas.email.optional(),
        role: BaseSchemas.role.optional(),
        credits: BaseSchemas.nonNegativeNumber.optional(),
    }),

    // قائمة المستخدمين
    userList: z.object({
        page: BaseSchemas.page,
        limit: BaseSchemas.limit,
        search: BaseSchemas.search.optional(),
        sortBy: BaseSchemas.sortBy.optional(),
        sortOrder: BaseSchemas.sortOrder,
    }),
};

/**
 * Schemas للمشاريع
 */
export const ProjectSchemas = {
    // إنشاء مشروع
    createProject: z.object({
        title: BaseSchemas.title,
        description: BaseSchemas.description.optional(),
        type: z.enum(['proposal', 'report', 'presentation', 'academic']),
        language: BaseSchemas.language,
        teamId: BaseSchemas.teamId.optional(),
    }),

    // تحديث المشروع
    updateProject: z.object({
        title: BaseSchemas.title.optional(),
        description: BaseSchemas.description.optional(),
        status: BaseSchemas.status.optional(),
    }),

    // إضافة سياق للمشروع
    addContext: z.object({
        type: z.enum(['file', 'text', 'url']),
        content: z.string().min(1, 'Content is required'),
        fileName: z.string().optional(),
        fileType: BaseSchemas.fileType.optional(),
        fileSize: BaseSchemas.fileSize.optional(),
    }),
};

/**
 * Schemas للفرق
 */
export const TeamSchemas = {
    // إنشاء فريق
    createTeam: z.object({
        name: BaseSchemas.name,
        description: BaseSchemas.description.optional(),
    }),

    // تحديث الفريق
    updateTeam: z.object({
        name: BaseSchemas.name.optional(),
        description: BaseSchemas.description.optional(),
    }),

    // دعوة عضو
    inviteMember: z.object({
        email: BaseSchemas.email,
        role: z.enum(['member', 'admin']),
    }),
};

/**
 * Schemas لأدوات الكتابة
 */
export const WritingToolSchemas = {
    // إعادة الصياغة
    paraphrase: z.object({
        text: BaseSchemas.text,
        mode: z.enum(['formal', 'casual', 'academic']).default('formal'),
    }),

    // الملخص
    summarize: z.object({
        text: BaseSchemas.text,
        length: z.enum(['short', 'medium', 'long']).default('medium'),
    }),

    // تحسين النص
    improve: z.object({
        text: BaseSchemas.text,
        style: z.enum(['professional', 'academic', 'casual']).default('professional'),
    }),

    // فحص القواعد
    grammarCheck: z.object({
        text: BaseSchemas.text,
        language: BaseSchemas.language.default('en'),
    }),

    // فحص الانتحال
    plagiarismCheck: z.object({
        text: BaseSchemas.text,
        sources: z.array(z.string().url()).optional(),
    }),
};

/**
 * Schemas للذكاء الاصطناعي
 */
export const AISchemas = {
    // توليد التقرير
    generateReport: z.object({
        projectId: BaseSchemas.projectId,
        section: z.string().min(1, 'Section is required'),
        context: z.string().optional(),
        language: BaseSchemas.language.default('en'),
    }),

    // توليد العرض التقديمي
    generatePresentation: z.object({
        projectId: BaseSchemas.projectId,
        slides: z.number().int().min(1).max(50).default(10),
        style: z.enum(['professional', 'academic', 'creative']).default('professional'),
        language: BaseSchemas.language.default('en'),
    }),

    // حل المشاكل الأكاديمية
    solveAcademic: z.object({
        problem: BaseSchemas.text,
        subject: z.string().min(1, 'Subject is required'),
        level: z.enum(['elementary', 'high-school', 'university', 'graduate']).default('university'),
        language: BaseSchemas.language.default('en'),
    }),
};

/**
 * Schemas للمعاملات
 */
export const TransactionSchemas = {
    // شراء ائتمانات
    purchaseCredits: z.object({
        planId: z.string().min(1, 'Plan ID is required'),
        credits: BaseSchemas.positiveNumber,
        amount: BaseSchemas.positiveNumber,
    }),

    // سجل المعاملات
    transactionHistory: z.object({
        page: BaseSchemas.page,
        limit: BaseSchemas.limit,
        type: z.enum(['purchase', 'usage', 'refund']).optional(),
        startDate: BaseSchemas.date.optional(),
        endDate: BaseSchemas.date.optional(),
    }),
};

/**
 * Schemas للإدارة
 */
export const AdminSchemas = {
    // إحصائيات لوحة التحكم
    dashboardStats: z.object({
        period: z.enum(['day', 'week', 'month', 'year']).default('month'),
        startDate: BaseSchemas.date.optional(),
        endDate: BaseSchemas.date.optional(),
    }),

    // إدارة الميزات
    featureToggle: z.object({
        featureId: z.string().min(1, 'Feature ID is required'),
        enabled: z.boolean(),
    }),

    // إدارة الوكلاء
    agentConfig: z.object({
        name: BaseSchemas.name,
        description: BaseSchemas.description,
        category: z.string().min(1, 'Category is required'),
        enabled: z.boolean().default(true),
        creditCost: BaseSchemas.nonNegativeNumber.default(1),
    }),
};

/**
 * دالة مساعدة للتحقق من صحة البيانات
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
    const result = schema.safeParse(data);
    if (!result.success) {
        throw new Error(`Validation error: ${result.error.errors.map(e => e.message).join(', ')}`);
    }
    return result.data;
}

/**
 * دالة مساعدة للتحقق من صحة البيانات مع رسائل خطأ مخصصة
 */
export function validateDataWithCustomError<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    customErrorMessage?: string
): T {
    const result = schema.safeParse(data);
    if (!result.success) {
        const errorMessage = customErrorMessage || `Validation error: ${result.error.errors.map(e => e.message).join(', ')}`;
        throw new Error(errorMessage);
    }
    return result.data;
}
