# Model Utilities Examples

This directory contains practical examples demonstrating how to use the AI model selection and management utilities.

## Files

### `basic-usage.ts`
Simple examples for getting started:
- **Example 1**: Simple model selection by complexity
- **Example 2**: Task-specific model selection
- **Example 3**: Queue-managed execution
- **Example 4**: Performance-based selection
- **Example 5**: Input size-based selection

### `advanced-usage.ts`
Advanced patterns for production use:
- **Example 1**: Smart selection with metadata
- **Example 2**: Performance monitoring
- **Example 3**: Queue management
- **Example 4**: Health checking
- **Example 5**: Automatic fallback
- **Example 6**: Text chunking for large documents
- **Example 7**: Configuration validation
- **Example 8**: Complete production flow
- **Example 9**: Monitoring dashboard
- **Example 10**: Batch processing

## Running Examples

### Option 1: Import and Run Specific Examples

```typescript
import { example1_simpleSelection } from '@/ai/examples/basic-usage';

await example1_simpleSelection();
```

### Option 2: Run All Examples

```typescript
import { runAllBasicExamples } from '@/ai/examples/basic-usage';
import { runAllAdvancedExamples } from '@/ai/examples/advanced-usage';

// Run all basic examples
await runAllBasicExamples();

// Run all advanced examples
await runAllAdvancedExamples();
```

### Option 3: Create Test Script

Create a test file `scripts/test-model-utilities.ts`:

```typescript
import { runAllBasicExamples } from '../src/ai/examples/basic-usage';
import { runAllAdvancedExamples } from '../src/ai/examples/advanced-usage';

async function main() {
  console.log('Testing Model Utilities...\n');
  
  await runAllBasicExamples();
  console.log('\n\n');
  await runAllAdvancedExamples();
  
  console.log('\nAll tests completed!');
}

main().catch(console.error);
```

Then run:
```bash
npx ts-node scripts/test-model-utilities.ts
```

## Quick Start Guide

### 1. Basic Model Selection

```typescript
import { selectModel, TaskComplexity } from '@/ai';

// Select by complexity
const model = selectModel({ taskComplexity: TaskComplexity.MODERATE });

// Select for academic work
const academicModel = selectModel({ 
  isAcademic: true, 
  hasRAGContext: true 
});
```

### 2. Queue Management

```typescript
import { executeWithQueue, generateRequestId } from '@/ai';

const requestId = generateRequestId();
const result = await executeWithQueue(
  requestId,
  model,
  'my-flow',
  async () => {
    // Your AI operation
    return await myAIOperation();
  }
);
```

### 3. Performance Tracking

```typescript
import { trackRequest, performanceMonitor } from '@/ai';

// Track a request
await trackRequest(requestId, model, flowName, operation);

// Get statistics
const stats = performanceMonitor.getModelStatistics(model);
console.log(stats);
```

### 4. Health Checking

```typescript
import { isModelHealthy, getAvailableModel } from '@/ai';

// Check health
const healthy = await isModelHealthy(model);

// Get available model with fallback
const availableModel = await getAvailableModel(preferredModel);
```

### 5. Complete Flow

```typescript
import {
  selectModel,
  executeWithQueue,
  trackRequest,
  generateRequestId,
  estimateTokenCount,
  validateModelConfig,
  TaskComplexity,
} from '@/ai';

async function processText(text: string) {
  // 1. Select model
  const model = selectModel({
    taskComplexity: TaskComplexity.MODERATE,
    inputTokens: estimateTokenCount(text),
  });

  // 2. Validate
  const validation = validateModelConfig(model, text);
  if (!validation.valid) {
    throw new Error('Invalid config');
  }

  // 3. Execute
  const requestId = generateRequestId();
  return await executeWithQueue(
    requestId,
    model,
    'process-text',
    async () => {
      return await trackRequest(
        requestId,
        model,
        'process-text',
        async () => {
          // Your operation
          return await yourAIFlow(text);
        }
      );
    }
  );
}
```

## Common Patterns

### Pattern 1: Academic Document Processing

```typescript
const model = selectModel({
  isAcademic: true,
  hasRAGContext: true,
  requiresDeepReasoning: true,
});
// Result: ollama/llama3.1:latest
```

### Pattern 2: Fast Real-time Chat

```typescript
const model = selectModel({
  performancePriority: PerformancePriority.SPEED,
  inputTokens: 100,
});
// Result: ollama/gemma:2b
```

### Pattern 3: Structured JSON Output

```typescript
const model = selectModel({
  requiresStructuredOutput: true,
  taskComplexity: TaskComplexity.MODERATE,
});
// Result: ollama/phi3:mini-4k
```

### Pattern 4: Large Document Analysis

```typescript
import { chunkText, getOptimalChunkSize } from '@/ai';

const chunks = chunkText(
  longDocument,
  getOptimalChunkSize(model),
  100 // overlap
);

const results = await Promise.all(
  chunks.map(chunk => processChunk(chunk, model))
);
```

