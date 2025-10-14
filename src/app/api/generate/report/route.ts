/**
 * API Route لتوليد التقارير - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { generateReportSection } from '@/ai/flows/unified';
import { GenerateSectionInputSchema } from '@/ai/schemas';
import { ApiResponse, createApiHandler } from '@/core/api';
import { logGeneration } from '@/services';

export const POST = createApiHandler(async (context) => {
    try {
        const { user, request } = context;
        const data = await request.json();

        console.log(`🚀 بدء توليد قسم "${data.sectionToGenerate}" باستخدام القوالب الذكية`);

        // استخدام النظام المحسن بالقوالب الذكية
        const result = await generateReportSection(data);

        const transformedOutput = { [result.sectionName]: result.content };

        // تسجيل العملية مع معلومات إضافية عن القالب المستخدم
        await logGeneration({
            agentId: `smart-template-${data.sectionToGenerate}`,
            userId: user.id,
            input: data,
            output: transformedOutput,
            creditCost: 1
        });

        console.log(`✅ تم توليد قسم "${data.sectionToGenerate}" بنجاح باستخدام القالب الذكي`);
        return ApiResponse.success(transformedOutput);
    } catch (error) {
        console.error('Generate report error:', error);
        return ApiResponse.error('Failed to generate report', 500);
    }
}, { validateBody: GenerateSectionInputSchema, requireAuth: true });
