# Schema Validation Quick Start

A fast reference guide for the most common schema validation tasks.

## 5-Minute Overview

**What is it?**
Schemas validate API requests using Zod. Every tool has an InputSchema that defines what fields are required.

**Why matters?**
- Catches bugs before they reach the server
- Type-safe development
- Clear error messages
- Prevents invalid data from being processed

**Core Rule:**
```typescript
// Every API call must include the flow field
{
    flow: 'exact-tool-name',  // ← Always required
    ...otherFields
}
```

---

## Adding a New Writing Tool (3 Steps)

### Step 1: Create Schema
```typescript
// File: src/ai/schemas/flows.ts

export const MyToolInputSchema = BaseTextInputSchema.extend({
    flow: z.literal('my-tool'),           // ← Exact kebab-case name
    myParameter: z.string(),               // ← Required field
    optionalParam: z.number().optional(),  // ← Optional field
});

export const MyToolOutputSchema = z.object({
    result: z.string(),
});

export type MyToolInput = z.infer<typeof MyToolInputSchema>;
export type MyToolOutput = z.infer<typeof MyToolOutputSchema>;
```

### Step 2: Create Flow
```typescript
// File: src/ai/flows/my-tool.ts

export const myTool = ai.defineFlow({
    name: 'myTool',
    inputSchema: MyToolInputSchema,
    outputSchema: MyToolOutputSchema,
}, async (input) => {
    // Implementation
    return { result: '...' };
});
```

Export it:
```typescript
// File: src/ai/flows/index.ts
export { myTool } from './my-tool';
```

### Step 3: Register in API
```typescript
// File: src/app/api/writing-tools/[tool]/route.ts

import { MyToolInputSchema } from '@/ai/schemas';
import { myTool } from '@/ai/flows';

const toolConfig = {
    'my-tool': {
        flow: myTool,
        schema: MyToolInputSchema,
        creditCost: 1,
    },
};
```

**Done!** Use via hook:
```typescript
const { mutate } = useWritingTool('my-tool');
mutate({ myParameter: 'value' });
```

---

## Common Schemas

### Text Processing
```typescript
export const TextToolInputSchema = BaseTextInputSchema.extend({
    flow: z.literal('text-tool'),
    text: z.string(),  // Inherited from base
    style: z.string().optional(),
});
```

### With Enums
```typescript
export const EnumToolInputSchema = z.object({
    flow: z.literal('enum-tool'),
    mode: z.enum(['fast', 'accurate', 'balanced']),
    text: z.string(),
});
```

### With Nested Objects
```typescript
export const ComplexToolInputSchema = z.object({
    flow: z.literal('complex-tool'),
    text: z.string(),
    options: z.object({
        minLength: z.number().optional(),
        maxLength: z.number().optional(),
    }).optional(),
});
```

---

## Using in Hooks

### Simple: Generic Hook
```typescript
const { mutate, isPending, data, error } = useWritingTool('my-tool');

mutate({
    text: userText,
    customParam: value,
});
```

### Custom: Manual Implementation
```typescript
const mutation = useMutation({
    mutationFn: async (input) => {
        const token = await firebaseUser.getIdToken();
        return writingToolApi('/api/writing-tools/my-tool', {
            data: {
                flow: 'my-tool',  // ← MUST INCLUDE
                ...input,
            },
            token,
        });
    },
});
```

---

## Field Types Reference

| Type | Zod | Example |
|------|-----|---------|
| Required String | `z.string()` | `text: z.string()` |
| Optional String | `z.string().optional()` | `style: z.string().optional()` |
| Number | `z.number()` | `ratio: z.number()` |
| Boolean | `z.boolean()` | `flag: z.boolean()` |
| Enum | `z.enum([...])` | `mode: z.enum(['a', 'b'])` |
| Array | `z.array(z.string())` | `tags: z.array(z.string())` |
| Object | `z.object({...})` | `config: z.object({...})` |
| Literal | `z.literal('value')` | `flow: z.literal('my-tool')` |

---

## Common Errors & Fixes

### ❌ "Validation failed"
```typescript
// Wrong: Missing flow field
mutate({ text: 'content' })

// Right: Include flow
mutate({ flow: 'my-tool', text: 'content' })
// OR use generic hook
useWritingTool('my-tool').mutate({ text: 'content' })
```

