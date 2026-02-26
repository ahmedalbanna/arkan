
import { z } from 'zod';
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { GetTransactionsUseCase } from '@/modules/billing/application/use-cases/GetTransactionsUseCase';
import { adminDb } from '@/infrastructure/firebase/server-init';

const getTransactionsSchema = z.object({
  status: z.enum(['pending', 'verified', 'rejected']).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(6),
  lastVisibleId: z.string().optional(),
});

const createTransactionRepository = () => ({
  getById: async (id: string) => {
    const doc = await adminDb.collection('transactions').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as any;
  },
  getAll: async () => {
    const snapshot = await adminDb.collection('transactions').orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
  },
  getByUserId: async (userId: string) => {
    const snapshot = await adminDb.collection('transactions').where('userId', '==', userId).orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
  },
  save: async (data: any) => {
    const ref = adminDb.collection('transactions').doc();
    const payload = { ...data, createdAt: new Date().toISOString() };
    await ref.set(payload);
    return { id: ref.id, ...payload } as any;
  },
  update: async (id: string, data: any) => {
    const ref = adminDb.collection('transactions').doc(id);
    await ref.update(data);
    const updated = await ref.get();
    return { id: updated.id, ...updated.data() } as any;
  },
  getPaginated: async (options: { status?: string; limit: number; lastVisibleId?: string }) => {
    let query: FirebaseFirestore.Query = adminDb.collection('transactions').orderBy('createdAt', 'desc');
    if (options.status) {
      query = query.where('status', '==', options.status);
    }
    query = query.limit(options.limit + 1);
    if (options.lastVisibleId) {
      const lastDoc = await adminDb.collection('transactions').doc(options.lastVisibleId).get();
      if (lastDoc.exists) query = query.startAfter(lastDoc);
    }
    const snapshot = await query.get();
    const transactions = snapshot.docs.slice(0, options.limit).map(doc => ({ id: doc.id, ...doc.data() } as any));
    const hasNextPage = snapshot.docs.length > options.limit;
    const lastId = hasNextPage ? transactions[transactions.length - 1].id : null;
    return { transactions, hasNextPage, lastVisibleId: lastId };
  },
  getByDateRange: async (startDate: string, endDate: string) => {
    const snapshot = await adminDb.collection('transactions')
      .where('createdAt', '>=', startDate)
      .where('createdAt', '<=', endDate)
      .orderBy('createdAt', 'desc')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
  }
});

export const GET = withAuth(async ({ request }) => {
  try {
    const { searchParams } = new URL(request.url);
    const queryValidation = getTransactionsSchema.safeParse(Object.fromEntries(searchParams));

    if (!queryValidation.success) {
      return handleApiError(queryValidation.error);
    }

    const { limit, lastVisibleId, status } = queryValidation.data;

    const transactionRepo = createTransactionRepository();
    const useCase = new GetTransactionsUseCase(transactionRepo as any);
    const result = await useCase.execute({ status, limit, lastVisibleId });
    return createApiResponse(result, 200);

  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });
