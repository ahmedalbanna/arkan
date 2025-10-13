/**
 * أدوات التحقق من البيانات الموحدة
 *
 * هذا الملف يحتوي على جميع أدوات التحقق من البيانات
 * المستخدمة في التطبيق
 */

import {
    NUMBER_VALIDATION_RULES,
    TEXT_VALIDATION_RULES,
    VALIDATION_MESSAGES
} from '../../lib/core/constants';

/**
 * التحقق من صحة البريد الإلكتروني
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
    if (!email) {
        return { valid: false, error: VALIDATION_MESSAGES.REQUIRED };
    }

    if (email.length > TEXT_VALIDATION_RULES.EMAIL_MAX) {
        return { valid: false, error: VALIDATION_MESSAGES.MAX_LENGTH(TEXT_VALIDATION_RULES.EMAIL_MAX) };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { valid: false, error: VALIDATION_MESSAGES.INVALID_EMAIL };
    }

    return { valid: true };
}

/**
 * التحقق من صحة رقم الهاتف
 */
export function validatePhone(phone: string): { valid: boolean; error?: string } {
    if (!phone) {
        return { valid: false, error: VALIDATION_MESSAGES.REQUIRED };
    }

    if (phone.length > TEXT_VALIDATION_RULES.PHONE_MAX) {
        return { valid: false, error: VALIDATION_MESSAGES.MAX_LENGTH(TEXT_VALIDATION_RULES.PHONE_MAX) };
    }

    if (!/^[\+]?[1-9][\d]{0,15}$/.test(phone)) {
        return { valid: false, error: VALIDATION_MESSAGES.INVALID_PHONE };
    }

    return { valid: true };
}

/**
 * التحقق من صحة كلمة المرور
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!password) {
        errors.push(VALIDATION_MESSAGES.REQUIRED);
        return { valid: false, errors };
    }

    if (password.length < TEXT_VALIDATION_RULES.PASSWORD_MIN) {
        errors.push(VALIDATION_MESSAGES.MIN_LENGTH(TEXT_VALIDATION_RULES.PASSWORD_MIN));
    }

    if (password.length > TEXT_VALIDATION_RULES.PASSWORD_MAX) {
        errors.push(VALIDATION_MESSAGES.MAX_LENGTH(TEXT_VALIDATION_RULES.PASSWORD_MAX));
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('يجب أن تحتوي كلمة المرور على رقم واحد على الأقل');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * التحقق من صحة اسم المستخدم
 */
