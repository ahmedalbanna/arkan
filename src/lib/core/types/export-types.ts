/**
 * أنواع التصدير المحسنة لتحسين Type Safety
 *
 * هذا الملف يحتوي على أنواع محسنة للتصدير مع استبدال `any`
 * بأنواع محددة ومفصلة
 */

import { TypedError } from './improved-types';

// ==================== أنواع التصدير الأساسية ====================

/**
 * طلب التصدير محسن
 */
export interface ExportRequest {
    content: string;
    format: ExportFormat;
    metadata?: ExportMetadata;
    options?: ExportOptions;
    userId?: string;
    sessionId?: string;
    requestId?: string;
}

/**
 * تنسيق التصدير محسن
 */
export type ExportFormat = 'docx' | 'pptx' | 'pdf' | 'markdown' | 'html' | 'txt' | 'rtf' | 'odt';

/**
 * بيانات التصدير محسنة
 */
export interface ExportMetadata {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string[];
    language?: string;
    version?: string;
    createdAt?: string;
    updatedAt?: string;
    custom?: Record<string, unknown>;
}

/**
 * خيارات التصدير محسنة
 */
export interface ExportOptions {
    includeImages?: boolean;
    includeCharts?: boolean;
    includeTables?: boolean;
    includeHeaders?: boolean;
    includeFooters?: boolean;
    watermark?: string;
    password?: string;
    template?: string;
    style?: ExportStyle;
    quality?: 'draft' | 'normal' | 'high' | 'print';
    compression?: 'none' | 'low' | 'medium' | 'high';
}

/**
 * نمط التصدير محسن
 */
export interface ExportStyle {
    font?: {
        family?: string;
        size?: number;
        color?: string;
        weight?: 'normal' | 'bold' | 'lighter' | 'bolder';
        style?: 'normal' | 'italic' | 'oblique';
    };
    colors?: {
        primary?: string;
        secondary?: string;
        accent?: string;
        background?: string;
        text?: string;
    };
    spacing?: {
        lineHeight?: number;
        paragraphSpacing?: number;
        margin?: {
            top?: number;
            right?: number;
            bottom?: number;
            left?: number;
        };
    };
    layout?: {
        orientation?: 'portrait' | 'landscape';
        pageSize?: 'A4' | 'A3' | 'A5' | 'letter' | 'legal';
        columns?: number;
        headerHeight?: number;
        footerHeight?: number;
    };
}

/**
 * استجابة التصدير محسنة
 */
export interface ExportResponse {
    fileUrl: string;
    filename: string;
    size: number;
    format: ExportFormat;
    success: boolean;
    message?: string;
    error?: TypedError;
    metadata?: ExportMetadata;
    requestId?: string;
    timestamp?: string;
}

// ==================== أنواع التصدير المتخصصة ====================

/**
 * تصدير DOCX محسن
 */
export interface DocxExportRequest extends ExportRequest {
    format: 'docx';
    options?: DocxExportOptions;
}

/**
 * خيارات تصدير DOCX محسنة
 */
export interface DocxExportOptions extends ExportOptions {
    includeStyles?: boolean;
    includeMacros?: boolean;
    includeComments?: boolean;
    includeTrackChanges?: boolean;
    pageBreaks?: boolean;
    headers?: DocxHeader[];
    footers?: DocxFooter[];
    styles?: DocxStyle[];
}

/**
 * رأس DOCX محسن
 */
export interface DocxHeader {
    type: 'default' | 'first' | 'even';
    content: string;
    style?: DocxStyle;
}

/**
 * تذييل DOCX محسن
 */
export interface DocxFooter {
    type: 'default' | 'first' | 'even';
    content: string;
    style?: DocxStyle;
}

/**
 * نمط DOCX محسن
 */
export interface DocxStyle {
    name: string;
    type: 'paragraph' | 'character' | 'table' | 'list';
    properties: Record<string, unknown>;
}

/**
 * تصدير PPTX محسن
 */
export interface PptxExportRequest extends ExportRequest {
    format: 'pptx';
    options?: PptxExportOptions;
}

/**
 * خيارات تصدير PPTX محسنة
 */
export interface PptxExportOptions extends ExportOptions {
    slideLayout?: 'title' | 'content' | 'two-content' | 'comparison' | 'blank';
    slideSize?: '4:3' | '16:9' | '16:10' | 'custom';
    includeNotes?: boolean;
    includeHandouts?: boolean;
    animations?: boolean;
    transitions?: boolean;
    themes?: PptxTheme[];
}

