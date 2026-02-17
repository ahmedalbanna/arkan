# Schema Validation - Real World Examples

Complete, working examples for common schema validation scenarios.

## Table of Contents

1. [Simple Text Processing Tool](#simple-text-processing-tool)
2. [Tool with Multiple Parameters](#tool-with-multiple-parameters)
3. [Tool with Nested Configuration](#tool-with-nested-configuration)
4. [Tool with Enum Selection](#tool-with-enum-selection)
5. [Extending Existing Schemas](#extending-existing-schemas)

---

## Simple Text Processing Tool

A basic tool that takes text and returns processed text.

### Schema Definition

```typescript
// File: src/ai/schemas/flows.ts

export const SimpleProcessToolInputSchema = BaseTextInputSchema.extend({
    flow: z.literal('simple-process'),
    // text is inherited from BaseTextInputSchema
    // No additional fields needed
});

export type SimpleProcessToolInput = z.infer<typeof SimpleProcessToolInputSchema>;

export const SimpleProcessToolOutputSchema = z.object({
    processedText: z.string(),
    originalLength: z.number(),
    processedLength: z.number(),
});

export type SimpleProcessToolOutput = z.infer<typeof SimpleProcessToolOutputSchema>;
```

### Flow Implementation

```typescript
// File: src/ai/flows/simple-process.ts

import { ai } from '@/ai/genkit';
import { 
    SimpleProcessToolInputSchema, 
    SimpleProcessToolOutputSchema 
} from '@/ai/schemas';

export const simpleProcess = ai.defineFlow({
    name: 'simpleProcess',
    inputSchema: SimpleProcessToolInputSchema,
    outputSchema: SimpleProcessToolOutputSchema,
}, async (input) => {
    // Validate at entry
    const validated = SimpleProcessToolInputSchema.parse(input);
    
    // Process the text
    const processedText = validated.text.trim().toLowerCase();
    
    return {
        processedText,
        originalLength: validated.text.length,
        processedLength: processedText.length,
    };
});
```

### Hook Usage

```typescript
// File: src/hooks/writing-tools/use-simple-process-logic.ts

import { useWritingTool } from './use-writing-tool';

export function useSimpleProcess() {
    return useWritingTool('simple-process');
}

// OR using the generic hook directly in components:
// const { mutate, isPending, data } = useWritingTool('simple-process');
```

### Component Usage

```typescript
// File: src/app/writing-tools/simple-process/page.tsx

'use client';

import { useSimpleProcess } from '@/hooks';

export default function SimpleProcessPage() {
    const { mutate, isPending, data, error } = useSimpleProcess();
    const [text, setText] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutate({ text });  // flow field auto-added by hook
    };
    
    return (
        <div>
            <form onSubmit={handleSubmit}>
                <textarea 
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter text to process"
                />
                <button disabled={isPending}>
                    {isPending ? 'Processing...' : 'Process'}
                </button>
            </form>
            
            {error && <p className="error">{error.message}</p>}
            
            {data && (
                <div>
                    <h3>Results:</h3>
                    <p>{data.processedText}</p>
                    <p>Original: {data.originalLength} chars</p>
                    <p>Processed: {data.processedLength} chars</p>
                </div>
            )}
        </div>
    );
}
```

### API Route Registration

```typescript
// File: src/app/api/writing-tools/[tool]/route.ts

import { SimpleProcessToolInputSchema } from '@/ai/schemas';
import { simpleProcess } from '@/ai/flows';

const toolConfig = {
    // ... existing tools ...
    
    'simple-process': {
        flow: simpleProcess,
        schema: SimpleProcessToolInputSchema,
        creditCost: 1,
    },
};
```

---

## Tool with Multiple Parameters

A more complex tool that accepts several parameters with optional fields.

### Schema Definition

```typescript
// File: src/ai/schemas/flows.ts

export const MultiParamToolInputSchema = BaseTextInputSchema.extend({
    flow: z.literal('multi-param-tool'),
    
    // Required parameters
    processingMode: z.enum(['fast', 'balanced', 'thorough']),
    targetLength: z.enum(['short', 'medium', 'long']),
    
    // Optional parameters
    preserveFormatting: z.boolean().optional(),
    includeMetadata: z.boolean().optional(),
    customSuffix: z.string().optional(),
});

export type MultiParamToolInput = z.infer<typeof MultiParamToolInputSchema>;

export const MultiParamToolOutputSchema = z.object({
    result: z.string(),
    metadata: z.object({
        processingTime: z.number(),
        mode: z.string(),
        targetLength: z.string(),
    }).optional(),
});

export type MultiParamToolOutput = z.infer<typeof MultiParamToolOutputSchema>;
```

### Flow Implementation

```typescript
// File: src/ai/flows/multi-param-tool.ts

import { ai } from '@/ai/genkit';
import { 
    MultiParamToolInputSchema, 
    MultiParamToolOutputSchema 
} from '@/ai/schemas';

export const multiParamTool = ai.defineFlow({
    name: 'multiParamTool',
    inputSchema: MultiParamToolInputSchema,
    outputSchema: MultiParamToolOutputSchema,
}, async (input) => {
    const validated = MultiParamToolInputSchema.parse(input);
    const startTime = Date.now();
    
    // Process based on parameters
    let result = validated.text;
    
    // Apply processing mode
    switch (validated.processingMode) {
        case 'fast':
            result = result.substring(0, 100);
            break;
        case 'balanced':
            // Normal processing
            break;
        case 'thorough':
            // More detailed processing
            break;
    }
    
    // Apply target length
    if (validated.targetLength === 'short') {
        result = result.substring(0, 50);
    }
    
    // Apply optional suffix
    if (validated.customSuffix) {
        result += ` ${validated.customSuffix}`;
    }
    
    const processingTime = Date.now() - startTime;
    
    return {
        result,
        metadata: validated.includeMetadata ? {
            processingTime,
            mode: validated.processingMode,
            targetLength: validated.targetLength,
        } : undefined,
    };
});
```

### Hook Implementation

```typescript
// File: src/hooks/writing-tools/use-multi-param-tool-logic.ts

import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks';
import { writingToolApi } from '@/services/api/writingToolsService';
import type { MultiParamToolInput, MultiParamToolOutput } from '@/ai/schemas';

export function useMultiParamTool() {
    const { firebaseUser } = useAuth();
    const { toast } = useToast();
    
    return useMutation<MultiParamToolOutput, Error, Omit<MultiParamToolInput, 'flow'>>({
        mutationFn: async (input) => {
            if (!firebaseUser) throw new Error('Not authenticated');
            const token = await firebaseUser.getIdToken();
            
            return writingToolApi<MultiParamToolInput, MultiParamToolOutput>(
                '/api/writing-tools/multi-param-tool',
                {
                    data: {
                        flow: 'multi-param-tool',  // ← CRITICAL
                        ...input,
                    },
                    token,
                }
            );
        },
        onSuccess: () => {
            toast({
                title: 'Success',
                description: 'Tool executed successfully',
            });
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
}
```

### Component Usage

```typescript
'use client';

import { useMultiParamTool } from '@/hooks';

export function MultiParamToolComponent() {
    const { mutate, isPending, data } = useMultiParamTool();
    const [formData, setFormData] = useState({
        text: '',
        processingMode: 'balanced' as const,
        targetLength: 'medium' as const,
        preserveFormatting: false,
        includeMetadata: true,
        customSuffix: '',
    });
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutate(formData);
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <textarea
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            />
            
            <select 
                value={formData.processingMode}
                onChange={(e) => setFormData({ 
                    ...formData, 
                    processingMode: e.target.value as any 
                })}
            >
                <option value="fast">Fast</option>
                <option value="balanced">Balanced</option>
                <option value="thorough">Thorough</option>
            </select>
            
            <select 
                value={formData.targetLength}
                onChange={(e) => setFormData({ 
                    ...formData, 
                    targetLength: e.target.value as any 
                })}
            >
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
            </select>
            
            <label>
                <input 
                    type="checkbox"
                    checked={formData.preserveFormatting}
                    onChange={(e) => setFormData({ 
                        ...formData, 
                        preserveFormatting: e.target.checked 
                    })}
                />
                Preserve Formatting
            </label>
            
            <label>
                <input 
                    type="checkbox"
                    checked={formData.includeMetadata}
                    onChange={(e) => setFormData({ 
                        ...formData, 
                        includeMetadata: e.target.checked 
                    })}
                />
                Include Metadata
            </label>
            
            <input
                type="text"
                placeholder="Custom suffix (optional)"
                value={formData.customSuffix}
                onChange={(e) => setFormData({ 
                    ...formData, 
                    customSuffix: e.target.value 
                })}
            />
            
            <button disabled={isPending}>
                {isPending ? 'Processing...' : 'Process'}
            </button>
            
            {data && (
                <div>
                    <h3>Result:</h3>
                    <p>{data.result}</p>
                    {data.metadata && (
                        <div>
                            <p>Time: {data.metadata.processingTime}ms</p>
                            <p>Mode: {data.metadata.mode}</p>
                        </div>
                    )}
                </div>
            )}
        </form>
    );
}
```

---

## Tool with Nested Configuration

A tool that accepts complex nested configuration objects.

### Schema Definition

```typescript
// File: src/ai/schemas/flows.ts

export const NestedConfigToolInputSchema = BaseTextInputSchema.extend({
    flow: z.literal('nested-config-tool'),
    
    config: z.object({
        output: z.object({
            format: z.enum(['plain', 'markdown', 'html']),
            encoding: z.enum(['utf-8', 'ascii']).optional(),
        }),
        
        processing: z.object({
            removeEmojis: z.boolean().optional(),
            removeSpecialChars: z.boolean().optional(),
            convertToLowercase: z.boolean().optional(),
        }).optional(),
        
        validation: z.object({
            minLength: z.number().min(1).optional(),
            maxLength: z.number().optional(),
            allowNumbers: z.boolean().optional(),
        }).optional(),
    }),
});

export type NestedConfigToolInput = z.infer<typeof NestedConfigToolInputSchema>;

export const NestedConfigToolOutputSchema = z.object({
    result: z.string(),
    stats: z.object({
        inputLength: z.number(),
        outputLength: z.number(),
        changesApplied: z.array(z.string()),
    }),
});

export type NestedConfigToolOutput = z.infer<typeof NestedConfigToolOutputSchema>;
```

---

## Tool with Enum Selection

A tool that uses enums for structured choices.

### Schema Definition

```typescript
// File: src/ai/schemas/flows.ts

export const EnumToolInputSchema = z.object({
    flow: z.literal('enum-tool'),
    text: z.string(),
    
    // Primary enum
    documentType: z.enum([
        'academic',
        'business',
        'creative',
        'technical',
    ]),
    
    // Secondary enum
    tone: z.enum([
        'formal',
        'casual',
        'humorous',
        'neutral',
    ]),
    
    // Optional enum
    language: z.enum([
        'en',
        'es',
        'fr',
        'de',
        'ar',
    ]).optional(),
});

export type EnumToolInput = z.infer<typeof EnumToolInputSchema>;

export const EnumToolOutputSchema = z.object({
    result: z.string(),
    appliedSettings: z.object({
        documentType: z.string(),
        tone: z.string(),
        language: z.string().optional(),
    }),
});

export type EnumToolOutput = z.infer<typeof EnumToolOutputSchema>;
```

### Usage in Hook

```typescript
const { mutate } = useWritingTool('enum-tool');

// Type-safe - only allows specified enum values
mutate({
    text: 'My text',
    documentType: 'academic',    // ✓ Valid
    tone: 'formal',              // ✓ Valid
    language: 'en',              // ✓ Valid
});

// Type error - prevents invalid values
mutate({
    text: 'My text',
    documentType: 'invalid',     // ✗ Type error
    tone: 'formal',
});
```

---

## Extending Existing Schemas

How to build on existing schemas without duplicating code.

### Scenario: Create a "Premium" Version of Existing Tool

```typescript
// Original tool
export const BasicToolInputSchema = BaseTextInputSchema.extend({
    flow: z.literal('basic-tool'),
});

// Premium version - extends the basic one
export const PremiumToolInputSchema = BasicToolInputSchema.extend({
    flow: z.literal('premium-tool'),  // Override flow
    
    // Add premium-only features
    advancedOptions: z.object({
        enableAI: z.boolean(),
        customModel: z.string().optional(),
        priority: z.enum(['normal', 'high', 'urgent']).optional(),
    }).optional(),
    
    webhookUrl: z.string().url().optional(),
});
```

### Scenario: Merge Multiple Base Schemas

```typescript
// Combine two base schemas
export const CombinedToolInputSchema = BaseTextInputSchema
    .merge(BaseControlsSchema)
    .extend({
        flow: z.literal('combined-tool'),
        // Add tool-specific fields
        algorithm: z.enum(['v1', 'v2', 'v3']),
    });
```

