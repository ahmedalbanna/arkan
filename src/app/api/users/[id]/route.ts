
import { withAuth, handleApiError, createApiResponse } from "@/lib/utils/api-utils";
import { container } from "@/infrastructure/di/container";
import { adminUpdateUserSchema, userUpdateSchema } from "@/lib/schemas/api-schemas";
import { checkUserAccessPermission, checkUserUpdatePermission } from "@/lib/utils/authorization";
import { IUserRepositoryToken } from "@/modules/users/domain/repositories/IUserRepository";
import { IAuthRepositoryToken } from "@/modules/users/domain/repositories/IAuthRepository";
import { GetUserProfileUseCase } from "@/modules/users/application/use-cases/GetUserProfileUseCase";
import { UpdateUserProfileUseCase } from "@/modules/users/application/use-cases/UpdateUserProfileUseCase";

const ensureUserRepositoriesRegistered = () => {
    const { adminDb, adminAuth } = require("@/infrastructure/firebase/server-init");

    const userRepo = {
        getById: async (id: string) => {
            const doc = await adminDb.collection("users").doc(id).get();
            if (!doc.exists) return null;
            return { id: doc.id, ...doc.data() };
        },
        update: async (id: string, data: any) => {
            await adminDb.collection("users").doc(id).set(data, { merge: true });
            const doc = await adminDb.collection("users").doc(id).get();
            return { id: doc.id, ...doc.data() };
        },
        save: async (user: any) => {
            await adminDb.collection("users").doc(user.id).set(user, { merge: true });
            return user;
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
        deleteUser: async () => {},
        verifyToken: async (tokenValue: string) => {
            const decodedToken = await adminAuth.verifyIdToken(tokenValue, true);
            return { uid: decodedToken.uid, email: decodedToken.email };
        },
    };

    return { userRepo, authRepo };
};

// GET a single user profile.
export const GET = withAuth(async ({ params, user: requester }) => {
    try {
        const { id: targetUserId } = await params;

        // Check authorization
        const authError = checkUserAccessPermission(requester, targetUserId);
        if (authError) return authError;

        const { userRepo } = ensureUserRepositoriesRegistered();
        const useCase = new GetUserProfileUseCase(userRepo);
        const user = await useCase.execute(targetUserId);
        
        if (!user) {
            return handleApiError({ message: "User not found." }, 404);
        }
        return createApiResponse(user, 200);
    } catch (error) {
        return handleApiError(error);
    }
});

// PUT (update) a user profile
export const PUT = withAuth(async ({ request, params, user: requester }) => {
    try {
        const { id: userId } = await params;
        const body = await request.json();

        // Check authorization
        const authError = checkUserUpdatePermission(requester, userId);
        if (authError) return authError;

        // Select schema based on role
        const schema = requester.role === 'admin' ? adminUpdateUserSchema : userUpdateSchema;
        const validation = schema.safeParse(body);

        if (!validation.success) {
            return handleApiError(validation.error);
        }

        const { userRepo, authRepo } = ensureUserRepositoriesRegistered();
        const useCase = new UpdateUserProfileUseCase(userRepo, authRepo);
        const updatedUser = await useCase.execute(userId, validation.data, requester.email);
        
        return createApiResponse(updatedUser, 200);
    } catch (error: any) {
        if (error.code === 'auth/email-already-exists') {
            return handleApiError({ message: "This email is already in use by another account." }, 409);
        }
        return handleApiError(error);
    }
});
