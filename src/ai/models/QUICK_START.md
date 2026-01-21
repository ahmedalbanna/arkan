# Model Utilities Quick Start

## 🚀 30-Second Start

```typescript
import { selectModel, executeWithQueue, generateRequestId } from '@/ai';

// 1. Select model
const model = selectModel({ flowName: 'my-flow' });

// 2. Execute with queue
const result = await executeWithQueue(
  generateRequestId(),
  model,
  'my-flow',
  async () => await yourOperation()
);
```

## 📋 Common Tasks

### Select Model by Task Type

```typescript
import { selectModel, TaskComplexity } from '@/ai';

// Fast text generation
const fastModel = selectModel({ 
  taskComplexity: TaskComplexity.SIMPLE 
});

// Analysis/Reports
const smartModel = selectModel({ 
  taskComplexity: TaskComplexity.MODERATE 
});

// Academic/Research
const qualityModel = selectModel({ 
  taskComplexity: TaskComplexity.COMPLEX 
});
```

### Check Model Health

```typescript
import { isModelHealthy, getAvailableModel } from '@/ai';

// Check if healthy
const healthy = await isModelHealthy(model);

// Get available with fallback
const availableModel = await getAvailableModel(preferredModel);
```

### Track Performance

```typescript
import { trackRequest, performanceMonitor } from '@/ai';

// Track request
await trackRequest(requestId, model, flowName, operation);

// Get stats
const stats = performanceMonitor.getModelStatistics(model);
console.log(`Avg: ${stats.averageDuration}ms`);
```

### Handle Large Text

```typescript
import { estimateTokenCount, chunkText, getOptimalChunkSize } from '@/ai';

const tokens = estimateTokenCount(text);
if (tokens > getOptimalChunkSize(model)) {
  const chunks = chunkText(text, getOptimalChunkSize(model));
  // Process chunks...
}
```

### Validate Configuration

```typescript
import { validateModelConfig } from '@/ai';

const validation = validateModelConfig(model, input, maxTokens, temperature);
if (!validation.valid) {
  console.error('Errors:', validation.errors);
}
```

## 🎯 Decision Tree

```
Need to generate content?
├─ Is it academic/research?
│  └─ selectModel({ isAcademic: true })  → Llama 3 8B
│
├─ Need structured output (JSON/Markdown)?
│  └─ selectModel({ requiresStructuredOutput: true })  → Phi-3 Mini
│
├─ Need grammar/analysis?
│  └─ selectModel({ taskComplexity: TaskComplexity.MODERATE })  → Phi-3 Mini
│
└─ Basic text generation?
   └─ selectModel({ taskComplexity: TaskComplexity.SIMPLE })  → Gemma 2B
```

## 📊 Monitoring Commands

```typescript
import { performanceMonitor, queueManager, healthMonitor } from '@/ai';

// Performance report
console.log(performanceMonitor.generateReport());

// Queue status
console.log(queueManager.generateReport());

// Health status
console.log(await healthMonitor.generateHealthReport());
```

## ⚡ Best Practices

### ✅ DO

```typescript
// Smart selection
const model = selectModel({ flowName: 'my-flow' });

// Queue heavy models
await executeWithQueue(id, OLLAMA_MODELS.LLAMA3_8B, flow, operation);

// Track performance
await trackRequest(id, model, flow, operation);

// Validate config
const validation = validateModelConfig(model, input);

// Use fallback
await executeWithFallback(model, operation);
```

### ❌ DON'T

```typescript
// Don't hardcode models
const model = 'ollama/gemma:2b';  // Bad

// Don't skip validation
await execute(largeInput);  // Bad

// Don't ignore queues for Llama
await llama3Operation();  // Bad
```

## 🔧 Configuration

```typescript
// Start health monitoring
import { startHealthMonitoring } from '@/ai';
startHealthMonitoring(60000);  // Every minute

// Adjust queue limits
import { queueManager } from '@/ai';
queueManager.setMaxConcurrent(model, 2);
```

## 📚 Full Documentation

- **Complete Guide**: `MODEL_UTILITIES_GUIDE.md`
- **Examples**: `examples/README.md`
- **API Reference**: JSDoc in source files

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| High memory | `queueManager.setMaxConcurrent(model, 1)` |
| Slow responses | `selectModel({ performancePriority: SPEED })` |
| Request failures | `executeWithFallback(model, operation)` |
| Need stats | `performanceMonitor.generateReport()` |

## 💡 Tips

1. **Always use queue for Llama 3 8B** - It uses 4.7GB RAM
2. **Start monitoring early** - Call `startHealthMonitoring()` at app start
3. **Validate before executing** - Use `validateModelConfig()`
4. **Track all requests** - Use `trackRequest()` for insights
5. **Check health periodically** - Monitor model availability

## 🎓 Learn More

Run examples:
```bash
npx ts-node src/ai/examples/basic-usage.ts
npx ts-node src/ai/examples/advanced-usage.ts
```

## 🌟 Common Patterns

### Pattern 1: Grammar Checking
```typescript
const model = selectModel({ 
  flowName: 'grammar-checker',
  requiresStructuredOutput: true 
});
```

### Pattern 2: Academic Writing
```typescript
const model = selectModel({ 
  isAcademic: true,
  hasRAGContext: true 
});
```

### Pattern 3: Fast Chat
```typescript
const model = selectModel({ 
  performancePriority: PerformancePriority.SPEED 
});
```

---

**Ready to start?** Import utilities and begin with `selectModel()`!
