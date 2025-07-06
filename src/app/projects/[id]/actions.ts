'use server';

import { z } from 'zod';
import { addComment, updateComment, deleteComment } from '@/lib/db/queries';
import { revalidatePath } from 'next/cache';

const commentSchema = z.object({
  comment: z.string().min(1, 'التعليق لا يمكن أن يكون فارغاً.').max(500, 'التعليق طويل جداً.'),
  projectId: z.string(),
  commentId: z.string().optional(),
  intent: z.enum(['create', 'edit', 'delete']),
});

export async function handleCommentAction(prevState: { error?: string } | null, formData: FormData) {
  // Clear the new comment field on successful submission
  const commentTextarea = formData.get('comment');
  if (commentTextarea instanceof HTMLInputElement) {
      commentTextarea.value = '';
  }
    
  const validatedFields = commentSchema.safeParse({
    comment: formData.get('comment'),
    projectId: formData.get('projectId'),
    commentId: formData.get('commentId'),
    intent: formData.get('intent'),
  });

  if (!validatedFields.success) {
    console.error(validatedFields.error.flatten().fieldErrors);
    return { error: 'بيانات تعليق غير صالحة.' };
  }

  const { comment, projectId, commentId, intent } = validatedFields.data;
  
  // For this prototype, we'll hardcode the user ID.
  // In a real app, this would come from the authenticated session and we'd check for ownership before editing/deleting.
  const userId = 'user-1'; 
    
  try {
    switch (intent) {
      case 'create':
        await addComment({
          projectId,
          userId,
          content: comment,
        });
        break;
      case 'edit':
        if (!commentId) return { error: 'معرّف التعليق مطلوب للتعديل.' };
        // In a real app, you would also verify that the current user owns this comment.
        await updateComment(commentId, comment);
        break;
      case 'delete':
        if (!commentId) return { error: 'معرّف التعليق مطلوب للحذف.' };
        // In a real app, you would also verify that the current user owns this comment.
        await deleteComment(commentId);
        break;
      default:
        return { error: 'إجراء غير صالح.' };
    }

    revalidatePath(`/projects/${projectId}`);
    return { error: undefined };

  } catch (error) {
    console.error('Error handling comment action:', error);
    return { error: 'فشل في تنفيذ إجراء التعليق.' };
  }
}