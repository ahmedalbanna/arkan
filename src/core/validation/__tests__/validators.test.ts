/**
 * اختبارات شاملة لـ Validators المتخصصة
 * تغطي جميع أنواع التحقق من الصحة والسيناريوهات المختلفة
 */

import { describe, expect, test } from '@jest/globals';
import { z } from 'zod';
import {
    AdvancedValidators,
    ArrayValidators,
    BooleanValidators,
    BusinessValidators,
    ContentValidators,
    DateValidators,
    FileValidators,
    FormValidators,
    NumberValidators,
    ObjectValidators,
    StringValidators,
    UserValidators
} from '../validators';

describe('StringValidators', () => {
    describe('Basic String Validation', () => {
        test('should validate required string', () => {
            const result = StringValidators.required.safeParse('test');
            expect(result.success).toBe(true);
        });

        test('should reject empty string for required', () => {
            const result = StringValidators.required.safeParse('');
            expect(result.success).toBe(false);
        });

        test('should validate optional string', () => {
            const result = StringValidators.optional.safeParse('test');
            expect(result.success).toBe(true);
        });

        test('should accept undefined for optional', () => {
            const result = StringValidators.optional.safeParse(undefined);
            expect(result.success).toBe(true);
        });
    });

    describe('Email Validation', () => {
        test('should validate correct email', () => {
            const result = StringValidators.email.safeParse('test@example.com');
            expect(result.success).toBe(true);
        });

        test('should reject invalid email', () => {
            const result = StringValidators.email.safeParse('invalid-email');
            expect(result.success).toBe(false);
        });

        test('should reject email without domain', () => {
            const result = StringValidators.email.safeParse('test@');
            expect(result.success).toBe(false);
        });
    });

    describe('URL Validation', () => {
        test('should validate correct URL', () => {
            const result = StringValidators.url.safeParse('https://example.com');
            expect(result.success).toBe(true);
        });

        test('should reject invalid URL', () => {
            const result = StringValidators.url.safeParse('not-a-url');
            expect(result.success).toBe(false);
        });
    });

    describe('Length Validation', () => {
        test('should validate string within length limits', () => {
            const result = StringValidators.length(3, 10).safeParse('test');
            expect(result.success).toBe(true);
        });

        test('should reject string too short', () => {
            const result = StringValidators.length(3, 10).safeParse('ab');
            expect(result.success).toBe(false);
        });

        test('should reject string too long', () => {
            const result = StringValidators.length(3, 10).safeParse('very long string');
            expect(result.success).toBe(false);
        });
    });
});

describe('NumberValidators', () => {
    describe('Basic Number Validation', () => {
        test('should validate required number', () => {
            const result = NumberValidators.required.safeParse(42);
            expect(result.success).toBe(true);
        });

        test('should reject string for required number', () => {
            const result = NumberValidators.required.safeParse('42');
            expect(result.success).toBe(false);
        });

        test('should validate optional number', () => {
            const result = NumberValidators.optional.safeParse(42);
            expect(result.success).toBe(true);
        });

        test('should accept undefined for optional', () => {
            const result = NumberValidators.optional.safeParse(undefined);
            expect(result.success).toBe(true);
        });
    });

    describe('Range Validation', () => {
        test('should validate number within range', () => {
            const result = NumberValidators.range(1, 100).safeParse(50);
            expect(result.success).toBe(true);
        });

        test('should reject number below minimum', () => {
            const result = NumberValidators.range(1, 100).safeParse(0);
            expect(result.success).toBe(false);
        });

        test('should reject number above maximum', () => {
            const result = NumberValidators.range(1, 100).safeParse(101);
            expect(result.success).toBe(false);
        });
    });

    describe('Positive/Negative Validation', () => {
        test('should validate positive number', () => {
            const result = NumberValidators.positive.safeParse(42);
            expect(result.success).toBe(true);
        });

        test('should reject negative number for positive', () => {
            const result = NumberValidators.positive.safeParse(-42);
            expect(result.success).toBe(false);
        });

        test('should validate negative number', () => {
            const result = NumberValidators.negative.safeParse(-42);
            expect(result.success).toBe(true);
        });

        test('should reject positive number for negative', () => {
            const result = NumberValidators.negative.safeParse(42);
            expect(result.success).toBe(false);
        });
    });
});

