
'use server';

import { NextResponse, type NextRequest } from 'next/server';
import { handleApiError, createApiResponse } from '@/lib/api-utils';
import { updateJob, getJob } from '@/lib/job-store';
import { z } from 'zod';

const webhookPayloadSchema = z.object({
  jobId: z.string(),
  status: z.enum(['completed', 'failed']).optional().default('completed'),
  resultText: z.any().optional(),
  error: z.string().optional(),
  apiToken: z.string(), // The secure token we generated
});

// This is a public endpoint, but secured with a job-specific token.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = webhookPayloadSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError({ message: 'Invalid payload', errors: validation.error.flatten() }, 400);
    }
    const { jobId, status, resultText, error, apiToken } = validation.data;

    // 1. Retrieve the job from the store
    const job = await getJob(jobId);
    if (!job) {
      return handleApiError({ message: 'Job not found' }, 404);
    }

    // 2. Verify the security token
    if (!job.token || job.token !== apiToken) {
      return handleApiError({ message: 'Unauthorized: Invalid token' }, 401);
    }

    // 3. Update the job with the result
    if (status === 'failed') {
        await updateJob(jobId, 'failed', error || 'Taskade workflow failed without an error message.');
        console.log(`Job ${jobId} failed.`);
    } else {
        await updateJob(jobId, 'completed', resultText);
        console.log(`Job ${jobId} completed and result stored.`);
    }

    // 4. Respond to Taskade to acknowledge receipt
    return createApiResponse({ message: 'Result received' }, 200);

  } catch (error) {
    return handleApiError(error);
  }
}
