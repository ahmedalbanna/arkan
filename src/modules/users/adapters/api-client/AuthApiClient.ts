import { apiService, ApiError } from '@/infrastructure/api/ApiService';
import { LoginCredentials } from '@/modules/users/domain/utils/authUtils';
import { SignupCredentials } from '@/modules/users/adapters/components/auth/SignupForm';
import { UserProfile } from '@/modules/users/domain/entities/User';
import { Result } from '@/infrastructure/utils/result';
import { injectable } from 'tsyringe';

const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;
  return new ApiError(error instanceof Error ? error.message : 'Unknown error', 500);
};

@injectable()
export class AuthApiClient {
    constructor() {}

    // --- Authentication Functions ---

    async loginWithEmail(credentials: LoginCredentials): Promise<Result<any, ApiError>> {
        try {
            const data = await apiService({
                endpoint: '/api/auth/login',
                method: 'POST',
                data: credentials
            });
            return Result.ok(data);
        } catch (error: any) {
            return Result.fail(toApiError(error));
        }
    }

    async loginWithGoogle(): Promise<Result<any, ApiError>> {
        return Result.fail(new ApiError("Google Sign-In not supported in local auth", 400));
    }

    async serviceLogoutUser(): Promise<Result<any, ApiError>> {
        try {
            const data = await apiService({ endpoint: '/api/auth/logout', method: 'POST' });
            return Result.ok(data);
        } catch (error: any) {
            return Result.fail(toApiError(error));
        }
    }

    async serviceSignupUser(credentials: SignupCredentials): Promise<Result<UserProfile, ApiError>> {
        try {
            const data = await apiService({
                endpoint: '/api/auth/signup',
                method: 'POST',
                data: credentials
            });
            return Result.ok(data);
        } catch (error: any) {
            return Result.fail(toApiError(error));
        }
    }

    async forgotPasswordService(email: string): Promise<Result<any, ApiError>> {
        try {
            const data = await apiService({
                endpoint: '/api/auth/forgot-password',
                method: 'POST',
                data: { email }
            });
            return Result.ok(data);
        } catch (error: any) {
            return Result.fail(toApiError(error));
        }
    }

    async resetPasswordApi(token: string, password: string): Promise<Result<any, ApiError>> {
        try {
            const data = await apiService({
                endpoint: '/api/auth/reset-password',
                method: 'POST',
                data: { token, password }
            });
            return Result.ok(data);
        } catch (error: any) {
            return Result.fail(toApiError(error));
        }
    }

    async changePasswordApi(passwords: { currentPassword: string, newPassword: string }): Promise<Result<any, ApiError>> {
        try {
            const data = await apiService({
                endpoint: '/api/auth/change-password',
                method: 'POST',
                data: passwords
            });
            return Result.ok(data);
        } catch (error: any) {
            return Result.fail(toApiError(error));
        }
    }

    async logoutAllDevicesApi(): Promise<Result<any, ApiError>> {
        try {
            const data = await apiService({
                endpoint: '/api/auth/logout-all',
                method: 'POST'
            });
            return Result.ok(data);
        } catch (error: any) {
            return Result.fail(toApiError(error));
        }
    }

    async sendPasswordResetEmailApi(userId: string): Promise<Result<any, ApiError>> {
        try {
            const data = await apiService({
                endpoint: `/api/admin/users/${userId}/send-password-reset`,
                method: 'POST'
            });
            return Result.ok(data);
        } catch (error: any) {
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
        } catch (error: any) {
            return Result.fail(toApiError(error));
        }
    }
}