export function validateUsername(username: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!username) {
        errors.push(VALIDATION_MESSAGES.REQUIRED);
        return { valid: false, errors };
    }

    if (username.length < TEXT_VALIDATION_RULES.USERNAME_MIN) {
        errors.push(VALIDATION_MESSAGES.MIN_LENGTH(TEXT_VALIDATION_RULES.USERNAME_MIN));
    }

    if (username.length > TEXT_VALIDATION_RULES.USERNAME_MAX) {
        errors.push(VALIDATION_MESSAGES.MAX_LENGTH(TEXT_VALIDATION_RULES.USERNAME_MAX));
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        errors.push('يجب أن يحتوي اسم المستخدم على أحرف وأرقام وشرطات وشرطات سفلية فقط');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * التحقق من صحة النص
 */
export function validateText(text: string, minLength?: number, maxLength?: number): { valid: boolean; error?: string } {
    if (!text) {
        return { valid: false, error: VALIDATION_MESSAGES.REQUIRED };
    }

    const min = minLength || TEXT_VALIDATION_RULES.MIN_LENGTH;
    const max = maxLength || TEXT_VALIDATION_RULES.MAX_LENGTH;

    if (text.length < min) {
        return { valid: false, error: VALIDATION_MESSAGES.MIN_LENGTH(min) };
    }

    if (text.length > max) {
        return { valid: false, error: VALIDATION_MESSAGES.MAX_LENGTH(max) };
    }

    return { valid: true };
}

/**
 * التحقق من صحة الرقم
 */
export function validateNumber(value: number, min?: number, max?: number): { valid: boolean; error?: string } {
    if (typeof value !== 'number' || isNaN(value)) {
        return { valid: false, error: 'يجب أن تكون القيمة رقماً صحيحاً' };
    }

    const minValue = min || NUMBER_VALIDATION_RULES.MIN_VALUE;
    const maxValue = max || NUMBER_VALIDATION_RULES.MAX_VALUE;

    if (value < minValue) {
        return { valid: false, error: VALIDATION_MESSAGES.MIN_VALUE(minValue) };
    }

    if (value > maxValue) {
        return { valid: false, error: VALIDATION_MESSAGES.MAX_VALUE(maxValue) };
    }

    return { valid: true };
}

/**
 * التحقق من صحة URL
 */
export function validateUrl(url: string): { valid: boolean; error?: string } {
    if (!url) {
        return { valid: false, error: VALIDATION_MESSAGES.REQUIRED };
    }

    if (url.length < 10) {
        return { valid: false, error: VALIDATION_MESSAGES.MIN_LENGTH(10) };
    }

    if (url.length > 2048) {
        return { valid: false, error: VALIDATION_MESSAGES.MAX_LENGTH(2048) };
    }

    try {
        new URL(url);
        if (!/^https?:\/\/.+/.test(url)) {
            return { valid: false, error: VALIDATION_MESSAGES.INVALID_URL };
        }
        return { valid: true };
    } catch {
        return { valid: false, error: VALIDATION_MESSAGES.INVALID_URL };
    }
}

/**
 * التحقق من صحة التاريخ
 */
export function validateDate(date: string | Date): { valid: boolean; error?: string } {
    if (!date) {
        return { valid: false, error: VALIDATION_MESSAGES.REQUIRED };
    }

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
        return { valid: false, error: 'تاريخ غير صحيح' };
    }

    return { valid: true };
}

/**
 * التحقق من صحة الملف
 */
