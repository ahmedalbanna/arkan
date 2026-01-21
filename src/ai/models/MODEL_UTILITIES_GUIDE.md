# Model Utilities Guide

Complete guide for using the AI model selection and management utilities.

## Table of Contents

1. [Model Selector](#model-selector)
2. [Performance Monitoring](#performance-monitoring)
3. [Request Queue Management](#request-queue-management)
4. [Health Checking](#health-checking)
5. [Utility Functions](#utility-functions)
6. [Best Practices](#best-practices)
7. [Examples](#examples)

---

## Model Selector

Intelligent model selection based on task requirements.

### Basic Usage

```typescript
import { selectModel, TaskComplexity, PerformancePriority } from '@/ai';

// Simple selection by task complexity
const model = selectModelByComplexity(TaskComplexity.COMPLEX);

// Selection by performance priority
const model = selectModelByPriority(PerformancePriority.QUALITY);

// Intelligent selection with multiple criteria
const model = selectModel({
  flowName: 'academic-literature-review',
  isAcademic: true,
  hasRAGContext: true,
  requiresDeepReasoning: true,
});
```

### Selection Criteria

```typescript
interface ModelSelectionCriteria {
  flowName?: string;                    // Use predefined mapping
  taskComplexity?: TaskComplexity;      // SIMPLE, MODERATE, COMPLEX
  performancePriority?: PerformancePriority; // SPEED, BALANCED, QUALITY
  inputTokens?: number;                 // Auto-select based on size
  requiresStructuredOutput?: boolean;   // Use Phi-3 Mini
  requiresDeepReasoning?: boolean;      // Use Phi-3 or Llama 3
  isAcademic?: boolean;                 // Force Llama 3 8B
  hasRAGContext?: boolean;              // Optimize for RAG usage
}
```

### Advanced Selection

```typescript
import { selectModelWithMetadata } from '@/ai';

const result = selectModelWithMetadata({
  isAcademic: true,
  hasRAGContext: false,
  inputTokens: 3000,
});

console.log(result.model);           // Selected model
console.log(result.reason);          // Why this model was chosen
console.log(result.fallbackModel);   // Backup if primary fails
console.log(result.warnings);        // Important notices
```

### Model Characteristics

```typescript
import { getModelCharacteristics } from '@/ai';

const char = getModelCharacteristics(OLLAMA_MODELS.PHI3_MINI);
console.log(char?.speed);            // 1-10 rating
console.log(char?.quality);          // 1-10 rating
console.log(char?.reasoning);        // 1-10 rating
console.log(char?.structuredOutput); // 1-10 rating
console.log(char?.memoryUsage);      // GB
console.log(char?.maxConcurrent);    // Recommended limit
```

---

## Performance Monitoring

Track model performance, response times, and resource usage.

### Basic Tracking

```typescript
import { performanceMonitor, generateRequestId } from '@/ai';

const requestId = generateRequestId();

// Start tracking
performanceMonitor.startRequest(requestId, model, flowName);

try {
  const result = await yourOperation();
  
  // End tracking (success)
  performanceMonitor.endRequest(requestId, true, undefined, inputTokens, outputTokens);
} catch (error) {
  // End tracking (failure)
  performanceMonitor.endRequest(requestId, false, error.message);
}
```

### Automatic Tracking

```typescript
import { trackRequest, generateRequestId } from '@/ai';

const requestId = generateRequestId();
const result = await trackRequest(
  requestId,
  model,
  flowName,
  async () => {
    // Your operation here
    return await generateText(input);
  },
  () => ({ input: 100, output: 200 }) // Optional token counts
);
```

### Get Statistics

```typescript
// Get statistics for a specific model
const stats = performanceMonitor.getModelStatistics(OLLAMA_MODELS.GEMMA_2B);
console.log(stats.totalRequests);
console.log(stats.averageDuration);
console.log(stats.errorRate);

// Get all model statistics
const allStats = performanceMonitor.getAllStatistics();

// Get performance report
const report = performanceMonitor.generateReport();
console.log(report);
```

### Monitor Active Requests

```typescript
// Get active request counts per model
const activeCounts = performanceMonitor.getActiveRequestCounts();

// Check if model can handle more requests
const canHandle = performanceMonitor.canHandleRequest(model, maxConcurrent);
```

### Debugging

```typescript
// Get recent errors
const errors = performanceMonitor.getRecentErrors(10);

// Get slowest requests for optimization
const slowest = performanceMonitor.getSlowestRequests(10);

// Compare model performance
const comparison = performanceMonitor.compareModels();
```

---

## Request Queue Management

Manage concurrent requests and prevent memory overload.

### Basic Queue Usage

```typescript
import { executeWithQueue, generateRequestId, RequestPriority } from '@/ai';

const requestId = generateRequestId();
const result = await executeWithQueue(
  requestId,
  model,
  flowName,
  async () => {
    // Your operation
    return await generateText(input);
  },
  {
    priority: RequestPriority.HIGH,
    timeout: 30000, // 30 seconds
  }
);
```

### Queue Management

```typescript
import { queueManager } from '@/ai';

// Get queue statistics
const stats = queueManager.getAllStats();
const modelStats = queueManager.getModelStats(OLLAMA_MODELS.LLAMA3_8B);

// Check availability
const isAvailable = queueManager.isAvailable(model);

// Get estimated wait time
const waitTime = queueManager.getEstimatedWaitTime(model);

// Generate queue report
const report = queueManager.generateReport();
console.log(report);
```

### Priority Levels

```typescript
enum RequestPriority {
  LOW = 0,      // Background tasks
  NORMAL = 1,   // Default
  HIGH = 2,     // User-facing operations
  URGENT = 3,   // Critical operations
}
```

### Configure Limits

```typescript
// Update max concurrent requests for a model
queueManager.setMaxConcurrent(OLLAMA_MODELS.LLAMA3_8B, 2);

// Clear queue
queueManager.clearModel(model);
queueManager.clearAll();
```

---

## Health Checking

Monitor Ollama server and model availability.

### Basic Health Checks

```typescript
import { healthMonitor, isModelHealthy } from '@/ai';

// Check specific model
const healthy = await isModelHealthy(OLLAMA_MODELS.GEMMA_2B);

// Check all models
const results = await healthMonitor.checkAllModels();

// Check server
const serverOnline = await healthMonitor.checkServer();

// Get full server health
const serverHealth = await healthMonitor.getServerHealth();
```

### Automatic Fallback

```typescript
import { getAvailableModel, executeWithFallback } from '@/ai';

// Get available model with automatic fallback
const model = await getAvailableModel(OLLAMA_MODELS.PHI3_MINI);

// Execute with automatic fallback on failure
const result = await executeWithFallback(
  OLLAMA_MODELS.LLAMA3_8B,
  async (model) => {
    return await generateText({ model, prompt });
  },
  2 // Max retries
);
```

### Periodic Monitoring

```typescript
import { startHealthMonitoring, stopHealthMonitoring } from '@/ai';

// Start periodic health checks (every 60 seconds)
startHealthMonitoring(60000);

// Stop monitoring
stopHealthMonitoring();
```

### Health Reports

```typescript
// Generate health report
const report = await healthMonitor.generateHealthReport();
console.log(report);

// Get cached health status
const status = healthMonitor.getHealthStatus(model);
console.log(status?.status); // HEALTHY, DEGRADED, UNHEALTHY, UNAVAILABLE
console.log(status?.responseTime);
```

---

## Utility Functions

Helper functions for token counting, optimization, and validation.

### Token Estimation

```typescript
import { estimateTokenCount, isWithinTokenLimit, truncateToTokenLimit } from '@/ai';

// Estimate tokens in text
const tokens = estimateTokenCount(text, 'en'); // or 'ar' or 'auto'

// Check if within limit
const withinLimit = isWithinTokenLimit(text, 2048);

// Truncate to fit limit
const truncated = truncateToTokenLimit(text, 2048);
```

### Text Chunking

```typescript
import { chunkText, getOptimalChunkSize } from '@/ai';

// Get optimal chunk size for model
const chunkSize = getOptimalChunkSize(OLLAMA_MODELS.PHI3_MINI);

// Split text into chunks
const chunks = chunkText(text, chunkSize, 100); // 100 token overlap
```

### Prompt Optimization

```typescript
import { optimizePromptForModel } from '@/ai';

// Optimize prompt for specific model
const optimized = optimizePromptForModel(prompt, model);
```

### Model Recommendations

```typescript
import { getModelRecommendations } from '@/ai';

const rec = getModelRecommendations(OLLAMA_MODELS.GEMMA_2B);
console.log(rec.maxInputTokens);      // 2048
console.log(rec.maxOutputTokens);     // 512
console.log(rec.optimalTemperature);  // 0.7
console.log(rec.useRAG);              // false
console.log(rec.recommendations);     // Array of tips
```

### Configuration Validation

```typescript
import { validateModelConfig } from '@/ai';

const validation = validateModelConfig(
  model,
  inputText,
  maxOutputTokens,
  temperature
);

if (!validation.valid) {
  console.error('Errors:', validation.errors);
}

if (validation.warnings.length > 0) {
  console.warn('Warnings:', validation.warnings);
}
```

### Memory Estimation

```typescript
import { estimateMemoryUsage } from '@/ai';

const memoryMB = estimateMemoryUsage(model, inputTokens);
console.log(`Estimated memory: ${memoryMB}MB`);
```

---

## Best Practices

### 1. Always Use Queue for Llama 3 8B

```typescript
// ✅ Good
const result = await executeWithQueue(
  requestId,
  OLLAMA_MODELS.LLAMA3_8B,
  flowName,
  operation,
  { priority: RequestPriority.HIGH }
);

// ❌ Bad - might overload memory
const result = await operation();
```

### 2. Monitor Performance

```typescript
// Start monitoring at app startup
startHealthMonitoring(60000);

// Track all requests
const result = await trackRequest(requestId, model, flowName, operation);

// Periodically check reports
setInterval(() => {
  console.log(performanceMonitor.generateReport());
  console.log(queueManager.generateReport());
}, 300000); // Every 5 minutes
```

### 3. Use Intelligent Selection

```typescript
// ✅ Good - considers multiple factors
const model = selectModel({
  flowName: 'grammar-checker',
  requiresStructuredOutput: true,
  performancePriority: PerformancePriority.BALANCED,
});

// ❌ Bad - hardcoded model
const model = OLLAMA_MODELS.GEMMA_2B;
```

### 4. Implement Fallbacks

```typescript
// ✅ Good - automatic fallback
const result = await executeWithFallback(model, operation);

// ❌ Bad - no fallback
const result = await operation();
```

### 5. Validate Before Execution

```typescript
// ✅ Good
const validation = validateModelConfig(model, input, maxTokens, temperature);
if (!validation.valid) {
  throw new Error(`Invalid config: ${validation.errors.join(', ')}`);
}

// ❌ Bad - no validation
const result = await execute();
```

### 6. Chunk Large Inputs

```typescript
// ✅ Good
if (estimateTokenCount(text) > getOptimalChunkSize(model)) {
  const chunks = chunkText(text, getOptimalChunkSize(model));
  const results = await Promise.all(
    chunks.map(chunk => processChunk(chunk))
  );
}

// ❌ Bad - might exceed limits
const result = await processText(veryLongText);
```

---

## Examples

### Complete Flow Example

```typescript
import {
  selectModel,
  executeWithQueue,
  trackRequest,
  generateRequestId,
  estimateTokenCount,
  chunkText,
  getOptimalChunkSize,
  validateModelConfig,
  RequestPriority,
  TaskComplexity,
} from '@/ai';

async function processDocument(text: string, flowName: string) {
  // 1. Select appropriate model
  const model = selectModel({
    flowName,
    taskComplexity: TaskComplexity.MODERATE,
    inputTokens: estimateTokenCount(text),
    requiresStructuredOutput: true,
  });

  // 2. Validate configuration
  const validation = validateModelConfig(model, text, 1024, 0.5);
  if (!validation.valid) {
    throw new Error(`Config invalid: ${validation.errors.join(', ')}`);
  }

  // 3. Check if chunking is needed
  const optimalSize = getOptimalChunkSize(model);
  const tokenCount = estimateTokenCount(text);
  
  if (tokenCount > optimalSize) {
    const chunks = chunkText(text, optimalSize, 100);
    const results = await processChunks(chunks, model, flowName);
    return combineResults(results);
  }

  // 4. Execute with queue and tracking
  const requestId = generateRequestId();
  return await executeWithQueue(
    requestId,
    model,
    flowName,
    async () => {
      return await trackRequest(
        requestId,
        model,
        flowName,
        async () => {
          // Your actual AI operation
          return await yourAIFlow({ text, model });
        },
        () => ({ input: tokenCount, output: 0 })
      );
    },
    { priority: RequestPriority.NORMAL, timeout: 30000 }
  );
}
```

### Monitoring Dashboard

```typescript
import {
  performanceMonitor,
  queueManager,
  healthMonitor,
} from '@/ai';

async function generateMonitoringDashboard() {
  const performanceReport = performanceMonitor.generateReport();
  const queueReport = queueManager.generateReport();
  const healthReport = await healthMonitor.generateHealthReport();

  return `
${healthReport}

${performanceReport}

${queueReport}
  `.trim();
}

// Call every 5 minutes
setInterval(async () => {
  const dashboard = await generateMonitoringDashboard();
  console.log(dashboard);
}, 300000);
```

### Smart Model Selection with Fallback

```typescript
import {
  selectModelWithMetadata,
  executeWithFallback,
  isModelHealthy,
} from '@/ai';

async function smartGenerate(input: string, criteria: ModelSelectionCriteria) {
  // Get model with metadata
  const selection = selectModelWithMetadata(criteria);
  
  // Log selection reasoning
  console.log(`Selected ${selection.model}: ${selection.reason}`);
  
  // Show warnings
  if (selection.warnings.length > 0) {
    console.warn('Warnings:', selection.warnings);
  }

  // Check health
  const healthy = await isModelHealthy(selection.model);
  if (!healthy) {
    console.warn(`${selection.model} unhealthy, using fallback: ${selection.fallbackModel}`);
  }

  // Execute with automatic fallback
  return await executeWithFallback(
    selection.model,
    async (model) => {
      return await yourOperation(input, model);
    },
    2 // Max 2 retries
  );
}
```

---

## API Reference Summary

### Model Selector
- `selectModel(criteria)` - Intelligent selection
- `selectModelWithMetadata(criteria)` - Selection with details
- `getModelCharacteristics(model)` - Get model specs
- `isModelSuitableForTask(model, criteria)` - Check suitability

### Performance Monitor
- `performanceMonitor.startRequest()` - Start tracking
- `performanceMonitor.endRequest()` - End tracking
- `performanceMonitor.getModelStatistics()` - Get stats
- `trackRequest()` - Automatic tracking wrapper

### Request Queue
- `executeWithQueue()` - Queue-managed execution
- `queueManager.getModelStats()` - Get queue stats
- `queueManager.isAvailable()` - Check availability

### Health Check
- `healthMonitor.checkModel()` - Check model health
- `isModelHealthy()` - Simple health check
- `executeWithFallback()` - Auto-fallback execution
- `startHealthMonitoring()` - Start periodic checks

### Utilities
- `estimateTokenCount()` - Count tokens
- `chunkText()` - Split text into chunks
- `optimizePromptForModel()` - Optimize prompts
- `validateModelConfig()` - Validate configuration

---

## Configuration

All utilities are pre-configured with sensible defaults. Customize as needed:

```typescript
// Update health check interval
healthMonitor.updateConfig({ checkInterval: 30000 });

// Update queue concurrency limits
queueManager.setMaxConcurrent(OLLAMA_MODELS.GEMMA_2B, 10);
```

---

## Troubleshooting

### High Memory Usage
- Check active requests: `performanceMonitor.getActiveRequestCounts()`
- Review queue status: `queueManager.generateReport()`
- Reduce Llama 3 8B concurrency: `queueManager.setMaxConcurrent(model, 1)`

### Slow Responses
- Check model health: `healthMonitor.generateHealthReport()`
- Review performance: `performanceMonitor.getSlowestRequests()`
- Consider switching models: `selectModelByPriority(SPEED)`

### Request Failures
- Check recent errors: `performanceMonitor.getRecentErrors()`
- Verify model health: `isModelHealthy(model)`
- Use fallback: `executeWithFallback(model, operation)`

---

For more information, see:
- `MODEL_UPDATES_SUMMARY.md` - Model migration details
- `QUICK_MODEL_REFERENCE.md` - Quick reference guide
- `require-models.md` - Original requirements (Arabic)
