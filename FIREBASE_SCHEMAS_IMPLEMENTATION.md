# Firebase Schemas & Validations Implementation

## ✅ Implementation Complete

A comprehensive, centralized validation layer for all Firestore collections has been successfully created.

## Overview

This implementation provides:

- **7 Zod Schemas** for all major Firestore collections
- **21 Validation Functions** for create, update, and partial operations
- **Custom Error Classes** for each collection type
- **Type-Safe Inference** with full TypeScript support
- **Centralized Exports** through firebase module index
- **DB Helper Integration** with automatic validation before writes

## Files Created

### 1. `src/lib/firebase/schemas.ts` (650 lines)

Complete Zod schemas for all Firestore collections with type inference.

**Collections:**
- Users (with role enumeration)
- Projects (with metadata and content items)
- Sections (with status tracking)
- Templates (with type enumeration)
- Transactions (with status tracking)
- Notifications (with type enumeration)
- Agents (with capability enumeration)

**Base Schemas:**
- Timestamp, UUID, Email, URL validations
- Pagination metadata
- Schema registry for dynamic access

**Custom Error Classes:**
- `ValidationError` (base)
- `UserValidationError`
- `ProjectValidationError`
- `SectionValidationError`
- `TemplateValidationError`
- `TransactionValidationError`
- `NotificationValidationError`
- `AgentValidationError`

### 2. `src/lib/firebase/validation-helpers.ts` (420 lines)

Type-safe validation functions for each collection.

**Validation Functions (3 per collection):**
- `validate{Entity}()` - Complete validation
- `validateCreate{Entity}()` - Creation validation
- `validateUpdate{Entity}()` - Update validation

**Special Validators:**
- `validateEmail()`, `validateCredits()` - Field-level validators
- `validateUniqueIds()`, `findDuplicateIds()` - Project-specific
- `validateExternalContextReferences()` - Context validation
- `validateSectionReferences()` - Section link validation
- `validateTransactionStatus()` - Status enumeration

**Safe Parsing Functions (no throw):**
- `safeParseUser()`, `safeParseProject()`, `safeParseNotification()`, `safeParseTransaction()`

### 3. `src/lib/firebase/index.ts` (230 lines)

Centralized export module for all Firebase functionality.

**Exports:**
- Admin SDK: `adminAuth`, `adminDb`, `adminRealtimeDb`
- DB Helpers: All 40+ helper functions
- Schemas: All Zod schemas and types
- Validators: All validation functions
- Error Classes: All custom error types

## Updated Files

### `src/lib/firebase/db-helpers.ts`

Integrated schema validation into key helpers:

- `createUserDocHelper()` - Validates with `validateCreateUser()`
- `saveProjectHelper()` - Validates with `validateProject()`
- `saveSectionHelper()` - Validates with `validateSection()`
- `saveTemplateHelper()` - Validates with `validateTemplate()`
- `createTransactionHelper()` - Validates with `validateCreateTransaction()`
- `createNotificationHelper()` - Validates with `validateCreateNotification()`
- `saveAgentHelper()` - Validates with `validateAgent()`

## Schema Structure

### User Schema

```typescript
export const UserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200),
  email: EmailSchema,
  role: UserRoleSchema, // 'admin' | 'user'
  credits: z.number().int().min(0),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
  bio: z.string().max(1000).optional(),
  profilePictureUrl: URLSchema.optional(),
  hasCompletedOnboarding: z.boolean().optional(),
  lastDailyCreditUpdate: TimestampSchema.optional(),
  apiKeys: z.record(z.string()).optional(),
});
```

### Project Schema

```typescript
export const ProjectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  projectType: z.string().max(100).optional(),
  // ... other fields
  meta: ProjectMetaSchema, // author, version, created, updated
  content: z.array(ProjectContentItemSchema).optional(),
  externalContext: z.array(BaseContextFileSchema).optional(),
  // ... global settings
});
```

### Transaction Schema

```typescript
export const TransactionSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  planId: z.string().min(1),
  credits: z.number().int().min(1),
  price: z.number().min(0),
  status: TransactionStatusSchema, // 'pending' | 'verified' | 'rejected'
  proofUrl: z.string().url(),
  createdAt: TimestampSchema,
  verifiedAt: TimestampSchema.optional(),
  // ... other fields
});
```

### Notification Schema

```typescript
export const NotificationSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  type: NotificationTypeSchema, // 'info' | 'success' | 'warning' | 'error'
  title: z.string().min(1).max(100),
  message: z.string().min(1).max(500),
  read: z.boolean(),
  actionUrl: z.string().url().optional(),
  createdAt: TimestampSchema,
  readAt: TimestampSchema.optional(),
});
```

### Agent Schema

```typescript
export const AgentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  category: z.string().min(1).max(50),
  capabilities: z.array(AgentCapabilitySchema).min(1),
  isActive: z.boolean(),
  config: z.record(z.any()).optional(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});
```

## Usage Examples

### In API Routes

```typescript
import { validateUser, UserValidationError } from '@/lib/firebase';

export const POST = withAuth(async ({ request }) => {
  try {
    const data = await request.json();
    const validatedUser = validateUser(data);
    
    // Use validated data
    await saveUserHelper(validatedUser);
    return ApiResponse.success(validatedUser);
  } catch (error) {
    if (error instanceof UserValidationError) {
      return ApiResponse.error(error.message, 400);
    }
    throw error;
  }
});
```

