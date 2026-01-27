
'use server';

import {
  createTransactionHelper,
  listDocs,
  paginateQuery,
} from '@/lib/firebase/db-helpers';
import type { TransactionProperties } from '@/lib/models';

/**
 * Create a new transaction record
 * @param data - Transaction data excluding auto-generated fields
 * @returns Object containing the created transaction ID
 */
export async function createTransaction(
  data: Omit<TransactionProperties, 'createdAt' | 'id'>
): Promise<{ id: string }> {
  try {
    const transaction = await createTransactionHelper(data);
    return { id: transaction.id };
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
}

/**
 * Get transactions by status with pagination support
 * @param status - Transaction status: pending, verified, or rejected
 * @param limit - Number of results per page
 * @param lastVisibleId - Cursor for pagination
 * @returns Paginated transactions with hasNextPage flag
 */
export async function getTransactionsByStatus({
  status,
  limit,
  lastVisibleId,
}: {
  status: 'pending' | 'verified' | 'rejected';
  limit: number;
  lastVisibleId?: string;
}): Promise<{
  transactions: TransactionProperties[];
  hasNextPage: boolean;
  lastVisibleId?: string | null;
}> {
  try {
    const result = await paginateQuery<TransactionProperties>(
      'transactions',
      limit,
      lastVisibleId,
      {
        filters: [{ field: 'status', operator: '==', value: status }],
        orderBy: { field: 'createdAt', direction: 'desc' },
      }
    );

    return {
      transactions: result.items,
      hasNextPage: result.hasNextPage,
      lastVisibleId: result.lastVisibleId,
    };
  } catch (error) {
    console.error(`Error fetching transactions by status (${status}):`, error);
    throw error;
  }
}

/**
 * Get all transactions for a specific user
 * @param userId - User ID to filter by
 * @returns Array of user's transactions
 */
export async function getTransactionsByUserId(
  userId: string
): Promise<TransactionProperties[]> {
  try {
    return await listDocs<TransactionProperties>('transactions', {
      filters: [{ field: 'userId', operator: '==', value: userId }],
      orderBy: { field: 'createdAt', direction: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    throw error;
  }
}

/**
 * Get transactions within a date range
 * @param startDate - Start date for range (ISO format)
 * @param endDate - End date for range (ISO format)
 * @returns Array of transactions within date range
 */
export async function getTransactionsByDateRange(
  startDate: string,
  endDate: string
): Promise<TransactionProperties[]> {
  try {
    return await listDocs<TransactionProperties>('transactions', {
      filters: [
        { field: 'createdAt', operator: '>=', value: startDate },
        { field: 'createdAt', operator: '<=', value: endDate },
      ],
      orderBy: { field: 'createdAt', direction: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching transactions by date range:', error);
    throw error;
  }
}
