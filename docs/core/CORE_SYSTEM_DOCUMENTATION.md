# نظام Core الشامل - Arkan

## نظرة عامة

نظام `src/core` هو القلب النابض لمشروع Arkan، يوفر مجموعة شاملة من الأدوات والمكونات القابلة لإعادة الاستخدام التي تدعم جميع جوانب التطبيق. هذا النظام مصمم لضمان التناسق والجودة والأداء العالي عبر جميع مكونات التطبيق.

## 🏗️ المعمارية العامة

### هيكل النظام
```
src/core/
├── constants/              # الثوابت والإعدادات المشتركة
│   ├── file-types.ts       # أنواع الملفات المدعومة
│   └── validation-rules.ts # قواعد التحقق المشتركة
├── export/                 # نظام التصدير الشامل
│   ├── types/              # أنواع التصدير
│   ├── base/               # Hook الأساسي لإدارة التصدير
│   ├── factories/          # Export Factories لكل تصنيف
│   └── index.ts           # تصدير موحد
├── hooks/                  # نظام Hooks المتقدم
│   ├── base/               # Hooks الأساسية القابلة لإعادة الاستخدام
│   ├── academic-solver-tools/    # أدوات الحلول الأكاديمية
│   ├── content-generators/       # مولدات المحتوى
│   ├── diagram-tools/            # أدوات المخططات
│   ├── performance/              # نظام الأداء والتحسين
│   ├── presentation-tools/       # أدوات العروض التقديمية
│   ├── project-plan-tools/       # أدوات تخطيط المشاريع
│   ├── proposal-tools/           # أدوات المقترحات
│   ├── report-tools/             # أدوات التقارير
│   ├── specialized-tools/        # الأدوات المتخصصة
│   ├── writing-tools/            # أدوات الكتابة
│   └── index.ts                  # تصدير موحد
├── monitoring/             # نظام المراقبة والأداء
│   └── performance-tracker.ts    # تتبع الأداء الشامل
├── templates/              # نظام إدارة القوالب
│   ├── types/              # أنواع القوالب
│   ├── managers/           # مديري القوالب
│   ├── factories/          # Template Factories
│   └── index.ts           # تصدير موحد
├── types/                  # الأنواع المشتركة
│   ├── common.ts          # الأنواع الأساسية
│   ├── error-types.ts     # أنواع الأخطاء المحسنة
│   └── writing-tools.ts   # أنواع أدوات الكتابة
├── ui/                     # مكونات UI القابلة لإعادة الاستخدام
│   └── use-ui-factory.ts  # Factory للمكونات
├── utils/                  # الأدوات المساعدة
│   ├── bundle-optimizer.ts # محسن الحزم
│   ├── enhanced-error-handler.ts # معالج الأخطاء المحسن
│   ├── error-handling.ts   # معالجة الأخطاء الأساسية
│   ├── error-monitoring.ts # مراقبة الأخطاء
│   └── memory-manager.ts   # إدارة الذاكرة
└── index.ts               # نقطة الدخول الرئيسية
```

## 🎯 المبادئ الأساسية

### 1. إعادة الاستخدام (Reusability)
- **Hook Factories**: مصانع لإنشاء hooks متخصصة
- **Component Factories**: مصانع للمكونات القابلة للتخصيص
- **Utility Functions**: دوال مساعدة قابلة لإعادة الاستخدام

### 2. التناسق (Consistency)
- **أنماط موحدة**: أنماط متسقة عبر جميع المكونات
- **معايير مشتركة**: معايير موحدة للتحقق والأخطاء
- **تصميم موحد**: تصميم متسق للواجهات

### 3. الأداء (Performance)
- **تحسين الذاكرة**: إدارة ذكية للذاكرة
- **تحسين الحزم**: تحسين حجم الحزم والأداء
- **مراقبة الأداء**: تتبع شامل للأداء

### 4. الجودة (Quality)
- **معالجة الأخطاء**: نظام شامل لمعالجة الأخطاء
- **التحقق من البيانات**: تحقق صارم من صحة البيانات
- **المراقبة**: مراقبة شاملة للأخطاء والأداء

## 📚 المكونات الرئيسية

### 1. نظام الثوابت (Constants)

#### أنواع الملفات المدعومة
```typescript
/**
 * أنواع الملفات المدعومة في التطبيق
 * يوفر معلومات شاملة عن أنواع الملفات المدعومة
 */
export interface FileTypeConfig {
    extension: string;
    mimeType: string;
    maxSize: number; // بالبايت
    description: string;
    icon: string;
    category: 'document' | 'text' | 'image' | 'archive';
}

// أنواع الملفات المدعومة
export const SUPPORTED_FILE_TYPES: Record<string, FileTypeConfig> = {
    pdf: {
        extension: '.pdf',
        mimeType: 'application/pdf',
        maxSize: 10 * 1024 * 1024, // 10MB
        description: 'ملفات PDF',
        icon: 'file-text',
        category: 'document',
    },
    // ... المزيد من الأنواع
};
```

