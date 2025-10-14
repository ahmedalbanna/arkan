# API Layer Modernization Guide

## Overview

This guide provides comprehensive documentation for the modernized API layer, including middleware, validation, response handling, and migration strategies.

## Table of Contents

1. [Modern Middleware](#modern-middleware)
2. [Advanced Validation](#advanced-validation)
3. [Enhanced Response Handling](#enhanced-response-handling)
4. [Migration Guide](#migration-guide)
5. [Best Practices](#best-practices)
6. [Examples](#examples)

## Modern Middleware

### Features

- **Middleware Chain**: Chain multiple middleware functions
- **Error Handling**: Built-in error handling
- **Request/Response Transformation**: Transform requests and responses
- **Performance Monitoring**: Monitor middleware performance
- **Rate Limiting**: Built-in rate limiting
- **Authentication**: Built-in authentication
- **CORS**: Built-in CORS handling

### Usage

```typescript
import { ModernMiddleware } from '@/core/api';

const middleware = new ModernMiddleware({
  errorHandling: true,
  performanceMonitoring: true,
  requestTransformation: true,
  responseTransformation: true
});

// Add middleware
middleware.use(authMiddleware);
middleware.use(validationMiddleware);
middleware.use(rateLimitMiddleware);

// Use middleware
export const GET = middleware.handle(async (request) => {
  // Handler logic
});
```

### Configuration

```typescript
interface MiddlewareConfig {
  errorHandling?: boolean;
  performanceMonitoring?: boolean;
  requestTransformation?: boolean;
  responseTransformation?: boolean;
  rateLimiting?: boolean;
  authentication?: boolean;
  cors?: boolean;
  logging?: boolean;
  caching?: boolean;
  compression?: boolean;
}
```

### Built-in Middleware

#### Authentication Middleware

```typescript
import { authMiddleware } from '@/core/api/middleware';

middleware.use(authMiddleware({
  required: true,
  roles: ['user', 'admin'],
  permissions: ['read', 'write']
}));
```

#### Validation Middleware

```typescript
import { validationMiddleware } from '@/core/api/middleware';

middleware.use(validationMiddleware({
  schema: userSchema,
  validateBody: true,
  validateQuery: true,
  validateParams: true
}));
```

#### Rate Limiting Middleware

```typescript
import { rateLimitMiddleware } from '@/core/api/middleware';

middleware.use(rateLimitMiddleware({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
}));
```

#### CORS Middleware

```typescript
import { corsMiddleware } from '@/core/api/middleware';

middleware.use(corsMiddleware({
  origin: ['https://example.com', 'https://app.example.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
```

## Advanced Validation

### Features

- **Schema Validation**: Validate against Zod schemas
- **Custom Validators**: Define custom validation rules
- **Error Messages**: Clear validation error messages
- **Performance Optimization**: Optimized validation performance
- **Async Validation**: Support for async validation
- **Conditional Validation**: Conditional validation rules

### Usage

```typescript
import { AdvancedValidator } from '@/core/api';

const validator = new AdvancedValidator({
  schema: userSchema,
  customValidators: {
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    password: (value) => value.length >= 8
  }
});

// Validate data
const result = await validator.validate(userData);
if (!result.success) {
  return ResponseBuilder.validationError(result.errors);
}
```

### Schema Definition

```typescript
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  age: z.number().min(18, 'Must be at least 18 years old'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

export { userSchema };
```

### Custom Validators

```typescript
const customValidators = {
  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },
  password: (value: string) => {
    return value.length >= 8 &&
           /[A-Z]/.test(value) &&
           /[a-z]/.test(value) &&
           /[0-9]/.test(value);
  },
  phone: (value: string) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(value);
  }
};
```

### Validation Rules

```typescript
const validationRules = {
  required: (value: any) => value !== null && value !== undefined && value !== '',
  minLength: (value: string, min: number) => value.length >= min,
  maxLength: (value: string, max: number) => value.length <= max,
  min: (value: number, min: number) => value >= min,
  max: (value: number, max: number) => value <= max,
  pattern: (value: string, regex: RegExp) => regex.test(value),
  email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  url: (value: string) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }
};
```

## Enhanced Response Handling

### Features

- **Standardized Responses**: Consistent response format
- **Response Interceptors**: Intercept and modify responses
- **Response Validation**: Validate response data
- **Response Caching**: Cache responses
- **Response Compression**: Compress responses
- **Response Encryption**: Encrypt sensitive responses

### Usage

```typescript
import { ResponseBuilder, ResponseInterceptor } from '@/core/api';

// Create response
const response = ResponseBuilder.success(data, 200, 'Success');

// Add interceptor
ResponseInterceptor.addInterceptor('logging', (response) => {
  console.log('Response:', response);
  return response;
});

// Use response
return response;
```

### Response Types

#### Success Response

```typescript
interface ApiResponse<T = unknown> {
  readonly data: T;
  readonly status: number;
  readonly message?: string;
  readonly success: boolean;
  readonly timestamp: string;
  readonly requestId?: string;
  readonly metadata?: Record<string, unknown>;
}
```

#### Error Response

```typescript
interface ApiError {
  readonly message: string;
  readonly code: string;
  readonly status: number;
  readonly details?: Record<string, unknown>;
  readonly timestamp: string;
  readonly requestId?: string;
  readonly stack?: string;
}
```

#### Paginated Response

```typescript
interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  readonly pagination: {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
    readonly totalPages: number;
    readonly hasNext: boolean;
    readonly hasPrev: boolean;
  };
}
```

### Response Builder Methods

```typescript
// Success responses
ResponseBuilder.success(data, status, message, metadata);
ResponseBuilder.created(data, message, metadata);
ResponseBuilder.updated(data, message, metadata);
ResponseBuilder.deleted(message, metadata);

// Error responses
ResponseBuilder.error(message, code, status, details, stack);
ResponseBuilder.notFound(message, details);
ResponseBuilder.unauthorized(message, details);
ResponseBuilder.forbidden(message, details);
ResponseBuilder.badRequest(message, details);
ResponseBuilder.validationError(errors, message);
ResponseBuilder.conflict(message, details);
ResponseBuilder.tooManyRequests(message, retryAfter, details);
ResponseBuilder.internalError(message, details, stack);
ResponseBuilder.serviceUnavailable(message, details);

// Paginated responses
ResponseBuilder.paginated(data, pagination, status, message, metadata);
ResponseBuilder.search(data, pagination, search, status, message, metadata);
```

### Response Interceptors

```typescript
// Add interceptor
ResponseInterceptor.addInterceptor('logging', (response) => {
  console.log('Response:', response);
  return response;
});

// Remove interceptor
ResponseInterceptor.removeInterceptor('logging');

// Intercept response
const interceptedResponse = await ResponseInterceptor.intercept(response);
```

### Response Caching

```typescript
import { ResponseCache } from '@/core/api';

// Set cache
ResponseCache.set(key, response, ttl);

// Get cache
const cachedResponse = ResponseCache.get(key);

// Delete cache
ResponseCache.delete(key);

// Clear cache
ResponseCache.clear();

// Generate cache key
const key = ResponseCache.generateKey(request);
```

## Migration Guide

### From Legacy API to Modern API

#### Step 1: Update Dependencies

```bash
npm install @tanstack/react-query
npm install zod
npm install @radix-ui/react-*
```

#### Step 2: Update API Routes

```typescript
// Before
export async function GET(request: NextRequest) {
  try {
    const data = await getData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// After
import { createApiHandler, ResponseBuilder } from '@/core/api';

export const GET = createApiHandler(async (request) => {
  const data = await getData();
  return ResponseBuilder.success(data);
});
```

#### Step 3: Update Error Handling

```typescript
// Before
try {
  await operation();
} catch (error) {
  console.error(error);
  throw error;
}

// After
import { ErrorHandler } from '@/core/error-handling';

try {
  await operation();
} catch (error) {
  ErrorHandler.handle(error, 'operationName');
}
```

#### Step 4: Update Validation

```typescript
// Before
const { name, email } = await request.json();
if (!name || !email) {
  return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
}

// After
import { AdvancedValidator } from '@/core/api';

const validator = new AdvancedValidator({ schema: userSchema });
const body = await request.json();

const validationResult = await validator.validate(body);
if (!validationResult.success) {
  return ResponseBuilder.validationError(validationResult.errors);
}
```

#### Step 5: Update Response Format

```typescript
// Before
return NextResponse.json({ data: result });

// After
return ResponseBuilder.success(result);
```

### Gradual Migration

#### Phase 1: Add Modern Middleware

```typescript
// Add modern middleware to existing routes
import { ModernMiddleware } from '@/core/api';

const middleware = new ModernMiddleware({
  errorHandling: true,
  performanceMonitoring: true
});

export const GET = middleware.handle(async (request) => {
  // Existing handler logic
});
```

#### Phase 2: Update Error Handling

```typescript
// Replace try-catch blocks with modern error handling
import { handleServerError } from '@/core/error-handling';

export const GET = createApiHandler(async (request) => {
  // Handler logic
}, {
  errorHandler: handleServerError
});
```

#### Phase 3: Update Validation

```typescript
// Replace manual validation with schema validation
import { AdvancedValidator } from '@/core/api';

const validator = new AdvancedValidator({ schema: userSchema });
const validationResult = await validator.validate(body);
```

#### Phase 4: Update Response Format

```typescript
// Replace manual response creation with ResponseBuilder
import { ResponseBuilder } from '@/core/api';

return ResponseBuilder.success(data);
```

## Best Practices

### General Best Practices

1. **Use Modern Middleware**
   - Use middleware for cross-cutting concerns
   - Implement proper error handling
   - Monitor middleware performance
   - Keep middleware focused

2. **Implement Validation**
   - Use schemas for validation
   - Define custom validators for complex rules
   - Provide clear error messages
   - Optimize validation performance

3. **Standardize Responses**
   - Use consistent response formats
   - Implement response interceptors
   - Validate response data
   - Use response caching appropriately

4. **Handle Errors Gracefully**
   - Use appropriate error types
   - Provide clear error messages
   - Implement recovery mechanisms
   - Log errors for debugging

### API Design Best Practices

1. **RESTful Design**
   - Use appropriate HTTP methods
   - Use proper status codes
   - Follow REST conventions
   - Use resource-based URLs

2. **Input Validation**
   - Validate all inputs
   - Use schemas for validation
   - Provide clear error messages
   - Handle validation errors gracefully

3. **Output Formatting**
   - Use consistent response formats
   - Include relevant metadata
   - Use appropriate status codes
   - Handle errors consistently

4. **Security**
   - Implement authentication
   - Use authorization
   - Validate inputs
   - Handle errors securely

### Performance Best Practices

1. **Caching**
   - Use appropriate caching strategies
   - Set reasonable TTL values
   - Monitor cache hit rates
   - Use compression for large data

2. **Rate Limiting**
   - Implement rate limiting
   - Use appropriate limits
   - Provide clear error messages
   - Handle rate limit errors gracefully

3. **Compression**
   - Use response compression
   - Compress large responses
   - Monitor compression ratios
   - Use appropriate compression algorithms

4. **Monitoring**
   - Monitor API performance
   - Track error rates
   - Monitor response times
   - Use performance metrics

## Examples

### Complete API Route Example

```typescript
import { createApiHandler, ResponseBuilder, AdvancedValidator } from '@/core/api';
import { handleServerError } from '@/core/error-handling';
import { userSchema } from '@/lib/schemas';

export const GET = createApiHandler(async (request) => {
  try {
    const users = await userService.getAllUsers();
    return ResponseBuilder.success(users);
  } catch (error) {
    return handleServerError(error, 'GET /api/users');
  }
});

export const POST = createApiHandler(async (request) => {
  try {
    const validator = new AdvancedValidator({ schema: userSchema });
    const body = await request.json();

    const validationResult = await validator.validate(body);
    if (!validationResult.success) {
      return ResponseBuilder.validationError(validationResult.errors);
    }

    const user = await userService.createUser(body);
    return ResponseBuilder.created(user);
  } catch (error) {
    return handleServerError(error, 'POST /api/users');
  }
});
```

### Middleware Example

```typescript
import { ModernMiddleware } from '@/core/api';

const middleware = new ModernMiddleware({
  errorHandling: true,
  performanceMonitoring: true,
  requestTransformation: true,
  responseTransformation: true
});

// Add authentication middleware
middleware.use(authMiddleware({
  required: true,
  roles: ['user', 'admin']
}));

// Add validation middleware
middleware.use(validationMiddleware({
  schema: userSchema,
  validateBody: true
}));

// Add rate limiting middleware
middleware.use(rateLimitMiddleware({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

export const GET = middleware.handle(async (request) => {
  const users = await userService.getAllUsers();
  return ResponseBuilder.success(users);
});
```

### Validation Example

```typescript
import { AdvancedValidator } from '@/core/api';
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  age: z.number().min(18, 'Must be at least 18 years old'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

const validator = new AdvancedValidator({
  schema: userSchema,
  customValidators: {
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    password: (value) => value.length >= 8 && /[A-Z]/.test(value)
  }
});

export const POST = createApiHandler(async (request) => {
  const body = await request.json();
  const validationResult = await validator.validate(body);

  if (!validationResult.success) {
    return ResponseBuilder.validationError(validationResult.errors);
  }

  const user = await userService.createUser(body);
  return ResponseBuilder.created(user);
});
```

### Response Example

```typescript
import { ResponseBuilder, ResponseInterceptor } from '@/core/api';

// Add response interceptor
ResponseInterceptor.addInterceptor('logging', (response) => {
  console.log('Response:', response);
  return response;
});

export const GET = createApiHandler(async (request) => {
  const users = await userService.getAllUsers();

  return ResponseBuilder.success(users, 200, 'Users retrieved successfully', {
    count: users.length,
    timestamp: new Date().toISOString()
  });
});

export const POST = createApiHandler(async (request) => {
  const userData = await request.json();
  const user = await userService.createUser(userData);

  return ResponseBuilder.created(user, 'User created successfully');
});
```

## Conclusion

This guide provides comprehensive documentation for the modernized API layer. By following the best practices and examples provided, developers can build robust, performant, and maintainable APIs.

The migration guide helps transition from legacy systems to modern implementations, ensuring a smooth upgrade path. The examples demonstrate real-world usage patterns and best practices.

For more information, refer to the individual module documentation and examples provided throughout the codebase.