/**
 * موضوع PPTX محسن
 */
export interface PptxTheme {
    name: string;
    colors: Record<string, string>;
    fonts: Record<string, string>;
    effects: Record<string, unknown>;
}

/**
 * تصدير PDF محسن
 */
export interface PdfExportRequest extends ExportRequest {
    format: 'pdf';
    options?: PdfExportOptions;
}

/**
 * خيارات تصدير PDF محسنة
 */
export interface PdfExportOptions extends ExportOptions {
    pageSize?: 'A4' | 'A3' | 'A5' | 'letter' | 'legal';
    orientation?: 'portrait' | 'landscape';
    margins?: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    includeBookmarks?: boolean;
    includeLinks?: boolean;
    includeForms?: boolean;
    security?: PdfSecurity;
    metadata?: PdfMetadata;
}

/**
 * أمان PDF محسن
 */
export interface PdfSecurity {
    password?: string;
    permissions?: {
        print?: boolean;
        modify?: boolean;
        copy?: boolean;
        annotate?: boolean;
    };
    encryption?: 'AES-128' | 'AES-256';
}

/**
 * بيانات PDF محسنة
 */
export interface PdfMetadata {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string[];
    creator?: string;
    producer?: string;
    creationDate?: string;
    modificationDate?: string;
}

// ==================== أنواع التصدير المتقدمة ====================

/**
 * تصدير متقدم محسن
 */
export interface AdvancedExportRequest extends ExportRequest {
    type: 'advanced';
    features?: AdvancedExportFeatures;
    processing?: AdvancedExportProcessing;
    validation?: AdvancedExportValidation;
}

/**
 * ميزات التصدير المتقدمة محسنة
 */
export interface AdvancedExportFeatures {
    batchExport?: boolean;
    parallelProcessing?: boolean;
    incrementalExport?: boolean;
    deltaExport?: boolean;
    compression?: boolean;
    encryption?: boolean;
    digitalSignature?: boolean;
    watermarking?: boolean;
    redaction?: boolean;
    annotation?: boolean;
}

/**
 * معالجة التصدير المتقدمة محسنة
 */
export interface AdvancedExportProcessing {
    queue?: boolean;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    timeout?: number;
    retries?: number;
    fallback?: boolean;
    caching?: boolean;
    optimization?: boolean;
    validation?: boolean;
    logging?: boolean;
}

/**
 * التحقق من صحة التصدير المتقدم محسن
 */
export interface AdvancedExportValidation {
    schema?: Record<string, unknown>;
    rules?: ExportValidationRule[];
    strict?: boolean;
    warnings?: boolean;
    errors?: boolean;
    suggestions?: boolean;
    autoFix?: boolean;
}

/**
 * قاعدة التحقق من صحة التصدير محسنة
 */
export interface ExportValidationRule {
    name: string;
    type: 'required' | 'format' | 'length' | 'pattern' | 'custom';
    value?: unknown;
    message?: string;
    severity?: 'error' | 'warning' | 'info';
    condition?: string;
}

// ==================== أنواع التصدير المتخصصة ====================

/**
 * تصدير الأكاديميا محسن
 */
export interface AcademicExportRequest extends ExportRequest {
    type: 'academic';
    format: 'docx' | 'pdf' | 'rtf';
    options?: AcademicExportOptions;
}

/**
 * خيارات تصدير الأكاديميا محسنة
 */
export interface AcademicExportOptions extends ExportOptions {
    citationStyle?: 'APA' | 'MLA' | 'Chicago' | 'Harvard' | 'IEEE';
    bibliography?: boolean;
    footnotes?: boolean;
    endnotes?: boolean;
    tableOfContents?: boolean;
    index?: boolean;
    appendices?: boolean;
    abstract?: boolean;
    keywords?: string[];
    acknowledgments?: boolean;
}

/**
 * تصدير الأعمال محسن
 */
export interface BusinessExportRequest extends ExportRequest {
    type: 'business';
    format: 'docx' | 'pptx' | 'pdf';
    options?: BusinessExportOptions;
}

/**
 * خيارات تصدير الأعمال محسنة
 */
export interface BusinessExportOptions extends ExportOptions {
    branding?: BusinessBranding;
    templates?: BusinessTemplates;
    compliance?: BusinessCompliance;
    localization?: BusinessLocalization;
}

/**
 * علامة تجارية للأعمال محسنة
 */
export interface BusinessBranding {
    logo?: string;
    colors?: Record<string, string>;
    fonts?: Record<string, string>;
    style?: 'corporate' | 'modern' | 'classic' | 'creative';
}

