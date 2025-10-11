/**
 * Error Formatter للتحقق من صحة البيانات
 * يوفر تنسيق جميل ومفيد لأخطاء التحقق من الصحة
 */

import { EnhancedError } from '../types/error-types';
import { ValidationError, ValidationWarning } from './unified-validator';

export interface FormattedValidationError {
    field: string;
    message: string;
    code: string;
    severity: 'error' | 'warning';
    userMessage: string;
    userGuidance: string;
    suggestedActions: string[];
    technicalDetails: string;
    path?: (string | number)[];
    value?: any;
}

export interface FormattedValidationWarning {
    field: string;
    message: string;
    code: string;
    suggestion?: string;
    userMessage: string;
    userGuidance: string;
}

export class ValidationErrorFormatter {
    private static readonly ERROR_MESSAGES: Record<string, {
        userMessage: string;
        userGuidance: string;
        suggestedActions: string[];
    }> = {
            'invalid_type': {
                userMessage: 'نوع البيانات غير صحيح',
                userGuidance: 'يرجى التأكد من نوع البيانات المدخلة',
                suggestedActions: ['مراجعة نوع البيانات', 'التأكد من التنسيق الصحيح']
            },
            'invalid_string': {
                userMessage: 'النص المدخل غير صحيح',
                userGuidance: 'يرجى التأكد من صحة النص المدخل',
                suggestedActions: ['مراجعة النص المدخل', 'التأكد من عدم وجود رموز غير صحيحة']
            },
            'invalid_number': {
                userMessage: 'الرقم المدخل غير صحيح',
                userGuidance: 'يرجى التأكد من صحة الرقم المدخل',
                suggestedActions: ['مراجعة الرقم المدخل', 'التأكد من التنسيق الصحيح']
            },
            'invalid_email': {
                userMessage: 'البريد الإلكتروني غير صحيح',
                userGuidance: 'يرجى التأكد من صحة البريد الإلكتروني',
                suggestedActions: ['مراجعة البريد الإلكتروني', 'التأكد من وجود @ و .']
            },
            'invalid_url': {
                userMessage: 'الرابط غير صحيح',
                userGuidance: 'يرجى التأكد من صحة الرابط',
                suggestedActions: ['مراجعة الرابط', 'التأكد من وجود http:// أو https://']
            },
            'too_small': {
                userMessage: 'القيمة صغيرة جداً',
                userGuidance: 'يرجى إدخال قيمة أكبر',
                suggestedActions: ['زيادة القيمة', 'مراجعة الحد الأدنى المطلوب']
            },
            'too_big': {
                userMessage: 'القيمة كبيرة جداً',
                userGuidance: 'يرجى إدخال قيمة أصغر',
                suggestedActions: ['تقليل القيمة', 'مراجعة الحد الأقصى المسموح']
            },
            'invalid_date': {
                userMessage: 'التاريخ غير صحيح',
                userGuidance: 'يرجى التأكد من صحة التاريخ',
                suggestedActions: ['مراجعة التاريخ', 'استخدام التنسيق الصحيح']
            },
            'custom': {
                userMessage: 'خطأ في التحقق من الصحة',
                userGuidance: 'يرجى مراجعة البيانات المدخلة',
                suggestedActions: ['مراجعة البيانات', 'المحاولة مرة أخرى']
            }
        };

    private static readonly WARNING_MESSAGES: Record<string, {
        userMessage: string;
        userGuidance: string;
    }> = {
            'EMPTY_FIELD': {
                userMessage: 'حقل فارغ',
                userGuidance: 'هذا الحقل فارغ، قد تحتاج لملئه'
            },
            'WEAK_PASSWORD': {
                userMessage: 'كلمة مرور ضعيفة',
                userGuidance: 'كلمة المرور ضعيفة، يُنصح بتقويتها'
            },
            'SUSPICIOUS_INPUT': {
                userMessage: 'إدخال مشبوه',
                userGuidance: 'يبدو أن الإدخال يحتوي على محتوى مشبوه'
            }
        };