## Best Practices

### ✅ DO

1. **Always validate configuration before execution**
   ```typescript
   const validation = validateModelConfig(model, input);
   if (!validation.valid) throw new Error('Invalid');
   ```

2. **Use queue for Llama 3 8B**
   ```typescript
   await executeWithQueue(id, OLLAMA_MODELS.LLAMA3_8B, flow, operation);
   ```

3. **Track performance for optimization**
   ```typescript
   await trackRequest(id, model, flow, operation);
   ```

4. **Implement fallback mechanisms**
   ```typescript
   await executeWithFallback(model, operation);
   ```

5. **Check health periodically**
   ```typescript
   startHealthMonitoring(60000);
   ```

### ❌ DON'T

1. **Don't hardcode models**
   ```typescript
   // Bad
   const model = 'ollama/gemma:2b';
   
   // Good
   const model = selectModel(criteria);
   ```

2. **Don't skip validation**
   ```typescript
   // Bad
   await execute(largeInput);
   
   // Good
   const validation = validateModelConfig(model, largeInput);
   if (validation.valid) await execute(largeInput);
   ```

3. **Don't ignore queue for heavy models**
   ```typescript
   // Bad
   await heavyModelOperation();
   
   // Good
   await executeWithQueue(id, model, flow, operation);
   ```

4. **Don't process large inputs without chunking**
   ```typescript
   // Bad
   await process(veryLongText);
   
   // Good
   const chunks = chunkText(veryLongText, optimalSize);
   await Promise.all(chunks.map(processChunk));
   ```

## Monitoring and Debugging

### Generate Reports

```typescript
// Performance report
console.log(performanceMonitor.generateReport());

// Queue status
console.log(queueManager.generateReport());

// Health status
console.log(await healthMonitor.generateHealthReport());
```

### Debug Slow Requests

```typescript
const slowest = performanceMonitor.getSlowestRequests(10);
slowest.forEach(req => {
  console.log(`${req.flowName}: ${req.duration}ms`);
});
```

### Track Errors

```typescript
const errors = performanceMonitor.getRecentErrors(10);
errors.forEach(err => {
  console.log(`${err.model}: ${err.error}`);
});
```

## Integration with Flows

### Update Existing Flow

Before:
```typescript
export async function myFlow(input: Input) {
  const result = await ai.generate({
    model: 'ollama/gemma:2b',
    prompt: input.prompt,
  });
  return result;
}
```

After:
```typescript
import { 
  selectModel, 
  executeWithQueue, 
  trackRequest, 
  generateRequestId 
} from '@/ai';

export async function myFlow(input: Input) {
  const model = selectModel({
    flowName: 'my-flow',
    inputTokens: estimateTokenCount(input.prompt),
  });

  const requestId = generateRequestId();
  
  return await executeWithQueue(
    requestId,
    model,
    'my-flow',
    async () => {
      return await trackRequest(
        requestId,
        model,
        'my-flow',
        async () => {
          return await ai.generate({
            model,
            prompt: input.prompt,
          });
        }
      );
    }
  );
}
```

## Testing

Create tests to verify utility behavior:

```typescript
import { describe, it, expect } from '@jest/globals';
import { selectModel, TaskComplexity } from '@/ai';

describe('Model Selection', () => {
  it('should select Gemma 2B for simple tasks', () => {
    const model = selectModel({ taskComplexity: TaskComplexity.SIMPLE });
    expect(model).toBe('ollama/gemma:2b');
  });

  it('should select Llama 3 8B for academic tasks', () => {
    const model = selectModel({ isAcademic: true });
    expect(model).toBe('ollama/llama3.1:latest');
  });
});
```

## Troubleshooting

### Issue: High Memory Usage
**Solution**: Check queue status and reduce Llama 3 8B concurrency
```typescript
queueManager.setMaxConcurrent(OLLAMA_MODELS.LLAMA3_8B, 1);
```

### Issue: Slow Responses
**Solution**: Switch to faster model or check health
```typescript
const healthy = await isModelHealthy(model);
if (!healthy) {
  model = selectModel({ performancePriority: PerformancePriority.SPEED });
}
```

### Issue: Request Failures
**Solution**: Use fallback mechanism
```typescript
await executeWithFallback(model, operation, 2);
```

## Additional Resources

- **Main Guide**: `../MODEL_UTILITIES_GUIDE.md`
- **Model Updates**: `../MODEL_UPDATES_SUMMARY.md`
- **Quick Reference**: `../QUICK_MODEL_REFERENCE.md`
- **Original Requirements**: `../require-models.md`

## Contributing

When adding new examples:
1. Follow existing naming pattern: `exampleN_description`
2. Add clear comments explaining each step
3. Include both success and error cases
4. Update this README with new examples
5. Test examples before committing