#### قواعد التحقق المشتركة
```typescript
/**
 * قواعد التحقق المشتركة في جميع أنحاء التطبيق
 */
export const TEXT_VALIDATION_RULES = {
    MIN_LENGTH: 5,
    MAX_LENGTH: 10000,
    MIN_LENGTH_FOR_PROCESSING: 10,
    MAX_LENGTH_FOR_PROCESSING: 50000,
} as const;

export const FILE_VALIDATION_RULES = {
    MAX_SIZE_PDF: 10 * 1024 * 1024, // 10MB
    MAX_SIZE_TEXT: 5 * 1024 * 1024, // 5MB
    ACCEPTED_TYPES: ['application/pdf', 'text/plain', 'text/markdown'],
} as const;
```

### 2. نظام التصدير الشامل (Export System)

#### Hook الأساسي لإدارة التصدير
```typescript
/**
 * Hook أساسي لإدارة التصدير
 * يوفر منطق موحد لجميع عمليات التصدير
 */
export interface ExportManagerOptions {
    onProgress?: (progress: ExportProgress) => void;
    onComplete?: (result: ExportResult) => void;
    onError?: (error: string) => void;
}

export interface ExportManagerResult {
    isExporting: boolean;
    progress: ExportProgress | null;
    exportContent: (content: any, options: ExportOptions) => Promise<ExportResult>;
    cancelExport: () => void;
    getSupportedFormats: (contentType: ContentType) => ExportFormat[];
    validateOptions: (options: ExportOptions) => boolean;
}

export function useExportManager(options: ExportManagerOptions = {}): ExportManagerResult {
    // تنفيذ منطق التصدير
}
```

#### Export Factories المتخصصة
```typescript
/**
 * Export Factory للمقترحات
 */
export interface ProposalExportResult {
    exportProposal: (proposal: ProjectProposal, format: ExportFormat, options?: Partial<ExportOptions>) => Promise<ExportResult>;
    exportProposalAsPdf: (proposal: ProjectProposal, options?: Partial<ExportOptions>) => Promise<ExportResult>;
    exportProposalAsDocx: (proposal: ProjectProposal, options?: Partial<ExportOptions>) => Promise<ExportResult>;
    getSupportedFormats: () => ExportFormat[];
    isExporting: boolean;
    progress: any;
}

export function createProposalExportHook(config: ProposalExportConfig = {}) {
    return function useProposalExport(): ProposalExportResult {
        // تنفيذ منطق تصدير المقترحات
    };
}
```

### 3. نظام Hooks المتقدم

#### Hooks الأساسية القابلة لإعادة الاستخدام

##### Hook معالجة النماذج
```typescript
/**
 * Hook أساسي لمعالجة النماذج
 * يوفر منطق موحد لجميع النماذج في التطبيق
 */
export interface FormHandlerOptions {
    onSubmitSuccess?: (data: any) => void;
    onSubmitError?: (error: any) => void;
    showSuccessToast?: boolean;
    successMessage?: string;
}

export interface FormHandlerResult<T extends z.ZodType> {
    form: UseFormReturn<z.infer<T>>;
    handleSubmit: (data: z.infer<T>) => void;
    isSubmitting: boolean;
    reset: () => void;
}

export function useFormHandler<T extends z.ZodType>(
    schema: T,
    defaultValues: z.infer<T>,
    options: FormHandlerOptions = {}
): FormHandlerResult<T> {
    // تنفيذ منطق معالجة النماذج
}
```

##### Hook رفع الملفات
```typescript
/**
 * Hook أساسي لرفع الملفات
 * يوفر منطق موحد لرفع الملفات في جميع أنحاء التطبيق
 */
export interface FileUploadOptions {
    acceptedTypes?: string[];
    maxSize?: number; // بالبايت
    multiple?: boolean;
    onSuccess?: (content: string, fileName: string) => void;
    onError?: (error: Error) => void;
    showSuccessToast?: boolean;
    successMessage?: string;
}

export interface FileUploadResult {
    isUploading: boolean;
    getRootProps: () => any;
    getInputProps: () => any;
    isDragActive: boolean;
    uploadFile: (file: File) => Promise<void>;
}

export function useFileUpload(options: FileUploadOptions = {}): FileUploadResult {
    // تنفيذ منطق رفع الملفات
}
```

##### Hook النسخ مع الإشعارات
```typescript
/**
 * Hook أساسي للنسخ مع الإشعارات
 * يوفر منطق موحد لنسخ النصوص مع إظهار الإشعارات
 */
export interface CopyToastOptions {
    successMessage?: string;
    errorMessage?: string;
    resetDelay?: number; // بالمللي ثانية
}

export interface CopyToastResult {
    isCopied: boolean;
    copyToClipboard: (text: string) => Promise<void>;
    resetCopiedState: () => void;
}

export function useCopyToast(options: CopyToastOptions = {}): CopyToastResult {
    // تنفيذ منطق النسخ مع الإشعارات
}
```

