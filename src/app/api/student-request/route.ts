
'use server';

import { z } from 'zod';
import { handleApiError, createApiResponse } from '@/lib/api-utils';
import { v4 as uuidv4 } from 'uuid';

const requestSchema = z.object({
  requirements: z.string().min(20),
  email: z.string().email(),
  phone: z.string().min(10),
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const requirements = formData.get('requirements') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;

    const validation = requestSchema.safeParse({ requirements, email, phone });
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const projectId = uuidv4();

    // In a real application, you would save this data to a database,
    // and upload the file to a storage service like Firebase Storage.
    // For now, we just log it to the server console.
    console.log('New Student Request Received:');
    console.log({
        projectId,
        requirements: validation.data.requirements,
        email: validation.data.email,
        phone: validation.data.phone,
        fileName: file?.name,
        fileSize: file?.size,
        fileType: file?.type,
    });

    // Return a success response to the client
    return createApiResponse({ message: 'Request received successfully.', projectId }, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
