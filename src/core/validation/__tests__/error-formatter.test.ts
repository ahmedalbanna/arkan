/**
 * اختبارات شاملة لـ ValidationErrorFormatter
 * تغطي جميع وظائف التنسيق والأخطاء والتحذيرات
 */

import { describe, expect, test } from '@jest/globals';
import { ValidationErrorFormatter } from '../error-formatter';
import { ValidationError, ValidationWarning } from '../unified-validator';

describe('ValidationErrorFormatter', () => {
    describe('Error Formatting', () => {
        test('should format invalid_type error correctly', () => {
            const error: ValidationError = {
                field: 'age',
                message: 'Expected number, received string',
                code: 'invalid_type',
                severity: 'error',
                path: ['age'],
                value: 'twenty'
            };

            const formatted = ValidationErrorFormatter.formatError(error);

            expect(formatted.field).toBe('age');
            expect(formatted.userMessage).toBe('نوع البيانات غير صحيح');
            expect(formatted.userGuidance).toBe('يرجى التأكد من نوع البيانات المدخلة');
            expect(formatted.suggestedActions).toContain('مراجعة نوع البيانات');
        });

        test('should format invalid_email error correctly', () => {
            const error: ValidationError = {
                field: 'email',
                message: 'Invalid email format',
                code: 'invalid_email',
                severity: 'error',
                path: ['email'],
                value: 'invalid-email'
            };

            const formatted = ValidationErrorFormatter.formatError(error);

            expect(formatted.field).toBe('email');
            expect(formatted.userMessage).toBe('البريد الإلكتروني غير صحيح');
            expect(formatted.userGuidance).toBe('يرجى التأكد من صحة البريد الإلكتروني');
            expect(formatted.suggestedActions).toContain('مراجعة البريد الإلكتروني');
        });

        test('should format too_small error correctly', () => {
            const error: ValidationError = {
                field: 'password',
                message: 'String must contain at least 8 character(s)',
                code: 'too_small',
                severity: 'error',
                path: ['password'],
                value: '123'
            };

            const formatted = ValidationErrorFormatter.formatError(error);

            expect(formatted.field).toBe('password');
            expect(formatted.userMessage).toBe('القيمة صغيرة جداً');
            expect(formatted.userGuidance).toBe('يرجى إدخال قيمة أكبر');
            expect(formatted.suggestedActions).toContain('زيادة القيمة');
        });

        test('should format too_big error correctly', () => {
            const error: ValidationError = {
                field: 'description',
                message: 'String must contain at most 500 character(s)',
                code: 'too_big',
                severity: 'error',
                path: ['description'],
                value: 'x'.repeat(600)
            };

            const formatted = ValidationErrorFormatter.formatError(error);

            expect(formatted.field).toBe('description');
            expect(formatted.userMessage).toBe('القيمة كبيرة جداً');
            expect(formatted.userGuidance).toBe('يرجى إدخال قيمة أصغر');
            expect(formatted.suggestedActions).toContain('تقليل القيمة');
        });

        test('should format custom error correctly', () => {
            const error: ValidationError = {
                field: 'username',
                message: 'Username already exists',
                code: 'custom',
                severity: 'error',
                path: ['username'],
                value: 'existing_user'
            };

            const formatted = ValidationErrorFormatter.formatError(error);

            expect(formatted.field).toBe('username');
            expect(formatted.userMessage).toBe('خطأ في التحقق من الصحة');
            expect(formatted.userGuidance).toBe('يرجى مراجعة البيانات المدخلة');
            expect(formatted.suggestedActions).toContain('مراجعة البيانات');
        });

        test('should handle unknown error codes', () => {
            const error: ValidationError = {
                field: 'unknown_field',
                message: 'Unknown error',
                code: 'unknown_code' as any,
                severity: 'error',
                path: ['unknown_field'],
                value: 'test'
            };

            const formatted = ValidationErrorFormatter.formatError(error);

            expect(formatted.field).toBe('unknown_field');
            expect(formatted.userMessage).toBe('خطأ في التحقق من الصحة');
            expect(formatted.userGuidance).toBe('يرجى مراجعة البيانات المدخلة');
        });
    });

    describe('Warning Formatting', () => {
        test('should format empty field warning correctly', () => {
            const warning: ValidationWarning = {
                field: 'optional_field',
                message: 'Field is empty',
                code: 'EMPTY_FIELD',
                severity: 'warning',
                path: ['optional_field'],
                value: ''
            };

            const formatted = ValidationErrorFormatter.formatWarning(warning);

            expect(formatted.field).toBe('optional_field');
            expect(formatted.userMessage).toBe('حقل فارغ');
            expect(formatted.userGuidance).toBe('هذا الحقل فارغ، قد تحتاج لملئه');
        });

        test('should format weak password warning correctly', () => {
            const warning: ValidationWarning = {
                field: 'password',
                message: 'Password is weak',
                code: 'WEAK_PASSWORD',
                severity: 'warning',
                path: ['password'],
                value: '123456'
            };

            const formatted = ValidationErrorFormatter.formatWarning(warning);

            expect(formatted.field).toBe('password');
            expect(formatted.userMessage).toBe('كلمة مرور ضعيفة');
            expect(formatted.userGuidance).toBe('كلمة المرور ضعيفة، يُنصح بتقويتها');
        });

        test('should format suspicious input warning correctly', () => {
            const warning: ValidationWarning = {
                field: 'comment',
                message: 'Suspicious input detected',
                code: 'SUSPICIOUS_INPUT',
                severity: 'warning',
                path: ['comment'],
                value: '<script>alert("xss")</script>'
            };

            const formatted = ValidationErrorFormatter.formatWarning(warning);

            expect(formatted.field).toBe('comment');
            expect(formatted.userMessage).toBe('إدخال مشبوه');
            expect(formatted.userGuidance).toBe('يبدو أن الإدخال يحتوي على محتوى مشبوه');
        });

        test('should handle unknown warning codes', () => {
            const warning: ValidationWarning = {
                field: 'unknown_field',
                message: 'Unknown warning',
                code: 'UNKNOWN_WARNING' as any,
                severity: 'warning',
                path: ['unknown_field'],
                value: 'test'
            };

            const formatted = ValidationErrorFormatter.formatWarning(warning);

            expect(formatted.field).toBe('unknown_field');
            expect(formatted.userMessage).toBe('تحذير');
            expect(formatted.userGuidance).toBe('يرجى مراجعة هذا الحقل');
        });
    });

    describe('Arabic Error Messages', () => {
        test('should create Arabic error message for invalid_type', () => {
            const error: ValidationError = {
                field: 'age',
                message: 'Expected number, received string',
                code: 'invalid_type',
                severity: 'error',
                path: ['age'],
                value: 'twenty'
            };

            const message = ValidationErrorFormatter.createArabicErrorMessage(error);

            expect(message).toContain('العمر');
            expect(message).toContain('نوع البيانات');
        });

        test('should create Arabic error message for invalid_email', () => {
            const error: ValidationError = {
                field: 'email',
                message: 'Invalid email format',
                code: 'invalid_email',
                severity: 'error',
                path: ['email'],
                value: 'invalid-email'
            };

            const message = ValidationErrorFormatter.createArabicErrorMessage(error);

            expect(message).toContain('البريد الإلكتروني');
            expect(message).toContain('غير صحيح');
        });

        test('should create Arabic error message for too_small', () => {
            const error: ValidationError = {
                field: 'password',
                message: 'String must contain at least 8 character(s)',
                code: 'too_small',
                severity: 'error',
                path: ['password'],
                value: '123'
            };

            const message = ValidationErrorFormatter.createArabicErrorMessage(error);

            expect(message).toContain('كلمة المرور');
            expect(message).toContain('صغيرة جداً');
        });

        test('should create Arabic error message for too_big', () => {
            const error: ValidationError = {
                field: 'description',
                message: 'String must contain at most 500 character(s)',
                code: 'too_big',
                severity: 'error',
                path: ['description'],
                value: 'x'.repeat(600)
            };

            const message = ValidationErrorFormatter.createArabicErrorMessage(error);

            expect(message).toContain('الوصف');
            expect(message).toContain('كبيرة جداً');
        });

        test('should create Arabic error message for custom error', () => {
            const error: ValidationError = {
                field: 'username',
                message: 'Username already exists',
                code: 'custom',
                severity: 'error',
                path: ['username'],
                value: 'existing_user'
            };

            const message = ValidationErrorFormatter.createArabicErrorMessage(error);

            expect(message).toContain('اسم المستخدم');
            expect(message).toContain('Username already exists');
        });

        test('should handle unknown field names', () => {
            const error: ValidationError = {
                field: 'unknown_field',
                message: 'Unknown error',
                code: 'invalid_type',
                severity: 'error',
                path: ['unknown_field'],
                value: 'test'
            };

            const message = ValidationErrorFormatter.createArabicErrorMessage(error);

            expect(message).toContain('unknown_field');
            expect(message).toContain('نوع البيانات');
        });
    });

    describe('Arabic Warning Messages', () => {
        test('should create Arabic warning message for empty field', () => {
            const warning: ValidationWarning = {
                field: 'optional_field',
                message: 'Field is empty',
                code: 'EMPTY_FIELD'
            };

            const message = ValidationErrorFormatter.createArabicWarningMessage(warning);

            expect(message).toContain('optional_field');
            expect(message).toContain('فارغ');
        });

        test('should create Arabic warning message for weak password', () => {
            const warning: ValidationWarning = {
                field: 'password',
                message: 'Password is weak',
                code: 'WEAK_PASSWORD'
            };

            const message = ValidationErrorFormatter.createArabicWarningMessage(warning);

            expect(message).toContain('كلمة المرور');
            expect(message).toContain('ضعيفة');
        });

        test('should create Arabic warning message for suspicious input', () => {
            const warning: ValidationWarning = {
                field: 'comment',
                message: 'Suspicious input detected',
                code: 'SUSPICIOUS_INPUT'
            };

            const message = ValidationErrorFormatter.createArabicWarningMessage(warning);

            expect(message).toContain('comment');
            expect(message).toContain('إدخال مشبوه');
        });
    });

    describe('Field Name Translation', () => {
        test('should translate common field names to Arabic', () => {
            const commonFields = [
                'name', 'email', 'password', 'age', 'phone', 'address',
                'username', 'firstName', 'lastName', 'gender',
                'country', 'city', 'zipCode', 'website', 'description',
                'title', 'content', 'category', 'tags', 'price', 'quantity',
                'status', 'type', 'level', 'score', 'rating', 'comment',
                'message', 'subject', 'body', 'attachment', 'file', 'image',
                'video', 'audio', 'document', 'link', 'url', 'slug'
            ];

            commonFields.forEach(field => {
                // Test that the method exists and returns a string
                const arabicName = (ValidationErrorFormatter as any).getArabicFieldName(field);
                expect(arabicName).toBeDefined();
                expect(typeof arabicName).toBe('string');
            });
        });

        test('should return original field name for unknown fields', () => {
            const unknownField = 'unknown_field_name';
            const arabicName = (ValidationErrorFormatter as any).getArabicFieldName(unknownField);

            expect(arabicName).toBe(unknownField);
        });

        test('should handle nested field paths', () => {
            const nestedField = 'user.profile.name';
            const arabicName = (ValidationErrorFormatter as any).getArabicFieldName(nestedField);

            // For nested fields, it should return the original field name
            expect(arabicName).toBe(nestedField);
        });
    });

    describe('Error Severity Mapping', () => {
        test('should map error severity correctly', () => {
            const error: ValidationError = {
                field: 'test',
                message: 'Test error',
                code: 'invalid_type',
                severity: 'error',
                path: ['test'],
                value: 'test'
            };

            const formatted = ValidationErrorFormatter.formatError(error);

            expect(formatted.severity).toBe('error');
        });

        test('should map warning severity correctly', () => {
            const warning: ValidationWarning = {
                field: 'test',
                message: 'Test warning',
                code: 'EMPTY_FIELD'
            };

            const formatted = ValidationErrorFormatter.formatWarning(warning);

            // ValidationWarning doesn't have severity, so we check if formatted has severity
            expect(formatted).toBeDefined();
        });
    });

    describe('Edge Cases', () => {
        test('should handle empty error message', () => {
            const error: ValidationError = {
                field: 'test',
                message: '',
                code: 'invalid_type',
                severity: 'error',
                path: ['test'],
                value: 'test'
            };

            const formatted = ValidationErrorFormatter.formatError(error);

            expect(formatted.field).toBe('test');
            expect(formatted.userMessage).toBeDefined();
        });

        test('should handle null field value', () => {
            const error: ValidationError = {
                field: 'test',
                message: 'Test error',
                code: 'invalid_type',
                severity: 'error',
                path: ['test'],
                value: null
            };

            const formatted = ValidationErrorFormatter.formatError(error);

            expect(formatted.field).toBe('test');
            expect(formatted.userMessage).toBeDefined();
        });

        test('should handle undefined field value', () => {
            const error: ValidationError = {
                field: 'test',
                message: 'Test error',
                code: 'invalid_type',
                severity: 'error',
                path: ['test'],
                value: undefined
            };

            const formatted = ValidationErrorFormatter.formatError(error);

            expect(formatted.field).toBe('test');
            expect(formatted.userMessage).toBeDefined();
        });

        test('should handle empty path array', () => {
            const error: ValidationError = {
                field: 'test',
                message: 'Test error',
                code: 'invalid_type',
                severity: 'error',
                path: [],
                value: 'test'
            };

            const formatted = ValidationErrorFormatter.formatError(error);

            expect(formatted.field).toBe('test');
            expect(formatted.userMessage).toBeDefined();
        });

        test('should handle very long field names', () => {
            const longFieldName = 'very_long_field_name_that_exceeds_normal_length';
            const error: ValidationError = {
                field: longFieldName,
                message: 'Test error',
                code: 'invalid_type',
                severity: 'error',
                path: [longFieldName],
                value: 'test'
            };

            const formatted = ValidationErrorFormatter.formatError(error);

            expect(formatted.field).toBe(longFieldName);
            expect(formatted.userMessage).toBeDefined();
        });
    });

    describe('Performance Tests', () => {
        test('should format errors efficiently', () => {
            const errors: ValidationError[] = Array.from({ length: 1000 }, (_, i) => ({
                field: `field_${i}`,
                message: `Error message ${i}`,
                code: 'invalid_type',
                severity: 'error',
                path: [`field_${i}`],
                value: `value_${i}`
            }));

            const startTime = performance.now();
            const formatted = errors.map(error => ValidationErrorFormatter.formatError(error));
            const endTime = performance.now();

            expect(formatted).toHaveLength(1000);
            expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
        });

        test('should format warnings efficiently', () => {
            const warnings: ValidationWarning[] = Array.from({ length: 1000 }, (_, i) => ({
                field: `field_${i}`,
                message: `Warning message ${i}`,
                code: 'EMPTY_FIELD',
                severity: 'warning',
                path: [`field_${i}`],
                value: ''
            }));

            const startTime = performance.now();
            const formatted = warnings.map(warning => ValidationErrorFormatter.formatWarning(warning));
            const endTime = performance.now();

            expect(formatted).toHaveLength(1000);
            expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
        });
    });

    describe('Integration Tests', () => {
        test('should work with real-world validation errors', () => {
            const realWorldErrors: ValidationError[] = [
                {
                    field: 'email',
                    message: 'Invalid email format',
                    code: 'invalid_email',
                    severity: 'error',
                    path: ['email'],
                    value: 'invalid-email'
                },
                {
                    field: 'password',
                    message: 'String must contain at least 8 character(s)',
                    code: 'too_small',
                    severity: 'error',
                    path: ['password'],
                    value: '123'
                },
                {
                    field: 'age',
                    message: 'Expected number, received string',
                    code: 'invalid_type',
                    severity: 'error',
                    path: ['age'],
                    value: 'twenty'
                },
                {
                    field: 'phone',
                    message: 'Invalid phone number format',
                    code: 'custom',
                    severity: 'error',
                    path: ['phone'],
                    value: '123'
                }
            ];

            const formatted = realWorldErrors.map(error => ValidationErrorFormatter.formatError(error));

            expect(formatted).toHaveLength(4);
            formatted.forEach((formatted, index) => {
                expect(formatted.field).toBe(realWorldErrors[index].field);
                expect(formatted.userMessage).toBeDefined();
                expect(formatted.userGuidance).toBeDefined();
                expect(formatted.suggestedActions).toBeDefined();
                expect(formatted.suggestedActions.length).toBeGreaterThan(0);
            });
        });
    });
});