    /**
     * تنسيق خطأ التحقق من الصحة
     */
    static formatError(error: ValidationError): FormattedValidationError {
        const errorInfo = this.ERROR_MESSAGES[error.code] || this.ERROR_MESSAGES['custom'];

        return {
            field: error.field,
            message: error.message,
            code: error.code,
            severity: error.severity,
            userMessage: errorInfo.userMessage,
            userGuidance: errorInfo.userGuidance,
            suggestedActions: errorInfo.suggestedActions,
            technicalDetails: this.generateTechnicalDetails(error),
            path: error.path,
            value: error.value
        };
    }

    /**
     * تنسيق تحذير التحقق من الصحة
     */
    static formatWarning(warning: ValidationWarning): FormattedValidationWarning {
        const warningInfo = this.WARNING_MESSAGES[warning.code] || {
            userMessage: 'تحذير',
            userGuidance: 'يرجى مراجعة هذا الحقل'
        };

        return {
            field: warning.field,
            message: warning.message,
            code: warning.code,
            suggestion: warning.suggestion,
            userMessage: warningInfo.userMessage,
            userGuidance: warningInfo.userGuidance
        };
    }

    /**
     * تنسيق عدة أخطاء
     */
    static formatErrors(errors: ValidationError[]): FormattedValidationError[] {
        return errors.map(error => this.formatError(error));
    }

    /**
     * تنسيق عدة تحذيرات
     */
    static formatWarnings(warnings: ValidationWarning[]): FormattedValidationWarning[] {
        return warnings.map(warning => this.formatWarning(warning));
    }

    /**
     * تحويل أخطاء التحقق من الصحة إلى EnhancedError
     */
    static toEnhancedError(
        errors: ValidationError[],
        context?: any
    ): EnhancedError {
        const formattedErrors = this.formatErrors(errors);
        const primaryError = formattedErrors[0];

        return {
            code: 'VALIDATION_ERROR' as keyof typeof import('../types/error-types').ERROR_MESSAGES,
            message: `فشل التحقق من صحة البيانات: ${errors.length} خطأ`,
            category: 'ai_generation',
            severity: 'low',
            userMessage: primaryError.userMessage,
            userGuidance: primaryError.userGuidance,
            suggestedActions: primaryError.suggestedActions,
            technicalDetails: JSON.stringify(formattedErrors, null, 2),
            isRetryable: true,
            retryAfter: 1,
            fallbackAvailable: false,
            timestamp: new Date().toISOString(),
            context: {
                validationErrors: formattedErrors,
                errorCount: errors.length,
                userContext: context,
                validationSystem: true
            }
        };
    }

    /**
     * إنشاء رسالة خطأ باللغة العربية
     */
    static createArabicErrorMessage(error: ValidationError): string {
        const fieldName = this.getArabicFieldName(error.field);

        switch (error.code) {
            case 'invalid_type':
                return `نوع البيانات في حقل "${fieldName}" غير صحيح`;
            case 'invalid_string':
                return `النص في حقل "${fieldName}" غير صحيح`;
            case 'invalid_number':
                return `الرقم في حقل "${fieldName}" غير صحيح`;
            case 'invalid_email':
                return `البريد الإلكتروني في حقل "${fieldName}" غير صحيح`;
            case 'invalid_url':
                return `الرابط في حقل "${fieldName}" غير صحيح`;
            case 'too_small':
                return `القيمة في حقل "${fieldName}" صغيرة جداً`;
            case 'too_big':
                return `القيمة في حقل "${fieldName}" كبيرة جداً`;
            case 'invalid_date':
                return `التاريخ في حقل "${fieldName}" غير صحيح`;
            default:
                return `خطأ في حقل "${fieldName}": ${error.message}`;
        }
    }

    /**
     * إنشاء رسالة تحذير باللغة العربية
     */
    static createArabicWarningMessage(warning: ValidationWarning): string {
        const fieldName = this.getArabicFieldName(warning.field);

        switch (warning.code) {
            case 'EMPTY_FIELD':
                return `حقل "${fieldName}" فارغ`;
            case 'WEAK_PASSWORD':
                return `كلمة المرور في حقل "${fieldName}" ضعيفة`;
            case 'SUSPICIOUS_INPUT':
                return `إدخال مشبوه في حقل "${fieldName}"`;
            default:
                return `تحذير في حقل "${fieldName}": ${warning.message}`;
        }
    }

