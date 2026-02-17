# Schema Validation Patterns Guide

## Overview

This document outlines the schema validation patterns used throughout the Arkan application. Understanding these patterns is essential for:
- Adding new AI flows and tools
- Creating API endpoints
- Building hooks that call AI services
- Ensuring type safety and runtime validation

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [Schema Structure](#schema-structure)
3. [Flow Field Pattern](#flow-field-pattern)
4. [Creating New Tools](#creating-new-tools)
5. [Hook Integration](#hook-integration)
6. [API Route Integration](#api-route-integration)
7. [Best Practices](#best-practices)
8. [Common Patterns](#common-patterns)
9. [Troubleshooting](#troubleshooting)

---

## Core Concepts

### What is a Schema?

A schema is a Zod definition that validates the input and output data for an AI flow. It ensures:
- Type safety at compile time (TypeScript)
- Runtime validation of data before API calls
- Clear documentation of required vs optional fields
- Consistent error messages for validation failures

### Schema Components

```typescript
// Input Schema (what the client sends)
export const MyFlowInputSchema = z.object({
    flow: z.literal('my-flow-name'),      // Required: identifies the tool
    requiredField: z.string(),              // Required field
    optionalField: z.string().optional(),   // Optional field
});

// Output Schema (what the server returns)
export const MyFlowOutputSchema = z.object({
    result: z.string(),
    metadata: z.object({
        processingTime: z.number(),
    }).optional(),
});

// Type Inference
export type MyFlowInput = z.infer<typeof MyFlowInputSchema>;
export type MyFlowOutput = z.infer<typeof MyFlowOutputSchema>;
```

---

## Schema Structure

### Directory Organization

```
src/ai/schemas/
├── base-schemas.ts          # Base schemas extended by others
├── flows.ts                 # All InputSchemas and OutputSchemas
├── index.ts                 # Barrel exports
└── enums.ts                 # Enum definitions used in schemas
```

### Base Schemas Pattern

Base schemas provide reusable field definitions to avoid repetition:

```typescript
// In base-schemas.ts
export const BaseTextInputSchema = z.object({
    flow: z.literal('placeholder'), // Will be overridden
    text: z.string().min(10, 'Text must be at least 10 characters'),
});

export const BaseControlsSchema = z.object({
    targetAudience: z.string().optional(),
    tone: z.string().optional(),
    style: z.string().optional(),
});

// In flows.ts - Extending base schemas
export const RewriteTextInputSchema = BaseTextInputSchema.extend({
    flow: z.literal('rewrite-text'),  // Override the flow literal
    style: z.string().optional(),      // Add additional fields
});

export const StyleEditorInputSchema = BaseTextInputSchema.merge(BaseControlsSchema).extend({
    flow: z.literal('style-editor'),
});
```

**Key Patterns:**
- Use `.extend()` to add new fields to a base schema
- Use `.merge()` to combine multiple base schemas
- **Always override the `flow` literal** when extending base schemas
- Keep base schemas in `base-schemas.ts`

---

## Flow Field Pattern

### The Flow Field is Critical

The `flow` field is a **literal string that identifies which AI tool is being executed**. It serves multiple purposes:

1. **Router Identification**: Tells the API which flow function to call
2. **Validation**: Ensures the request matches the intended flow
3. **Type Safety**: Distinguishes between different tool requests
4. **Error Tracking**: Helps identify which tool caused issues

### Flow Field Rules

```typescript
// ✓ CORRECT: Literal string
export const MyFlowInputSchema = z.object({
    flow: z.literal('my-flow-name'),
    // ...
});

// ✗ WRONG: Regular string (loses type safety)
export const MyFlowInputSchema = z.object({
    flow: z.string(),
    // ...
});

// ✗ WRONG: Enum (still requires literal in actual usage)
export const MyFlowInputSchema = z.object({
    flow: z.enum(['my-flow-name']),
    // ...
});
```

### Flow Naming Convention

Flow names should be **kebab-case** and match the route slug:

```typescript
// Flow name        Route path              Hook method
'rewrite-text'  => /api/writing-tools/rewrite-text
'generate-toc'  => /api/writing-tools/generate-toc
'summarize-with-ratio' => /api/writing-tools/summarize-with-ratio
```

---

## Creating New Tools

### Step-by-Step: Adding a New Writing Tool

#### 1. Define the Schema

```typescript
// File: src/ai/schemas/flows.ts

export const MyNewToolInputSchema = BaseTextInputSchema.extend({
    flow: z.literal('my-new-tool'),
    customParameter: z.string(),
    optionalParameter: z.number().optional(),
});

export type MyNewToolInput = z.infer<typeof MyNewToolInputSchema>;

export const MyNewToolOutputSchema = z.object({
    result: z.string(),
    metadata: z.object({
        tokensUsed: z.number(),
    }).optional(),
});

export type MyNewToolOutput = z.infer<typeof MyNewToolOutputSchema>;
```

**Checklist:**
- [ ] Schema is in `src/ai/schemas/flows.ts`
- [ ] `flow` field uses `z.literal()` with kebab-case name
- [ ] All required fields are defined without `.optional()`
- [ ] Optional fields use `.optional()`
- [ ] Type exports are included (`z.infer`)
- [ ] Input schema name ends with `InputSchema`
- [ ] Output schema name ends with `OutputSchema`

#### 2. Create the AI Flow

```typescript
// File: src/ai/flows/my-new-tool.ts

import { ai } from '@/ai/genkit';
import { MyNewToolInputSchema, MyNewToolOutputSchema } from '@/ai/schemas';

export const myNewTool = ai.defineFlow({
    name: 'myNewTool',
    inputSchema: MyNewToolInputSchema,
    outputSchema: MyNewToolOutputSchema,
}, async (input) => {
    // Validate input at flow entry
    const validated = MyNewToolInputSchema.parse(input);
    
    // Your implementation
    const result = await generateContent(validated.text);
    
    return {
        result,
        metadata: {
            tokensUsed: result.length,
        },
    };
});
```

**Checklist:**
- [ ] Flow is in `src/ai/flows/`
- [ ] Flow name matches camelCase version of route slug
- [ ] Input and output schemas are imported
- [ ] Flow is exported
- [ ] Input is validated using schema `.parse()`

#### 3. Export the Flow

```typescript
// File: src/ai/flows/index.ts

export { myNewTool } from './my-new-tool';
```

#### 4. Register in API Route

```typescript
// File: src/app/api/writing-tools/[tool]/route.ts

import { MyNewToolInputSchema } from '@/ai/schemas';
import { myNewTool } from '@/ai/flows';

const toolConfig = {
    // ... existing tools ...
    
    'my-new-tool': {
        flow: myNewTool,
        schema: MyNewToolInputSchema,
        creditCost: 1,
    },
};
```

**Checklist:**
- [ ] Schema is imported
- [ ] Flow is imported
- [ ] Entry in `toolConfig` uses kebab-case key
- [ ] Schema reference is correct
- [ ] Credit cost is set

#### 5. Create a Hook (Optional - for client integration)

```typescript
// File: src/hooks/writing-tools/use-my-new-tool-logic.ts

import { useWritingTool } from './use-writing-tool';

export function useMyNewTool() {
    return useWritingTool('my-new-tool');
}
```

Or if you need custom logic:

```typescript
import { useMutation } from '@tanstack/react-query';
import { writingToolApi } from '@/services/api/writingToolsService';
import { MyNewToolInputSchema } from '@/ai/schemas';
import { useAuth } from '@/context/AuthContext';

export function useMyNewTool() {
    const { firebaseUser } = useAuth();
    
    const mutation = useMutation({
        mutationFn: async (data: { text: string; customParameter: string }) => {
            if (!firebaseUser) throw new Error('Not authenticated');
            const token = await firebaseUser.getIdToken();
            
            return writingToolApi(
                '/api/writing-tools/my-new-tool',
                {
                    data: {
                        flow: 'my-new-tool',  // ← CRITICAL: Include flow field
                        text: data.text,
                        customParameter: data.customParameter,
                    },
                    token,
                }
            );
        },
        // ... success/error handlers ...
    });
    
    return mutation;
}
```

**Important:** When calling `writingToolApi`, always include the `flow` field in the data object.

---

## Hook Integration

### Using the Generic `useWritingTool` Hook

For simple tools without custom logic, use the generic hook:

```typescript
// In your component
import { useWritingTool } from '@/hooks';

export function MyComponent() {
    const { mutate, isPending, data } = useWritingTool('my-flow-name');
    
    const handleSubmit = (formData) => {
        mutate({
            text: formData.text,
            customParameter: formData.custom,
        });
    };
    
    return (
        // ...
    );
}
```

**How it works:**
1. The hook automatically adds `flow: 'my-flow-name'` to all requests
2. It handles Firebase authentication
3. It manages loading and error states
4. It validates input against the schema

### When to Create a Custom Hook

Create a custom hook when you need:
- Pre/post-processing of data
- Multiple API calls
- Conditional logic
- Custom error handling
- Integration with other hooks

```typescript
export function useComplexTool() {
    const { firebaseUser } = useAuth();
    const { mutate: firstStep } = useWritingTool('first-flow');
    const { mutate: secondStep } = useWritingTool('second-flow');
    
    const complexMutation = useMutation({
        mutationFn: async (input) => {
            // Step 1
            const result1 = await firstStep(input);
            
            // Step 2
            const result2 = await secondStep({
                input: result1.output,
                // ...
            });
            
            return result2;
        },
    });
    
    return complexMutation;
}
```

---

## API Route Integration

### The Writing Tools Route Handler

```typescript
// File: src/app/api/writing-tools/[tool]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// ... import all schemas and flows ...

const toolConfig = {
    'flow-name-1': {
        flow: flowFunction1,
        schema: FlowName1InputSchema,
        creditCost: 1,
    },
    'flow-name-2': {
        flow: flowFunction2,
        schema: FlowName2InputSchema,
        creditCost: 2,
    },
    // ... more tools ...
};

export async function POST(
    request: NextRequest,
    { params }: { params: { tool: string } }
) {
    try {
        const toolName = params.tool;
        const toolHandler = toolConfig[toolName];
        
        if (!toolHandler) {
            return NextResponse.json(
                { error: `Unknown tool: ${toolName}` },
                { status: 404 }
            );
        }
        
        // Validate request
        const body = await request.json();
        const validated = toolHandler.schema.parse(body);
        
        // Execute flow
        const result = await toolHandler.flow(validated);
        
        // Return response
        return NextResponse.json(result);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.errors },
                { status: 400 }
            );
        }
        
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
```

### Adding New Tools to Route

When adding a new tool:

```typescript
// 1. Import schema and flow
import { MyNewToolInputSchema } from '@/ai/schemas';
import { myNewTool } from '@/ai/flows';

// 2. Add to toolConfig
const toolConfig = {
    // ... existing tools ...
    'my-new-tool': {
        flow: myNewTool,
        schema: MyNewToolInputSchema,
        creditCost: 1,  // Adjust based on complexity/cost
    },
};

// 3. Done! The route handler processes it automatically
```

---

## Best Practices

### 1. Always Use Literal Flow Fields

```typescript
// ✓ CORRECT
export const FlowInputSchema = z.object({
    flow: z.literal('exact-flow-name'),
});

// ✗ WRONG - Will fail validation
return writingToolApi('/api/writing-tools/my-tool', {
    data: { /* missing flow field */ },
});
```

### 2. Match Flow Names Across All Layers

```typescript
// Schema
z.literal('my-tool')

// Hook
flow: 'my-tool'

// Route handler
'my-tool': { flow: myTool, schema: ... }

// API endpoint
/api/writing-tools/my-tool
```

### 3. Define Optional Fields Correctly

```typescript
// ✓ CORRECT - Optional field
optionalField: z.string().optional()

// ✗ WRONG - Always required
optionalField: z.string()

// ✗ WRONG - May cause issues
optionalField: z.string().default('')
```

### 4. Use Base Schemas to Reduce Duplication

```typescript
// ✓ CORRECT - Reusable base
export const BaseTextInputSchema = z.object({
    flow: z.literal('placeholder'),
    text: z.string(),
});

export const RewriteInputSchema = BaseTextInputSchema.extend({
    flow: z.literal('rewrite'),
    style: z.string().optional(),
});

// ✗ WRONG - Duplicates schema definition
export const RewriteInputSchema = z.object({
    flow: z.literal('rewrite'),
    text: z.string(),
    style: z.string().optional(),
});
```

### 5. Validate Early in Flows

```typescript
export const myFlow = ai.defineFlow({
    inputSchema: MyInputSchema,
    outputSchema: MyOutputSchema,
}, async (input) => {
    // Validate input at entry point
    const validated = MyInputSchema.parse(input);
    
    // Use validated data
    // ...
});
```

### 6. Document Complex Schemas

```typescript
/**
 * Input schema for the advanced text rewriting tool.
 * 
 * @example
 * {
 *   flow: 'advanced-rewrite',
 *   text: 'Original text...',
 *   style: 'academic',
 *   targetAudience: 'professionals',
 * }
 */
export const AdvancedRewriteInputSchema = z.object({
    flow: z.literal('advanced-rewrite'),
    text: z.string().min(10),
    style: z.enum(['academic', 'casual', 'technical']),
    targetAudience: z.string().optional(),
});
```

---

## Common Patterns

### Pattern 1: Text Processing Tools

```typescript
// Schema
export const TextProcessorInputSchema = BaseTextInputSchema.extend({
    flow: z.literal('text-processor'),
    processingMode: z.enum(['compress', 'expand', 'beautify']),
});

// Usage
const { mutate } = useWritingTool('text-processor');
mutate({
    text: userInput,
    processingMode: 'compress',
});
```

### Pattern 2: Tools with Multiple Parameters

```typescript
// Schema
export const AdvancedToolInputSchema = BaseTextInputSchema.extend({
    flow: z.literal('advanced-tool'),
    targetAudience: z.string(),
    tone: z.string(),
    language: z.string(),
    customOptions: z.object({
        option1: z.boolean().optional(),
        option2: z.number().optional(),
    }).optional(),
});

// Usage
mutate({
    text: input,
    targetAudience: 'developers',
    tone: 'professional',
    language: 'en',
    customOptions: {
        option1: true,
    },
});
```

### Pattern 3: File-Based Tools

```typescript
// Schema
export const FileProcessorInputSchema = z.object({
    flow: z.literal('file-processor'),
    fileContent: z.string(),
    fileName: z.string(),
    fileType: z.enum(['pdf', 'docx', 'txt']),
    processingOptions: z.object({
        extractImages: z.boolean().optional(),
        preserveFormatting: z.boolean().optional(),
    }).optional(),
});

// Usage
mutate({
    fileContent: base64EncodedContent,
    fileName: 'document.pdf',
    fileType: 'pdf',
    processingOptions: {
        extractImages: true,
    },
});
```

### Pattern 4: Chained Operations

```typescript
// Schema 1
export const Step1InputSchema = BaseTextInputSchema.extend({
    flow: z.literal('chain-step-1'),
});

// Schema 2 (takes output of step 1)
export const Step2InputSchema = BaseTextInputSchema.extend({
    flow: z.literal('chain-step-2'),
    previousOutput: z.string(),
});

// Hook
export function useChainedOperation() {
    const step1 = useWritingTool('chain-step-1');
    const step2 = useWritingTool('chain-step-2');
    
    return useMutation({
        mutationFn: async (input: string) => {
            const result1 = await step1.mutateAsync({
                text: input,
            });
            
            const result2 = await step2.mutateAsync({
                text: input,
                previousOutput: result1.output,
            });
            
            return result2;
        },
    });
}
```

---

## Troubleshooting

### Issue: "Validation failed" Error

**Symptoms:** API returns 400 with validation error

**Causes:**
1. Missing `flow` field in request
2. Wrong `flow` value (doesn't match schema literal)
3. Missing required fields
4. Wrong field types
5. Field value doesn't match enum

**Solution:**
```typescript
// Check 1: Is flow field included?
{
    flow: 'my-tool',  // ← Must be present
    text: 'content',
}

// Check 2: Does flow match exactly?
z.literal('my-tool')  // ← Must match exactly
mutate({ flow: 'my-tool' })  // ← Not 'my_tool' or 'myTool'

// Check 3: Are all required fields present?
export const MySchema = z.object({
    flow: z.literal('my-tool'),
    requiredField: z.string(),  // ← No .optional()
});

// Check 4: Are field types correct?
z.string()    // ← Pass strings
z.number()    // ← Pass numbers
z.enum([...]) // ← Pass only allowed values
```

### Issue: "Unknown tool" Error

**Symptoms:** API returns 404 with "Unknown tool" message

**Causes:**
1. Tool name not registered in `toolConfig`
2. Route slug doesn't match tool name
3. Typo in tool name

**Solution:**
```typescript
// Ensure tool is registered in toolConfig
const toolConfig = {
    'my-tool': {  // ← Must match API route slug
        flow: myTool,
        schema: MyToolInputSchema,
        creditCost: 1,
    },
};

// Endpoint must match
/api/writing-tools/my-tool  // ← Exact match
```

### Issue: Type Mismatch in Hook

**Symptoms:** TypeScript error "Type 'X' is not assignable to type 'Y'"

**Causes:**
1. Hook input type doesn't match schema
2. Missing required fields
3. Extra fields not in schema

**Solution:**
```typescript
// Get type from schema
import type { MyToolInput } from '@/ai/schemas';

// Use typed mutation
const mutation = useMutation<MyToolOutput, Error, MyToolInput>({
    mutationFn: async (data) => {
        // data is now properly typed
        return writingToolApi('/api/writing-tools/my-tool', {
            data: {
                flow: 'my-tool',
                ...data,
            },
            token,
        });
    },
});
```

### Issue: Flow Field Lost in Request

**Symptoms:** Schema validation fails saying `flow` is missing

**Causes:**
1. `useWritingTool` hook not used
2. Direct API call doesn't include `flow`
3. Data spreading loses `flow` field

**Solution:**
```typescript
// Option 1: Use generic hook (auto-adds flow)
const { mutate } = useWritingTool('my-tool');
mutate({ text: 'content' });  // ← flow auto-added

// Option 2: Manually include flow
writingToolApi('/api/writing-tools/my-tool', {
    data: {
        flow: 'my-tool',  // ← Explicitly include
        text: 'content',
    },
    token,
});

// Option 3: Spread carefully
const baseData = { text: 'content' };
const fullData = {
    flow: 'my-tool',
    ...baseData,  // ← Spreads text, not flow
};
```

---

## Quick Reference Checklist

### Before Adding a New Tool ✓

- [ ] Schema defined in `src/ai/schemas/flows.ts`
- [ ] `flow` field uses exact kebab-case literal value
- [ ] Input/Output schemas created with proper types
- [ ] AI flow defined in `src/ai/flows/` directory
- [ ] Flow exported from `src/ai/flows/index.ts`
- [ ] Tool registered in API route `toolConfig`
- [ ] Hook created (if needed) with correct `flow` value
- [ ] All flow names match across layers (schema, hook, route)

### Before Deploying ✓

- [ ] No schema validation errors in logs
- [ ] All required fields are sent from client
- [ ] `flow` field matches schema literal exactly
- [ ] Route handler includes tool in `toolConfig`
- [ ] No unused schema imports
- [ ] No duplicate flow definitions

### When Debugging ✓

- [ ] Check flow name matches exactly (kebab-case)
- [ ] Verify `flow` field is in request body
- [ ] Confirm all required fields are present
- [ ] Validate field types match schema
- [ ] Check for typos in enum values
- [ ] Ensure schema is imported in route handler

---

## Related Documentation

- [API Development Guide](./docs/README.md)
- [Genkit Documentation](https://firebase.google.com/docs/genkit)
- [Zod Validation Library](https://zod.dev)
- [TypeScript Patterns](./docs/TYPESCRIPT_PATTERNS.md)

---

## Contributing

When adding new tools or modifying schemas:

1. Follow the patterns documented here
2. Keep schemas in `src/ai/schemas/flows.ts`
3. Use base schemas to reduce duplication
4. Always include the `flow` field as a literal
5. Document complex schemas with JSDoc
6. Test validation with sample data
7. Update this guide if introducing new patterns

---

**Last Updated:** February 2026
**Version:** 1.0