describe('DateValidators', () => {
    describe('Basic Date Validation', () => {
        test('should validate required date', () => {
            const result = DateValidators.required.safeParse(new Date());
            expect(result.success).toBe(true);
        });

        test('should reject string for required date', () => {
            const result = DateValidators.required.safeParse('2023-01-01');
            expect(result.success).toBe(false);
        });

        test('should validate optional date', () => {
            const result = DateValidators.optional.safeParse(new Date());
            expect(result.success).toBe(true);
        });

        test('should accept undefined for optional', () => {
            const result = DateValidators.optional.safeParse(undefined);
            expect(result.success).toBe(true);
        });
    });

    describe('Date Range Validation', () => {
        test('should validate date within range', () => {
            const minDate = new Date('2020-01-01');
            const maxDate = new Date('2030-12-31');
            const testDate = new Date('2023-06-15');

            const result = DateValidators.range(minDate, maxDate).safeParse(testDate);
            expect(result.success).toBe(true);
        });

        test('should reject date before minimum', () => {
            const minDate = new Date('2020-01-01');
            const maxDate = new Date('2030-12-31');
            const testDate = new Date('2019-12-31');

            const result = DateValidators.range(minDate, maxDate).safeParse(testDate);
            expect(result.success).toBe(false);
        });

        test('should reject date after maximum', () => {
            const minDate = new Date('2020-01-01');
            const maxDate = new Date('2030-12-31');
            const testDate = new Date('2031-01-01');

            const result = DateValidators.range(minDate, maxDate).safeParse(testDate);
            expect(result.success).toBe(false);
        });
    });
});

describe('BooleanValidators', () => {
    describe('Basic Boolean Validation', () => {
        test('should validate required boolean', () => {
            const result = BooleanValidators.required.safeParse(true);
            expect(result.success).toBe(true);
        });

        test('should reject string for required boolean', () => {
            const result = BooleanValidators.required.safeParse('true');
            expect(result.success).toBe(false);
        });

        test('should validate optional boolean', () => {
            const result = BooleanValidators.optional.safeParse(false);
            expect(result.success).toBe(true);
        });

        test('should accept undefined for optional', () => {
            const result = BooleanValidators.optional.safeParse(undefined);
            expect(result.success).toBe(true);
        });
    });
});

describe('ArrayValidators', () => {
    describe('Basic Array Validation', () => {
        test('should validate required array', () => {
            const result = ArrayValidators.required.safeParse([1, 2, 3]);
            expect(result.success).toBe(true);
        });

        test('should reject string for required array', () => {
            const result = ArrayValidators.required.safeParse('not-array');
            expect(result.success).toBe(false);
        });

        test('should validate optional array', () => {
            const result = ArrayValidators.optional.safeParse([1, 2, 3]);
            expect(result.success).toBe(true);
        });

        test('should accept undefined for optional', () => {
            const result = ArrayValidators.optional.safeParse(undefined);
            expect(result.success).toBe(true);
        });
    });

    describe('Array Length Validation', () => {
        test('should validate array within length limits', () => {
            const result = ArrayValidators.length(2, 5).safeParse([1, 2, 3]);
            expect(result.success).toBe(true);
        });

        test('should reject array too short', () => {
            const result = ArrayValidators.length(2, 5).safeParse([1]);
            expect(result.success).toBe(false);
        });

        test('should reject array too long', () => {
            const result = ArrayValidators.length(2, 5).safeParse([1, 2, 3, 4, 5, 6]);
            expect(result.success).toBe(false);
        });
    });

    describe('Array Element Validation', () => {
        test('should validate array with string elements', () => {
            const result = z.array(z.string()).safeParse(['a', 'b', 'c']);
            expect(result.success).toBe(true);
        });

        test('should reject array with mixed types', () => {
            const result = z.array(z.string()).safeParse(['a', 1, 'c']);
            expect(result.success).toBe(false);
        });
    });
});

describe('ObjectValidators', () => {
    describe('Basic Object Validation', () => {
        test('should validate required object', () => {
            const result = ObjectValidators.required.safeParse({ key: 'value' });
            expect(result.success).toBe(true);
        });

        test('should reject string for required object', () => {
            const result = ObjectValidators.required.safeParse('not-object');
            expect(result.success).toBe(false);
        });

        test('should validate optional object', () => {
            const result = ObjectValidators.optional.safeParse({ key: 'value' });
            expect(result.success).toBe(true);
        });

        test('should accept undefined for optional', () => {
            const result = ObjectValidators.optional.safeParse(undefined);
            expect(result.success).toBe(true);
        });
    });
});

describe('UserValidators', () => {
    describe('User Registration', () => {
        test('should validate complete user registration', () => {
            const userData = {
                name: 'أحمد محمد',
                email: 'ahmed@example.com',
                password: 'password123',
                confirmPassword: 'password123',
                termsAccepted: true
            };

            const result = UserValidators.registration.safeParse(userData);
            expect(result.success).toBe(true);
        });

        test('should reject user registration with mismatched passwords', () => {
            const userData = {
                name: 'أحمد محمد',
                email: 'ahmed@example.com',
                password: 'password123',
                confirmPassword: 'different123',
                termsAccepted: true
            };

            const result = UserValidators.registration.safeParse(userData);
            expect(result.success).toBe(false);
        });

        test('should reject user registration without terms acceptance', () => {
            const userData = {
                name: 'أحمد محمد',
                email: 'ahmed@example.com',
                password: 'password123',
                confirmPassword: 'password123',
                termsAccepted: false
            };

            const result = UserValidators.registration.safeParse(userData);
            expect(result.success).toBe(false);
        });
    });

    describe('User Login', () => {
        test('should validate user login', () => {
            const loginData = {
                email: 'ahmed@example.com',
                password: 'password123'
            };

            const result = UserValidators.login.safeParse(loginData);
            expect(result.success).toBe(true);
        });

        test('should reject login with invalid email', () => {
            const loginData = {
                email: 'invalid-email',
                password: 'password123'
            };

            const result = UserValidators.login.safeParse(loginData);
            expect(result.success).toBe(false);
        });
    });
});

describe('BusinessValidators', () => {
    describe('Company Validation', () => {
        test('should validate complete company data', () => {
            const companyData = {
                name: 'شركة التكنولوجيا',
                email: 'info@company.com',
                phone: '+966501234567',
                address: 'الرياض، المملكة العربية السعودية',
                website: 'https://company.com',
                industry: 'Technology',
                size: '50-100',
                description: 'شركة متخصصة في التكنولوجيا'
            };

            const result = BusinessValidators.company.safeParse(companyData);
            expect(result.success).toBe(true);
        });

        test('should reject company with invalid website', () => {
            const companyData = {
                name: 'شركة التكنولوجيا',
                email: 'info@company.com',
                phone: '+966501234567',
                address: 'الرياض، المملكة العربية السعودية',
                website: 'not-a-url',
                industry: 'Technology',
                size: '50-100',
                description: 'شركة متخصصة في التكنولوجيا'
            };

            const result = BusinessValidators.company.safeParse(companyData);
            expect(result.success).toBe(false);
        });
    });

    describe('Project Validation', () => {
        test('should validate complete project data', () => {
            const projectData = {
                title: 'مشروع تطوير النظام',
                description: 'تطوير نظام إدارة شامل',
                budget: 50000,
                duration: 6,
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-06-30'),
                status: 'planning',
                priority: 'high',
                team: ['user1', 'user2'],
                tags: ['development', 'management']
            };

            const result = BusinessValidators.project.safeParse(projectData);
            expect(result.success).toBe(true);
        });
    });
});

