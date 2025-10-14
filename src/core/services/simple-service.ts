/**
 * نظام الخدمات المبسط
 *
 * نظام جديد مبسط لاستدعاء APIs بدون تعقيد Classes متعددة
 */

import { z } from 'zod';

// أنواع البيانات الأساسية
export interface ServiceConfig {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  token?: string;
  timeout?: number;
  params?: Record<string, any>;
}

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

// دالة مساعدة لاستدعاء API
async function apiCall<T = any>(
  endpoint: string,
  options: RequestOptions = {},
  data?: any
): Promise<ServiceResponse<T>> {
  try {
    const {
      method = 'GET',
      headers = {},
      token,
      timeout = 10000
    } = options;

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      signal: AbortSignal.timeout(timeout),
    };

    // إضافة المصادقة
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    // إضافة البيانات للطلب
    if (method !== 'GET' && data) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(endpoint, config);
    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.message || `HTTP ${response.status}`,
        status: response.status,
      };
    }

    return {
      success: true,
      data: result.data || result,
      status: response.status,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// دالة مساعدة للتحقق من صحة البيانات
function validateData<T>(data: any, schema?: z.ZodSchema<T>): T {
  if (!schema) return data;

  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`Validation error: ${result.error.errors.map(e => e.message).join(', ')}`);
  }

  return result.data;
}

// دالة مساعدة لإنشاء endpoint كامل
function createEndpoint(baseUrl: string, path: string, params?: Record<string, any>): string {
  const url = new URL(path, baseUrl);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
}

// فئة الخدمة المبسطة
export class SimpleService {
  private baseUrl: string;
  private defaultTimeout: number;

  constructor(config: ServiceConfig = {}) {
    this.baseUrl = config.baseUrl || '/api';
    this.defaultTimeout = config.timeout || 10000;
  }

  // GET request
  async get<T = any>(
    path: string,
    options: Omit<RequestOptions, 'method'> = {}
  ): Promise<ServiceResponse<T>> {
    const endpoint = createEndpoint(this.baseUrl, path, options.params);
    return apiCall<T>(endpoint, {
      ...options,
      method: 'GET',
      timeout: options.timeout || this.defaultTimeout,
    });
  }

  // POST request
  async post<T = any>(
    path: string,
    data?: any,
    options: Omit<RequestOptions, 'method'> = {}
  ): Promise<ServiceResponse<T>> {
    const endpoint = createEndpoint(this.baseUrl, path);
    return apiCall<T>(endpoint, {
      ...options,
      method: 'POST',
      timeout: options.timeout || this.defaultTimeout,
    }, data);
  }

  // PUT request
  async put<T = any>(
    path: string,
    data?: any,
    options: Omit<RequestOptions, 'method'> = {}
  ): Promise<ServiceResponse<T>> {
    const endpoint = createEndpoint(this.baseUrl, path);
    return apiCall<T>(endpoint, {
      ...options,
      method: 'PUT',
      timeout: options.timeout || this.defaultTimeout,
    }, data);
  }

  // DELETE request
  async delete<T = any>(
    path: string,
    options: Omit<RequestOptions, 'method'> = {}
  ): Promise<ServiceResponse<T>> {
    const endpoint = createEndpoint(this.baseUrl, path);
    return apiCall<T>(endpoint, {
      ...options,
      method: 'DELETE',
      timeout: options.timeout || this.defaultTimeout,
    });
  }

  // PATCH request
  async patch<T = any>(
    path: string,
    data?: any,
    options: Omit<RequestOptions, 'method'> = {}
  ): Promise<ServiceResponse<T>> {
    const endpoint = createEndpoint(this.baseUrl, path);
    return apiCall<T>(endpoint, {
      ...options,
      method: 'PATCH',
      timeout: options.timeout || this.defaultTimeout,
    }, data);
  }

  // دالة مساعدة للتحقق من صحة البيانات
  validate<T>(data: any, schema?: z.ZodSchema<T>): T {
    return validateData(data, schema);
  }
}

// إنشاء instance افتراضي
export const apiService = new SimpleService();

// دوال مساعدة للاستخدام المباشر
export const api = {
  get: <T = any>(path: string, options?: Omit<RequestOptions, 'method'>) =>
    apiService.get<T>(path, options),

  post: <T = any>(path: string, data?: any, options?: Omit<RequestOptions, 'method'>) =>
    apiService.post<T>(path, data, options),

  put: <T = any>(path: string, data?: any, options?: Omit<RequestOptions, 'method'>) =>
    apiService.put<T>(path, data, options),

  delete: <T = any>(path: string, options?: Omit<RequestOptions, 'method'>) =>
    apiService.delete<T>(path, options),

  patch: <T = any>(path: string, data?: any, options?: Omit<RequestOptions, 'method'>) =>
    apiService.patch<T>(path, data, options),
};

// Hook للاستخدام في React components
export function useApiService(config?: ServiceConfig) {
  return new SimpleService(config);
}
