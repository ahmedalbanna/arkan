
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { updateUser, deleteUser, getUserProfile } from '@/services/userService';
import { getSession } from '@/lib/auth';

// Helper function to verify the requester is an admin
async function verifyAdmin() {
  const session = await getSession();
  
  if (!session?.user?.id) {
    return { authorized: false, message: 'Unauthorized' };
  }

  const userProfile = await getUserProfile(session.user.id);
  if (!userProfile || (userProfile.role !== 'ADMIN' && userProfile.role !== 'SUPER_ADMIN')) {
    return { authorized: false, message: 'Forbidden' };
  }

  return { authorized: true };
}


const updateUserSchema = z.object({
  userId: z.string(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  credits: z.coerce.number().int('Credits must be an integer').min(0, 'Credits cannot be negative'),
  role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']),
});

export async function handleUpdateUser(prevState: any, formData: FormData) {
  const adminCheck = await verifyAdmin();
  if (!adminCheck.authorized) {
      return { errors: { _form: 'Forbidden' } };
  }

  const validatedFields = updateUserSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { userId, ...updateData } = validatedFields.data;

  try {
    await updateUser(userId, updateData);
    revalidatePath('/admin/manage-users');
    revalidatePath(`/admin/manage-users/${userId}/edit`);
    return { success: true, message: 'User updated successfully.' };
  } catch (_error) {
    console.error('Failed to update user:', _error);
    return { errors: { _form: 'An unexpected error occurred.' } };
  }
}

const deleteUserSchema = z.object({
  userId: z.string(),
});

export async function handleDeleteUser(prevState: any, formData: FormData) {
    const adminCheck = await verifyAdmin();
    if (!adminCheck.authorized) {
        return { error: 'Forbidden' };
    }

    const validatedFields = deleteUserSchema.safeParse({
        userId: formData.get('userId'),
    });

    if (!validatedFields.success) {
        return { error: 'Invalid user ID.' };
    }

    try {
        await deleteUser(validatedFields.data.userId);
    } catch {
        return { error: 'Failed to delete user.' };
    }

    revalidatePath('/admin/manage-users');
    redirect('/admin/manage-users');
}
