/**
 * خدمة المستخدمين
 *
 * هذا الملف يحتوي على جميع وظائف إدارة المستخدمين
 */

import { apiClient } from '@/core/api/client/api-client';
import { AdminService, ComplexService, SimpleService } from '@/core/api/client/base-client';
import { UserSchemas } from '@/core/validation/api-validators';
import type { UserProfile } from '@/lib/types';

export interface UserListResponse {
    users: UserProfile[];
    hasNextPage: boolean;
    lastVisibleId: string | null;
}

export interface CreateUserData {
    name: string;
    email: string;
    password: string;
    role: 'user' | 'admin';
    credits: number;
}

export interface UpdateUserData {
    name?: string;
    email?: string;
    role?: 'user' | 'admin';
    credits?: number;
}

export interface UserListParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

/**
 * خدمة قائمة المستخدمين
 */
export class UserListService extends SimpleService<UserListResponse> {
    protected endpoint = '/api/admin/users';
    protected requiresAuth = true;

    async call(token: string, params: UserListParams = {}): Promise<UserListResponse> {
        const searchParams = new URLSearchParams();

        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());
        if (params.search) searchParams.append('search', params.search);
        if (params.sortBy) searchParams.append('sortBy', params.sortBy);
        if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

        const endpoint = `${this.endpoint}?${searchParams.toString()}`;
        const response = await this.client.get<UserListResponse>(endpoint, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    }
}

/**
 * خدمة إنشاء مستخدم
 */
export class CreateUserService extends AdminService<CreateUserData, UserProfile> {
    protected endpoint = '/api/admin/users';
    protected method: 'POST' = 'POST';
    protected inputSchema = UserSchemas.createUser;
}

/**
 * خدمة تحديث المستخدم
 */
export class UpdateUserService extends AdminService<UpdateUserData, UserProfile> {
    protected endpoint = '/api/admin/users';
    protected method: 'PUT' = 'PUT';
    protected inputSchema = UserSchemas.updateUser;

    async call(data: UpdateUserData, token: string, userId: string): Promise<UserProfile> {
        const endpoint = `${this.endpoint}/${userId}`;
        const response = await this.client.put<UserProfile>(endpoint, data, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    }
}

/**
 * خدمة حذف المستخدم
 */
export class DeleteUserService extends AdminService<{}, { message: string }> {
    protected endpoint = '/api/admin/users';
    protected method: 'DELETE' = 'DELETE';
    protected inputSchema = undefined;
    protected requiresAuth = true;

    async call(data: {}, token: string, userId: string): Promise<{ message: string }> {
        const endpoint = `${this.endpoint}/${userId}`;
        const response = await this.client.delete<{ message: string }>(endpoint, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    }
}

/**
 * خدمة الحصول على ملف المستخدم
 */
export class GetUserService extends SimpleService<UserProfile> {
    protected endpoint = '/api/users';
    protected requiresAuth = true;

    async call(token: string, userId: string): Promise<UserProfile> {
        const endpoint = `${this.endpoint}/${userId}`;
        const response = await this.client.get<UserProfile>(endpoint, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    }
}

/**
 * خدمة الحصول على قائمة المدراء
 */
export class GetAdminsService extends SimpleService<UserProfile[]> {
    protected endpoint = '/api/admins';
    protected requiresAuth = false;

    async call(): Promise<UserProfile[]> {
        const response = await this.client.get<UserProfile[]>(this.endpoint);
        return response.data;
    }
}

/**
 * خدمة إرسال إعادة تعيين كلمة المرور
 */
export class SendPasswordResetService extends ComplexService<{}, { message: string }> {
    protected endpoint = '/api/users';
    protected method: 'POST' = 'POST';
    protected inputSchema = undefined;
    protected requiresAuth = true;

    async call(data: {}, token: string, userId: string): Promise<{ message: string }> {
        const endpoint = `${this.endpoint}/${userId}/reset-password`;
        const response = await this.client.post<{ message: string }>(endpoint, data, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    }
}

/**
 * دوال مساعدة للمستخدمين
 */
export const userService = {
    get list() { return new UserListService(apiClient); },
    get create() { return new CreateUserService(apiClient); },
    get update() { return new UpdateUserService(apiClient); },
    get delete() { return new DeleteUserService(apiClient); },
    get get() { return new GetUserService(apiClient); },
    get getAdmins() { return new GetAdminsService(apiClient); },
    get sendPasswordReset() { return new SendPasswordResetService(apiClient); },
};

/**
 * دالة الحصول على قائمة المستخدمين
 */
export async function fetchUsersApi(
    token: string,
    params: UserListParams = {}
): Promise<UserListResponse> {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const endpoint = `/api/admin/users?${searchParams.toString()}`;
    const response = await apiClient.get<UserListResponse>(endpoint, {
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    });
    return response.data;
}

/**
 * دالة إنشاء مستخدم
 */
export async function createUserApi(
    data: CreateUserData,
    token: string
): Promise<UserProfile> {
    const response = await apiClient.post<UserProfile>('/api/admin/users', data, {
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    });
    return response.data;
}

/**
 * دالة تحديث المستخدم
 */
export async function updateUserApi(
    userId: string,
    data: UpdateUserData,
    token: string
): Promise<UserProfile> {
    const endpoint = `/api/admin/users/${userId}`;
    const response = await apiClient.put<UserProfile>(endpoint, data, {
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    });
    return response.data;
}

/**
 * دالة حذف المستخدم
 */
export async function deleteUserApi(
    userId: string,
    token: string
): Promise<{ message: string }> {
    const endpoint = `/api/admin/users/${userId}`;
    const response = await apiClient.delete<{ message: string }>(endpoint, {
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    });
    return response.data;
}

/**
 * دالة الحصول على ملف المستخدم
 */
export async function fetchUserProfileApi(
    userId: string,
    token: string
): Promise<UserProfile> {
    const endpoint = `/api/users/${userId}`;
    const response = await apiClient.get<UserProfile>(endpoint, {
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    });
    return response.data;
}

/**
 * دالة الحصول على قائمة المدراء
 */
export async function fetchAdminsApi(): Promise<UserProfile[]> {
    const response = await apiClient.get<UserProfile[]>('/api/admins');
    return response.data;
}

/**
 * دالة إرسال إعادة تعيين كلمة المرور
 */
export async function sendPasswordResetEmailApi(
    userId: string,
    token: string
): Promise<{ message: string }> {
    const endpoint = `/api/users/${userId}/reset-password`;
    const response = await apiClient.post<{ message: string }>(endpoint, {}, {
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    });
    return response.data;
}
