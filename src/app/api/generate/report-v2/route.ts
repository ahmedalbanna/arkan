/**
 * API Route لتوليد التقارير - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لتوليد التقارير
 */

import { generateReportSection } from '@/ai/flows/generate-report-section';
import { GenerateSectionInputSchema } from '@/ai/schemas';
import { CreditBasedApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { adminDb } from '@/lib/firebase/server-init';
import { logGeneration } from '@/services/generation-service';

/**
 * معالج توليد التقارير
 */
class GenerateReportHandler extends CreditBasedApiHandler<any, any> {
    protected inputSchema = GenerateSectionInputSchema;
    protected creditCost = 1;

    protected async processRequest(data: any, context: any) {
        const { user } = context;

        const agentInput = data;

        // جلب معلومات القسم ديناميكياً من Firestore
        const sectionDocRef = adminDb.collection('sections').doc(agentInput.sectionToGenerate);
        const sectionDoc = await sectionDocRef.get();

        if (!sectionDoc.exists) {
            throw new Error('Section not found in database.');
        }

        const agentInfo = sectionDoc.data() as { agentId: string; title: string };

        if (!agentInfo) {
            throw new Error('Unknown section requested.');
        }

        const result = await generateReportSection(agentInput);

        const transformedOutput = { [result.sectionName]: result.content };

        // تسجيل العملية
        await logGeneration({
            agentId: agentInfo.agentId,
            userId: user.id,
            input: agentInput,
            output: transformedOutput,
            creditCost: this.creditCost,
        });

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
