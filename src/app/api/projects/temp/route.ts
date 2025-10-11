// /**
//  * API Route لإدارة المشاريع المؤقتة
//  *
//  * هذا الملف يحتوي على endpoints لإدارة المشاريع المؤقتة
//  */

// import { ComplexApiHandler, SimpleApiHandler } from '@/app/api/shared/handlers/base-handler';
// import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
// import { tempProjectManager } from '@/lib/services/temp-project-manager';
// import { z } from 'zod';

// // Schema لإنشاء مشروع مؤقت
// const createTempProjectSchema = z.object({
//     title: z.string().min(1, 'Title is required'),
//     description: z.string().optional(),
//     type: z.string().optional(),
//     metadata: z.record(z.any()).optional(),
// });

// // Schema لتحويل مشروع مؤقت إلى دائم
// const convertToPermanentSchema = z.object({
//     permanentProjectId: z.string().optional(),
// });

// /**
//  * معالج إنشاء مشروع مؤقت
//  */
// class CreateTempProjectHandler extends ComplexApiHandler<z.infer<typeof createTempProjectSchema>, { projectId: string }> {
//     protected inputSchema = createTempProjectSchema;
//     protected requiresAdmin = false;
//     protected creditCost = 0; // لا يتطلب ائتمانات

//     protected async processRequest(data: z.infer<typeof createTempProjectSchema>, context: any): Promise<{ projectId: string }> {
//         const { user } = context;

//         const projectData = {
//             title: data.title,
//             description: data.description || '',
//             type: data.type || 'general',
//             metadata: data.metadata || {},
//             status: 'draft',
//             externalContext: [],
//             createdAt: new Date().toISOString(),
//             updatedAt: new Date().toISOString(),
//         };

//         const tempProjectId = await tempProjectManager.createTempProject(user.id, projectData);

//         return { projectId: tempProjectId };
//     }
// }

// /**
//  * معالج تحويل مشروع مؤقت إلى دائم
//  */
// class ConvertToPermanentHandler extends ComplexApiHandler<z.infer<typeof convertToPermanentSchema>, { projectId: string }> {
//     protected inputSchema = convertToPermanentSchema;
//     protected requiresAdmin = false;
//     protected creditCost = 1; // يتطلب ائتمان واحد

//     protected async processRequest(data: z.infer<typeof convertToPermanentSchema>, context: any): Promise<{ projectId: string }> {
//         const { user, request } = context;

//         // استخراج معرف المشروع المؤقت من URL
//         const url = new URL(request.url);
//         const pathParts = url.pathname.split('/');
//         const tempProjectId = pathParts[pathParts.length - 1];

//         if (!tempProjectId.startsWith('temp-')) {
//             throw new Error('Invalid temporary project ID');
//         }

//         // التحقق من أن المستخدم يملك المشروع المؤقت
//         const projectDoc = await tempProjectManager.validateTempProject(tempProjectId);
//         if (!projectDoc) {
//             throw new Error('Temporary project not found or expired');
//         }

//         const permanentProjectId = await tempProjectManager.convertToPermanent(
//             tempProjectId,
//             data.permanentProjectId
//         );

//         return { projectId: permanentProjectId };
//     }
// }

// /**
//  * معالج الحصول على إحصائيات المشاريع المؤقتة
//  */
// class GetTempProjectStatsHandler extends SimpleApiHandler<any> {
//     protected async processRequest(context: any): Promise<any> {
//         const stats = await tempProjectManager.getTempProjectStats();
//         return stats;
//     }
// }

// /**
//  * معالج تنظيف المشاريع المؤقتة المنتهية الصلاحية
//  */
// class CleanupTempProjectsHandler extends SimpleApiHandler<{ cleanedCount: number }> {
//     protected async processRequest(context: any): Promise<{ cleanedCount: number }> {
//         const cleanedCount = await tempProjectManager.cleanupExpiredTempProjects();
//         return { cleanedCount };
//     }
// }

// // إنشاء المعالجات
// const createTempProjectHandler = new CreateTempProjectHandler();
// const convertToPermanentHandler = new ConvertToPermanentHandler();
// const getTempProjectStatsHandler = new GetTempProjectStatsHandler();
// const cleanupTempProjectsHandler = new CleanupTempProjectsHandler();

// // تصدير الـ handlers مع middleware
// export const POST = withApiMiddleware(
//     createTempProjectHandler.handle.bind(createTempProjectHandler),
//     { logging: true }
// );

// export const GET = withApiMiddleware(
//     getTempProjectStatsHandler.handle.bind(getTempProjectStatsHandler),
//     { logging: true }
// );

// export const DELETE = withApiMiddleware(
//     cleanupTempProjectsHandler.handle.bind(cleanupTempProjectsHandler),
//     { logging: true }
// );