/**
 * قوالب الأعمال محسنة
 */
export interface BusinessTemplates {
    proposal?: string;
    report?: string;
    presentation?: string;
    contract?: string;
    invoice?: string;
    letter?: string;
}

/**
 * الامتثال للأعمال محسن
 */
export interface BusinessCompliance {
    standards?: string[];
    regulations?: string[];
    policies?: string[];
    procedures?: string[];
    guidelines?: string[];
}

/**
 * توطين الأعمال محسن
 */
export interface BusinessLocalization {
    language?: string;
    region?: string;
    currency?: string;
    dateFormat?: string;
    numberFormat?: string;
    timezone?: string;
}

// ==================== أنواع المساعدات ====================

/**
 * دالة التحقق من صحة التصدير
 */
export type ExportValidator<T> = (data: T) => boolean | string;

/**
 * دالة معالجة التصدير
 */
export type ExportProcessor<TInput, TOutput> = (input: TInput) => Promise<TOutput>;

/**
 * دالة معالجة الخطأ للتصدير
 */
export type ExportErrorHandler = (error: TypedError) => void | Promise<void>;

/**
 * دالة تسجيل التصدير
 */
export type ExportLogger = (message: string, metadata?: Record<string, unknown>) => void;

// ==================== أنواع Generic محسنة ====================

/**
 * نتيجة العملية للتصدير محسنة
 */
export interface ExportResult<T = unknown, E = TypedError> {
    success: boolean;
    data?: T;
    error?: E;
    message?: string;
    metadata?: Record<string, unknown>;
    processingTime?: number;
    fileSize?: number;
    format?: ExportFormat;
}

/**
 * خيارات العملية للتصدير محسنة
 */
export interface ExportProcessOptions {
    timeout?: number;
    retries?: number;
    validate?: boolean;
    log?: boolean;
    cache?: boolean;
    optimize?: boolean;
    compress?: boolean;
    encrypt?: boolean;
}

// ==================== أنواع الأدوات المساعدة ====================

/**
 * دالة المساعدة للتحقق من صحة طلب التصدير
 */
export function isValidExportRequest(request: unknown): request is ExportRequest {
    return (
        typeof request === 'object' &&
        request !== null &&
        'content' in request &&
        'format' in request &&
        typeof (request as ExportRequest).content === 'string' &&
        typeof (request as ExportRequest).format === 'string'
    );
}

/**
 * دالة المساعدة للتحقق من صحة استجابة التصدير
 */
export function isValidExportResponse(response: unknown): response is ExportResponse {
    return (
        typeof response === 'object' &&
        response !== null &&
        'fileUrl' in response &&
        'filename' in response &&
        'size' in response &&
        'format' in response &&
        'success' in response &&
        typeof (response as ExportResponse).fileUrl === 'string' &&
        typeof (response as ExportResponse).filename === 'string' &&
        typeof (response as ExportResponse).size === 'number' &&
        typeof (response as ExportResponse).format === 'string' &&
        typeof (response as ExportResponse).success === 'boolean'
    );
}

/**
 * دالة المساعدة للتحقق من صحة خيارات التصدير
 */
export function isValidExportOptions(options: unknown): options is ExportOptions {
    return (
        typeof options === 'object' &&
        options !== null &&
        (typeof (options as ExportOptions).includeImages === 'boolean' ||
            typeof (options as ExportOptions).includeImages === 'undefined') &&
        (typeof (options as ExportOptions).includeCharts === 'boolean' ||
            typeof (options as ExportOptions).includeCharts === 'undefined') &&
        (typeof (options as ExportOptions).includeTables === 'boolean' ||
            typeof (options as ExportOptions).includeTables === 'undefined')
    );
}

/**
 * دالة المساعدة للتحقق من صحة نمط التصدير
 */
export function isValidExportStyle(style: unknown): style is ExportStyle {
    return (
        typeof style === 'object' &&
        style !== null &&
        (typeof (style as ExportStyle).font === 'object' ||
            typeof (style as ExportStyle).font === 'undefined') &&
        (typeof (style as ExportStyle).colors === 'object' ||
            typeof (style as ExportStyle).colors === 'undefined') &&
        (typeof (style as ExportStyle).spacing === 'object' ||
            typeof (style as ExportStyle).spacing === 'undefined') &&
        (typeof (style as ExportStyle).layout === 'object' ||
            typeof (style as ExportStyle).layout === 'undefined')
    );
}

// جميع الأنواع مُصدَّرة بالفعل في بداية الملف
