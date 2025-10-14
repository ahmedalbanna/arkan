/**
 * العميل المبسط للـ API
 *
 * يحتوي على الوظائف الأساسية فقط
 */

'use client';

import { BaseApiClient } from './base-client';

// أنواع البيانات الأساسية
interface AuthRequest {
    email: string;
    password: string;
}

interface AuthResponse {
    token: string;
    user: {
        id: string;
        email: string;
        role: string;
    };
}

/**
 * العميل المبسط للـ API
 */
export class ApiClient extends BaseApiClient {
    // ==================== المصادقة ====================

    /**
     * تسجيل الدخول
     */
    async login(credentials: AuthRequest): Promise<AuthResponse> {
        const response = await this.post<AuthResponse>('/api/auth/login', credentials);
        return BaseApiClient.extractData<AuthResponse>(response);
    }

    /**
     * تسجيل الخروج
     */
    async logout(): Promise<void> {
        await this.post('/api/auth/logout');
    }

    /**
     * تحديث الرمز المميز
     */
    async refreshToken(): Promise<AuthResponse> {
        const response = await this.post<AuthResponse>('/api/auth/refresh');
        return BaseApiClient.extractData<AuthResponse>(response);
    }

    // ==================== المستخدمين ====================

    /**
     * الحصول على ملف المستخدم الشخصي
     */
    async getUserProfile(userId?: string): Promise<any> {
        const url = userId ? `/api/users/${userId}` : '/api/users/profile';
        const response = await this.get<any>(url);
        return BaseApiClient.extractData<any>(response);
    }

    /**
     * تحديث ملف المستخدم الشخصي
     */
    async updateUserProfile(userId: string, data: any): Promise<any> {
        const response = await this.put<any>(`/api/users/${userId}`, data);
        return BaseApiClient.extractData<any>(response);
    }

    // ==================== المشاريع ====================

    /**
     * إنشاء مشروع جديد
     */
    async createProject(data: any): Promise<any> {
        const response = await this.post<any>('/api/projects', data);
        return BaseApiClient.extractData<any>(response);
    }

    /**
     * الحصول على قائمة المشاريع
     */
    async getProjects(page = 1, limit = 10): Promise<any> {
        const response = await this.get<any>(`/api/projects?page=${page}&limit=${limit}`);
        return BaseApiClient.extractData<any>(response);
    }

    /**
     * الحصول على مشروع محدد
     */
    async getProject(projectId: string): Promise<any> {
        const response = await this.get<any>(`/api/projects/${projectId}`);
        return BaseApiClient.extractData<any>(response);
    }

    /**
     * تحديث مشروع
     */
    async updateProject(projectId: string, data: any): Promise<any> {
        const response = await this.put<any>(`/api/projects/${projectId}`, data);
        return BaseApiClient.extractData<any>(response);
    }

    /**
     * حذف مشروع
     */
    async deleteProject(projectId: string): Promise<void> {
        await this.delete(`/api/projects/${projectId}`);
    }

    // ==================== الوكلاء ====================

    /**
     * الحصول على قائمة الوكلاء
     */
    async getAgents(): Promise<any> {
        const response = await this.get<any>('/api/agents');
        return BaseApiClient.extractData<any>(response);
    }

    /**
     * إنشاء وكيل جديد
     */
    async createAgent(data: any): Promise<any> {
        const response = await this.post<any>('/api/admin/agents', data);
        return BaseApiClient.extractData<any>(response);
    }

    /**
     * تحديث وكيل
     */
    async updateAgent(agentId: string, data: any): Promise<any> {
        const response = await this.put<any>(`/api/admin/agents/${agentId}`, data);
        return BaseApiClient.extractData<any>(response);
    }

    /**
     * حذف وكيل
     */
    async deleteAgent(agentId: string): Promise<void> {
        await this.delete(`/api/admin/agents/${agentId}`);
    }

    // ==================== الملفات ====================

    /**
     * رفع ملف
     */
    async uploadFileToServer(file: File, folder?: string): Promise<any> {
        const url = folder ? `/api/files/upload?folder=${folder}` : '/api/files/upload';
        const response = await super.uploadFile<any>(url, file);
        return BaseApiClient.extractData<any>(response);
    }

    /**
     * حذف ملف
     */
    async deleteFile(fileId: string): Promise<void> {
        await this.delete(`/api/files/${fileId}`);
    }

    // ==================== استدعاء API مخصص ====================

    /**
     * استدعاء API endpoint مخصص
     */
    async call<TInput = any, TOutput = any>(
        endpoint: string,
        options: {
            method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
            data?: TInput;
            token?: string;
            headers?: Record<string, string>;
            timeout?: number;
        } = {}
    ): Promise<TOutput> {
        const {
            method = 'GET',
            data,
            token,
            headers = {},
            timeout,
        } = options;

        const requestOptions = {
            headers: { ...headers },
            timeout,
        };

        let response: any;

        switch (method) {
            case 'GET':
                response = await this.get<TOutput>(endpoint, requestOptions);
                break;
            case 'POST':
                response = await this.post<TOutput>(endpoint, data!, requestOptions);
                break;
            case 'PUT':
                response = await this.put<TOutput>(endpoint, data!, requestOptions);
                break;
            case 'DELETE':
                response = await this.delete<TOutput>(endpoint, requestOptions);
                break;
            case 'PATCH':
                response = await this.patch<any>(endpoint, data!, requestOptions);
                break;
            default:
                throw new Error(`Unsupported HTTP method: ${method}`);
        }

        return BaseApiClient.extractData<TOutput>(response);
    }
}

/**
 * عميل API افتراضي
 */
export const apiClient = new ApiClient();

/**
 * عميل API للإدارة
 */
export const adminApiClient = new ApiClient();

/**
 * عميل API للعمليات العامة
 */
export const publicApiClient = new ApiClient();