    /**
     * إنشاء ملخص للأخطاء
     */
    static createErrorSummary(errors: ValidationError[]): string {
        if (errors.length === 0) {
            return 'لا توجد أخطاء';
        }

        if (errors.length === 1) {
            return this.createArabicErrorMessage(errors[0]);
        }

        const fieldNames = errors.map(error => this.getArabicFieldName(error.field));
        return `أخطاء في الحقول التالية: ${fieldNames.join('، ')}`;
    }

    /**
     * إنشاء ملخص للتحذيرات
     */
    static createWarningSummary(warnings: ValidationWarning[]): string {
        if (warnings.length === 0) {
            return 'لا توجد تحذيرات';
        }

        if (warnings.length === 1) {
            return this.createArabicWarningMessage(warnings[0]);
        }

        const fieldNames = warnings.map(warning => this.getArabicFieldName(warning.field));
        return `تحذيرات في الحقول التالية: ${fieldNames.join('، ')}`;
    }

    /**
     * الحصول على الاسم العربي للحقل
     */
    private static getArabicFieldName(field: string): string {
        const fieldNames: Record<string, string> = {
            'email': 'البريد الإلكتروني',
            'password': 'كلمة المرور',
            'name': 'الاسم',
            'username': 'اسم المستخدم',
            'phone': 'رقم الهاتف',
            'address': 'العنوان',
            'date': 'التاريخ',
            'time': 'الوقت',
            'url': 'الرابط',
            'age': 'العمر',
            'gender': 'الجنس',
            'country': 'البلد',
            'city': 'المدينة',
            'zip': 'الرمز البريدي',
            'firstName': 'الاسم الأول',
            'lastName': 'اسم العائلة',
            'middleName': 'الاسم الأوسط',
            'title': 'اللقب',
            'company': 'الشركة',
            'job': 'الوظيفة',
            'department': 'القسم',
            'salary': 'الراتب',
            'description': 'الوصف',
            'notes': 'الملاحظات',
            'comments': 'التعليقات',
            'message': 'الرسالة',
            'subject': 'الموضوع',
            'content': 'المحتوى',
            'title': 'العنوان',
            'category': 'الفئة',
            'tags': 'العلامات',
            'status': 'الحالة',
            'priority': 'الأولوية',
            'type': 'النوع',
            'level': 'المستوى',
            'value': 'القيمة',
            'amount': 'المبلغ',
            'price': 'السعر',
            'quantity': 'الكمية',
            'weight': 'الوزن',
            'height': 'الارتفاع',
            'width': 'العرض',
            'length': 'الطول',
            'color': 'اللون',
            'size': 'الحجم',
            'format': 'التنسيق',
            'version': 'الإصدار',
            'id': 'المعرف',
            'code': 'الكود',
            'key': 'المفتاح',
            'token': 'الرمز المميز',
            'session': 'الجلسة',
            'user': 'المستخدم',
            'admin': 'المدير',
            'guest': 'الضيف',
            'member': 'العضو',
            'customer': 'العميل',
            'client': 'الزبون',
            'vendor': 'المورد',
            'supplier': 'المزود',
            'partner': 'الشريك',
            'employee': 'الموظف',
            'manager': 'المدير',
            'director': 'المدير التنفيذي',
            'ceo': 'الرئيس التنفيذي',
            'cto': 'الرئيس التقني',
            'cfo': 'الرئيس المالي',
            'coo': 'الرئيس التشغيلي'
        };

        return fieldNames[field] || field;
    }

    /**
     * إنشاء التفاصيل التقنية للخطأ
     */
    private static generateTechnicalDetails(error: ValidationError): string {
        const details = [
            `Field: ${error.field}`,
            `Code: ${error.code}`,
            `Message: ${error.message}`,
            `Severity: ${error.severity}`
        ];

        if (error.path && error.path.length > 0) {
            details.push(`Path: ${error.path.join('.')}`);
        }

        if (error.value !== undefined) {
            details.push(`Value: ${JSON.stringify(error.value)}`);
        }

        return details.join('\n');
    }
}

export default ValidationErrorFormatter;
