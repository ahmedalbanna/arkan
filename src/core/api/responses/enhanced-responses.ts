/**
 * Enhanced API Response System
 * Type-safe response handling with standardized formats
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { TypeGuards } from '../../types/type-guards';

export interface ApiResponse<T = unknown> {
  readonly data: T;
  readonly status: number;
  readonly message?: string;
  readonly success: boolean;
  readonly timestamp: string;
  readonly requestId?: string;
  readonly metadata?: Record<string, unknown>;
}

export interface ApiError {
  readonly message: string;
  readonly code: string;
  readonly status: number;
  readonly details?: Record<string, unknown>;
  readonly timestamp: string;
  readonly requestId?: string;
  readonly stack?: string;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  readonly pagination: {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
    readonly totalPages: number;
    readonly hasNext: boolean;
    readonly hasPrev: boolean;
  };
}

export interface SearchResponse<T = unknown> extends PaginatedResponse<T> {
  readonly search: {
    readonly query?: string;
    readonly filters?: Record<string, unknown>;
    readonly sort?: {
      readonly field: string;
      readonly direction: 'asc' | 'desc';
    };
    readonly facets?: Record<string, unknown>;
  };
}

// Response Builder
export class ResponseBuilder {
  private static requestIdCounter = 0;

  static success<T>(
    data: T,
    status: number = 200,
    message?: string,
    metadata?: Record<string, unknown>
  ): NextResponse<ApiResponse<T>> {
    const response: ApiResponse<T> = {
      data,
      status,
      message,
      success: true,
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId(),
      metadata
    };

    return NextResponse.json(response, { status });
  }

  static error(
    message: string,
    code: string = 'INTERNAL_ERROR',
    status: number = 500,
    details?: Record<string, unknown>,
    stack?: string
  ): NextResponse<ApiError> {
    const response: ApiError = {
      message,
      code,
      status,
      details,
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId(),
      stack
    };

    return NextResponse.json(response, { status });
  }

  static paginated<T>(
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
    },
    status: number = 200,
    message?: string,
    metadata?: Record<string, unknown>
  ): NextResponse<PaginatedResponse<T>> {
    const totalPages = Math.ceil(pagination.total / pagination.limit);

    const response: PaginatedResponse<T> = {
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages,
        hasNext: pagination.page < totalPages,
        hasPrev: pagination.page > 1
      },
      status,
      message,
      success: true,
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId(),
      metadata
    };

    return NextResponse.json(response, { status });
  }

  static search<T>(
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
    },
    search: {
      query?: string;
      filters?: Record<string, unknown>;
      sort?: {
        field: string;
        direction: 'asc' | 'desc';
      };
      facets?: Record<string, unknown>;
    },
    status: number = 200,
    message?: string,
    metadata?: Record<string, unknown>
  ): NextResponse<SearchResponse<T>> {
    const totalPages = Math.ceil(pagination.total / pagination.limit);

    const response: SearchResponse<T> = {
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages,
        hasNext: pagination.page < totalPages,
        hasPrev: pagination.page > 1
      },
      search,
      status,
      message,
      success: true,
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId(),
      metadata
    };

    return NextResponse.json(response, { status });
  }

  static created<T>(
    data: T,
    message: string = 'Resource created successfully',
    metadata?: Record<string, unknown>
  ): NextResponse<ApiResponse<T>> {
    return this.success(data, 201, message, metadata);
  }

  static updated<T>(
    data: T,
    message: string = 'Resource updated successfully',
    metadata?: Record<string, unknown>
  ): NextResponse<ApiResponse<T>> {
    return this.success(data, 200, message, metadata);
  }

  static deleted(
    message: string = 'Resource deleted successfully',
    metadata?: Record<string, unknown>
  ): NextResponse<ApiResponse<null>> {
    return this.success(null, 200, message, metadata);
  }

  static notFound(
    message: string = 'Resource not found',
    details?: Record<string, unknown>
  ): NextResponse<ApiError> {
    return this.error(message, 'NOT_FOUND', 404, details);
  }

  static unauthorized(
    message: string = 'Authentication required',
    details?: Record<string, unknown>
  ): NextResponse<ApiError> {
    return this.error(message, 'UNAUTHORIZED', 401, details);
  }

  static forbidden(
    message: string = 'Insufficient permissions',
    details?: Record<string, unknown>
  ): NextResponse<ApiError> {
    return this.error(message, 'FORBIDDEN', 403, details);
  }

  static badRequest(
    message: string = 'Bad request',
    details?: Record<string, unknown>
  ): NextResponse<ApiError> {
    return this.error(message, 'BAD_REQUEST', 400, details);
  }

  static validationError(
    errors: Array<{
      field: string;
      message: string;
      code: string;
    }>,
    message: string = 'Validation failed'
  ): NextResponse<ApiError> {
    return this.error(message, 'VALIDATION_ERROR', 400, { errors });
  }

  static conflict(
    message: string = 'Resource conflict',
    details?: Record<string, unknown>
  ): NextResponse<ApiError> {
    return this.error(message, 'CONFLICT', 409, details);
  }

  static tooManyRequests(
    message: string = 'Too many requests',
    retryAfter?: number,
    details?: Record<string, unknown>
  ): NextResponse<ApiError> {
    const headers: Record<string, string> = {};
    if (retryAfter) {
      headers['Retry-After'] = retryAfter.toString();
    }

    const response = this.error(message, 'TOO_MANY_REQUESTS', 429, details);
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  }

  static internalError(
    message: string = 'Internal server error',
    details?: Record<string, unknown>,
    stack?: string
  ): NextResponse<ApiError> {
    return this.error(message, 'INTERNAL_ERROR', 500, details, stack);
  }

  static serviceUnavailable(
    message: string = 'Service temporarily unavailable',
    details?: Record<string, unknown>
  ): NextResponse<ApiError> {
    return this.error(message, 'SERVICE_UNAVAILABLE', 503, details);
  }

  private static generateRequestId(): string {
    return `req_${Date.now()}_${++this.requestIdCounter}`;
  }
}

// Response Interceptor
export class ResponseInterceptor {
  private static interceptors: Array<{
    name: string;
    interceptor: (response: NextResponse) => NextResponse | Promise<NextResponse>;
    priority: number;
  }> = [];

  static addInterceptor(
    name: string,
    interceptor: (response: NextResponse) => NextResponse | Promise<NextResponse>,
    priority: number = 0
  ): void {
    this.interceptors.push({ name, interceptor, priority });
    this.interceptors.sort((a, b) => b.priority - a.priority);
  }

  static removeInterceptor(name: string): void {
    this.interceptors = this.interceptors.filter(i => i.name !== name);
  }

  static async intercept(response: NextResponse): Promise<NextResponse> {
    let interceptedResponse = response;

    for (const { interceptor } of this.interceptors) {
      try {
        interceptedResponse = await interceptor(interceptedResponse);
      } catch (error) {
        console.error('Response interceptor error:', error);
      }
    }

    return interceptedResponse;
  }
}

// Response Validator
export class ResponseValidator {
  private static schemas = new Map<string, z.ZodSchema>();

  static registerSchema<T>(name: string, schema: z.ZodSchema<T>): void {
    this.schemas.set(name, schema);
  }

  static validateResponse<T>(
    response: NextResponse,
    schemaName: string
  ): { success: boolean; data?: T; error?: string } {
    const schema = this.schemas.get(schemaName);
    if (!schema) {
      return { success: false, error: 'Schema not found' };
    }

    try {
      const data = response.json();
      const result = schema.safeParse(data);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error.message };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Validation error'
      };
    }
  }
}

// Response Cache
export class ResponseCache {
  private static cache = new Map<string, {
    response: NextResponse;
    expiresAt: number;
  }>();

  static set(key: string, response: NextResponse, ttl: number = 300000): void {
    this.cache.set(key, {
      response: response.clone(),
      expiresAt: Date.now() + ttl
    });
  }

  static get(key: string): NextResponse | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return cached.response.clone();
  }

  static delete(key: string): void {
    this.cache.delete(key);
  }

  static clear(): void {
    this.cache.clear();
  }

  static generateKey(request: Request): string {
    const url = new URL(request.url);
    return `${request.method}:${url.pathname}:${url.search}`;
  }
}

// Response Metrics
export class ResponseMetrics {
  private static metrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    responseTimes: [] as number[],
    statusCodes: new Map<number, number>(),
    errors: new Map<string, number>()
  };

  static recordResponse(
    response: NextResponse,
    startTime: number,
    error?: Error
  ): void {
    const responseTime = Date.now() - startTime;

    this.metrics.totalRequests++;
    this.metrics.responseTimes.push(responseTime);

    if (response.status >= 200 && response.status < 300) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }

    const statusCount = this.metrics.statusCodes.get(response.status) || 0;
    this.metrics.statusCodes.set(response.status, statusCount + 1);

    if (error) {
      const errorCount = this.metrics.errors.get(error.message) || 0;
      this.metrics.errors.set(error.message, errorCount + 1);
    }

    // Update average response time
    this.metrics.averageResponseTime =
      this.metrics.responseTimes.reduce((a, b) => a + b, 0) /
      this.metrics.responseTimes.length;

    // Keep only last 1000 response times
    if (this.metrics.responseTimes.length > 1000) {
      this.metrics.responseTimes = this.metrics.responseTimes.slice(-1000);
    }
  }

  static getMetrics(): typeof this.metrics {
    return { ...this.metrics };
  }

  static reset(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      responseTimes: [],
      statusCodes: new Map(),
      errors: new Map()
    };
  }
}

// Response Utilities
export class ResponseUtils {
  static isSuccessResponse(response: NextResponse): boolean {
    return response.status >= 200 && response.status < 300;
  }

  static isErrorResponse(response: NextResponse): boolean {
    return response.status >= 400;
  }

  static isClientError(response: NextResponse): boolean {
    return response.status >= 400 && response.status < 500;
  }

  static isServerError(response: NextResponse): boolean {
    return response.status >= 500;
  }

  static getErrorMessage(response: NextResponse): string {
    try {
      const data = response.json();
      if (TypeGuards.isPlainObject(data) && 'message' in data) {
        return String(data.message);
      }
    } catch {
      // Ignore parsing errors
    }
    return 'Unknown error';
  }

  static getErrorCode(response: NextResponse): string {
    try {
      const data = response.json();
      if (TypeGuards.isPlainObject(data) && 'code' in data) {
        return String(data.code);
      }
    } catch {
      // Ignore parsing errors
    }
    return 'UNKNOWN_ERROR';
  }

  static addHeaders(response: NextResponse, headers: Record<string, string>): NextResponse {
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  static setCacheHeaders(
    response: NextResponse,
    maxAge: number = 300,
    staleWhileRevalidate: number = 60
  ): NextResponse {
    response.headers.set('Cache-Control', `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`);
    return response;
  }

  static setCorsHeaders(
    response: NextResponse,
    origin: string = '*',
    methods: string[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  ): NextResponse {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', methods.join(', '));
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
  }
}

// Register predefined schemas
ResponseValidator.registerSchema('apiResponse', z.object({
  data: z.unknown(),
  status: z.number(),
  message: z.string().optional(),
  success: z.boolean(),
  timestamp: z.string(),
  requestId: z.string().optional(),
  metadata: z.record(z.unknown()).optional()
}));

ResponseValidator.registerSchema('apiError', z.object({
  message: z.string(),
  code: z.string(),
  status: z.number(),
  details: z.record(z.unknown()).optional(),
  timestamp: z.string(),
  requestId: z.string().optional(),
  stack: z.string().optional()
}));

ResponseValidator.registerSchema('paginatedResponse', z.object({
  data: z.array(z.unknown()),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean()
  }),
  status: z.number(),
  message: z.string().optional(),
  success: z.boolean(),
  timestamp: z.string(),
  requestId: z.string().optional(),
  metadata: z.record(z.unknown()).optional()
}));
