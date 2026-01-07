// // src/app/api/agents/[id]/route.ts
// import { adminDb } from '@/lib/firebase/server-init';
// import { handleApiError, createApiResponse, withAuth } from '@/lib/utils/api-utils';
// import { z } from 'zod';

// const agentUpdateSchema = z.object({
//     name: z.string().min(1).optional(),
//     description: z.string().optional(),
//     category: z.string().optional(),
//     prompt: z.string().optional(),
//     guidelines: z.array(z.string()).optional(),
//     isEnabled: z.boolean().optional(),
//     author: z.string().optional(),
//     version: z.string().optional(),
// });

// export const GET = withAuth(async ({ params }) => {
//     try {
//         let { id } = params;
//         let agentRef = adminDb.collection('agents').doc(id);
//         let doc = await agentRef.get();

//         if (!doc.exists) {
//             return handleApiError({ message: 'Agent not found' }, 404);
//         }
//         return createApiResponse({ id: doc.id, ...doc.data() }, 200);
//     } catch (error) {
//         return handleApiError(error);
//     }
// });

// export const PUT = withAuth(async ({ request, params }) => {
//     try {
//         let { id } = params;
//         let body = await request.json();
//         let validation = agentUpdateSchema.safeParse(body);

//         if (!validation.success) {
//             return handleApiError(validation.error);
//         }

//         let agentRef = adminDb.collection('agents').doc(id);
//         await agentRef.update({
//             ...validation.data,
//             updatedAt: new Date().toISOString(),
//         });

//         let updatedDoc = await agentRef.get();
//         return createApiResponse({ id: updatedDoc.id, ...updatedDoc.data() }, 200);
//     } catch (error) {
//         return handleApiError(error);
//     }
// }, { requireAdmin: true });

// export const DELETE = withAuth(async ({ params }) => {
//     try {
//         let { id } = params;
//         await adminDb.collection('agents').doc(id).delete();
//         return createApiResponse({ message: 'Agent deleted successfully' }, 200);
//     } catch (error) {
//         return handleApiError(error);
//     }
// }, { requireAdmin: true });
