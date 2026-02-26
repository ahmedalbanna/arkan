
import { z } from 'zod';
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { GetGenerationLogsUseCase } from '@/modules/admin/application/use-cases/GetGenerationLogsUseCase';
import { adminDb } from '@/infrastructure/firebase/server-init';

const createRepositories = () => {
  const userRepo = {
    getById: async (id: string) => {
      const doc = await adminDb.collection('users').doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() } as any;
    },
  };

  const generationLogRepo = {
    async log() {
      return;
    },
    async getPaginated(options: { limit: number; agentId?: string; userId?: string; lastVisibleId?: string }) {
      let query: FirebaseFirestore.Query = adminDb.collection('generationLogs').orderBy('createdAt', 'desc');
      if (options.agentId) query = query.where('agentId', '==', options.agentId);
      if (options.userId) query = query.where('userId', '==', options.userId);
      query = query.limit(options.limit + 1);
      if (options.lastVisibleId) {
        const lastDoc = await adminDb.collection('generationLogs').doc(options.lastVisibleId).get();
        if (lastDoc.exists) query = query.startAfter(lastDoc);
      }
      const snapshot = await query.get();
      const logs = snapshot.docs.slice(0, options.limit).map(doc => ({ id: doc.id, ...doc.data() } as any));
      const hasNextPage = snapshot.docs.length > options.limit;
      const lastVisibleId = hasNextPage ? logs[logs.length - 1]?.id : null;
      return { logs, hasNextPage, lastVisibleId };
    }
  };

  return { userRepo, generationLogRepo };
};

const getLogsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(15),
  agentId: z.string().optional(),
  userId: z.string().optional(),
  lastVisibleId: z.string().optional(),
});

export const GET = withAuth(async ({ request }) => {
    try {
        const { searchParams } = new URL(request.url);
        const queryValidation = getLogsQuerySchema.safeParse(Object.fromEntries(searchParams));

        if (!queryValidation.success) {
            return handleApiError(queryValidation.error);
        }

        const { userRepo, generationLogRepo } = createRepositories();
        const useCase = new GetGenerationLogsUseCase(generationLogRepo as any, userRepo as any);
        const result = await useCase.execute(queryValidation.data);

        return createApiResponse(result, 200);

    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