describe('ContentValidators', () => {
    describe('Article Validation', () => {
        test('should validate complete article', () => {
            const articleData = {
                title: 'مقال عن الذكاء الاصطناعي',
                content: 'محتوى المقال هنا...',
                author: 'أحمد محمد',
                category: 'Technology',
                tags: ['AI', 'Machine Learning'],
                published: true,
                featured: false,
                seoTitle: 'مقال عن الذكاء الاصطناعي - دليل شامل',
                seoDescription: 'مقال شامل عن الذكاء الاصطناعي وتطبيقاته'
            };

            const result = ContentValidators.article.safeParse(articleData);
            expect(result.success).toBe(true);
        });

        test('should reject article with empty title', () => {
            const articleData = {
                title: '',
                content: 'محتوى المقال هنا...',
                author: 'أحمد محمد',
                category: 'Technology',
                tags: ['AI', 'Machine Learning'],
                published: true,
                featured: false
            };

            const result = ContentValidators.article.safeParse(articleData);
            expect(result.success).toBe(false);
        });
    });

    describe('Comment Validation', () => {
        test('should validate complete comment', () => {
            const commentData = {
                content: 'تعليق مفيد على المقال',
                author: 'أحمد محمد',
                email: 'ahmed@example.com',
                articleId: 'article123',
                parentId: null,
                approved: true
            };

            const result = ContentValidators.comment.safeParse(commentData);
            expect(result.success).toBe(true);
        });
    });
});

describe('FileValidators', () => {
    describe('Image Validation', () => {
        test('should validate image file', () => {
            const imageData = {
                name: 'image.jpg',
                size: 1024000, // 1MB
                type: 'image/jpeg',
                lastModified: Date.now()
            };

            const result = FileValidators.image.safeParse(imageData);
            expect(result.success).toBe(true);
        });

        test('should reject image file too large', () => {
            const imageData = {
                name: 'image.jpg',
                size: 10 * 1024 * 1024, // 10MB
                type: 'image/jpeg',
                lastModified: Date.now()
            };

            const result = FileValidators.image.safeParse(imageData);
            expect(result.success).toBe(false);
        });

        test('should reject non-image file', () => {
            const fileData = {
                name: 'document.pdf',
                size: 1024000,
                type: 'application/pdf',
                lastModified: Date.now()
            };

            const result = FileValidators.image.safeParse(fileData);
            expect(result.success).toBe(false);
        });
    });

    describe('Document Validation', () => {
        test('should validate document file', () => {
            const documentData = {
                name: 'document.pdf',
                size: 2048000, // 2MB
                type: 'application/pdf',
                lastModified: Date.now()
            };

            const result = FileValidators.document.safeParse(documentData);
            expect(result.success).toBe(true);
        });
    });
});

describe('FormValidators', () => {
    describe('Contact Form Validation', () => {
        test('should validate complete contact form', () => {
            const contactData = {
                name: 'أحمد محمد',
                email: 'ahmed@example.com',
                phone: '+966501234567',
                subject: 'استفسار عن الخدمات',
                message: 'أريد الاستفسار عن الخدمات المتاحة',
                company: 'شركة التكنولوجيا',
                preferredContact: 'email'
            };

            const result = FormValidators.contact.safeParse(contactData);
            expect(result.success).toBe(true);
        });

        test('should reject contact form with invalid phone', () => {
            const contactData = {
                name: 'أحمد محمد',
                email: 'ahmed@example.com',
                phone: 'invalid-phone',
                subject: 'استفسار عن الخدمات',
                message: 'أريد الاستفسار عن الخدمات المتاحة'
            };

            const result = FormValidators.contact.safeParse(contactData);
            expect(result.success).toBe(false);
        });
    });

    describe('Feedback Form Validation', () => {
        test('should validate complete feedback form', () => {
            const feedbackData = {
                rating: 5,
                comment: 'خدمة ممتازة',
                category: 'service',
                userId: 'user123',
                anonymous: false
            };

            const result = FormValidators.feedback.safeParse(feedbackData);
            expect(result.success).toBe(true);
        });

        test('should reject feedback with invalid rating', () => {
            const feedbackData = {
                rating: 6, // Invalid rating (should be 1-5)
                comment: 'خدمة ممتازة',
                category: 'service'
            };

            const result = FormValidators.feedback.safeParse(feedbackData);
            expect(result.success).toBe(false);
        });
    });
});

