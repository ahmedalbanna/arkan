# Quick Start - Dynamic Flow System

**Get started with the Dynamic Flow System in 5 minutes!**

---

## 🚀 Quick Start

### 1. Import the Executor

```typescript
import { createEnhancedExecutor } from '@/ai/dynamic-flow';
import { z } from 'zod';
```

### 2. Define Your Flow

```typescript
const flowConfig = {
  id: 'my_flow',
  name: 'my-first-flow',
  description: 'My first dynamic flow',
  version: '1.0.0',
  tags: ['example'],
  status: 'active',
  
  // What goes in
  inputSchema: z.object({
    topic: z.string()
  }),
  
  // What comes out
  outputSchema: z.object({
    content: z.string()
  }),
  
  // What happens
  steps: [
    {
      id: 'step_1',
      name: 'Generate Content',
      type: 'prompt',
      config: {
        prompt: 'Write about {{input.topic}}',
        model: 'gemini-2.0-flash-exp'
      }
    }
  ],
  
  // How to extract output
  outputMapping: {
    content: 'step_1'
  }
};
```

### 3. Execute

```typescript
const executor = createEnhancedExecutor();
const result = await executor.execute(flowConfig, { 
  topic: 'AI' 
});

console.log(result.output.content);
console.log(result.metrics); // tokens, cost, duration
```

---

## 📚 Common Patterns

### Multi-Step Flow

```typescript
steps: [
  {
    id: 'research',
    type: 'prompt',
    config: { prompt: 'Research {{input.query}}' },
    contextMapping: { output: { '': 'findings' } }
  },
  {
    id: 'write',
    type: 'prompt',
    config: { prompt: 'Write based on {{findings}}' }
  }
]
```

### Conditional Logic

```typescript
{
  id: 'premium_step',
  type: 'prompt',
  condition: {
    expression: 'input.userType === "premium"'
  },
  config: { /* ... */ }
}
```

### Error Handling

```typescript
{
  id: 'resilient_step',
  type: 'prompt',
  errorHandling: {
    retries: 3,
    fallback: 'backup_step',
    continueOnError: false
  },
  config: { /* ... */ }
}
```

### Loop Through Items

```typescript
{
  id: 'process_items',
  type: 'loop',
  config: {
    iterateOver: 'items',
    maxIterations: 10,
    steps: [ /* nested steps */ ]
  }
}
```

### Parallel Execution

```typescript
{
  id: 'parallel_tasks',
  type: 'parallel',
  config: {
    allowPartialFailure: true,
    steps: [
      { id: 'task_1', /* ... */ },
      { id: 'task_2', /* ... */ }
    ]
  }
}
```

---

## 🎯 Step Types

| Type | Purpose | Example |
|------|---------|---------|
| `prompt` | AI generation | Generate content |
| `tool` | Call external tool | Search, RAG retrieval |
| `condition` | Branching logic | Check user type |
| `loop` | Iterate over array | Process multiple items |
| `parallel` | Concurrent execution | Run tasks in parallel |

---

## 🔧 Context Mapping

### Input Mapping
```typescript
contextMapping: {
  input: {
    'stepInputField': 'contextVariable'
  }
}
```

### Output Mapping
```typescript
contextMapping: {
  output: {
    'stepOutputPath': 'contextVariable'
  }
}
```

### Access Variables
- `input.field` - Input data
- `variableName` - Context variable
- `stepId.output` - Step result
- `context.duration` - Special variables

---

## 📊 Result Object

```typescript
{
  success: boolean,
  output: any,              // Your result
  error?: Error,
  traceId: string,
  metrics: {
    totalSteps: number,
    successfulSteps: number,
    failedSteps: number,
    skippedSteps: number,
    totalTokens: number,
    totalCost: number
  },
  duration: number
}
```

---

## 🛠️ Template Variables

In prompts and configs:
- `{{input.field}}` - Access input
- `{{variable}}` - Access context variable
- `{{stepId.output}}` - Access step result

With helpers:
- `{{uppercase text}}` - Transform text
- `{{join items ", "}}` - Join array
- `{{#if condition}}...{{/if}}` - Conditional
- `{{#each items}}...{{/each}}` - Loop

---

## ⚡ Best Practices

### ✅ Do
- Use clear step names
- Define explicit schemas
- Handle errors gracefully
- Map outputs to context
- Use descriptive variable names

### ❌ Don't
- Skip input validation
- Ignore error handling
- Create circular dependencies
- Use eval-like patterns
- Hardcode sensitive data

---

## 🧪 Testing Your Flow

```typescript
import { createEnhancedExecutor } from '@/ai/dynamic-flow';

describe('My Flow', () => {
  it('should generate content', async () => {
    const executor = createEnhancedExecutor();
    const result = await executor.execute(flowConfig, {
      topic: 'Test'
    });
    
    expect(result.success).toBe(true);
    expect(result.output.content).toBeDefined();
  });
});
```

---

## 📖 More Resources

- **Full Documentation**: `DYNAMIC_FLOWS_EXPANDED_PLAN.md`
- **Implementation Guide**: `IMPLEMENTATION_COMPLETE.md`
- **Usage Examples**: `src/ai/dynamic-flow/example.ts`
- **API Reference**: `src/ai/dynamic-flow/README.md`

---

## 🆘 Troubleshooting

### Flow doesn't execute
- Check flow status is 'active'
- Validate input against schema
- Ensure all step IDs are unique

### Template not rendering
- Check variable names match context
- Use correct syntax: `{{variable}}`
- Verify template helpers syntax

### Condition not working
- Use simple expressions first
- Check variable access paths
- Test condition separately

### Performance issues
- Reduce step count
- Optimize prompts
- Use parallel steps
- Enable caching

---

## 💡 Quick Tips

1. **Start Simple**: Begin with a single prompt step
2. **Test Incrementally**: Add complexity gradually
3. **Use Context Mapping**: Keep data flow clean
4. **Handle Errors**: Always add retry/fallback
5. **Monitor Metrics**: Track tokens and cost

---

**Ready to build dynamic flows?** 🚀

Start with the examples in `src/ai/dynamic-flow/example.ts`!
