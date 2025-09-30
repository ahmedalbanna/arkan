/**
 * خدمة المستخدمين
 *
 * هذا الملف يحتوي على جميع وظائف إدارة المستخدمين
 */

import { UserSchemas } from '@/app/api/shared/validators/api-validators';
import type { UserProfile } from '@/lib/types';
import { apiClient } from '../shared/api-client';
import { AdminService, ComplexService, SimpleService } from '../shared/base-service';

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
        return apiClient.get(endpoint, { token });
    }
}

/**
 * خدمة إنشاء مستخدم
 */
export class CreateUserService extends AdminService<CreateUserData, UserProfile> {
    protected endpoint = '/api/admin/users';
    protected method = 'POST';
    protected inputSchema = UserSchemas.createUser;
}

/**
 * خدمة تحديث المستخدم
 */
export class UpdateUserService extends AdminService<UpdateUserData, UserProfile> {
    protected endpoint = '/api/admin/users';
    protected method = 'PUT';
    protected inputSchema = UserSchemas.updateUser;

    async call(data: UpdateUserData, token: string, userId: string): Promise<UserProfile> {
        const endpoint = `${this.endpoint}/${userId}`;
        return apiClient.put(endpoint, data, { token });
    }
}

/**
 * خدمة حذف المستخدم
 */
export class DeleteUserService extends AdminService<{}, { message: string }> {
    protected endpoint = '/api/admin/users';
    protected method = 'DELETE';

    async call(data: {}, token: string, userId: string): Promise<{ message: string }> {
        const endpoint = `${this.endpoint}/${userId}`;
        return apiClient.delete(endpoint, { token });
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
        return apiClient.get(endpoint, { token });
    }
}

/**
 * خدمة الحصول على قائمة المدراء
 */
export class GetAdminsService extends SimpleService<UserProfile[]> {
    protected endpoint = '/api/admins';
    protected requiresAuth = false;

    async call(): Promise<UserProfile[]> {
        return apiClient.get(this.endpoint);
    }
}

/**
 * خدمة إرسال إعادة تعيين كلمة المرور
 */
export class SendPasswordResetService extends ComplexService<{}, { message: string }> {
    protected endpoint = '/api/users';
    protected method = 'POST';
    protected requiresAuth = true;

    async call(data: {}, token: string, userId: string): Promise<{ message: string }> {
        const endpoint = `${this.endpoint}/${userId}/reset-password`;
        return apiClient.post(endpoint, data, { token });
    }
}

/**
 * دوال مساعدة للمستخدمين
 */
export const userService = {
    list: new UserListService(),
    create: new CreateUserService(),
    update: new UpdateUserService(),
    delete: new DeleteUserService(),
    get: new GetUserService(),
    getAdmins: new GetAdminsService(),
    sendPasswordReset: new SendPasswordResetService(),
};

/**
 * دالة الحصول على قائمة المستخدمين
 */
export async function fetchUsersApi(
    token: string,
    params: UserListParams = {}
): Promise<UserListResponse> {
    return userService.list.call(token, params);
}

/**
 * دالة إنشاء مستخدم
 */
export async function createUserApi(
    data: CreateUserData,
    token: string
): Promise<UserProfile> {
    return userService.create.call(data, token);
}

/**
 * دالة تحديث المستخدم
 */
export async function updateUserApi(
    userId: string,
    data: UpdateUserData,
    token: string
): Promise<UserProfile> {
    return userService.update.call(data, token, userId);
}

/**
 * دالة حذف المستخدم
 */
export async function deleteUserApi(
    userId: string,
    token: string
): Promise<{ message: string }> {
    return userService.delete.call({}, token, userId);
}

/**
 * دالة الحصول على ملف المستخدم
 */
export async function fetchUserProfileApi(
    userId: string,
    token: string
): Promise<UserProfile> {
    return userService.get.call(token, userId);
}

/**
 * دالة الحصول على قائمة المدراء
 */
export async function fetchAdminsApi(): Promise<UserProfile[]> {
    return userService.getAdmins.call();
}

/**
 * دالة إرسال إعادة تعيين كلمة المرور
 */
export async function sendPasswordResetEmailApi(
    userId: string,
    token: string
): Promise<{ message: string }> {
    return userService.sendPasswordReset.call({}, token, userId);
}
