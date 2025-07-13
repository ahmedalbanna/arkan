
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { updateUserByAdmin, deleteUser } from '@/lib/db/queries';

const updateUserSchema = z.object({
  userId: z.string(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  bio: z.string().optional(),
  credits: z.coerce.number().int('Credits must be an integer').min(0, 'Credits cannot be negative'),
});

export async function handleUpdateUser(prevState: any, formData: FormData) {
  const validatedFields = updateUserSchema.safeParse({
    userId: formData.get('userId'),
    name: formData.get('name'),
    email: formData.get('email'),
    bio: formData.get('bio'),
    credits: formData.get('credits'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { userId, ...updateData } = validatedFields.data;

  try {
    await updateUserByAdmin(userId, updateData);
    revalidatePath('/manage-users');
    revalidatePath(`/manage-users/${userId}/edit`);
    return { success: true };
  } catch (error) {
    console.error('Failed to update user:', error);
    return { errors: { _form: 'An unexpected error occurred.' } };
  }
}

const deleteUserSchema = z.object({
  userId: z.string(),
});

export async function handleDeleteUser(prevState: any, formData: FormData) {
  const validatedFields = deleteUserSchema.safeParse({
    userId: formData.get('userId'),
  });

  if (!validatedFields.success) {
    return { error: 'Invalid user ID.' };
  }

  try {
    await deleteUser(validatedFields.data.userId);
  } catch (error) {
    console.error('Failed to delete user:', error);
    return { error: 'Failed to delete user.' };
  }

  revalidatePath('/manage-users');
  redirect('/manage-users');
}
