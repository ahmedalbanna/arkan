import { injectable } from 'tsyringe';
import { apiService, ApiError } from '@/infrastructure/api/ApiService';
import { Result } from '@/lib/utils/result';
import type { UserProfile, UserRole } from '../../domain/entities/User';
import { doc, onSnapshot, type Firestore } from 'firebase/firestore';

export interface PaginatedUsersResponse {
  users: UserProfile[];
  hasNextPage: boolean;
  lastVisibleId: string | null;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  credits: number;
}

export interface CreateUserResponse {
  user: {
    uid: string;
    email?: string;
  };
}

export interface SendNotificationInput {
  userId: string;
  title: string;
  body: string;
  link?: string;
}

export interface SendNotificationResponse {
  message?: string;
  messageId?: string;
}

const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  return new ApiError('Unexpected API client error', 500, error);
};

@injectable()
export class UserApiClient {
  async fetchUserById(id: string, token: string): Promise<Result<UserProfile, ApiError>> {
    try {
      const data = await apiService<never, UserProfile>({ endpoint: `/api/users/${id}`, token });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async fetchUserProfile(id: string, token: string): Promise<Result<UserProfile, ApiError>> {
    return this.fetchUserById(id, token);
  }

  async fetchUserFingerprints(userId: string): Promise<Result<any[], ApiError>> {
    try {
      const data = await apiService<never, any[]>({ endpoint: `/api/users/${userId}/fingerprints` });
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
      const data = await apiService<never, any[]>({ endpoint: `/api/users/${userId}/login-history` });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async updateUser(id: string, data: Partial<UserProfile>, token: string): Promise<Result<UserProfile, ApiError>> {
    try {
      const response = await apiService<Partial<UserProfile>, UserProfile>({
        endpoint: `/api/users/${id}`,
        method: 'PUT',
        data,
        token,
      });

      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async getPaginatedUsers(
    options: { limit: number; lastVisibleId?: string },
    token: string,
  ): Promise<Result<PaginatedUsersResponse, ApiError>> {
    try {
      const params = new URLSearchParams();
      params.append('limit', options.limit.toString());
      if (options.lastVisibleId) {
        params.append('lastVisibleId', options.lastVisibleId);
      }

      const response = await apiService<never, PaginatedUsersResponse>({
        endpoint: `/api/admin/users?${params.toString()}`,
        token,
      });

      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async createUser(data: CreateUserInput, token: string): Promise<Result<CreateUserResponse, ApiError>> {
    try {
      const response = await apiService<CreateUserInput, CreateUserResponse>({
        endpoint: '/api/admin/users',
        method: 'POST',
        data,
        token,
      });

      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async adminUpdateUser(id: string, data: Partial<UserProfile>, token: string): Promise<Result<UserProfile, ApiError>> {
    try {
      const response = await apiService<Partial<UserProfile>, UserProfile>({
        endpoint: `/api/admin/users/${id}`,
        method: 'PUT',
        data,
        token,
      });

      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async deleteUser(id: string, token: string): Promise<Result<{ message: string }, ApiError>> {
    try {
      const response = await apiService<never, { message: string }>({
        endpoint: `/api/admin/users/${id}`,
        method: 'DELETE',
        token,
      });

      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async sendNotification(
    variables: SendNotificationInput,
    token: string,
  ): Promise<Result<SendNotificationResponse, ApiError>> {
    try {
      const response = await apiService<SendNotificationInput, SendNotificationResponse>({
        endpoint: '/api/admin/notifications/send',
        method: 'POST',
        data: variables,
        token,
      });

      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  subscribeToUserProfile(
    userId: string,
    firestore: Firestore,
    callback: (user: UserProfile | null) => void,
  ): () => void {
    if (typeof window === 'undefined' || !firestore) {
      return () => {};
    }

    const userDocRef = doc(firestore, 'users', userId);

    const unsubscribe = onSnapshot(
      userDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          callback({ id: snapshot.id, ...snapshot.data() } as UserProfile);
          return;
        }

        callback(null);
      },
      (error) => {
        console.error('Error listening to user profile:', error);
        callback(null);
      },
    );

    return unsubscribe;
  }
}
