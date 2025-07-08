
'use server';

import { z } from 'zod';
import { createProject } from '@/lib/db/queries';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const projectSchema = z.object({
  title: z.string().min(3, 'العنوان يجب أن يكون 3 أحرف على الأقل.'),
  description: z.string().min(10, 'الوصف يجب أن يكون 10 أحرف على الأقل.'),
  category: z.string().min(1, 'التصنيف مطلوب.'),
  tags: z.string().min(1, 'يجب إدخال وسم واحد على الأقل.'),
  liveLink: z.string().url('الرابط غير صالح.').optional().or(z.literal('')),
});

export interface CreateProjectState {
  errors?: {
    title?: string[];
    description?: string[];
    category?: string[];
    tags?: string[];
    liveLink?: string[];
    _form?: string;
  };
  success?: boolean;
}

export async function handleCreateProject(
  prevState: CreateProjectState,
  formData: FormData
): Promise<CreateProjectState> {

  const validatedFields = projectSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    category: formData.get('category'),
    tags: formData.get('tags'),
    liveLink: formData.get('liveLink'),
  });
  
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { title, description, category, tags, liveLink } = validatedFields.data;

  // In a real app, this would come from the authenticated session.
  const userId = 'user-1'; 
  
  let newProjectId;
  try {
    newProjectId = await createProject({
      userId,
      title,
      description,
      category,
      liveLink: liveLink || undefined,
      tags: tags.split(',').map(t => t.trim()).filter(t => t.length > 0),
      media: [{
          url: 'https://placehold.co/800x600.png',
          alt: `Cover image for ${title}`,
          aiHint: 'report cover',
          type: 'image'
      }]
    });

    revalidatePath('/projects');
    revalidatePath(`/profile/${userId}`);

  } catch (error) {
    console.error('Failed to create project:', error);
    if (error instanceof Error) {
        return {
          errors: { _form: error.message },
        };
    }
    return {
      errors: { _form: 'فشل في إنشاء المشروع. يرجى المحاولة مرة أخرى.' },
    };
  }

  // Redirect to the new project page on success
  redirect(`/projects/${newProjectId}`);
}