##### Hook إدارة حالة المعالجة
```typescript
/**
 * Hook أساسي لإدارة حالة المعالجة
 * يوفر منطق موحد لإدارة حالات التحميل والمعالجة
 */
export interface ProcessingStateOptions {
    initialLoading?: boolean;
    onStateChange?: (isProcessing: boolean) => void;
}

export interface ProcessingStateResult {
    isProcessing: boolean;
    setIsProcessing: (value: boolean) => void;
    startProcessing: () => void;
    stopProcessing: () => void;
    toggleProcessing: () => void;
    withProcessing: <T>(asyncFn: () => Promise<T>) => Promise<T>;
}

export function useProcessingState(
    options: ProcessingStateOptions = {}
): ProcessingStateResult {
    // تنفيذ منطق إدارة حالة المعالجة
}
```

#### Hook Factories المتخصصة

##### Factory أدوات الكتابة
```typescript
/**
 * Hook Factory لأدوات الكتابة
 * يوفر طريقة مبسطة لإنشاء hooks أدوات الكتابة
 */
export interface WritingToolConfig {
    toolName: string;
    apiEndpoint: string;
    schema: z.ZodType;
    defaultValues: any;
    successMessage?: string;
    errorMessage?: string;
    enableFileUpload?: boolean;
    acceptedFileTypes?: string[];
    customFeatures?: string[];
}

export function createWritingToolHook(config: WritingToolConfig) {
    return function useWritingToolLogic() {
        // تنفيذ منطق أداة الكتابة
    };
}
```

##### Factory مولدات المحتوى
```typescript
/**
 * Hook Factory لمولدات المحتوى
 * يوفر طريقة مبسطة لإنشاء hooks مولدات المحتوى
 */
export interface ContentGeneratorConfig {
    toolName: string;
    apiEndpoint: string;
    schema: z.ZodType;
    defaultValues: any;
    successMessage?: string;
    errorMessage?: string;
    enableFileUpload?: boolean;
    acceptedFileTypes?: string[];
    outputFormat?: 'text' | 'json' | 'html' | 'markdown';
    customFeatures?: {
        formatOutput?: (data: any) => any;
        validateInput?: (data: any) => boolean;
        getProgressSteps?: () => string[];
    };
}

export function createContentGeneratorHook(config: ContentGeneratorConfig) {
    return function useContentGeneratorLogic() {
        // تنفيذ منطق مولد المحتوى
    };
}
```

### 4. نظام الأداء والتحسين

#### مراقب الأداء الشامل
```typescript
/**
 * نظام مراقبة الأداء الرئيسي
 * يوفر تتبع شامل لأداء التطبيق
 */
export class PerformanceTracker {
    private static config: PerformanceConfig = {
        enableTracking: true,
        slowThreshold: 100, // milliseconds
        memoryThreshold: 50 * 1024 * 1024, // 50MB
        reportInterval: 30000, // 30 seconds
        maxHistorySize: 1000,
    };

    // تتبع أداء المكونات
    static trackComponentLoad(
        componentName: string,
        loadTime: number,
        success: boolean
    ): void {
        // تنفيذ تتبع تحميل المكونات
    }

    // تتبع أداء الـ Hooks
    static trackHookPerformance(
        hookName: string,
        executionTime: number,
        success: boolean,
        context?: string
    ): void {
        // تنفيذ تتبع أداء الـ Hooks
    }

    // تتبع أداء الدوال
    static trackFunctionPerformance<T>(
        functionName: string,
        fn: () => T,
        context?: Record<string, any>
    ): T {
        // تنفيذ تتبع أداء الدوال
    }
}
```

#### نظام إدارة الذاكرة
```typescript
/**
 * نظام إدارة الذاكرة الرئيسي
 * يوفر إدارة ذكية للذاكرة والتخزين المؤقت
 */
export class MemoryManager {
    private static cache = new Map<string, CacheEntry>();
    private static config: MemoryConfig = {
        maxCacheSize: 100 * 1024 * 1024, // 100MB
        maxEntries: 1000,
        cleanupInterval: 300000, // 5 minutes
        warningThreshold: 0.8, // 80%
        criticalThreshold: 0.9, // 90%
    };

    // إضافة عنصر للتخزين المؤقت
    static set<T>(key: string, value: T, ttl?: number): boolean {
        // تنفيذ إضافة العنصر
    }

    // استرجاع عنصر من التخزين المؤقت
    static get<T>(key: string): T | null {
        // تنفيذ استرجاع العنصر
    }

    // تنظيف التخزين المؤقت
    static cleanup(): void {
        // تنفيذ تنظيف التخزين المؤقت
    }
}
```

### 5. نظام معالجة الأخطاء المحسن

#### معالج الأخطاء المحسن
```typescript
/**
 * معالج الأخطاء المحسن
 * يوفر معالجة شاملة ومتقدمة للأخطاء
 */
export class EnhancedErrorHandler {
    private static retryContexts = new Map<string, RetryContext>();
    private static errorHistory = new Map<string, EnhancedError[]>();

    // معالجة الأخطاء مع إعادة المحاولة
    static async handleWithRetry<T>(
        operation: () => Promise<T>,
        context: {
            operationId: string;
            category: ErrorCategory;
            severity?: ErrorSeverity;
            customErrorCode?: keyof typeof ERROR_MESSAGES;
            userId?: string;
            sessionId?: string;
            requestId?: string;
        }
    ): Promise<ErrorHandlingResult> {
        // تنفيذ معالجة الأخطاء مع إعادة المحاولة
    }

    // إنشاء خطأ محسن
    static createEnhancedError(
        error: unknown,
        category: ErrorCategory,
        severity: ErrorSeverity,
        context?: Record<string, any>
    ): EnhancedError {
        // تنفيذ إنشاء خطأ محسن
    }
}
```

