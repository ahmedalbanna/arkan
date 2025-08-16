// import { NextRequest, NextResponse } from 'next/server';
// import { handleApiError, createApiResponse } from '@/lib/api-utils';
// import { getJob, updateJob } from '@/lib/job-store';
// import { z } from 'zod';

// const webhookPayloadSchema = z.object({
//   jobId: z.string(),
//   status: z.enum(['completed', 'failed']).optional().default('completed'),
//   resultText: z.any().optional(),
//   linkEventStats: z.array(z.object({
//     platform: z.string(),
//     count: z.string(),
//     event: z.string(),
//   })).optional(),
//   error: z.string().optional(),
//   apiToken: z.string(),
// });

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const validation = webhookPayloadSchema.safeParse(body);
    
//     if (!validation.success) {
//       return handleApiError(
//         { error: 'Invalid request body', details: validation.error.errors },
//         400
//       );
//     }
    
//     const data = validation.data; // Destructure to get jobId, status, resultText, error, apiToken

//     const job = await getJob(data.jobId);

//     if (!job || job.apiToken !== data.apiToken) {
//       return handleApiError({ error: "Unauthorized or Job not found" }, 401);
//     }

//     await updateJob(data.jobId, {
//       status: data.status,
//       resultText: data.linkEventStats || data.resultText, // Use linkEventStats if available, otherwise fallback to resultText
//       error: data.error,
//     });

//  return createApiResponse(
//  { message: "Webhook received and processed" },
//  200
//  );
//   } catch (error) {
//     return handleApiError(error, 500);
//   }
// }