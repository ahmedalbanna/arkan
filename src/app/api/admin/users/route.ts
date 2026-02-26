
import { z } from 'zod';
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { container } from '@/infrastructure/di/container';
import { IUserRepositoryToken } from '@/modules/users/domain/repositories/IUserRepository';
import { IAuthRepositoryToken } from '@/modules/users/domain/repositories/IAuthRepository';
import { GetPaginatedUsersUseCase } from '@/modules/users/application/use-cases/GetPaginatedUsersUseCase';
import { CreateUserUseCase } from '@/modules/users/application/use-cases/CreateUserUseCase';

const userListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  lastVisibleId: z.string().optional(),
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
    getPaginated: async ({ limit, lastVisibleId }: any) => {
      let query = adminDb.collection("users").orderBy("createdAt", "desc").limit(limit + 1);
      if (lastVisibleId) {
        const lastDoc = await adminDb.collection("users").doc(lastVisibleId).get();
        if (lastDoc.exists) query = query.startAfter(lastDoc);
      }
      const snapshot = await query.get();
      const users = snapshot.docs.slice(0, limit).map((doc: any) => ({ id: doc.id, ...doc.data() }));
      const hasNextPage = snapshot.docs.length > limit;
      const newLastVisibleId = hasNextPage ? snapshot.docs[snapshot.docs.length - 2]?.id : null;
      return { users, hasNextPage, lastVisibleId: newLastVisibleId };
    },
    getAdmins: async () => [],
  };

  const authRepo = {
    create: async () => ({ uid: "", email: "" }),
    updateEmail: async () => {},
    updatePassword: async () => {},
    deleteUser: async () => {},
    verifyToken: async (tokenValue: string) => {
      const decodedToken = await adminAuth.verifyIdToken(tokenValue, true);
      return { uid: decodedToken.uid, email: decodedToken.email };
    },
  };

  return { userRepo, authRepo };
};

export const GET = withAuth(async ({ request }) => {
  try {
    const { searchParams } = new URL(request.url);
    const queryValidation = userListQuerySchema.safeParse(Object.fromEntries(searchParams));

    if (!queryValidation.success) {
      return handleApiError(queryValidation.error);
    }

    const { limit, lastVisibleId } = queryValidation.data;
    const { userRepo } = ensureUserRepositoriesRegistered();
    const useCase = new GetPaginatedUsersUseCase(userRepo);
    const results = await useCase.execute({ limit, lastVisibleId });
    
    return createApiResponse(results, 200);
  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });


const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  role: z.enum(['user', 'admin']).default('user'),
  credits: z.coerce.number().int().min(0).default(10),
});

export const POST = withAuth(async ({ request }) => {
  try {
    const body = await request.json();
    const validation = createUserSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }
    
    const { userRepo, authRepo } = ensureUserRepositoriesRegistered();
    const useCase = new CreateUserUseCase(userRepo, authRepo);
    const newUser = await useCase.execute(validation.data);
    
    return createApiResponse(newUser, 201);
  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });
