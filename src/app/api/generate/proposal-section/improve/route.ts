/**
 * API endpoint لتحسين أقسام المقترح
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// مخطط طلب التحسين
const ImproveRequestSchema = z.object({
    type: z.string(),
    content: z.string().min(1, 'المحتوى مطلوب'),
    improvementAreas: z.array(z.string()).optional().default([])
});

// مخطط استجابة التحسين
const ImproveResponseSchema = z.object({
    improvedContent: z.string(),
    improvements: z.array(z.string()),
    qualityScore: z.number().min(0).max(100)
});

export async function POST(request: NextRequest) {
    try {
        console.log('🔧 طلب تحسين قسم المقترح');

        const body = await request.json();
        const { type, content, improvementAreas } = ImproveRequestSchema.parse(body);

        console.log(`📝 تحسين قسم: ${type}`);

        // تحليل المحتوى الحالي
        const wordCount = content.trim().split(/\s+/).length;
        const hasTitle = content.includes('#') || content.includes('##');
        const hasStructure = content.includes('\n\n') || content.includes('- ') || content.includes('1.');

        // تطبيق التحسينات
        let improvedContent = content;
        const improvements: string[] = [];

        // إضافة عنوان إذا لم يكن موجوداً
        if (!hasTitle) {
            const sectionTitles: Record<string, string> = {
                'executive_summary': '# الملخص التنفيذي',
                'problem_statement': '# بيان المشكلة',
                'objectives': '# أهداف المشروع',
                'scope': '# نطاق المشروع',
                'methodology': '# المنهجية',
                'timeline': '# الجدول الزمني',
                'budget': '# الميزانية',
                'team': '# فريق العمل',
                'deliverables': '# المخرجات المتوقعة',
                'risk_assessment': '# تقييم المخاطر',
                'success_criteria': '# معايير النجاح',
                'conclusion': '# الخاتمة',
                'appendices': '# الملاحق'
            };

            const title = sectionTitles[type] || `# ${type}`;
            improvedContent = `${title}\n\n${improvedContent}`;
            improvements.push('تم إضافة عنوان رئيسي للقسم');
        }

        // تحسين الهيكل
        if (!hasStructure && wordCount > 50) {
            // تقسيم المحتوى إلى فقرات
            const sentences = improvedContent.split(/[.!?؟]/).filter(s => s.trim().length > 10);
            if (sentences.length > 2) {
                const structuredContent = sentences.map((sentence, index) => {
                    if (index === 0) return sentence.trim() + '.';
                    return `\n\n${sentence.trim()}.`;
                }).join('');
                improvedContent = structuredContent;
                improvements.push('تم تحسين هيكل المحتوى وتنظيمه');
            }
        }

        // تحسينات خاصة بنوع القسم
        switch (type) {
            case 'objectives':
                if (!improvedContent.includes('الهدف') && !improvedContent.includes('تحقيق')) {
                    improvedContent += '\n\n## الأهداف الرئيسية:\n- تحقيق النتائج المطلوبة\n- ضمان الجودة العالية\n- الالتزام بالجدول الزمني';
                    improvements.push('تم إضافة أهداف محددة وقابلة للقياس');
                }
                break;

            case 'budget':
                if (!/\d+/.test(improvedContent)) {
                    improvedContent += '\n\n## تفصيل الميزانية:\n- التكاليف المباشرة: [يحدد حسب المشروع]\n- التكاليف غير المباشرة: [يحدد حسب المشروع]\n- الاحتياطي: 10% من إجمالي التكلفة';
                    improvements.push('تم إضافة تفاصيل مالية وهيكل الميزانية');
                }
                break;

            case 'timeline':
                if (!improvedContent.includes('شهر') && !improvedContent.includes('أسبوع')) {
                    improvedContent += '\n\n## المراحل الزمنية:\n- المرحلة الأولى: الشهر الأول\n- المرحلة الثانية: الشهر الثاني\n- المرحلة النهائية: الشهر الثالث';
                    improvements.push('تم إضافة جدول زمني مفصل بالمراحل');
                }
                break;

            case 'risk_assessment':
                if (!improvedContent.includes('مخاطر') && !improvedContent.includes('تحدي')) {
                    improvedContent += '\n\n## المخاطر المحتملة:\n- المخاطر التقنية: [يحدد حسب المشروع]\n- المخاطر المالية: [يحدد حسب المشروع]\n- خطط التخفيف: [استراتيجيات الحلول]';
                    improvements.push('تم إضافة تحليل للمخاطر وخطط التخفيف');
                }
                break;
        }

        // تطبيق تحسينات محددة من المستخدم
        if (improvementAreas.length > 0) {
            for (const area of improvementAreas) {
                switch (area.toLowerCase()) {
                    case 'clarity':
                    case 'وضوح':
                        improvedContent = improvedContent.replace(/([.!?؟])\s*([أ-ي])/g, '$1\n\n$2');
                        improvements.push('تم تحسين وضوح المحتوى');
                        break;
                    case 'detail':
                    case 'تفصيل':
                        improvedContent += '\n\n*ملاحظة: يمكن إضافة المزيد من التفاصيل حسب متطلبات المشروع المحددة.*';
                        improvements.push('تم إضافة المزيد من التفاصيل');
                        break;
                    case 'structure':
                    case 'هيكل':
                        if (!improvedContent.includes('##')) {
                            improvedContent = improvedContent.replace(/\n\n/g, '\n\n## ');
                            improvements.push('تم تحسين الهيكل العام للقسم');
                        }
                        break;
                }
            }
        }

        // حساب نقاط الجودة المحسنة
        const newWordCount = improvedContent.trim().split(/\s+/).length;
        let qualityScore = 70; // نقطة أساسية للمحتوى المحسن

        if (newWordCount > wordCount) qualityScore += 10;
        if (improvedContent.includes('#')) qualityScore += 5;
        if (improvedContent.includes('##')) qualityScore += 5;
        if (improvements.length > 0) qualityScore += improvements.length * 3;

        qualityScore = Math.min(100, qualityScore);

        const result = {
            improvedContent,
            improvements,
            qualityScore
        };

        // التحقق من صحة الاستجابة
        const validatedResult = ImproveResponseSchema.parse(result);

        console.log(`✅ تم تحسين القسم - النقاط: ${qualityScore}/100`);

        return NextResponse.json(validatedResult, {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });

    } catch (error) {
        console.error('❌ خطأ في تحسين القسم:', error);

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
                error: 'فشل في تحسين القسم',
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
