/**
 * أنواع التصدير المشتركة
 *
 * هذا الملف يحتوي على الأنواع المستخدمة في عمليات التصدير
 * والتحويل بين التنسيقات المختلفة
 */

/**
 * نوع تنسيق التصدير
 */
export type ExportFormat = 'pdf' | 'docx' | 'pptx' | 'txt' | 'json' | 'html' | 'markdown';

/**
 * نوع التوجه
 */
export type Orientation = 'portrait' | 'landscape';

/**
 * نوع المحاذاة
 */
export type Alignment = 'left' | 'center' | 'right' | 'justify';

/**
 * نوع الخط
 */
export type FontFamily = 'Arial' | 'Times New Roman' | 'Calibri' | 'Tahoma' | 'Cairo' | 'Almarai';

/**
 * حجم الخط
 */
export type FontSize = 8 | 9 | 10 | 11 | 12 | 14 | 16 | 18 | 20 | 24 | 28 | 32 | 36 | 48 | 72;

/**
 * لون النص
 */
export type TextColor =
    | 'black' | 'white' | 'red' | 'green' | 'blue' | 'yellow' | 'orange' | 'purple' | 'pink' | 'brown' | 'gray'
    | 'dark-red' | 'dark-green' | 'dark-blue' | 'dark-yellow' | 'dark-orange' | 'dark-purple' | 'dark-pink' | 'dark-brown' | 'dark-gray'
    | 'light-red' | 'light-green' | 'light-blue' | 'light-yellow' | 'light-orange' | 'light-purple' | 'light-pink' | 'light-brown' | 'light-gray';

/**
 * خيارات الخط
 */
export interface FontOptions {
    family: FontFamily;
    size: FontSize;
    color: TextColor;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
}

/**
 * خيارات الفقرة
 */
export interface ParagraphOptions {
    alignment: Alignment;
    lineSpacing?: number;
    spaceBefore?: number;
    spaceAfter?: number;
    indent?: number;
    hangingIndent?: number;
}

/**
 * خيارات الجدول
 */
export interface TableOptions {
    borderWidth?: number;
    borderColor?: TextColor;
    headerBackground?: TextColor;
    alternateRowColor?: TextColor;
    cellPadding?: number;
    cellSpacing?: number;
}

/**
 * خيارات الصفحة
 */
export interface PageOptions {
    size: 'A4' | 'A3' | 'A5' | 'Letter' | 'Legal' | 'Tabloid';
    orientation: Orientation;
    margins: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    header?: HeaderFooterOptions;
    footer?: HeaderFooterOptions;
}

/**
 * خيارات الرأس والذيل
 */
export interface HeaderFooterOptions {
    content: string;
    fontSize?: FontSize;
    fontColor?: TextColor;
    alignment?: Alignment;
    pageNumbers?: boolean;
    pageNumberFormat?: '1' | '1 of 10' | 'Page 1' | 'صفحة 1';
}

/**
 * خيارات الصورة
 */
export interface ImageOptions {
    width?: number;
    height?: number;
    alignment?: Alignment;
    caption?: string;
    border?: boolean;
    borderWidth?: number;
    borderColor?: TextColor;
}

/**
 * خيارات الرسم البياني
 */
export interface ChartOptions {
    type: 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'doughnut';
    title?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    legend?: boolean;
    gridLines?: boolean;
    colors?: TextColor[];
}

/**
 * خيارات التصدير الأساسية
 */
export interface BaseExportOptions {
    format: ExportFormat;
    filename?: string;
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string[];
    creator?: string;
    producer?: string;
    creationDate?: Date;
    modificationDate?: Date;
}

/**
 * خيارات تصدير PDF
 */
export interface PDFExportOptions extends BaseExportOptions {
    format: 'pdf';
    pageOptions: PageOptions;
    fontOptions: FontOptions;
    paragraphOptions: ParagraphOptions;
    tableOptions?: TableOptions;
    imageOptions?: ImageOptions;
    chartOptions?: ChartOptions;
    watermark?: {
        text: string;
        opacity: number;
        angle: number;
        fontSize: FontSize;
        color: TextColor;
    };
    security?: {
        password?: string;
        permissions?: {
            print?: boolean;
            modify?: boolean;
            copy?: boolean;
            annotate?: boolean;
        };
    };
    compression?: {
        enabled: boolean;
        quality: number;
    };
}

/**
 * خيارات تصدير DOCX
 */
export interface DOCXExportOptions extends BaseExportOptions {
    format: 'docx';
    pageOptions: PageOptions;
    fontOptions: FontOptions;
    paragraphOptions: ParagraphOptions;
    tableOptions?: TableOptions;
    imageOptions?: ImageOptions;
    chartOptions?: ChartOptions;
    styles?: {
        heading1?: FontOptions;
        heading2?: FontOptions;
        heading3?: FontOptions;
        body?: FontOptions;
        caption?: FontOptions;
        quote?: FontOptions;
    };
    numbering?: {
        enabled: boolean;
        style: 'arabic' | 'roman' | 'alpha' | 'bullet';
        startValue?: number;
    };
    tableOfContents?: {
        enabled: boolean;
        depth: number;
        style?: FontOptions;
    };
}

