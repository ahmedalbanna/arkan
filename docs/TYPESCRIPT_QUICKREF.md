# TypeScript Quick Reference Card

**⚡ Fast lookup for common TypeScript patterns in Arkan**

---

## 🚨 Most Common Fixes

### Problem: "Cannot assign to readonly property"

```typescript
// ❌ Wrong
project.name = "New Name";

// ✅ Correct
updateProject(p => p.with({ name: "New Name" }));
```

### Problem: Readonly array type mismatch

```typescript
// ❌ Wrong
return p.with({ sections: chapter.sections });

// ✅ Correct
return p.with({ sections: [...chapter.sections] });
```

### Problem: Property 'flow' does not exist

```typescript
// ❌ Wrong (legacy)
await aiFlow({ flow: "name", data });

// ✅ Correct
await aiFlow({ data });
```

---

## 📦 Import Patterns

```typescript
// Type-only imports
import type { User } from '@/lib/models';

// Mixed imports
import { Project, type ProjectProperties } from '@/lib/models';

// When using instanceof (need value)
import { Chapter } from '@/lib/models';
if (item instanceof Chapter) { }
```

---

## 🔄 Immutability Cheat Sheet

```typescript
// Update single property
updateProject(p => p.with({ name: newName }));

// Update multiple properties
updateProject(p => p.with({ 
  name: newName,
  description: newDesc 
}));

// Update with array
updateProject(p => p.with({ 
  content: [...newContent] 
}));

// Update chapter
updateChapter(id, c => c.with({ 
  title: newTitle,
  sections: [...newSections]
}));
```

---

## ⚛️ React Components

```typescript
// Component props
interface Props {
  data: Data;
  onUpdate?: (data: Data) => void;
  className?: string;
}

export function Component({ data, onUpdate, className }: Props) {
  // Implementation
}

// Event handlers
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();
};

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};
```

---

## 🎣 Custom Hooks

```typescript
// Hook return type
interface UseDataReturn {
  data: Data | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useData(): UseDataReturn {
  // Implementation
  return { data, isLoading, error, refetch };
}

// React Query hook
export function useFeature() {
  return useQuery<DataType>({
    queryKey: ['feature'],
    queryFn: fetchFeature,
  });
}

// Mutation hook
export function useUpdate() {
  return useMutation({
    mutationFn: async (data: Input) => {
      const token = await getToken();
      return updateApi(data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data'] });
    },
  });
}
```

---

## 📝 Forms with Zod

```typescript
// Define schema
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  age: z.number().optional(),
});

type FormValues = z.infer<typeof schema>;

// Create form
const form = useForm<FormValues>({
  resolver: zodResolver(schema),
  defaultValues: {
    email: '',
    password: '',
  },
});

// Submit handler
const onSubmit = (data: FormValues) => {
  // data is typed and validated
  submitData(data);
};
```

---

## 🤖 AI Flows

```typescript
// Define schemas
export const InputSchema = z.object({
  prompt: z.string().min(1),
  options: z.object({
    temperature: z.number().optional(),
  }).optional(),
});

export const OutputSchema = z.object({
  result: z.string(),
});

// Define flow
export const myFlow = ai.defineFlow({
  name: 'myFlow',
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
}, async (input) => {
  // Input is typed
  return { result: processedData };
});

// Use flow
const result = await myFlow({ 
  prompt: "Generate",
  options: { temperature: 0.7 }
});
```

---

## 💾 Database Operations

```typescript
// Type-safe Firestore
const usersRef = collection(db, 'users') as CollectionReference<User>;

// Query with null check
if (data.id) {
  queryClient.invalidateQueries({ 
    queryKey: ['user', data.id] 
  });
}

// Safe document get
const getUserById = async (id: string): Promise<User | null> => {
  const docRef = doc(usersRef, id);
  const snapshot = await getDoc(docRef);
  
  if (!snapshot.exists()) return null;
  
  return { id: snapshot.id, ...snapshot.data() };
};
```

---

## 🎨 Type Utilities

```typescript
// Partial - all optional
type PartialUser = Partial<User>;

// Pick - select properties
type UserMeta = Pick<User, 'id' | 'name'>;

// Omit - exclude properties
type UserWithoutMeta = Omit<User, 'createdAt' | 'updatedAt'>;

// Readonly - make immutable
type ReadonlyUser = Readonly<User>;

// Record - key-value pairs
type StringMap = Record<string, string>;

// Array types
const items: User[] = [];
const ids: string[] = [];
```

---

## ⚠️ When to Use @ts-expect-error

**Only use for:**
- External library type bugs
- Complex inference issues
- Temporary workarounds (document in TYPESCRIPT_SUPPRESSIONS.md)

```typescript
// Always add descriptive comment
// @ts-expect-error - TipTap v2.1 missing custom command types
editor.commands.customCommand();

// Never suppress silently
// @ts-ignore  // ❌ Don't do this
someFunction();
```

---

## 🔍 Type Narrowing

```typescript
// Type guard
function isUser(value: unknown): value is User {
  return value instanceof User;
}

// Narrowing with typeof
if (typeof value === 'string') {
  // value is string here
  value.toUpperCase();
}

// Discriminated unions
type Response = 
  | { status: 'success'; data: Data }
  | { status: 'error'; error: string };

function handle(res: Response) {
  if (res.status === 'success') {
    console.log(res.data);  // TypeScript knows
  } else {
    console.error(res.error);  // TypeScript knows
  }
}
```

---

## 🧪 Testing Types

```typescript
// Type assertions in tests
import { Project, type ProjectProperties } from '@/lib/models';

it('should update project', () => {
  const props: ProjectProperties = {
    id: '1',
    name: 'Test',
    // ... other required props
  };
  
  const project = new Project(props);
  const updated = project.with({ name: 'Updated' });
  
  expect(updated.name).toBe('Updated');
});
```

---

## 📚 Quick Links

| Document | When to Use |
|----------|-------------|
| [Patterns](./TYPESCRIPT_PATTERNS.md) | Learning patterns in depth |
| [Migration](./TYPESCRIPT_MIGRATION_GUIDE.md) | Migrating existing code |
| [Suppressions](./TYPESCRIPT_SUPPRESSIONS.md) | Understanding suppressions |
| [Summary](./TYPESCRIPT_CLEANUP_SUMMARY.md) | Overview and context |

---

## 🎯 Before You Commit

```bash
# 1. Type check
npm run typecheck

# 2. Tests
npm test

# 3. Lint
npm run lint
```

---

## 🆘 Common Errors

| Error Message | Quick Fix |
|--------------|-----------|
| Cannot assign to readonly | Use `.with()` method |
| readonly array not assignable | Spread array `[...arr]` |
| Property does not exist | Check schema, remove legacy props |
| Type X not assignable to Y | Check import, ensure proper typing |
| Cannot find module | Verify path, check exports |
| Object literal may only specify | Remove extra properties |

---

## 💡 Pro Tips

1. **Let TypeScript infer** - Don't over-annotate
2. **Use const for functions** - `const fn = () => {}`
3. **Destructure with types** - `const { data }: { data: Type } = ...`
4. **Early returns** - Better than nested ifs
5. **Type at boundaries** - API calls, props, etc.

---

**📖 Full Documentation:** [docs/README.md](./README.md)

**Last Updated:** January 2026
