'use server';

import { createApiResponseEnhanced, handleApiErrorEnhanced, withEnhancedAuth } from '@/lib/core/api';
import { createJob, generateJobToken } from '@/lib/job-store';
import { v4 as uuidv4 } from 'uuid';

/**
 * معالج بدء المهام غير المتزامنة
 */
export const POST = withEnhancedAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const { inputContent, featureId } = body;

    // 1. Generate a unique ID for the job
    const jobId = uuidv4();

    // 2. Store the initial job status in RTDB
    await createJob(jobId);
    const jobToken = await generateJobToken(jobId);

    // 3. Asynchronously trigger the Taskade workflow
    const taskadeWebhookUrl = "https://www.taskade.com/webhooks/flow/01K32B4BQ9JF4R5EP3PK1GDG5S/sync";
    const taskadeAuthToken = "Bearer tskdp_pJ56NamHnj8yn8Y3dNTTXMwrrB7ksoGWbC";

    console.log(`Job ${jobId} started. Calling Taskade workflow...`);

    // We don't wait for this to complete.
    fetch(taskadeWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': taskadeAuthToken,
      },
      body: JSON.stringify({
        jobId: jobId,
        inputContent: inputContent,
        callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/taskade-result`,
        apiToken: jobToken, // Pass our secure token to Taskade
      })
    }).catch(error => {
      // Log the error but don't fail the user's request.
      console.error(`Error triggering Taskade workflow for job ${jobId}:`, error);
    });

    // 4. Immediately respond to the client with the job ID
    return createApiResponseEnhanced({ jobId }, 202); // 202 Accepted

  } catch (error) {
    return handleApiErrorEnhanced(error);
  }
});
