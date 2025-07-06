'use server';

import { z } from 'zod';
import { addComment } from '@/lib/db/queries';
import { revalidatePath } from 'next/cache';

const commentSchema = z.object({
  comment: z.string().min(1, 'التعليق لا يمكن أن يكون فارغاً.').max(500, 'التعليق طويل جداً.'),
  projectId: z.string(),
});

export async function handlePostComment(formData: FormData) {
  const validatedFields = commentSchema.safeParse({
    comment: formData.get('comment'),
    projectId: formData.get('projectId'),
  });

  if (!validatedFields.success) {
    console.error(validatedFields.error.flatten().fieldErrors);
    // In a real app, you would return this error to the user.
    return { error: 'Invalid comment data.' };
  }

  const { comment, projectId } = validatedFields.data;

  try {
    // For this prototype, we'll hardcode the user ID of an existing user.
    // In a real app, this would come from the authenticated session.
    const userId = 'user-1'; 
    
    await addComment({
      projectId,
      userId,
      content: comment,
    });

    revalidatePath(`/projects/${projectId}`);
  } catch (error) {
    console.error('Error posting comment:', error);
    return { error: 'Failed to post comment.' };
  }
}
