import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { updateUser, getUserProfile } from '@/services/userService';
import { saveFile, deleteFile, validateFileType, validateFileSize, ALLOWED_IMAGE_TYPES } from '@/lib/storage/file-storage';
import { revalidatePath } from 'next/cache';

/**
 * POST /api/admin/users/[id]/upload-profile-picture
 * Admin-only endpoint to upload a profile picture for any user
 */
export const POST = withAuth(
  async ({ request, params }) => {
    try {
      const { id: targetUserId } = await params;

      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return handleApiError({ message: 'No file uploaded.' }, 400);
      }

      // Validate file type
      if (!validateFileType(file, ALLOWED_IMAGE_TYPES)) {
        return handleApiError(
          { message: 'Invalid file type. Only JPG, PNG, and WebP are allowed.' },
          400
        );
      }

      // Validate file size (max 5MB)
      if (!validateFileSize(file, 5)) {
        return handleApiError(
          { message: 'File size exceeds 5MB limit.' },
          400
        );
      }

      // Get user's current profile to delete old picture if it exists
      const currentUser = await getUserProfile(targetUserId);
      if (!currentUser) {
        return handleApiError({ message: 'User not found.' }, 404);
      }

      // Save new file
      const fileUrl = await saveFile(file, `profile-pictures/${targetUserId}`);

      // Delete old profile picture if it exists
      if (currentUser.image) {
        try {
          await deleteFile(currentUser.image);
        } catch (error) {
          console.warn('Failed to delete old profile picture:', error);
          // Don't fail the operation if deletion fails
        }
      }

      // Update user profile with new image URL
      const updatedUser = await updateUser(targetUserId, {
        image: fileUrl,
      });

      revalidatePath(`/profile/${targetUserId}`);
      revalidatePath('/admin/manage-users');

      return createApiResponse(
        {
          message: 'Profile picture uploaded successfully',
          image: fileUrl,
        },
        200
      );
    } catch (error) {
      console.error('Profile picture upload error:', error);
      return handleApiError(error);
    }
  },
  { requireAdmin: true }
);
