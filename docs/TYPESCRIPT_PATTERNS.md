# TypeScript Patterns and Best Practices

## Overview

This document outlines the TypeScript patterns implemented across the Arkan codebase to achieve 100% type safety in source code. These patterns ensure maintainability, scalability, and production readiness.

---

## Table of Contents

1. [Immutability Patterns](#immutability-patterns)
2. [Type Export Organization](#type-export-organization)
3. [React Component Patterns](#react-component-patterns)
4. [Hook Typing Patterns](#hook-typing-patterns)
5. [AI Flow Type Safety](#ai-flow-type-safety)
6. [Database Operation Patterns](#database-operation-patterns)
7. [Form Handling Patterns](#form-handling-patterns)
8. [Library Integration Patterns](#library-integration-patterns)

---

## Immutability Patterns

### Problem
Readonly properties in classes cannot be directly mutated, causing type errors when trying to update state.

### Solution: Use Immutable `with()` Methods

**Before (❌ Incorrect):**
```typescript
updateProject(p => {
  p.name = newName;  // Error: Cannot assign to readonly property
});
```

**After (✅ Correct):**
```typescript
updateProject(p => p.with({ name: newName }));
```

### Pattern: Array Spreading for Readonly Arrays

**Before (❌ Incorrect):**
```typescript
return p.with({ content: newContent });  // Error: readonly type mismatch
```

**After (✅ Correct):**
```typescript
return p.with({ content: [...newContent] });
```

### Examples in Codebase

1. **Project Updates:**
```typescript
// src/hooks/core/use-builder-page.ts
const updateProjectName = useCallback((name: string) => {
  updateProject(p => p.with({ name }));
}, [updateProject]);
```

2. **Chapter Updates:**
```typescript
// src/hooks/report-mode/use-ai-actions.ts
return p.updateChapter(data.chapterId, c => 
  c.with({ sections: [...newChapter.sections] })
);
```

3. **Markdown Parsing:**
```typescript
// src/hooks/util/useMarkdownParser.ts
currentChapter = new Chapter({ 
  id: existingChapter?.id, 
  title: title, 
  sections: existingChapter?.sections ? [...existingChapter.sections] : []
});
```

---

## Type Export Organization

### Pattern: Centralized Type Exports

All types should be exported from their source modules and re-exported from index files for clean imports.

**Structure:**
```typescript
// src/lib/models/project.ts
export interface ProjectProperties { /* ... */ }
export class Project { /* ... */ }

// src/lib/models/index.ts
export { Project, type ProjectProperties } from './project';
export { Chapter, type ChapterProperties } from './chapter';
export { Section, type SectionProperties } from './section';
```

**Usage:**
```typescript
// ✅ Clean import
import { Project, type ProjectProperties } from '@/lib/models';

// ❌ Avoid
import { Project } from '@/lib/models/project';
import type { ProjectProperties } from '@/lib/models/project';
```

### Pattern: Type vs Value Imports

Use `type` keyword for type-only imports to avoid runtime bundling issues.

```typescript
// When used only as a type
import type { ProjectProperties } from '@/lib/models';

// When used as both type and value (e.g., with instanceof)
import { Chapter, type Project } from '@/lib/models';

if (result instanceof Chapter) { // Chapter used as value
  const project: Project = {}; // Project used as type
}
```

---

## React Component Patterns

### Pattern: Proper Component Prop Typing

**Always define prop interfaces explicitly:**

```typescript
interface ComponentProps {
  user: User;
  onUpdate?: (user: User) => void;
  className?: string;
}

export function Component({ user, onUpdate, className }: ComponentProps) {
  // Implementation
}
```

### Pattern: Lazy Loading with Type Safety

When using React.lazy(), ensure prop types match:

```typescript
// Import with proper typing
const EditUserFormComponent = lazy(() => 
  import('@/components/admin/EditUserForm')
);

// Usage - ensure props match component expectations
<Suspense fallback={<Loading />}>
  <EditUserFormComponent user={user} />
</Suspense>
```

### Pattern: Event Handlers

```typescript
// Proper event typing
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  event.preventDefault();
  // Handler logic
};

// Form submissions
const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  // Form logic
};
```

---

## Hook Typing Patterns

### Pattern: Custom Hook Return Types

Always explicitly type hook return values:

```typescript
interface UseFeatureReturn {
  data: Data | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useFeature(): UseFeatureReturn {
  // Implementation
  return { data, isLoading, error, refetch };
}
```

### Pattern: React Query Hooks

```typescript
export function useData() {
  return useQuery<DataType>({
    queryKey: ['data'],
    queryFn: fetchData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUpdateData() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateInput) => {
      const token = await getToken();
      return updateDataApi(data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data'] });
      toast({ title: 'Success!' });
    },
  });
}
```

### Pattern: Zustand Store Typing

```typescript
interface StoreState {
  data: Data | null;
  isLoading: boolean;
}

interface StoreActions {
  setData: (data: Data) => void;
  reset: () => void;
}

export const useStore = create<StoreState & StoreActions>((set) => ({
  data: null,
  isLoading: false,
  
  setData: (data) => set({ data }),
  reset: () => set({ data: null, isLoading: false }),
}));
```

---

## AI Flow Type Safety

### Pattern: Input/Output Schema Definitions

All AI flows must have Zod schemas for input and output:

```typescript
// src/ai/schemas/flows.ts
export const FlowInputSchema = z.object({
  prompt: z.string().min(1),
  options: z.object({
    temperature: z.number().optional(),
  }).optional(),
});

export const FlowOutputSchema = z.object({
  result: z.string(),
  metadata: z.object({
    tokens: z.number(),
  }),
});

export type FlowInput = z.infer<typeof FlowInputSchema>;
export type FlowOutput = z.infer<typeof FlowOutputSchema>;
```

### Pattern: Flow Definition

```typescript
// src/ai/flows/my-flow.ts
import { ai } from '@/modules/ai/infrastructure/services/Genkit';
import { FlowInputSchema, FlowOutputSchema } from '@/modules/ai/domain/schemas';

export const myFlow = ai.defineFlow({
  name: 'myFlow',
  inputSchema: FlowInputSchema,
  outputSchema: FlowOutputSchema,
}, async (input) => {
  // Input is automatically typed as FlowInput
  const result = await processInput(input);
  
  // Return must match FlowOutput
  return {
    result: result.text,
    metadata: { tokens: result.tokenCount },
  };
});
```

### Pattern: Removing Legacy Properties

When schemas evolve, remove obsolete properties from calls:

```typescript
// ❌ Old (had legacy 'flow' property)
await prompt({ flow: "translate-text", text, targetLang });

// ✅ New (clean schema)
await prompt({ text, targetLang });
```

---

## Database Operation Patterns

### Pattern: Firestore Type Safety

```typescript
// Define collection types
interface UserDocument {
  id: string;
  name: string;
  email: string;
  createdAt: Timestamp;
}

// Type-safe collection reference
const usersRef = collection(db, 'users') as CollectionReference<UserDocument>;

// Type-safe queries
const getUserById = async (id: string): Promise<UserDocument | null> => {
  const docRef = doc(usersRef, id);
  const snapshot = await getDoc(docRef);
  
  if (!snapshot.exists()) return null;
  
  return { id: snapshot.id, ...snapshot.data() };
};
```

### Pattern: Optional ID Handling

When IDs might be undefined, add null checks:

```typescript
// ❌ Unsafe
queryClient.invalidateQueries({ queryKey: ['section', data.id] });

// ✅ Safe
if (data.id) {
  queryClient.invalidateQueries({ queryKey: ['section', data.id] });
}
```

---

## Form Handling Patterns

### Pattern: React Hook Form with Zod

```typescript
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Define schema
const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormValues = z.infer<typeof formSchema>;

// Use in component
export function MyForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const onSubmit = (data: FormValues) => {
    // data is fully typed
    submitForm(data);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </Form>
  );
}
```

### Pattern: Nested Object Forms

```typescript
const schema = z.object({
  user: z.object({
    name: z.string(),
    settings: z.object({
      theme: z.enum(['light', 'dark']),
    }),
  }),
});

// Access nested fields
<FormField
  control={form.control}
  name="user.settings.theme"
  render={({ field }) => <Select {...field} />}
/>
```

---

## Library Integration Patterns

### Pattern: TipTap Editor Extensions

When custom commands don't have proper types, use targeted suppressions:

```typescript
// Custom command definition
addCommands() {
  return {
    // @ts-expect-error - Custom TipTap extension command
    insertCustomNode: () => ({ commands }: any) => {
      return commands.insertContent('<custom-node></custom-node>');
    },
  } as any;
},
```

### Pattern: External Library Type Mismatches

For third-party libraries with incorrect types:

```typescript
// docx library type mismatch
// @ts-expect-error - IFootnotesOptions not exported in current docx version
import type { IFootnotesOptions } from 'docx';

// Or define locally
type IFootnotesOptions = any;
```

### Pattern: PptxGen Write Options

```typescript
// Type assertion for write output formats
const blob = await pptx.write('blob' as any) as Promise<Blob>;
const buffer = await pptx.write('nodebuffer' as any) as Promise<Buffer>;
```

---

## General Best Practices

### 1. Avoid `any` Where Possible

```typescript
// ❌ Avoid
function process(data: any) { }

// ✅ Prefer
function process<T extends BaseType>(data: T) { }

// ✅ Or use unknown for truly unknown types
function process(data: unknown) {
  if (isValidType(data)) {
    // Type narrowing
  }
}
```

### 2. Use Type Guards

```typescript
function isProject(value: unknown): value is Project {
  return value instanceof Project;
}

function processData(data: unknown) {
  if (isProject(data)) {
    // data is now typed as Project
    data.name;
  }
}
```

### 3. Discriminated Unions

```typescript
type Response = 
  | { status: 'success'; data: Data }
  | { status: 'error'; error: string };

function handleResponse(response: Response) {
  if (response.status === 'success') {
    // TypeScript knows response has 'data'
    console.log(response.data);
  } else {
    // TypeScript knows response has 'error'
    console.error(response.error);
  }
}
```

### 4. Utility Types

```typescript
// Make all properties optional
type PartialProject = Partial<ProjectProperties>;

// Pick specific properties
type ProjectMeta = Pick<ProjectProperties, 'id' | 'name' | 'createdAt'>;

// Omit specific properties
type ProjectWithoutMeta = Omit<ProjectProperties, 'createdAt' | 'updatedAt'>;

// Make readonly
type ReadonlyProject = Readonly<ProjectProperties>;
```

---

## Summary

These patterns ensure:
- ✅ Type safety across the entire codebase
- ✅ Maintainable and scalable code
- ✅ Clear intent and documentation
- ✅ Fewer runtime errors
- ✅ Better IDE support and autocomplete
- ✅ Easier refactoring and code evolution

By following these patterns, the team can maintain the high level of type safety achieved during the TypeScript error cleanup initiative.