#### خدمة مراقبة الأخطاء
```typescript
/**
 * خدمة مراقبة الأخطاء
 * يوفر مراقبة شاملة وتحليل للأخطاء
 */
export class ErrorMonitoringService {
    private static instance: ErrorMonitoringService;
    private errorHistory: Map<string, EnhancedError[]> = new Map();
    private errorMetrics: ErrorMetrics;
    private alerts: Map<string, ErrorAlert> = new Map();

    // تسجيل خطأ جديد
    recordError(error: EnhancedError, operationId: string = 'default'): void {
        // تنفيذ تسجيل الخطأ
    }

    // الحصول على الإحصائيات
    getMetrics(): ErrorMetrics {
        // تنفيذ الحصول على الإحصائيات
    }

    // الحصول على الاتجاهات
    getTrends(period: 'hour' | 'day' | 'week' | 'month' = 'day'): ErrorTrend[] {
        // تنفيذ الحصول على الاتجاهات
    }
}
```

### 6. نظام إدارة القوالب

#### مدير القوالب
```typescript
/**
 * مدير القوالب الشامل
 * يوفر إدارة شاملة للقوالب في جميع التنسيقات
 */
export interface TemplateManagerResult {
    templates: Record<string, Template>;
    activeTemplate: Template | null;
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;

    // إدارة القوالب
    setActiveTemplate: (templateId: string) => void;
    createTemplate: (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
    updateTemplate: (templateId: string, updates: Partial<Template>) => Promise<void>;
    deleteTemplate: (templateId: string) => Promise<void>;
    duplicateTemplate: (templateId: string, newName: string) => Promise<string>;

    // إدارة الأنماط
    updateStyle: (templateId: string, styleId: string, properties: Record<string, any>) => void;
    addStyle: (templateId: string, style: TemplateStyle) => void;
    removeStyle: (templateId: string, styleId: string) => void;

    // الوظائف المساعدة
    getTemplatesByCategory: (category: TemplateCategory) => Template[];
    getTemplatesByFormat: (format: TemplateFormat) => Template[];
    validateTemplate: (template: Template) => boolean;
    exportTemplate: (templateId: string) => Promise<Blob>;
    importTemplate: (file: File) => Promise<string>;
}

export function useTemplateManager(options: TemplateManagerOptions = {}): TemplateManagerResult {
    // تنفيذ منطق إدارة القوالب
}
```

#### Template Factories المتخصصة

##### Factory قوالب DOCX
```typescript
/**
 * Export Factory لقوالب DOCX
 * يوفر إدارة متخصصة لقوالب Word
 */
export interface DocxTemplateResult {
    templates: Record<string, Template>;
    activeTemplate: Template | null;
    isLoading: boolean;
    isSaving: boolean;

    // إدارة القوالب
    setActiveTemplate: (templateId: string) => void;
    createDocxTemplate: (name: string, description: string, styles: Record<string, TemplateStyle>) => Promise<string>;
    updateDocxTemplate: (templateId: string, updates: Partial<Template>) => Promise<void>;
    deleteDocxTemplate: (templateId: string) => Promise<void>;

    // إدارة الأنماط
    updateDocxStyle: (templateId: string, styleId: string, properties: Record<string, any>) => void;
    addDocxStyle: (templateId: string, style: TemplateStyle) => void;
    removeDocxStyle: (templateId: string, styleId: string) => void;

    // الأنماط الافتراضية
    getDefaultDocxStyles: () => Record<string, TemplateStyle>;
    applyDocxStyle: (templateId: string, elementType: string, styleId: string) => void;

    // الوظائف المساعدة
    getDocxTemplatesByCategory: (category: TemplateCategory) => Template[];
    validateDocxTemplate: (template: Template) => boolean;
}

export function createDocxTemplateHook(config: DocxTemplateConfig) {
    return function useDocxTemplate(): DocxTemplateResult {
        // تنفيذ منطق إدارة قوالب DOCX
    };
}
```

##### Factory قوالب PPTX
```typescript
/**
 * Export Factory لقوالب PPTX
 * يوفر إدارة متخصصة لقوالب PowerPoint
 */
export interface PptxTemplateResult {
    templates: Record<string, Template>;
    activeTemplate: Template | null;
    isLoading: boolean;
    isSaving: boolean;

    // إدارة القوالب
    setActiveTemplate: (templateId: string) => void;
    createPptxTemplate: (name: string, description: string, styles: Record<string, TemplateStyle>) => Promise<string>;
    updatePptxTemplate: (templateId: string, updates: Partial<Template>) => Promise<void>;
    deletePptxTemplate: (templateId: string) => Promise<void>;

    // إدارة الأنماط
    updatePptxStyle: (templateId: string, styleId: string, properties: Record<string, any>) => void;
    addPptxStyle: (templateId: string, style: TemplateStyle) => void;
    removePptxStyle: (templateId: string, styleId: string) => void;

    // الأنماط الافتراضية
    getDefaultPptxStyles: () => Record<string, TemplateStyle>;
    applyPptxStyle: (templateId: string, slideType: string, styleId: string) => void;

    // الوظائف المساعدة
    getPptxTemplatesByCategory: (category: TemplateCategory) => Template[];
    validatePptxTemplate: (template: Template) => boolean;
}

export function createPptxTemplateHook(config: PptxTemplateConfig) {
    return function usePptxTemplate(): PptxTemplateResult {
        // تنفيذ منطق إدارة قوالب PPTX
    };
}
```