### ❌ "Unknown tool"
```typescript
// Wrong: Tool not in toolConfig
// Right: Add to toolConfig first
const toolConfig = {
    'my-tool': { flow: myTool, schema: ... }
}
```

### ❌ Type error in hook
```typescript
// Wrong: Type doesn't match
const { mutate } = useWritingTool('my-tool');
mutate({ wrongField: 'value' })

// Right: Match schema fields
mutate({ correctField: 'value' })
```

### ❌ Missing field error
```typescript
// Schema
flow: z.literal('tool'),
requiredField: z.string(),  // No .optional()

// Wrong: Missing required field
mutate({ flow: 'tool' })

// Right: Include all required fields
mutate({ flow: 'tool', requiredField: 'value' })
```

---

## File Locations Quick Map

| What | Where |
|------|-------|
| Schema definitions | `src/ai/schemas/flows.ts` |
| Base schemas | `src/ai/schemas/base-schemas.ts` |
| Flow implementations | `src/ai/flows/*.ts` |
| Hook implementations | `src/hooks/writing-tools/*.ts` |
| API route | `src/app/api/writing-tools/[tool]/route.ts` |
| Generic hook | `src/hooks/writing-tools/use-writing-tool.ts` |

---

## Validation Checklist

Before submitting code:

- [ ] Schema uses `z.literal()` for flow field
- [ ] Flow field matches kebab-case tool name exactly
- [ ] All required fields lack `.optional()`
- [ ] Optional fields have `.optional()`
- [ ] Hook includes `flow` in request (or uses generic hook)
- [ ] Schema registered in API route
- [ ] Type exports included (`z.infer`)
- [ ] No typos in field names

---

## Pro Tips

### ✨ Extend Base Schemas
```typescript
// Reuse common fields
export const MySchema = BaseTextInputSchema.extend({
    flow: z.literal('my-tool'),
    // Add your fields
});
```

### ✨ Merge Multiple Base Schemas
```typescript
// Combine multiple schemas
export const MySchema = BaseTextInputSchema
    .merge(BaseControlsSchema)
    .extend({
        flow: z.literal('my-tool'),
    });
```

### ✨ Auto-Add Flow Field
```typescript
// Use generic hook to auto-add flow
const { mutate } = useWritingTool('my-tool');
mutate({ text: 'content' });  // flow added automatically
```

### ✨ Create Reusable Type
```typescript
export type MyToolInput = z.infer<typeof MyToolInputSchema>;

// Use in component
function MyComponent(props: MyToolInput) {
    // props are typed!
}
```

---

## Examples

### Example 1: Simple Text Tool
```typescript
// Schema
export const SimpleToolInputSchema = BaseTextInputSchema.extend({
    flow: z.literal('simple-tool'),
});

// Hook
const { mutate } = useWritingTool('simple-tool');
mutate({ text: 'Hello world' });
```

### Example 2: Tool with Options
```typescript
// Schema
export const AdvancedToolInputSchema = BaseTextInputSchema.extend({
    flow: z.literal('advanced-tool'),
    mode: z.enum(['fast', 'accurate']),
    level: z.number().min(1).max(10).optional(),
});

// Hook
const { mutate } = useWritingTool('advanced-tool');
mutate({
    text: 'Content',
    mode: 'accurate',
    level: 5,
});
```

### Example 3: Complex Tool
```typescript
// Schema
export const ComplexToolInputSchema = z.object({
    flow: z.literal('complex-tool'),
    text: z.string(),
    config: z.object({
        temperature: z.number().default(0.7),
        maxTokens: z.number().optional(),
    }).optional(),
});

// Hook
const { mutate } = useWritingTool('complex-tool');
mutate({
    text: 'Input',
    config: {
        temperature: 0.5,
        maxTokens: 1000,
    },
});
```

---

## Need More?

- **Full Guide:** See `SCHEMA_VALIDATION_PATTERNS.md`
- **API Development:** See project development guide
- **TypeScript:** See `TYPESCRIPT_PATTERNS.md`
- **Zod Docs:** https://zod.dev

---

**Quick Links:**
- [Full Patterns Guide](./SCHEMA_VALIDATION_PATTERNS.md)
- [Main Development Guide](./README.md)

