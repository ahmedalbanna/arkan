
'use server';

import { z } from 'zod';
import { updateProject, deleteProject } from '@/lib/db/queries';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const projectSchema = z.object({
  projectId: z.string(),
  title: z.string().min(3, 'العنوان يجب أن يكون 3 أحرف على الأقل.'),
  description: z.string().min(10, 'الوصف يجب أن يكون 10 أحرف على الأقل.'),
  category: z.string().min(1, 'التصنيف مطلوب.'),
  tags: z.string().min(1, 'يجب إدخال وسم واحد على الأقل.'),
  liveLink: z.string().url('الرابط غير صالح.').optional().or(z.literal('')),
  mediaUrls: z.array(z.string().url('رابط الوسائط غير صالح.')).min(1, 'يجب إضافة صورة واحدة على الأقل.'),
  mediaAlts: z.array(z.string().min(1, 'النص البديل مطلوب.')).min(1, 'يجب إضافة صورة واحدة على الأقل.'),
  mediaAiHints: z.array(z.string().optional()),
});

export interface UpdateProjectState {
  errors?: {
    title?: string[];
    description?: string[];
    category?: string[];
    tags?: string[];
    liveLink?: string[];
    mediaUrls?: string[];
    mediaAlts?: string[];
    _form?: string;
  };
  success?: boolean;
}

export async function handleUpdateProject(
  prevState: UpdateProjectState,
  formData: FormData
): Promise<UpdateProjectState> {
  const mediaUrls = formData.getAll('mediaUrl').map(String).filter(url => url.trim() !== '');
  const mediaAlts = formData.getAll('mediaAlt').map(String).filter(alt => alt.trim() !== '');
  const mediaAiHints = formData.getAll('mediaAiHint').map(String);

  const validatedFields = projectSchema.safeParse({
    projectId: formData.get('projectId'),
    title: formData.get('title'),
    description: formData.get('description'),
    category: formData.get('category'),
    tags: formData.get('tags'),
    liveLink: formData.get('liveLink'),
    mediaUrls,
    mediaAlts,
    mediaAiHints,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { projectId, title, description, category, tags, liveLink, mediaUrls: urls, mediaAlts: alts, mediaAiHints: hints } = validatedFields.data;

  try {
    await updateProject(projectId, {
      title,
      description,
      category,
      liveLink: liveLink || undefined,
      tags: tags.split(',').map(t => t.trim()).filter(t => t.length > 0),
      media: urls.map((url, i) => ({
        url,
        alt: alts[i],
        aiHint: hints?.[i] || undefined,
        type: 'image'
      }))
    });

    revalidatePath('/projects');
    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/projects/${projectId}/edit`);

  } catch (error) {
    console.error('Failed to update project:', error);
    if (error instanceof Error) {
      return {
        errors: { _form: error.message },
      };
    }
    return {
      errors: { _form: 'فشل في تحديث المشروع. يرجى المحاولة مرة أخرى.' },
    };
  }

  redirect(`/projects/${projectId}`);
}

const deleteSchema = z.object({
  projectId: z.string(),
});

export async function handleDeleteProject(prevState: { error?: string; success?: boolean }, formData: FormData) {
  const validatedFields = deleteSchema.safeParse({
    projectId: formData.get('projectId'),
  });

  if (!validatedFields.success) {
    return { error: "معرّف المشروع غير صالح." };
  }

  try {
    await deleteProject(validatedFields.data.projectId);
    revalidatePath('/projects');
  } catch (error) {
    console.error('Failed to delete project:', error);
    return { error: "فشل في حذف المشروع." };
  }

  // Redirect is handled on the client-side after this action completes
  return { success: true };
}
