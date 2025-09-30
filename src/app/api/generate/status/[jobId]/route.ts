
'use server';

import { getJob } from '@/lib/job-store';

interface RouteContext {
  params: {
    jobId: string;
  };
}

// THIS ENDPOINT IS NO LONGER USED FOR POLLING
// but it's kept in case a direct status check is needed in the future.
export const GET = withEnhancedAuth(async ({ params }) => {
  try {
    const { jobId } = params;

    const job = await getJob(jobId);

    if (!job) {
      return handleApiErrorEnhanced({ message: 'Job not found' }, 404);
    }

    // Return the current status and the result if completed
    return createApiResponseEnhanced({
      status: job.status,
      result: job.result,
      error: job.error,
    }, 200);

  } catch (error) {
    return handleApiErrorEnhanced(error);
  }
});
