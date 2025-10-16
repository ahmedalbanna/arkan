
'use client';

interface StartGenerationResponse {
  jobId: string;
}

interface StartGenerationPayload {
    featureId: string;
    inputContent: string | object;
}

export async function startGenerationApi(payload: StartGenerationPayload, token: string): Promise<StartGenerationResponse> {
  const response = await fetch('/api/generate/start', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to start the generation process.');
  }

  return response.json();
}

export async function getJobStatusApi(jobId: string, token: string): Promise<any> {
    const response = await fetch(`/api/generate/status/${jobId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
     if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch job status.');
    }
    return response.json();
}