## 📖 أمثلة الاستخدام

### 1. استخدام Hook معالجة النماذج

```typescript
import { useFormHandler } from '@/core';
import { z } from 'zod';

// تعريف مخطط التحقق
const userSchema = z.object({
    name: z.string().min(2, 'الاسم يجب أن يكون على الأقل حرفين'),
    email: z.string().email('عنوان البريد الإلكتروني غير صحيح'),
    age: z.number().min(18, 'العمر يجب أن يكون 18 أو أكثر'),
});

// استخدام Hook
function UserForm() {
    const formHandler = useFormHandler(
        userSchema,
        { name: '', email: '', age: 18 },
        {
            onSubmitSuccess: (data) => {
                console.log('تم حفظ البيانات:', data);
            },
            onSubmitError: (error) => {
                console.error('خطأ في الحفظ:', error);
            },
            successMessage: 'تم حفظ بيانات المستخدم بنجاح!',
        }
    );

    return (
        <form onSubmit={formHandler.form.handleSubmit(formHandler.handleSubmit)}>
            <input
                {...formHandler.form.register('name')}
                placeholder="الاسم"
            />
            {formHandler.form.formState.errors.name && (
                <span>{formHandler.form.formState.errors.name.message}</span>
            )}

            <input
                {...formHandler.form.register('email')}
                placeholder="البريد الإلكتروني"
            />
            {formHandler.form.formState.errors.email && (
                <span>{formHandler.form.formState.errors.email.message}</span>
            )}

            <input
                {...formHandler.form.register('age', { valueAsNumber: true })}
                type="number"
                placeholder="العمر"
            />
            {formHandler.form.formState.errors.age && (
                <span>{formHandler.form.formState.errors.age.message}</span>
            )}

            <button type="submit" disabled={formHandler.isSubmitting}>
                {formHandler.isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
            </button>
        </form>
    );
}
```

### 2. استخدام Hook رفع الملفات

```typescript
import { useFileUpload } from '@/core';

function FileUploadComponent() {
    const fileUpload = useFileUpload({
        acceptedTypes: ['application/pdf', 'text/plain', 'text/markdown'],
        maxSize: 10 * 1024 * 1024, // 10MB
        multiple: false,
        onSuccess: (content, fileName) => {
            console.log(`تم رفع الملف ${fileName} بنجاح`);
            console.log('المحتوى المستخرج:', content);
        },
        onError: (error) => {
            console.error('فشل في رفع الملف:', error.message);
        },
        successMessage: 'تم رفع الملف بنجاح!',
    });

    return (
        <div
            {...fileUpload.getRootProps()}
            className={`border-2 border-dashed p-8 text-center ${
                fileUpload.isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
        >
            <input {...fileUpload.getInputProps()} />

            {fileUpload.isUploading ? (
                <p>جاري رفع الملف...</p>
            ) : (
                <div>
                    <p>اسحب الملف هنا أو انقر للاختيار</p>
                    <p className="text-sm text-gray-500">
                        أنواع الملفات المدعومة: PDF, TXT, MD
                    </p>
                    <p className="text-sm text-gray-500">
                        الحد الأقصى للحجم: 10MB
                    </p>
                </div>
            )}
        </div>
    );
}
```

### 3. استخدام Hook النسخ مع الإشعارات

```typescript
import { useCopyToast } from '@/core';

function CopyButton({ text }: { text: string }) {
    const copyToast = useCopyToast({
        successMessage: 'تم النسخ إلى الحافظة!',
        errorMessage: 'فشل في النسخ',
        resetDelay: 2000,
    });

    return (
        <button
            onClick={() => copyToast.copyToClipboard(text)}
            className={`px-4 py-2 rounded ${
                copyToast.isCopied ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
            }`}
        >
            {copyToast.isCopied ? 'تم النسخ!' : 'نسخ'}
        </button>
    );
}
```

### 4. استخدام نظام التصدير

```typescript
import { useProposalExport } from '@/core';
import type { ProjectProposal } from '@/lib/models/proposal';

