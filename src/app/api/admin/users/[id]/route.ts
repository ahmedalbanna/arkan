
import { z } from 'zod';
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { GetUserProfileUseCase } from '@/modules/users/application/use-cases/GetUserProfileUseCase';
import { UpdateUserProfileUseCase } from '@/modules/users/application/use-cases/UpdateUserProfileUseCase';
import { DeleteUserUseCase } from '@/modules/users/application/use-cases/DeleteUserUseCase';

const adminUpdateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email address').optional(),
  bio: z.string().optional(),
  credits: z.coerce.number().int().min(0).optional(),
  role: z.enum(['user', 'admin']).optional(),
  hasCompletedOnboarding: z.boolean().optional(),
});

const ensureUserRepositoriesRegistered = () => {
  const { adminDb, adminAuth } = require("@/infrastructure/firebase/server-init");

  const userRepo = {
    getById: async (id: string) => {
      const doc = await adminDb.collection("users").doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    },
    save: async (user: any) => {
      const userId = user?.id || adminDb.collection("users").doc().id;
      await adminDb.collection("users").doc(userId).set({ ...user, id: userId }, { merge: true });
      return { ...user, id: userId };
    },
    update: async (id: string, data: any) => {
      await adminDb.collection("users").doc(id).set(data, { merge: true });
      const doc = await adminDb.collection("users").doc(id).get();
      return { id: doc.id, ...doc.data() };
    },
    delete: async (id: string) => adminDb.collection("users").doc(id).delete(),
    deductCredits: async () => 0,
    addCredits: async () => {},
    getPaginated: async () => ({ users: [], hasNextPage: false, lastVisibleId: null }),
    getAdmins: async () => [],
  };

  const authRepo = {
    create: async () => ({ uid: "", email: "" }),
    updateEmail: async () => {},
    updatePassword: async () => {},
    deleteUser: async (id: string) => adminAuth.deleteUser(id),
    verifyToken: async (tokenValue: string) => {
      const decodedToken = await adminAuth.verifyIdToken(tokenValue, true);
      return { uid: decodedToken.uid, email: decodedToken.email };
    },
  };

  return { userRepo, authRepo };
};

// GET logic to fetch a single user, admin only
export const GET = withAuth(async ({ params }) => {
    try {
        const { id } = await params;
        const { userRepo } = ensureUserRepositoriesRegistered();
        const useCase = new GetUserProfileUseCase(userRepo);
        const user = await useCase.execute(id);
        if (!user) {
            return handleApiError({ message: "User not found." }, 404);
        }
        return createApiResponse(user, 200);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });

// PUT to update a user profile (Admin only)
export const PUT = withAuth(async ({ request, params }) => {
  try {
    const { id } = await params;
    if (!id) {
      return handleApiError({ message: 'User ID is required' }, 400);
    }
    
    const body = await request.json();
    const validation = adminUpdateUserSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }
    
    const { userRepo, authRepo } = ensureUserRepositoriesRegistered();
    const useCase = new UpdateUserProfileUseCase(userRepo, authRepo);
    const updatedUser = await useCase.execute(id, validation.data);

    return createApiResponse(updatedUser, 200);
  } catch (error: any) {
    if (error.code === 'auth/email-already-exists') {
        return handleApiError({ message: "This email is already in use by another account." }, 409);
    }
    return handleApiError(error);
  }
}, { requireAdmin: true });

// DELETE a user (Admin only)
export const DELETE = withAuth(async ({ params }) => {
  try {
    const { id } = await params;
    if (!id) {
      return handleApiError({ message: "User ID is required" }, 400);
    }
    const { userRepo, authRepo } = ensureUserRepositoriesRegistered();
    const useCase = new DeleteUserUseCase(userRepo, authRepo);
    await useCase.execute(id);
    return createApiResponse({ message: `User ${id} deleted successfully`}, 200);
  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });
