import { apiService, ApiError } from '@/infrastructure/api/ApiService';
import { LoginCredentials } from '@/modules/users/domain/utils/authUtils';
import { SignupCredentials } from '@/modules/users/adapters/components/auth/SignupForm';
import { UserProfile } from '@/modules/users/domain/entities/User';
import { Result } from '@/infrastructure/utils/result';
import { injectable } from 'tsyringe';

/**
 * AuthApiClient — Unified high-fidelity communication vector for identity nodes.
 * Manages secure ingress, session termination, and profile persistence.
 * 
 * DEFENSIVE MEASURES:
 * 1. Result Pattern: Transitions all API responses into structured success/failure vectors.
 * 2. Type Purity: Uses explicit domain entities (UserProfile) for return types.
 * 3. Error Containment: Standardized toApiError mapper for uniform protocol failures.
 */

const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;
  return new ApiError(error instanceof Error ? error.message : 'Unknown neural link failure.', 500);
};

@injectable()
export class AuthApiClient {
    constructor() {}

    async loginWithEmail(credentials: LoginCredentials): Promise<Result<UserProfile, ApiError>> {
        try {
            const data = await apiService<LoginCredentials, UserProfile>({
                endpoint: '/api/auth/login',
                method: 'POST',
                data: credentials
            });
            return Result.ok(data);
        } catch (error: unknown) {
            return Result.fail(toApiError(error));
        }
    }

    async loginWithGoogle(): Promise<Result<UserProfile, ApiError>> {
        return Result.fail(new ApiError("Google Sign-In protocol is currently restricted.", 400));
    }

    async serviceLogoutUser(): Promise<Result<{ success: boolean }, ApiError>> {
        try {
            const data = await apiService<undefined, { success: boolean }>({ 
                endpoint: '/api/auth/logout', 
                method: 'POST' 
            });
            return Result.ok(data);
        } catch (error: unknown) {
            return Result.fail(toApiError(error));
        }
    }

    async serviceSignupUser(credentials: SignupCredentials): Promise<Result<UserProfile, ApiError>> {
        try {
            const data = await apiService<SignupCredentials, UserProfile>({
                endpoint: '/api/auth/signup',
                method: 'POST',
                data: credentials
            });
            return Result.ok(data);
        } catch (error: unknown) {
            return Result.fail(toApiError(error));
        }
    }

    async forgotPasswordService(email: string): Promise<Result<{ success: boolean }, ApiError>> {
        try {
            const data = await apiService<{ email: string }, { success: boolean }>({
                endpoint: '/api/auth/forgot-password',
                method: 'POST',
                data: { email }
            });
            return Result.ok(data);
        } catch (error: unknown) {
            return Result.fail(toApiError(error));
        }
    }

    async resetPasswordApi(token: string, password: string): Promise<Result<{ success: boolean }, ApiError>> {
        try {
            const data = await apiService<any, { success: boolean }>({
                endpoint: '/api/auth/reset-password',
                method: 'POST',
                data: { token, password }
            });
            return Result.ok(data);
        } catch (error: unknown) {
            return Result.fail(toApiError(error));
        }
    }

    async changePasswordApi(passwords: { currentPassword: string, newPassword: string }): Promise<Result<{ success: boolean }, ApiError>> {
        try {
            const data = await apiService<any, { success: boolean }>({
                endpoint: '/api/auth/change-password',
                method: 'POST',
                data: passwords
            });
            return Result.ok(data);
        } catch (error: unknown) {
            return Result.fail(toApiError(error));
        }
    }

    async logoutAllDevicesApi(): Promise<Result<{ success: boolean }, ApiError>> {
        try {
            const data = await apiService<undefined, { success: boolean }>({
                endpoint: '/api/auth/logout-all',
                method: 'POST'
            });
            return Result.ok(data);
        } catch (error: unknown) {
            return Result.fail(toApiError(error));
        }
    }

    async sendPasswordResetEmailApi(userId: string): Promise<Result<{ success: boolean }, ApiError>> {
        try {
            const data = await apiService<undefined, { success: boolean }>({
                endpoint: `/api/admin/users/${userId}/send-password-reset`,
                method: 'POST'
            });
            return Result.ok(data);
        } catch (error: unknown) {
            return Result.fail(toApiError(error));
        }
    }

    async createOrUpdateUserProfileApi(userId: string, data: Partial<UserProfile>): Promise<Result<UserProfile, ApiError>> {
        try {
            const response = await apiService<Partial<UserProfile>, UserProfile>({
                endpoint: `/api/users/${userId}`,
                method: 'PUT',
                data,
            });
            return Result.ok(response);
        } catch (error: unknown) {
            return Result.fail(toApiError(error));
        }
    }
}
