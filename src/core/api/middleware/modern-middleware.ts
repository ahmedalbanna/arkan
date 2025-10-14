/**
 * Modern API Middleware System
 * Advanced middleware with type safety, validation, and error handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export interface MiddlewareContext {
  request: NextRequest;
  params: Record<string, string>;
  user?: {
    id: string;
    email: string;
    role: string;
  };
  metadata: Record<string, unknown>;
}

export interface MiddlewareResult {
  success: boolean;
  response?: NextResponse;
  context?: Partial<MiddlewareContext>;
  error?: string;
}

export type Middleware = (
  context: MiddlewareContext,
  next: () => Promise<MiddlewareResult>
) => Promise<MiddlewareResult>;

export interface MiddlewareOptions {
  name?: string;
  priority?: number;
  enabled?: boolean;
  config?: Record<string, unknown>;
}

// Base Middleware Class
export abstract class BaseMiddleware implements Middleware {
  public readonly name: string;
  public readonly priority: number;
  public readonly enabled: boolean;
  public readonly config: Record<string, unknown>;

  constructor(options: MiddlewareOptions = {}) {
    this.name = options.name || this.constructor.name;
    this.priority = options.priority || 0;
    this.enabled = options.enabled !== false;
    this.config = options.config || {};
  }

  abstract execute(
    context: MiddlewareContext,
    next: () => Promise<MiddlewareResult>
  ): Promise<MiddlewareResult>;

  async call(
    context: MiddlewareContext,
    next: () => Promise<MiddlewareResult>
  ): Promise<MiddlewareResult> {
    if (!this.enabled) {
      return next();
    }

    try {
      return await this.execute(context, next);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown middleware error'
      };
    }
  }
}

// Authentication Middleware
export class AuthenticationMiddleware extends BaseMiddleware {
  constructor(options: MiddlewareOptions = {}) {
    super({ ...options, name: 'authentication', priority: 100 });
  }

  async execute(
    context: MiddlewareContext,
    next: () => Promise<MiddlewareResult>
  ): Promise<MiddlewareResult> {
    const token = this.extractToken(context.request);

    if (!token) {
      return {
        success: false,
        response: NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      };
    }

    try {
      const user = await this.validateToken(token);
      return next().then(result => ({
        ...result,
        context: {
          ...result.context,
          user
        }
      }));
    } catch (error) {
      return {
        success: false,
        response: NextResponse.json(
          { error: 'Invalid authentication token' },
          { status: 401 }
        )
      };
    }
  }

  private extractToken(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }

  private async validateToken(token: string): Promise<MiddlewareContext['user']> {
    // Implement token validation logic
    // This would typically involve JWT verification or database lookup
    return {
      id: 'user-id',
      email: 'user@example.com',
      role: 'user'
    };
  }
}

// Authorization Middleware
export class AuthorizationMiddleware extends BaseMiddleware {
  constructor(
    private requiredRole: string,
    options: MiddlewareOptions = {}
  ) {
    super({ ...options, name: 'authorization', priority: 90 });
  }

  async execute(
    context: MiddlewareContext,
    next: () => Promise<MiddlewareResult>
  ): Promise<MiddlewareResult> {
    if (!context.user) {
      return {
        success: false,
        response: NextResponse.json(
          { error: 'User not authenticated' },
          { status: 401 }
        )
      };
    }

    if (!this.hasRequiredRole(context.user.role)) {
      return {
        success: false,
        response: NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        )
      };
    }

    return next();
  }

  private hasRequiredRole(userRole: string): boolean {
    const roleHierarchy = ['user', 'moderator', 'admin'];
    const userRoleIndex = roleHierarchy.indexOf(userRole);
    const requiredRoleIndex = roleHierarchy.indexOf(this.requiredRole);

    return userRoleIndex >= requiredRoleIndex;
  }
}

// Validation Middleware
export class ValidationMiddleware<T = unknown> extends BaseMiddleware {
  constructor(
    private schema: z.ZodSchema<T>,
    private source: 'body' | 'query' | 'params' = 'body',
    options: MiddlewareOptions = {}
  ) {
    super({ ...options, name: 'validation', priority: 80 });
  }

  async execute(
    context: MiddlewareContext,
    next: () => Promise<MiddlewareResult>
  ): Promise<MiddlewareResult> {
    try {
      const data = await this.extractData(context.request);
      const validatedData = this.schema.parse(data);

      return next().then(result => ({
        ...result,
        context: {
          ...result.context,
          metadata: {
            ...result.context?.metadata,
            validatedData
          }
        }
      }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          response: NextResponse.json(
            {
              error: 'Validation failed',
              details: error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message,
                code: err.code
              }))
            },
            { status: 400 }
          )
        };
      }

      return {
        success: false,
        response: NextResponse.json(
          { error: 'Invalid request data' },
          { status: 400 }
        )
      };
    }
  }

  private async extractData(request: NextRequest): Promise<unknown> {
    switch (this.source) {
      case 'body':
        try {
          return await request.json();
        } catch {
          return {};
        }
      case 'query':
        return Object.fromEntries(request.nextUrl.searchParams);
      case 'params':
        return context.params;
      default:
        return {};
    }
  }
}

// Rate Limiting Middleware
export class RateLimitMiddleware extends BaseMiddleware {
  private requestCounts = new Map<string, { count: number; resetTime: number }>();

  constructor(
    private maxRequests: number = 100,
    private windowMs: number = 60000, // 1 minute
    options: MiddlewareOptions = {}
  ) {
    super({ ...options, name: 'rate-limit', priority: 70 });
  }

  async execute(
    context: MiddlewareContext,
    next: () => Promise<MiddlewareResult>
  ): Promise<MiddlewareResult> {
    const key = this.getRateLimitKey(context);
    const now = Date.now();

    const current = this.requestCounts.get(key);

    if (!current || now > current.resetTime) {
      this.requestCounts.set(key, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return next();
    }

    if (current.count >= this.maxRequests) {
      return {
        success: false,
        response: NextResponse.json(
          { error: 'Rate limit exceeded' },
          {
            status: 429,
            headers: {
              'Retry-After': Math.ceil((current.resetTime - now) / 1000).toString()
            }
          }
        )
      };
    }

    current.count++;
    return next();
  }

  private getRateLimitKey(context: MiddlewareContext): string {
    const user = context.user;
    const ip = context.request.ip || 'unknown';

    return user ? `user:${user.id}` : `ip:${ip}`;
  }
}

// Logging Middleware
export class LoggingMiddleware extends BaseMiddleware {
  constructor(options: MiddlewareOptions = {}) {
    super({ ...options, name: 'logging', priority: 10 });
  }

  async execute(
    context: MiddlewareContext,
    next: () => Promise<MiddlewareResult>
  ): Promise<MiddlewareResult> {
    const startTime = Date.now();
    const method = context.request.method;
    const url = context.request.url;
    const userAgent = context.request.headers.get('user-agent') || 'unknown';

    console.log(`[${new Date().toISOString()}] ${method} ${url} - ${userAgent}`);

    const result = await next();

    const duration = Date.now() - startTime;
    const status = result.response?.status || 200;

    console.log(`[${new Date().toISOString()}] ${method} ${url} - ${status} (${duration}ms)`);

    return result;
  }
}

// CORS Middleware
export class CorsMiddleware extends BaseMiddleware {
  constructor(
    private allowedOrigins: string[] = ['*'],
    private allowedMethods: string[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    private allowedHeaders: string[] = ['Content-Type', 'Authorization'],
    options: MiddlewareOptions = {}
  ) {
    super({ ...options, name: 'cors', priority: 5 });
  }

  async execute(
    context: MiddlewareContext,
    next: () => Promise<MiddlewareResult>
  ): Promise<MiddlewareResult> {
    const origin = context.request.headers.get('origin');

    if (context.request.method === 'OPTIONS') {
      return {
        success: true,
        response: new NextResponse(null, {
          status: 200,
          headers: this.getCorsHeaders(origin)
        })
      };
    }

    const result = await next();

    if (result.response) {
      const headers = this.getCorsHeaders(origin);
      Object.entries(headers).forEach(([key, value]) => {
        result.response!.headers.set(key, value);
      });
    }

    return result;
  }

  private getCorsHeaders(origin: string | null): Record<string, string> {
    const headers: Record<string, string> = {
      'Access-Control-Allow-Methods': this.allowedMethods.join(', '),
      'Access-Control-Allow-Headers': this.allowedHeaders.join(', '),
      'Access-Control-Max-Age': '86400'
    };

    if (this.allowedOrigins.includes('*') || (origin && this.allowedOrigins.includes(origin))) {
      headers['Access-Control-Allow-Origin'] = origin || '*';
      headers['Access-Control-Allow-Credentials'] = 'true';
    }

    return headers;
  }
}

// Error Handling Middleware
export class ErrorHandlingMiddleware extends BaseMiddleware {
  constructor(options: MiddlewareOptions = {}) {
    super({ ...options, name: 'error-handling', priority: 1 });
  }

  async execute(
    context: MiddlewareContext,
    next: () => Promise<MiddlewareResult>
  ): Promise<MiddlewareResult> {
    try {
      return await next();
    } catch (error) {
      console.error('Unhandled error in middleware chain:', error);

      return {
        success: false,
        response: NextResponse.json(
          {
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
          },
          { status: 500 }
        )
      };
    }
  }
}

// Middleware Pipeline
export class MiddlewarePipeline {
  private middlewares: BaseMiddleware[] = [];

  use(middleware: BaseMiddleware): this {
    this.middlewares.push(middleware);
    this.middlewares.sort((a, b) => b.priority - a.priority);
    return this;
  }

  async execute(context: MiddlewareContext): Promise<MiddlewareResult> {
    let index = 0;

    const next = async (): Promise<MiddlewareResult> => {
      if (index >= this.middlewares.length) {
        return { success: true };
      }

      const middleware = this.middlewares[index++];
      return middleware.call(context, next);
    };

    return next();
  }

  getMiddlewares(): BaseMiddleware[] {
    return [...this.middlewares];
  }

  clear(): void {
    this.middlewares = [];
  }
}

// Middleware Factory
export class MiddlewareFactory {
  static createAuthMiddleware(requiredRole?: string): BaseMiddleware[] {
    const middlewares: BaseMiddleware[] = [
      new AuthenticationMiddleware()
    ];

    if (requiredRole) {
      middlewares.push(new AuthorizationMiddleware(requiredRole));
    }

    return middlewares;
  }

  static createValidationMiddleware<T>(
    schema: z.ZodSchema<T>,
    source: 'body' | 'query' | 'params' = 'body'
  ): ValidationMiddleware<T> {
    return new ValidationMiddleware(schema, source);
  }

  static createRateLimitMiddleware(
    maxRequests: number = 100,
    windowMs: number = 60000
  ): RateLimitMiddleware {
    return new RateLimitMiddleware(maxRequests, windowMs);
  }

  static createStandardPipeline(): MiddlewarePipeline {
    const pipeline = new MiddlewarePipeline();

    pipeline
      .use(new ErrorHandlingMiddleware())
      .use(new CorsMiddleware())
      .use(new LoggingMiddleware())
      .use(new RateLimitMiddleware());

    return pipeline;
  }

  static createAuthPipeline(requiredRole?: string): MiddlewarePipeline {
    const pipeline = this.createStandardPipeline();

    const authMiddlewares = this.createAuthMiddleware(requiredRole);
    authMiddlewares.forEach(middleware => pipeline.use(middleware));

    return pipeline;
  }
}

// API Handler with Middleware
export class ApiHandler {
  private pipeline: MiddlewarePipeline;

  constructor(middlewares: BaseMiddleware[] = []) {
    this.pipeline = new MiddlewarePipeline();
    middlewares.forEach(middleware => this.pipeline.use(middleware));
  }

  async handle(
    request: NextRequest,
    context: { params: Record<string, string> },
    handler: (context: MiddlewareContext) => Promise<NextResponse>
  ): Promise<NextResponse> {
    const middlewareContext: MiddlewareContext = {
      request,
      params: context.params,
      metadata: {}
    };

    const result = await this.pipeline.execute(middlewareContext);

    if (!result.success) {
      return result.response || NextResponse.json(
        { error: 'Middleware chain failed' },
        { status: 500 }
      );
    }

    try {
      return await handler(middlewareContext);
    } catch (error) {
      console.error('Handler error:', error);
      return NextResponse.json(
        {
          error: 'Handler error',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  }

  use(middleware: BaseMiddleware): this {
    this.pipeline.use(middleware);
    return this;
  }
}

// Utility functions
export function createApiHandler(middlewares: BaseMiddleware[] = []): ApiHandler {
  return new ApiHandler(middlewares);
}

export function withAuth(requiredRole?: string) {
  return (handler: (context: MiddlewareContext) => Promise<NextResponse>) => {
    const apiHandler = createApiHandler(MiddlewareFactory.createAuthMiddleware(requiredRole));
    return (request: NextRequest, context: { params: Record<string, string> }) =>
      apiHandler.handle(request, context, handler);
  };
}

export function withValidation<T>(
  schema: z.ZodSchema<T>,
  source: 'body' | 'query' | 'params' = 'body'
) {
  return (handler: (context: MiddlewareContext & { validatedData: T }) => Promise<NextResponse>) => {
    const validationMiddleware = MiddlewareFactory.createValidationMiddleware(schema, source);
    const apiHandler = createApiHandler([validationMiddleware]);

    return (request: NextRequest, context: { params: Record<string, string> }) =>
      apiHandler.handle(request, context, handler as (context: MiddlewareContext) => Promise<NextResponse>);
  };
}

export function withRateLimit(maxRequests: number = 100, windowMs: number = 60000) {
  return (handler: (context: MiddlewareContext) => Promise<NextResponse>) => {
    const rateLimitMiddleware = MiddlewareFactory.createRateLimitMiddleware(maxRequests, windowMs);
    const apiHandler = createApiHandler([rateLimitMiddleware]);

    return (request: NextRequest, context: { params: Record<string, string> }) =>
      apiHandler.handle(request, context, handler);
  };
}
