/**
 * API endpoint للتحقق من صحة أقسام المقترح
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// مخطط طلب التحقق
const ValidateRequestSchema = z.object({
    type: z.string(),
    content: z.string().min(1, 'المحتوى مطلوب')
});

// مخطط استجابة التحقق
const ValidateResponseSchema = z.object({
    isValid: z.boolean(),
    score: z.number().min(0).max(100),
    issues: z.array(z.string()),
    suggestions: z.array(z.string())
});

export async function POST(request: NextRequest) {
    try {
        console.log('🔍 طلب التحقق من صحة قسم المقترح');

        const body = await request.json();
        const { type, content } = ValidateRequestSchema.parse(body);

        console.log(`📝 التحقق من قسم: ${type}`);

        // تحليل بسيط للمحتوى
        const wordCount = content.trim().split(/\s+/).length;
        const hasTitle = content.includes('#') || content.includes('##');
        const hasStructure = content.includes('\n\n') || content.includes('- ') || content.includes('1.');
        const hasNumbers = /\d+/.test(content);
        const isArabic = /[\u0600-\u06FF]/.test(content);

        // حساب النقاط
        let score = 50; // نقطة أساسية
        const issues: string[] = [];
        const suggestions: string[] = [];

        // تقييم طول المحتوى
        if (wordCount < 50) {
            issues.push('المحتوى قصير جداً');
            suggestions.push('أضف المزيد من التفاصيل والشرح');
            score -= 20;
        } else if (wordCount > 100) {
            score += 15;
        }

        // تقييم الهيكل
        if (hasTitle) {
            score += 10;
        } else {
            issues.push('لا يوجد عنوان واضح');
            suggestions.push('أضف عنواناً رئيسياً للقسم');
        }

        if (hasStructure) {
            score += 15;
        } else {
            issues.push('الهيكل غير منظم');
            suggestions.push('استخدم قوائم أو فقرات منظمة');
        }

        // تقييم المحتوى حسب نوع القسم
        switch (type) {
            case 'budget':
                if (hasNumbers) {
                    score += 10;
                } else {
                    issues.push('لا توجد أرقام في قسم الميزانية');
                    suggestions.push('أضف تفاصيل مالية وأرقام محددة');
                }
                break;

            case 'timeline':
                if (hasNumbers && (content.includes('شهر') || content.includes('أسبوع') || content.includes('يوم'))) {
                    score += 10;
                } else {
                    issues.push('لا توجد مدد زمنية واضحة');
                    suggestions.push('أضف جدولاً زمنياً محدداً');
                }
                break;

            case 'objectives':
                if (content.includes('هدف') || content.includes('غاية') || content.includes('تحقيق')) {
                    score += 10;
                } else {
                    issues.push('لا توجد أهداف واضحة');
                    suggestions.push('حدد أهدافاً قابلة للقياس');
                }
                break;
        }

        // تقييم اللغة
        if (isArabic) {
            score += 5;
        }

        // تحديد الحد الأقصى والأدنى للنقاط
        score = Math.max(0, Math.min(100, score));

        // تحديد صحة المحتوى
        const isValid = score >= 60 && issues.length <= 2;

        // إضافة اقتراحات عامة
        if (score < 70) {
            suggestions.push('راجع المحتوى وأضف المزيد من التفاصيل');
        }
        if (!hasStructure) {
            suggestions.push('استخدم عناوين فرعية لتنظيم المحتوى');
        }

        const result = {
            isValid,
            score,
            issues,
            suggestions
        };

        // التحقق من صحة الاستجابة
        const validatedResult = ValidateResponseSchema.parse(result);

        console.log(`✅ تم التحقق من القسم - النقاط: ${score}/100`);

        return NextResponse.json(validatedResult, {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });

    } catch (error) {
        console.error('❌ خطأ في التحقق من صحة القسم:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: 'بيانات غير صحيحة',
                    details: error.errors
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                error: 'فشل في التحقق من صحة القسم',
                message: error instanceof Error ? error.message : 'خطأ غير معروف'
            },
            { status: 500 }
        );
    }
}

// دعم CORS
export async function OPTIONS(request: NextRequest) {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
