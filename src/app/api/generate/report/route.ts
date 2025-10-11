/**
 * API Route لتوليد التقارير - النسخة المحسنة بالقوالب الذكية
 *
 * هذا الملف يستخدم النظام المحسن بالقوالب الذكية المتخصصة لكل قسم
 */


import { generateReportSection } from '@/ai/flows/unified';
import { GenerateSectionInputSchema } from '@/ai/schemas';
import { CreditBasedApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { logGeneration } from '@/services';

/**
 * معالج توليد التقارير المحسن بالقوالب الذكية
 */
class GenerateReportHandler extends CreditBasedApiHandler<any, any> {
    protected inputSchema = GenerateSectionInputSchema;
    protected creditCost = 1;
    protected requiresAdmin = false;

    protected async processRequest(data: any, context: any) {
        const { user } = context;
        const agentInput = data;

        console.log(`🚀 بدء توليد قسم "${agentInput.sectionToGenerate}" باستخدام القوالب الذكية`);

        // استخدام النظام المحسن بالقوالب الذكية
        const result = await generateReportSection(agentInput);

        const transformedOutput = { [result.sectionName]: result.content };

        // تسجيل العملية مع معلومات إضافية عن القالب المستخدم
        await logGeneration({
            agentId: `smart-template-${agentInput.sectionToGenerate}`,
            userId: user.id,
            input: agentInput,
            output: transformedOutput,
            creditCost: this.creditCost
        });

        console.log(`✅ تم توليد قسم "${agentInput.sectionToGenerate}" بنجاح باستخدام القالب الذكي`);
        return transformedOutput;
    }
}

// إنشاء المعالج
const generateReportHandler = new GenerateReportHandler();

// تصدير الـ handler مع middleware
export const POST = withApiMiddleware(
    generateReportHandler.handle.bind(generateReportHandler),
    {
        logging: true
    }
);
