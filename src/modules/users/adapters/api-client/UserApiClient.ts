import { injectable } from 'tsyringe';
import { apiService, ApiError } from '@/infrastructure/api/ApiService';
import { UserProfile } from '../../domain/entities/User';
import { Result } from '@/infrastructure/utils/result';

export interface PaginatedUsersResponse {
  users: UserProfile[];
  hasNextPage: boolean;
  lastVisibleId: string | null;
}

export interface CreateUserInput {
  email: string;
  name: string;
  role: 'admin' | 'user';
  password?: string;
}

export interface CreateUserResponse {
  id: string;
  email: string;
  name: string;
}

export interface SendNotificationInput {
  userId: string;
  title: string;
  description: string;
  type: 'info' | 'success' | 'warning' | 'alert' | 'error';
  link?: string;
}

export interface SendNotificationResponse {
  message: string;
}

const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;
  return new ApiError(error instanceof Error ? error.message : 'Unknown error', 500);
};

@injectable()
export class UserApiClient {
  async fetchUserById(id: string): Promise<Result<UserProfile, ApiError>> {
    try {
      const data = await apiService<never, UserProfile>({ endpoint: `/api/users/${id}` });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async fetchUserProfile(id: string): Promise<Result<UserProfile, ApiError>> {
    return this.fetchUserById(id);
  }

  async fetchUserFingerprints(userId: string): Promise<Result<any[], ApiError>> {
    try {
      const data = await apiService<never, any[]>({ 
        endpoint: `/api/users/${userId}/fingerprints`
      });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async revokeUserFingerprint(userId: string, fingerprintId: string): Promise<Result<void, ApiError>> {
    try {
      await apiService({ 
        endpoint: `/api/users/${userId}/fingerprints/${fingerprintId}`,
        method: 'DELETE'
      });
      return Result.ok();
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async fetchLoginHistory(userId: string): Promise<Result<any[], ApiError>> {
    try {
      const data = await apiService<never, any[]>({ 
        endpoint: `/api/users/${userId}/login-history`
      });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async updateUser(id: string, data: Partial<UserProfile>): Promise<Result<UserProfile, ApiError>> {
    try {
      const response = await apiService<Partial<UserProfile>, UserProfile>({
        endpoint: `/api/users/${id}`,
        method: 'PUT',
        data,
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async getPaginatedUsers(
    options: { limit: number; lastVisibleId?: string }
  ): Promise<Result<PaginatedUsersResponse, ApiError>> {
    try {
      const query = new URLSearchParams({ limit: options.limit.toString() });
      if (options.lastVisibleId) query.set('lastVisibleId', options.lastVisibleId);

      const data = await apiService<never, PaginatedUsersResponse>({
        endpoint: `/api/admin/users?${query.toString()}`,
      });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async createUser(data: any): Promise<Result<CreateUserResponse, ApiError>> {
    try {
      const response = await apiService<any, CreateUserResponse>({
        endpoint: '/api/admin/users',
        method: 'POST',
        data,
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async adminUpdateUser(options: { id: string; data: Partial<UserProfile> }): Promise<Result<UserProfile, ApiError>> {
    try {
      const response = await apiService<Partial<UserProfile>, UserProfile>({
        endpoint: `/api/admin/users/${options.id}`,
        method: 'PUT',
        data: options.data,
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async deleteUser(id: string): Promise<Result<{ message: string }, ApiError>> {
    try {
      const response = await apiService<never, { message: string }>({
        endpoint: `/api/admin/users/${id}`,
        method: 'DELETE',
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async sendNotification(
    data: SendNotificationInput,
  ): Promise<Result<SendNotificationResponse, ApiError>> {
    try {
      const response = await apiService<SendNotificationInput, SendNotificationResponse>({
        endpoint: '/api/admin/notifications',
        method: 'POST',
        data,
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  // Legacy/Firebase specific - can be removed if not needed anymore
  subscribeToUserProfile(
    _id: string,
    _firestore: any,
    _callback: (user: UserProfile | null) => void,
  ): () => void {
    // This previously used Firestore onSnapshot. 
    // For SQLite, we should probably rely on manual refetch or WebSockets.
    return () => {};
  }
}