describe('AdvancedValidators', () => {
    describe('Password Validation', () => {
        test('should validate strong password', () => {
            const result = AdvancedValidators.password.safeParse('StrongPass123!');
            expect(result.success).toBe(true);
        });

        test('should reject weak password', () => {
            const result = AdvancedValidators.password.safeParse('123');
            expect(result.success).toBe(false);
        });

        test('should reject password without special characters', () => {
            const result = AdvancedValidators.password.safeParse('StrongPass123');
            expect(result.success).toBe(false);
        });
    });

    describe('Username Validation', () => {
        test('should validate valid username', () => {
            const result = AdvancedValidators.username.safeParse('ahmed123');
            expect(result.success).toBe(true);
        });

        test('should reject username with special characters', () => {
            const result = AdvancedValidators.username.safeParse('ahmed@123');
            expect(result.success).toBe(false);
        });

        test('should reject username too short', () => {
            const result = AdvancedValidators.username.safeParse('ab');
            expect(result.success).toBe(false);
        });
    });

    describe('Slug Validation', () => {
        test('should validate valid slug', () => {
            const result = AdvancedValidators.slug.safeParse('valid-slug-123');
            expect(result.success).toBe(true);
        });

        test('should reject slug with uppercase letters', () => {
            const result = AdvancedValidators.slug.safeParse('Invalid-Slug');
            expect(result.success).toBe(false);
        });

        test('should reject slug with spaces', () => {
            const result = AdvancedValidators.slug.safeParse('invalid slug');
            expect(result.success).toBe(false);
        });
    });

    describe('Color Validation', () => {
        test('should validate hex color', () => {
            const result = AdvancedValidators.color.safeParse('#FF5733');
            expect(result.success).toBe(true);
        });

        test('should validate rgb color', () => {
            const result = AdvancedValidators.color.safeParse('rgb(255, 87, 51)');
            expect(result.success).toBe(true);
        });

        test('should reject invalid color', () => {
            const result = AdvancedValidators.color.safeParse('not-a-color');
            expect(result.success).toBe(false);
        });
    });

    describe('Timezone Validation', () => {
        test('should validate valid timezone', () => {
            const result = AdvancedValidators.timezone.safeParse('Asia/Riyadh');
            expect(result.success).toBe(true);
        });

        test('should reject invalid timezone', () => {
            const result = AdvancedValidators.timezone.safeParse('Invalid/Timezone');
            expect(result.success).toBe(false);
        });
    });

    describe('Language Validation', () => {
        test('should validate valid language code', () => {
            const result = AdvancedValidators.language.safeParse('ar');
            expect(result.success).toBe(true);
        });

        test('should reject invalid language code', () => {
            const result = AdvancedValidators.language.safeParse('invalid');
            expect(result.success).toBe(false);
        });
    });
});

describe('Edge Cases and Performance', () => {
    describe('Edge Cases', () => {
        test('should handle null values gracefully', () => {
            const result = StringValidators.required.safeParse(null);
            expect(result.success).toBe(false);
        });

        test('should handle undefined values gracefully', () => {
            const result = StringValidators.required.safeParse(undefined);
            expect(result.success).toBe(false);
        });

        test('should handle empty objects gracefully', () => {
            const result = ObjectValidators.required.safeParse({});
            expect(result.success).toBe(true);
        });

        test('should handle empty arrays gracefully', () => {
            const result = ArrayValidators.required.safeParse([]);
            expect(result.success).toBe(true);
        });
    });

    describe('Performance Tests', () => {
        test('should validate large datasets efficiently', () => {
            const largeData = Array.from({ length: 1000 }, (_, i) => ({
                id: i,
                name: `User ${i}`,
                email: `user${i}@example.com`,
                age: 20 + (i % 50)
            }));

            const schema = z.array(z.object({
                id: z.number(),
                name: z.string(),
                email: z.string().email(),
                age: z.number().min(18).max(100)
            }));

            const startTime = performance.now();
            const result = schema.safeParse(largeData);
            const endTime = performance.now();

            expect(result.success).toBe(true);
            expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
        });

        test('should handle concurrent validations', async () => {
            const schema = StringValidators.email;
            const testData = 'test@example.com';

            const promises = Array.from({ length: 100 }, () =>
                Promise.resolve(schema.safeParse(testData))
            );

            const startTime = performance.now();
            const results = await Promise.all(promises);
            const endTime = performance.now();

            expect(results).toHaveLength(100);
            expect(results.every(r => r.success)).toBe(true);
            expect(endTime - startTime).toBeLessThan(50); // Should complete within 50ms
        });
    });
});
