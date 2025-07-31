
import { z } from 'zod';
import { handleApiError, createApiResponse } from '@/lib/api-utils';

const requestSchema = z.object({
  requirements: z.string().min(20),
  email: z.string().email(),
  phone: z.string().min(10),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = requestSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const { requirements, email, phone } = validation.data;

    // In a real application, you would save this data to a database,
    // trigger a workflow, send a notification, etc.
    // For now, we just log it to the server console.
    console.log('New Student Request Received:');
    console.log({ requirements, email, phone });

    // Return a success response to the client
    return createApiResponse({ message: 'Request received successfully.' }, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
