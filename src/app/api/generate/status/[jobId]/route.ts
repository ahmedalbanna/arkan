
'use server';

import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';
import { getJob } from '@/lib/job-store';

interface RouteContext {
  params: {
    jobId: string;
  };
}

// THIS ENDPOINT IS NO LONGER USED FOR POLLING
// but it's kept in case a direct status check is needed in the future.
export const GET = withAuth(async ({ params }) => {
  try {
    const { jobId } = params;

    const job = await getJob(jobId);

    if (!job) {
      return handleApiError({ message: 'Job not found' }, 404);
    }

    // Return the current status and the result if completed
    return createApiResponse({
        status: job.status,
        result: job.result,
        error: job.error,
    }, 200);

  } catch (error) {
    return handleApiError(error);
  }
});
