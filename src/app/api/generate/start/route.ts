
'use server';

import { v4 as uuidv4 } from 'uuid';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';
import { createJob, generateJobToken } from '@/lib/job-store';
import axios from 'axios';

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const inputContent = body.inputContent;

    // 1. Generate a unique ID for the job
    const jobId = uuidv4();

    // 2. Store the initial job status in RTDB
    await createJob(jobId);
    const jobToken = await generateJobToken(jobId);

    // 3. Asynchronously trigger the Taskade workflow
    const taskadeWebhookUrl = "https://www.taskade.com/webhooks/flow/01K1XJVYKXE6BPSE706F4W8KTF";
    const taskadeAuthToken = "Bearer tskdp_pJ56NamHnj8yn8Y3dNTTXMwrrB7ksoGWbC";

    console.log(`Job ${jobId} started. Calling Taskade workflow...`);

    // We don't wait for this to complete.
    axios.post(taskadeWebhookUrl, {
      jobId: jobId,
      inputContent: inputContent,
      callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/taskade-result`,
      apiToken: jobToken, // Pass our secure token to Taskade
    }, {
      headers: {
        'Authorization': taskadeAuthToken,
      }
    }).catch(error => {
        // Log the error but don't fail the user's request.
        console.error(`Error triggering Taskade workflow for job ${jobId}:`, error);
    });

    // 4. Immediately respond to the client with the job ID
    return createApiResponse({ jobId }, 202); // 202 Accepted

  } catch (error) {
    return handleApiError(error);
  }
});
