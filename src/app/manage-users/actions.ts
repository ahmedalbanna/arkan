
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { container } from '@/infrastructure/di/container';
import { UserController } from '@/modules/users/adapters/controllers/UserController';
import { cookies } from 'next/headers';

// Helper function to verify the requester is an admin
async function verifyAdmin() {
  const sessionCookie = (await cookies()).get('__session')?.value;
  if (!sessionCookie) {
    return { authorized: false, message: 'Unauthorized' };
  }
  try {
    const controller = container.resolve(UserController);
    const decodedToken = await controller.verifySession(sessionCookie, true);
    const userProfile = await controller.getUser(decodedToken.uid);
    if (userProfile?.role !== 'admin') {
      return { authorized: false, message: 'Forbidden' };
    }
    return { authorized: true };
  } catch (error) {
    return { authorized: false, message: 'Unauthorized' };
  }
}


const updateUserSchema = z.object({
  userId: z.string(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  bio: z.string().optional(),
  credits: z.coerce.number().int('Credits must be an integer').min(0, 'Credits cannot be negative'),
  role: z.enum(['user', 'admin']),
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
    const controller = container.resolve(UserController);
    await controller.updateUser(userId, updateData);
    
    revalidatePath('/admin/manage-users');
    revalidatePath(`/admin/manage-users/${userId}/edit`);
    return { success: true, message: 'User updated successfully.' };
  } catch (error) {
    console.error('Failed to update user:', error);
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
        const controller = container.resolve(UserController);
        await controller.deleteUser(validatedFields.data.userId);
    } catch (error) {
        console.error('Failed to delete user:', error);
        return { error: 'Failed to delete user.' };
    }

    revalidatePath('/admin/manage-users');
    redirect('/admin/manage-users');
}