/**
 * خيارات تصدير PPTX
 */
export interface PPTXExportOptions extends BaseExportOptions {
    format: 'pptx';
    slideSize: {
        width: number;
        height: number;
    };
    fontOptions: FontOptions;
    imageOptions?: ImageOptions;
    chartOptions?: ChartOptions;
    theme?: {
        name: string;
        colors: {
            primary: TextColor;
            secondary: TextColor;
            accent: TextColor;
            background: TextColor;
            text: TextColor;
        };
        fonts: {
            heading: FontFamily;
            body: FontFamily;
        };
    };
    transitions?: {
        enabled: boolean;
        type: 'fade' | 'slide' | 'wipe' | 'dissolve';
        duration: number;
    };
    animations?: {
        enabled: boolean;
        type: 'fade' | 'fly' | 'zoom' | 'bounce';
        duration: number;
    };
}

/**
 * خيارات تصدير TXT
 */
export interface TXTExportOptions extends BaseExportOptions {
    format: 'txt';
    encoding: 'utf-8' | 'utf-16' | 'ascii';
    lineEnding: 'lf' | 'crlf' | 'cr';
    wordWrap?: boolean;
    maxLineLength?: number;
}

/**
 * خيارات تصدير JSON
 */
export interface JSONExportOptions extends BaseExportOptions {
    format: 'json';
    prettyPrint: boolean;
    includeMetadata: boolean;
    excludeEmptyFields: boolean;
    dateFormat: 'iso' | 'timestamp' | 'custom';
    customDateFormat?: string;
}

/**
 * خيارات تصدير HTML
 */
export interface HTMLExportOptions extends BaseExportOptions {
    format: 'html';
    includeCSS: boolean;
    inlineStyles: boolean;
    externalCSS?: string[];
    responsive: boolean;
    metaTags: {
        description?: string;
        keywords?: string[];
        author?: string;
        viewport?: string;
    };
}

/**
 * خيارات تصدير Markdown
 */
export interface MarkdownExportOptions extends BaseExportOptions {
    format: 'markdown';
    includeTableOfContents: boolean;
    headingStyle: 'atx' | 'setext';
    listStyle: 'dash' | 'asterisk' | 'plus';
    codeBlockStyle: 'fenced' | 'indented';
    tableStyle: 'pipe' | 'html';
}

/**
 * اتحاد جميع خيارات التصدير
 */
export type ExportOptions =
    | PDFExportOptions
    | DOCXExportOptions
    | PPTXExportOptions
    | TXTExportOptions
    | JSONExportOptions
    | HTMLExportOptions
    | MarkdownExportOptions;

/**
 * نتيجة التصدير
 */
export interface ExportResult {
    success: boolean;
    filename: string;
    size: number;
    format: ExportFormat;
    downloadUrl?: string;
    error?: string;
    metadata?: {
        pages?: number;
        slides?: number;
        words?: number;
        characters?: number;
        images?: number;
        tables?: number;
        charts?: number;
    };
}

/**
 * تقدم التصدير
 */
export interface ExportProgress {
    stage: 'preparing' | 'processing' | 'finalizing' | 'completed' | 'error';
    progress: number; // 0-100
    message: string;
    estimatedTime?: number; // in seconds
    currentStep?: string;
    totalSteps?: number;
}

/**
 * إعدادات التحويل
 */
export interface ConversionSettings {
    inputFormat: ExportFormat;
    outputFormat: ExportFormat;
    preserveFormatting: boolean;
    preserveImages: boolean;
    preserveTables: boolean;
    preserveCharts: boolean;
    quality: 'low' | 'medium' | 'high' | 'original';
    compression: boolean;
}

/**
 * نتيجة التحويل
 */
export interface ConversionResult {
    success: boolean;
    inputFile: string;
    outputFile: string;
    inputSize: number;
    outputSize: number;
    compressionRatio?: number;
    quality?: number;
    error?: string;
    warnings?: string[];
}

/**
 * مساعد للتحقق من نوع خيارات التصدير
 */
export const isPDFExportOptions = (options: ExportOptions): options is PDFExportOptions => {
    return options.format === 'pdf';
};

export const isDOCXExportOptions = (options: ExportOptions): options is DOCXExportOptions => {
    return options.format === 'docx';
};

export const isPPTXExportOptions = (options: ExportOptions): options is PPTXExportOptions => {
    return options.format === 'pptx';
};

/**
 * مساعد للتحقق من نتيجة التصدير
 */
export const isExportResult = (value: any): value is ExportResult => {
    return typeof value === 'object' &&
        value !== null &&
        typeof value.success === 'boolean' &&
        typeof value.filename === 'string' &&
        typeof value.size === 'number' &&
        typeof value.format === 'string';
};
