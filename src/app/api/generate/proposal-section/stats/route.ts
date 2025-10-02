/**
 * API endpoint لإحصائيات أقسام المقترح
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// مخطط الإحصائيات
const StatsResponseSchema = z.object({
    totalGenerated: z.number(),
    byType: z.record(z.number()),
    byCategory: z.record(z.number()),
    averageQuality: z.number(),
    averageWordCount: z.number(),
    mostUsedTypes: z.array(z.string()),
    averageGenerationTime: z.number()
});

// بيانات وهمية للإحصائيات (في التطبيق الحقيقي ستأتي من قاعدة البيانات)
const mockStats = {
    totalGenerated: 1247,
    byType: {
        'executive_summary': 156,
        'problem_statement': 134,
        'objectives': 142,
        'scope': 98,
        'methodology': 123,
        'timeline': 87,
        'budget': 91,
        'team': 76,
        'deliverables': 89,
        'risk_assessment': 67,
        'success_criteria': 78,
        'conclusion': 84,
        'appendices': 22
    },
    byCategory: {
        'overview': 262,
        'planning': 327,
        'execution': 301,
        'management': 234,
        'evaluation': 123
    },
    averageQuality: 84.7,
    averageWordCount: 387,
    mostUsedTypes: [
        'executive_summary',
        'objectives',
        'methodology',
        'problem_statement',
        'scope'
    ],
    averageGenerationTime: 2847 // milliseconds
};

export async function GET(request: NextRequest) {
    try {
        console.log('📊 طلب إحصائيات أقسام المقترح');

        // في التطبيق الحقيقي، ستتم قراءة الإحصائيات من قاعدة البيانات
        // const stats = await getProposalSectionStats();

        // إضافة بعض التنويع للبيانات الوهمية
        const randomizedStats = {
            ...mockStats,
            totalGenerated: mockStats.totalGenerated + Math.floor(Math.random() * 10),
            averageQuality: Math.round((mockStats.averageQuality + (Math.random() - 0.5) * 5) * 10) / 10,
            averageGenerationTime: mockStats.averageGenerationTime + Math.floor((Math.random() - 0.5) * 500)
        };

        // التحقق من صحة البيانات
        const validatedStats = StatsResponseSchema.parse(randomizedStats);

        console.log('✅ تم إرجاع الإحصائيات بنجاح');

        return NextResponse.json(validatedStats, {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=300' // cache for 5 minutes
            }
        });

    } catch (error) {
        console.error('❌ خطأ في جلب إحصائيات أقسام المقترح:', error);

        return NextResponse.json(
            {
                error: 'فشل في جلب الإحصائيات',
                message: error instanceof Error ? error.message : 'خطأ غير معروف'
            },
            { status: 500 }
        );
    }
}

// دعم CORS للطلبات من المتصفح
export async function OPTIONS(request: NextRequest) {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