### In Services

```typescript
import { validateCreateProject, ProjectValidationError } from '@/lib/firebase';

export async function createProjectService(data: unknown) {
  try {
    const validated = validateCreateProject(data);
    return await saveProjectHelper(validated);
  } catch (error) {
    if (error instanceof ProjectValidationError) {
      console.error('Project validation failed:', error.field);
    }
    throw error;
  }
}
```

### Safe Parsing (No Throw)

```typescript
import { safeParseNotification } from '@/lib/firebase';

const [notification, error] = safeParseNotification(data);
if (error) {
  console.error('Invalid notification:', error.message);
  return;
}
// Use notification safely
```

### Type Inference

```typescript
import type { User, Project, Notification } from '@/lib/firebase';

// Types automatically inferred from schemas
const user: User = {
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user',
  credits: 100,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
```

## Validation Patterns

### Create Operation

```typescript
// Server-side validation before creating
const validated = validateCreateUser({
  name: 'John',
  email: 'john@example.com',
  role: 'user',
  credits: 0,
});

await createUserDocHelper('userId123', validated);
```

### Update Operation

```typescript
// Partial validation allows subset of fields
const validated = validateUpdateUser({
  bio: 'New bio',
  profilePictureUrl: 'https://...',
});

await updateUserHelper('userId123', validated);
```

### Batch Validation

```typescript
// Validate multiple items
for (const project of projects) {
  validateProject(project); // Throws if invalid
}

// Safe alternative without throwing
const [data, error] = safeParseProject(project);
if (!error) {
  // Process valid project
}
```

## Error Handling

### Thrown Errors

```typescript
try {
  validateUser({ name: '' }); // Empty name
} catch (error) {
  if (error instanceof UserValidationError) {
    console.log(error.field); // 'name'
    console.log(error.message); // 'Name is required'
    console.log(error.details); // Zod error object
  }
}
```

### Error Messages

All validation errors include:
- **Message**: Human-readable description
- **Field**: Which field failed (if applicable)
- **Details**: Complete Zod error object

## Type Safety

All schemas provide full TypeScript type inference:

```typescript
// Inferred type from schema
type User = z.infer<typeof UserSchema>;
// Equivalent to
type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  credits: number;
  createdAt: string;
  updatedAt: string;
  // ... optional fields
};
```

## Integration with DB Helpers

The DB helpers automatically validate before writes:

```typescript
// Automatically validates before saving to Firestore
const saved = await saveProjectHelper({
  id: 'proj123',
  name: 'My Project',
  // ... other fields with validation
});

// If validation fails, throws ProjectValidationError
// If valid, saves to Firestore and returns validated data
```

## Collection Coverage

| Collection | Schema | Validators | Error Class |
|-----------|--------|-----------|------------|
| Users | ✅ UserSchema | ✅ 3 functions | ✅ UserValidationError |
| Projects | ✅ ProjectSchema | ✅ 3 functions | ✅ ProjectValidationError |
| Sections | ✅ SectionSchema | ✅ 3 functions | ✅ SectionValidationError |
| Templates | ✅ TemplateSchema | ✅ 3 functions | ✅ TemplateValidationError |
| Transactions | ✅ TransactionSchema | ✅ 3 functions | ✅ TransactionValidationError |
| Notifications | ✅ NotificationSchema | ✅ 3 functions | ✅ NotificationValidationError |
| Agents | ✅ AgentSchema | ✅ 3 functions | ✅ AgentValidationError |

## Performance Considerations

- **Lazy Validation**: Validation only runs when explicitly called or in DB helpers
- **Type-Safe**: No runtime overhead for TypeScript types
- **Efficient**: Zod schemas are optimized for performance
- **Cacheable**: Schemas are defined at module level, not recreated

## Best Practices

### ✅ Do

1. **Use collection-specific validators** in services
2. **Validate at boundaries** (API routes, form submissions)
3. **Leverage TypeScript types** for compile-time safety
4. **Use safe parsing** when user input is untrusted
5. **Catch specific error classes** for better error handling

### ❌ Don't

1. Don't skip validation for server-side operations
2. Don't validate the same data twice (validate once at boundary)
3. Don't ignore validation errors from user input
4. Don't store unvalidated data to Firestore
5. Don't mix validation patterns (use either throw or safe parse)

## Future Enhancements

Potential improvements:
- Add custom validators for complex business logic
- Implement schema versioning for migrations
- Add schema documentation generation
- Create schema composition utilities
- Add schema testing utilities
- Implement automatic schema updates from Firestore types

## Summary

The Firebase Schemas & Validations layer provides:

✅ **Comprehensive Coverage**: All 7 major collections validated
✅ **Type Safety**: Full TypeScript type inference
✅ **Consistency**: Uniform validation patterns
✅ **Error Handling**: Clear, actionable error messages
✅ **Integration**: Seamlessly integrated with DB helpers
✅ **Extensibility**: Easy to add new validators and schemas
✅ **Production-Ready**: Enterprise-grade validation patterns

This implementation ensures data integrity, provides excellent developer experience with TypeScript support, and maintains consistency across the entire Firestore backend.
