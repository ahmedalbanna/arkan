# Architecture Standards: Result Object Pattern

This document outlines the standard for error handling and state management across the backend modules using the **Result Object Pattern**.

## Overview

The Result Object Pattern is a functional programming pattern used to represent the outcome of an operation that can either succeed or fail. Instead of throwing exceptions for expected business failures, we return a `Result` object that contains either the success value or a domain-specific error.

### Benefits
- **Explicit Error Handling**: Failures are part of the function signature, forcing callers to handle them.
- **Type Safety**: TypeScript ensures that you cannot access the value of a failed operation without checking its status.
- **Clean Architecture**: Domain errors are separated from infrastructure-specific exceptions (like Firestore or Vector Store errors).
- **Standardized API Responses**: Standardized handlers translate Result objects into consistent JSON responses.

---

## 1. The Result Class

The core implementation lives in `src/lib/utils/result.ts`.

```typescript
export class Result<T, E = Error> {
  public readonly isSuccess: boolean;
  public readonly isFailure: boolean;
  public readonly error: E | null;
  private readonly _value: T | null;

  // ... (implementation details)

  public getValue(): T {
    if (!this.isSuccess) {
      throw new Error("Can't get the value of an error result.");
    }
    return this._value as T;
  }

  public static ok<T, E>(value?: T): Result<T, E> {
    return new Result<T, E>(true, undefined, value);
  }

  public static fail<T, E>(error: E): Result<T, E> {
    return new Result<T, E>(false, error);
  }
}
```

---

## 2. Defining Domain Errors

Each module should define its own domain error class and error types.

**Example (`src/modules/projects/domain/errors/ProjectErrors.ts`):**

```typescript
export enum ProjectErrorType {
  NOT_FOUND = "NOT_FOUND",
  VALIDATION = "VALIDATION",
  SAVE_ERROR = "SAVE_ERROR",
  INTERNAL = "INTERNAL"
}

export class ProjectError {
  constructor(
    public readonly type: ProjectErrorType,
    public readonly message: string,
    public readonly details?: any
  ) {}

  public static notFound(message: string): ProjectError {
    return new ProjectError(ProjectErrorType.NOT_FOUND, message);
  }
  // ... other static factory methods
}
```

---

## 3. Implementation Layers

### Repository Layer
Repositories should wrap technical exceptions and return Result objects.

```typescript
async getById(id: string): Promise<Result<Project, ProjectError>> {
    try {
        const doc = await this.collection.doc(id).get();
        if (!doc.exists) {
            return Result.fail(ProjectError.notFound(`Project ${id} not found`));
        }
        return Result.ok(new Project(doc.data()));
    } catch (error: any) {
        return Result.fail(ProjectError.internal(error.message));
    }
}
```

### Use Case Layer
Use cases propagate results or combine multiple results.

```typescript
async execute(id: string): Promise<Result<Project, ProjectError>> {
    return this.projectRepository.getById(id);
}
```

### Controller Layer
Controllers handle side effects (like cache revalidation) and return the Result.

```typescript
async saveProject(data: any, userId: string) {
    const result = await this.saveProjectUseCase.execute(data, userId);
    if (result.isSuccess) {
        revalidatePath('/dashboard');
    }
    return result;
}
```

---

## 4. API Integration

API routes use standardized handlers from `src/lib/utils/api-utils.ts` to convert Results into standard HTTP responses.

```typescript
export const GET = withAuth(async ({ params }) => {
    const controller = container.resolve(ProjectController);
    const result = await controller.getProjectById(params.id);
    
    // Standardized mapping: NOT_FOUND -> 404, UNAUTHORIZED -> 401, etc.
    return handleProjectResult(result);
});
```

---

## 5. Summary of Standard Handlers

| Handler | Domain Error Type | Location |
|---------|-------------------|----------|
| `handleUserResult` | `UserError` | `api-utils.ts` |
| `handleProjectResult` | `ProjectError` | `api-utils.ts` |
| `handleBillingResult` | `BillingError` | `api-utils.ts` |
| `handleRagResult` | `RagError` | `api-utils.ts` |
| `handleTemplateResult` | `TemplateError` | `api-utils.ts` |
| `handleAIContentResult` | `AIContentError` | `api-utils.ts` |