function ProposalExportComponent({ proposal }: { proposal: ProjectProposal }) {
    const proposalExport = useProposalExport();

    const handleExportPdf = async () => {
        const result = await proposalExport.exportProposalAsPdf(proposal, {
            metadata: {
                title: proposal.title,
                author: 'Arkan AI',
                subject: proposal.category,
            }
        });

        if (result.success) {
            console.log('تم تصدير PDF:', result.fileName);
        } else {
            console.error('فشل في التصدير:', result.error);
        }
    };

    const handleExportDocx = async () => {
        const result = await proposalExport.exportProposalAsDocx(proposal, {
            templateId: 'modern-proposal-template',
            customStyles: {
                title: { fontSize: 24, fontWeight: 'bold' },
                body: { fontSize: 12, lineHeight: 1.5 }
            }
        });

        if (result.success) {
            console.log('تم تصدير DOCX:', result.fileName);
        } else {
            console.error('فشل في التصدير:', result.error);
        }
    };

    return (
        <div className="flex gap-4">
            <button
                onClick={handleExportPdf}
                disabled={proposalExport.isExporting}
                className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
            >
                {proposalExport.isExporting ? 'جاري التصدير...' : 'تصدير PDF'}
            </button>

            <button
                onClick={handleExportDocx}
                disabled={proposalExport.isExporting}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
            >
                {proposalExport.isExporting ? 'جاري التصدير...' : 'تصدير DOCX'}
            </button>

            {proposalExport.progress && (
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${proposalExport.progress.progress}%` }}
                    ></div>
                </div>
            )}
        </div>
    );
}
```

### 5. استخدام نظام إدارة القوالب

```typescript
import { useDocxTemplate } from '@/core';

function TemplateManager() {
    const docxTemplate = useDocxTemplate();

    const createCustomTemplate = async () => {
        const defaultStyles = docxTemplate.getDefaultDocxStyles();

        const templateId = await docxTemplate.createDocxTemplate(
            'قالب الأعمال المخصص',
            'قالب احترافي لمستندات الأعمال',
            defaultStyles
        );

        // تحديث نمط العنوان
        docxTemplate.updateDocxStyle(templateId, 'title', {
            fontSize: 28,
            fontWeight: 'bold',
            color: '#1a365d',
            alignment: 'center',
        });

        // تطبيق القالب
        docxTemplate.setActiveTemplate(templateId);
    };

    return (
        <div>
            <button
                onClick={createCustomTemplate}
                className="px-4 py-2 bg-blue-500 text-white rounded"
            >
                إنشاء قالب مخصص
            </button>

            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">القوالب المتاحة:</h3>
                {Object.values(docxTemplate.templates).map(template => (
                    <div key={template.id} className="border p-4 rounded mb-2">
                        <h4 className="font-semibold">{template.name}</h4>
                        <p className="text-gray-600">{template.description}</p>
                        <button
                            onClick={() => docxTemplate.setActiveTemplate(template.id)}
                            className="mt-2 px-3 py-1 bg-green-500 text-white rounded text-sm"
                        >
                            استخدام القالب
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
```

### 6. استخدام نظام الأداء والتحسين

```typescript
import { PerformanceTracker, MemoryManager } from '@/core';

function PerformanceOptimizedComponent() {
    React.useEffect(() => {
        // تتبع أداء تحميل المكون
        const startTime = performance.now();

        // محاكاة تحميل المكون
        setTimeout(() => {
            const loadTime = performance.now() - startTime;
            PerformanceTracker.trackComponentLoad(
                'PerformanceOptimizedComponent',
                loadTime,
                true
            );
        }, 1000);

        // تنظيف الذاكرة عند إلغاء تحميل المكون
        return () => {
            MemoryManager.cleanup();
        };
    }, []);

    const handleExpensiveOperation = () => {
        // تتبع أداء العملية المكلفة
        const result = PerformanceTracker.trackFunctionPerformance(
            'expensiveOperation',
            () => {
                // تنفيذ العملية المكلفة
                return performExpensiveCalculation();
            },
            { component: 'PerformanceOptimizedComponent' }
        );

        return result;
    };

    return (
        <div>
            <button onClick={handleExpensiveOperation}>
                تنفيذ عملية مكلفة
            </button>
        </div>
    );
}
```

### 7. استخدام نظام معالجة الأخطاء المحسن

```typescript
import { EnhancedErrorHandler } from '@/core';

async function performRiskyOperation() {
    const result = await EnhancedErrorHandler.handleWithRetry(
        async () => {
            // تنفيذ العملية المحفوفة بالمخاطر
            return await riskyApiCall();
        },
        {
            operationId: 'risky-operation',
            category: 'ai_generation',
            severity: 'medium',
            userId: 'user123',
            sessionId: 'session456',
        }
    );

    if (result.success) {
        console.log('تم تنفيذ العملية بنجاح:', result.data);
    } else {
        console.error('فشل في تنفيذ العملية:', result.error);

        if (result.retryContext) {
            console.log('سيتم إعادة المحاولة بعد:', result.retryContext.delay, 'ثانية');
        }
    }

    return result;
}
```

## 🔧 التخصيص المتقدم

### 1. إنشاء Hook Factory مخصص

```typescript
import { createWritingToolHook } from '@/core';
import { z } from 'zod';

// تعريف مخطط التحقق
const customToolSchema = z.object({
    input: z.string().min(10, 'النص يجب أن يكون على الأقل 10 أحرف'),
    style: z.enum(['formal', 'casual', 'creative']),
    length: z.enum(['short', 'medium', 'long']),
});

// إنشاء Hook مخصص
const useCustomWritingTool = createWritingToolHook({
    toolName: 'custom-writing-tool',
    apiEndpoint: '/api/custom-tool',
    schema: customToolSchema,
    defaultValues: {
        input: '',
        style: 'formal',
        length: 'medium',
    },
    successMessage: 'تم معالجة النص بنجاح!',
    errorMessage: 'فشل في معالجة النص',
    enableFileUpload: true,
    acceptedFileTypes: ['text/plain', 'text/markdown'],
    customFeatures: ['grammar-check', 'style-suggestions'],
});

// استخدام Hook المخصص
function CustomWritingTool() {
    const tool = useCustomWritingTool();

    return (
        <div>
            <form onSubmit={tool.form.handleSubmit(tool.handleSubmit)}>
                <textarea
                    {...tool.form.register('input')}
                    placeholder="أدخل النص هنا..."
                />

                <select {...tool.form.register('style')}>
                    <option value="formal">رسمي</option>
                    <option value="casual">عادي</option>
                    <option value="creative">إبداعي</option>
                </select>

                <select {...tool.form.register('length')}>
                    <option value="short">قصير</option>
                    <option value="medium">متوسط</option>
                    <option value="long">طويل</option>
                </select>

                <button type="submit" disabled={tool.isProcessing}>
                    {tool.isProcessing ? 'جاري المعالجة...' : 'معالجة النص'}
                </button>
            </form>

            {tool.processedText && (
                <div className="mt-4">
                    <h3>النتيجة:</h3>
                    <p>{tool.processedText}</p>
                    <button onClick={() => tool.copyToClipboard(tool.processedText)}>
                        نسخ النتيجة
                    </button>
                </div>
            )}
        </div>
    );
}
```

### 2. إنشاء Export Factory مخصص

```typescript
import { createProposalExportHook } from '@/core';

// إنشاء Export Factory مخصص
const useCustomProposalExport = createProposalExportHook({
    defaultFormat: 'pdf',
    includeImages: true,
    customStyles: {
        title: { fontSize: 24, fontWeight: 'bold', color: '#1a365d' },
        body: { fontSize: 12, lineHeight: 1.5, color: '#2d3748' },
        header: { backgroundColor: '#f7fafc', padding: '20px' },
    },
    templateId: 'custom-proposal-template',
});

// استخدام Export Factory المخصص
function CustomProposalExport({ proposal }: { proposal: ProjectProposal }) {
    const proposalExport = useCustomProposalExport();

    const handleExport = async () => {
        const result = await proposalExport.exportProposal(proposal, 'pdf', {
            metadata: {
                title: proposal.title,
                author: 'Custom Export',
                subject: proposal.category,
                keywords: ['custom', 'proposal', 'export'],
            }
        });

        if (result.success) {
            console.log('تم التصدير بنجاح:', result.fileName);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={proposalExport.isExporting}
            className="px-4 py-2 bg-purple-500 text-white rounded"
        >
            {proposalExport.isExporting ? 'جاري التصدير...' : 'تصدير مخصص'}
        </button>
    );
}
```

### 3. إنشاء Template Factory مخصص

```typescript
import { createDocxTemplateHook } from '@/core';

// إنشاء Template Factory مخصص
const useCustomDocxTemplate = createDocxTemplateHook({
    category: 'proposal',
    autoSave: true,
    validateStyles: true,
});

// استخدام Template Factory المخصص
function CustomTemplateManager() {
    const docxTemplate = useCustomDocxTemplate();

    const createAdvancedTemplate = async () => {
        const templateId = await docxTemplate.createDocxTemplate(
            'قالب متقدم',
            'قالب متقدم مع أنماط مخصصة',
            {
                title: {
                    id: 'title',
                    name: 'العنوان الرئيسي',
                    properties: {
                        fontSize: 32,
                        fontWeight: 'bold',
                        color: '#1a365d',
                        alignment: 'center',
                        marginBottom: 20,
                    },
                    category: 'typography',
                },
                body: {
                    id: 'body',
                    name: 'النص الأساسي',
                    properties: {
                        fontSize: 14,
                        lineHeight: 1.6,
                        color: '#2d3748',
                        marginBottom: 10,
                    },
                    category: 'typography',
                },
            }
        );

        // تطبيق القالب
        docxTemplate.setActiveTemplate(templateId);
    };

    return (
        <div>
            <button
                onClick={createAdvancedTemplate}
                className="px-4 py-2 bg-indigo-500 text-white rounded"
            >
                إنشاء قالب متقدم
            </button>

            <div className="mt-4">
                <h3>القوالب المتاحة:</h3>
                {Object.values(docxTemplate.templates).map(template => (
                    <div key={template.id} className="border p-3 rounded mb-2">
                        <h4>{template.name}</h4>
                        <p className="text-sm text-gray-600">{template.description}</p>
                        <div className="mt-2">
                            <button
                                onClick={() => docxTemplate.setActiveTemplate(template.id)}
                                className="px-2 py-1 bg-green-500 text-white rounded text-sm mr-2"
                            >
                                استخدام
                            </button>
                            <button
                                onClick={() => docxTemplate.deleteDocxTemplate(template.id)}
                                className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                            >
                                حذف
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
```

## 📊 أفضل الممارسات

### 1. استخدام Hooks الأساسية

```typescript
// ✅ جيد - استخدام Hook الأساسي
const formHandler = useFormHandler(schema, defaultValues, {
    onSubmitSuccess: (data) => {
        console.log('تم الحفظ:', data);
    },
    successMessage: 'تم الحفظ بنجاح!',
});

// ❌ تجنب - إعادة كتابة المنطق
const [isSubmitting, setIsSubmitting] = useState(false);
const [formData, setFormData] = useState(defaultValues);
// ... منطق معالجة النموذج مكرر
```

### 2. استخدام Factory Pattern

```typescript
// ✅ جيد - استخدام Factory Pattern
const useCustomTool = createWritingToolHook({
    toolName: 'custom-tool',
    apiEndpoint: '/api/custom',
    schema: customSchema,
    defaultValues: customDefaults,
});

// ❌ تجنب - إعادة كتابة Hook كامل
function useCustomTool() {
    // ... إعادة كتابة جميع المنطق
}
```

### 3. معالجة الأخطاء

```typescript
// ✅ جيد - استخدام معالج الأخطاء المحسن
try {
    const result = await EnhancedErrorHandler.handleWithRetry(
        () => riskyOperation(),
        {
            operationId: 'operation-name',
            category: 'ai_generation',
            severity: 'medium',
        }
    );
} catch (error) {
    // معالجة الخطأ
}

// ❌ تجنب - معالجة الأخطاء اليدوية
try {
    const result = await riskyOperation();
} catch (error) {
    console.error(error); // معالجة بسيطة
}
```

### 4. إدارة الأداء

```typescript
// ✅ جيد - تتبع الأداء
const result = PerformanceTracker.trackFunctionPerformance(
    'expensiveOperation',
    () => performExpensiveCalculation(),
    { component: 'ComponentName' }
);

// ❌ تجنب - عدم تتبع الأداء
const result = performExpensiveCalculation(); // بدون تتبع
```

### 5. إدارة الذاكرة

```typescript
// ✅ جيد - استخدام إدارة الذاكرة
React.useEffect(() => {
    // تنظيف الذاكرة عند إلغاء تحميل المكون
    return () => {
        MemoryManager.cleanup();
    };
}, []);

// ❌ تجنب - عدم تنظيف الذاكرة
React.useEffect(() => {
    // لا يوجد تنظيف للذاكرة
}, []);
```

## 🚀 التحسينات المستقبلية

### 1. تحسينات الأداء
- **تحسين الذاكرة**: تحسينات إضافية لإدارة الذاكرة
- **تحسين الحزم**: تحسينات إضافية لحجم الحزم
- **تحسين الشبكة**: تحسينات لطلبات الشبكة

### 2. ميزات جديدة
- **تحليلات متقدمة**: تحليلات شاملة للأداء والاستخدام
- **إشعارات ذكية**: نظام إشعارات ذكي
- **تخصيص متقدم**: خيارات تخصيص أكثر

### 3. تحسينات المطورين
- **أدوات التطوير**: أدوات إضافية للمطورين
- **توثيق محسن**: توثيق أكثر تفصيلاً
- **أمثلة أكثر**: أمثلة إضافية للاستخدام

## 📋 قائمة التحقق

### مكتمل ✅
- [x] نظام الثوابت والإعدادات
- [x] نظام التصدير الشامل
- [x] نظام Hooks المتقدم
- [x] نظام الأداء والتحسين
- [x] نظام معالجة الأخطاء المحسن
- [x] نظام إدارة القوالب
- [x] نظام الأنواع المشتركة
- [x] نظام UI القابل لإعادة الاستخدام
- [x] نظام الأدوات المساعدة
- [x] التوثيق الشامل

### قيد التطوير 🔄
- [ ] تحسينات الأداء الإضافية
- [ ] ميزات جديدة حسب الحاجة
- [ ] تحسينات المطورين

### مستقبلي 📅
- [ ] تحليلات متقدمة
- [ ] إشعارات ذكية
- [ ] تخصيص متقدم
- [ ] أدوات التطوير الإضافية

## 🎯 الخلاصة

نظام `src/core` يوفر أساساً قوياً ومتطوراً لإدارة جميع جوانب التطبيق. من خلال استخدام المكونات والأدوات المتوفرة، يمكن للمطورين:

1. **تطوير أسرع**: استخدام المكونات الجاهزة بدلاً من إعادة الكتابة
2. **جودة أعلى**: استخدام الأنماط والمعايير الموحدة
3. **أداء أفضل**: الاستفادة من التحسينات المدمجة
4. **صيانة أسهل**: كود منظم وقابل للصيانة
5. **تجربة مستخدم محسنة**: واجهات متسقة وموثوقة

هذا النظام يضمن التناسق والجودة عبر جميع مكونات التطبيق ويوفر تجربة تطوير ممتازة للمطورين! 🚀