export function validateFile(file: File, options: {
    maxSize?: number;
    acceptedTypes?: string[];
}): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!file) {
        errors.push(VALIDATION_MESSAGES.REQUIRED);
        return { valid: false, errors };
    }

    if (options.maxSize && file.size > options.maxSize) {
        const maxSizeMB = (options.maxSize / (1024 * 1024)).toFixed(2);
        errors.push(`حجم الملف كبير جداً. الحد الأقصى ${maxSizeMB} MB`);
    }

    if (options.acceptedTypes && !options.acceptedTypes.includes(file.type)) {
        errors.push(`نوع الملف غير مدعوم. الأنواع المدعومة: ${options.acceptedTypes.join(', ')}`);
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * التحقق من صحة المصفوفة
 */
export function validateArray<T>(array: T[], minLength?: number, maxLength?: number): { valid: boolean; error?: string } {
    if (!Array.isArray(array)) {
        return { valid: false, error: 'يجب أن تكون القيمة مصفوفة' };
    }

    if (minLength !== undefined && array.length < minLength) {
        return { valid: false, error: `يجب أن تحتوي المصفوفة على ${minLength} عنصر على الأقل` };
    }

    if (maxLength !== undefined && array.length > maxLength) {
        return { valid: false, error: `يجب أن تحتوي المصفوفة على ${maxLength} عنصر على الأكثر` };
    }

    return { valid: true };
}

/**
 * التحقق من صحة الكائن
 */
export function validateObject(obj: any, requiredFields: string[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!obj || typeof obj !== 'object') {
        errors.push('يجب أن تكون القيمة كائناً');
        return { valid: false, errors };
    }

    for (const field of requiredFields) {
        if (!(field in obj) || obj[field] === undefined || obj[field] === null) {
            errors.push(`الحقل ${field} مطلوب`);
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * التحقق من صحة النمط
 */
export function validatePattern(value: string, pattern: RegExp, errorMessage: string): { valid: boolean; error?: string } {
    if (!value) {
        return { valid: false, error: VALIDATION_MESSAGES.REQUIRED };
    }

    if (!pattern.test(value)) {
        return { valid: false, error: errorMessage };
    }

    return { valid: true };
}

/**
 * التحقق من صحة النص العربي
 */
export function validateArabicText(text: string): { valid: boolean; error?: string } {
    if (!text) {
        return { valid: false, error: VALIDATION_MESSAGES.REQUIRED };
    }

    if (!/^[\u0600-\u06FF\s]+$/.test(text)) {
        return { valid: false, error: 'يجب أن يحتوي النص على أحرف عربية فقط' };
    }

    return { valid: true };
}

/**
 * التحقق من صحة النص الإنجليزي
 */
export function validateEnglishText(text: string): { valid: boolean; error?: string } {
    if (!text) {
        return { valid: false, error: VALIDATION_MESSAGES.REQUIRED };
    }

    if (!/^[a-zA-Z\s]+$/.test(text)) {
        return { valid: false, error: 'يجب أن يحتوي النص على أحرف إنجليزية فقط' };
    }

    return { valid: true };
}

/**
 * التحقق من صحة النص المختلط
 */
export function validateMixedText(text: string): { valid: boolean; error?: string } {
    if (!text) {
        return { valid: false, error: VALIDATION_MESSAGES.REQUIRED };
    }

    if (!/^[\u0600-\u06FFa-zA-Z0-9\s.,!?]+$/.test(text)) {
        return { valid: false, error: 'يجب أن يحتوي النص على أحرف عربية أو إنجليزية أو أرقام فقط' };
    }

    return { valid: true };
}

/**
 * التحقق من صحة IBAN
 */
export function validateIBAN(iban: string): { valid: boolean; error?: string } {
    if (!iban) {
        return { valid: false, error: VALIDATION_MESSAGES.REQUIRED };
    }

    if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/.test(iban)) {
        return { valid: false, error: 'رقم IBAN غير صحيح' };
    }

    return { valid: true };
}

/**
 * التحقق من صحة رقم البطاقة الائتمانية
 */
export function validateCreditCard(cardNumber: string): { valid: boolean; error?: string } {
    if (!cardNumber) {
        return { valid: false, error: VALIDATION_MESSAGES.REQUIRED };
    }

    if (!/^[0-9]{13,19}$/.test(cardNumber)) {
        return { valid: false, error: 'رقم البطاقة الائتمانية غير صحيح' };
    }

    return { valid: true };
}

/**
 * التحقق من صحة UUID
 */
export function validateUUID(uuid: string): { valid: boolean; error?: string } {
    if (!uuid) {
        return { valid: false, error: VALIDATION_MESSAGES.REQUIRED };
    }

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid)) {
        return { valid: false, error: 'UUID غير صحيح' };
    }

    return { valid: true };
}

/**
 * التحقق من صحة النسبة المئوية
 */
export function validatePercentage(value: number): { valid: boolean; error?: string } {
    if (typeof value !== 'number' || isNaN(value)) {
        return { valid: false, error: 'يجب أن تكون القيمة رقماً صحيحاً' };
    }

    if (value < 0 || value > 100) {
        return { valid: false, error: 'يجب أن تكون النسبة المئوية بين 0 و 100' };
    }

    return { valid: true };
}

/**
 * التحقق من صحة كلمة المرور المطابقة
 */
export function validatePasswordMatch(password: string, confirmPassword: string): { valid: boolean; error?: string } {
    if (!password) {
        return { valid: false, error: 'كلمة المرور مطلوبة' };
    }

    if (!confirmPassword) {
        return { valid: false, error: 'تأكيد كلمة المرور مطلوب' };
    }

    if (password !== confirmPassword) {
        return { valid: false, error: VALIDATION_MESSAGES.PASSWORDS_NOT_MATCH };
    }

    return { valid: true };
}

/**
 * التحقق من صحة البيانات المتعددة
 */
export function validateMultiple(values: Array<{ value: any; validator: (value: any) => { valid: boolean; error?: string } }>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const { value, validator } of values) {
        const result = validator(value);
        if (!result.valid && result.error) {
            errors.push(result.error);
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
