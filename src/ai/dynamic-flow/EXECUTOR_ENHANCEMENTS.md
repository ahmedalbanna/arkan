# Enhanced Flow Executor - New Features

## Overview

The Enhanced Flow Executor has been upgraded with three critical production-ready features:

1. **Circuit Breaker Pattern** - Prevents cascading failures
2. **Timeout Mechanism** - Per-step and global timeouts
3. **Parallelization Support** - Execute independent steps concurrently

---

## 1. Circuit Breaker Pattern

### Purpose
Prevents cascading failures by automatically stopping execution when a service becomes unhealthy.

### How It Works

The circuit breaker has three states:

- **CLOSED** (Normal operation)
  - All requests pass through
  - Failures are tracked
  - Transitions to OPEN after threshold failures

- **OPEN** (Blocking requests)
  - All requests are immediately rejected
  - No actual execution happens
  - Automatically transitions to HALF_OPEN after reset timeout

- **HALF_OPEN** (Testing recovery)
  - Limited requests allowed through
  - Tests if service has recovered
  - Transitions to CLOSED after successful attempts
  - Returns to OPEN if failures continue

### Configuration

```typescript
constructor() {
  this.circuitBreaker = new CircuitBreaker({
    failureThreshold: 5,        // Open after 5 failures
    resetTimeout: 60000,        // Try again after 1 minute
    halfOpenMaxAttempts: 3      // Need 3 successes to close
  });
}
```

### Usage Example

```typescript
const executor = new EnhancedFlowExecutor();

// Circuit breaker automatically wraps execution
const result = await executor.execute(config, input);

if (result.error?.message.includes('Circuit breaker is OPEN')) {
  console.log('Service is temporarily unavailable');
  // Implement retry logic or fallback
}
```

### Benefits

- **Fail Fast** - Don't waste time on operations that will fail
- **Resource Protection** - Prevent overwhelming failing services
- **Auto Recovery** - Automatically test and resume when service recovers
- **Cascading Failure Prevention** - Stops failures from propagating

---

## 2. Timeout Mechanism

### Purpose
Prevents hung operations and ensures predictable execution times.

### Two-Level Timeout System

#### Global Flow Timeout
- Applies to entire flow execution
- Default: 5 minutes (300,000ms)
- Configurable via flow config or options

```typescript
// Via flow configuration
const config: FlowConfiguration = {
  // ...
  config: {
    timeout: 120000 // 2 minutes for entire flow
  }
};

// Via execution options
await executor.execute(config, input, {
  timeout: 180000 // 3 minutes override
});
```

#### Per-Step Timeout
- Applies to individual step execution
- Default: 30 seconds (30,000ms)
- Configurable per step or globally

```typescript
// Per-step timeout
const step: FlowStep = {
  id: 'step1',
  name: 'Slow Operation',
  type: 'generate',
  config: {
    prompt: 'Complex task',
    timeout: 60000 // 1 minute for this step
  }
};

// Global step timeout
await executor.execute(config, input, {
  stepTimeout: 45000 // 45 seconds for all steps
});
```

### Timeout Priority

1. Step-specific timeout (highest priority)
2. Global step timeout from options
3. Default timeout (30 seconds)

### Error Handling

```typescript
try {
  const result = await executor.execute(config, input);
} catch (error) {
  if (error instanceof TimeoutError) {
    console.log(`Timeout after ${error.timeoutMs}ms`);
    console.log(error.message); // "Step X timeout" or "Flow execution timeout"
  }
}
```

### Benefits

- **Predictable Performance** - No hung operations
- **Resource Management** - Free up resources from stuck operations
- **User Experience** - Fail fast instead of waiting indefinitely
- **Debugging** - Clear indication of which step timed out

---

## 3. Parallelization Support

### Purpose
Dramatically improve flow execution speed by running independent steps concurrently.

### Dependency Analysis

The executor automatically:
1. Analyzes step dependencies by examining variable references
2. Builds a dependency graph
3. Performs topological sort to find execution levels
4. Executes independent steps in parallel

### How It Works

```typescript
// These steps run IN PARALLEL (no dependencies)
const parallelSteps = [
  {
    id: 'step1',
    config: { prompt: 'Task 1' } // No references to other steps
  },
  {
    id: 'step2', 
    config: { prompt: 'Task 2' } // No references to other steps
  },
  {
    id: 'step3',
    config: { prompt: 'Task 3' } // No references to other steps
  }
];

// These steps run SEQUENTIALLY (has dependencies)
const sequentialSteps = [
  {
    id: 'step1',
    config: { prompt: 'First task' }
  },
  {
    id: 'step2',
    config: { 
      prompt: 'Use {{steps.step1.output}}' // Depends on step1
    }
  }
];
```

### Execution Levels

The executor organizes steps into levels:

```
Level 0: [step1]                    // No dependencies
Level 1: [step2, step3, step4]      // All depend on step1, can run in parallel
Level 2: [step5]                    // Depends on step2, step3, step4
```

### Mixed Parallel/Sequential Example

```typescript
const config: FlowConfiguration = {
  steps: [
    {
      id: 'fetch_data',
      config: { query: 'Get data from DB' }
    },
    // These 3 steps can run in parallel after fetch_data
    {
      id: 'process_1',
      config: { input: '{{steps.fetch_data.output}}' }
    },
    {
      id: 'process_2',
      config: { input: '{{steps.fetch_data.output}}' }
    },
    {
      id: 'process_3',
      config: { input: '{{steps.fetch_data.output}}' }
    },
    // This waits for all 3 processors
    {
      id: 'combine',
      config: { 
        data: [
          '{{steps.process_1.output}}',
          '{{steps.process_2.output}}',
          '{{steps.process_3.output}}'
        ]
      }
    }
  ]
};

// Execution order:
// 1. fetch_data (sequential)
// 2. process_1, process_2, process_3 (parallel)
// 3. combine (sequential)
```

### Performance Impact

**Before (Sequential):**
```
Step1: 2s
Step2: 2s
Step3: 2s
Total: 6s
```

**After (Parallel):**
```
Step1: 2s |
Step2: 2s | (all run simultaneously)
Step3: 2s |
Total: 2s
```

**Potential Speed Improvement: 3x or more**

### Circular Dependency Detection

The executor detects circular dependencies and falls back to sequential execution with a warning:

```typescript
// Circular dependency
step1 depends on step2
step2 depends on step3
step3 depends on step1

// Result: Warning logged, sequential execution
console.warn('Possible circular dependency detected, executing remaining steps sequentially');
```

### Benefits

- **Massive Speed Improvements** - 2x-10x faster for independent operations
- **Better Resource Utilization** - Use available CPU/network concurrently
- **Automatic Optimization** - No manual configuration needed
- **Safe Execution** - Respects dependencies automatically

---

## Combined Usage Example

```typescript
const executor = new EnhancedFlowExecutor();

const config: FlowConfiguration = {
  id: 'production-flow',
  name: 'Production Flow',
  version: '1.0.0',
  steps: [
    {
      id: 'fetch',
      name: 'Fetch Data',
      type: 'retrieve',
      config: { 
        query: 'Get documents',
        timeout: 10000 // 10 second timeout for this step
      }
    },
    {
      id: 'process1',
      name: 'Process Branch 1',
      type: 'generate',
      config: { 
        prompt: 'Analyze {{steps.fetch.output}}',
        timeout: 30000 // 30 second timeout
      }
    },
    {
      id: 'process2',
      name: 'Process Branch 2',
      type: 'generate',
      config: { 
        prompt: 'Summarize {{steps.fetch.output}}',
        timeout: 30000
      }
    },
    {
      id: 'combine',
      name: 'Combine Results',
      type: 'transform',
      config: { 
        inputs: [
          '{{steps.process1.output}}',
          '{{steps.process2.output}}'
        ]
      }
    }
  ],
  config: {
    timeout: 120000 // 2 minute global timeout
  }
};

try {
  const result = await executor.execute(config, input, {
    stepTimeout: 45000 // Override: 45 seconds per step
  });

  if (result.success) {
    console.log('Flow completed:', result.output);
    console.log('Metrics:', result.metrics);
  } else {
    console.error('Flow failed:', result.error);
  }
} catch (error) {
  if (error instanceof TimeoutError) {
    console.error('Flow timed out:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

**Execution Flow:**
1. **fetch** executes (10s timeout) - protected by circuit breaker
2. **process1** and **process2** execute IN PARALLEL (30s each) - both protected
3. **combine** executes after both complete
4. Entire flow has 2-minute global timeout
5. Circuit breaker monitors all operations

---

## Performance Metrics

### Before Enhancements
- No failure protection → cascading failures
- No timeout protection → hung operations
- Sequential execution → slow performance

### After Enhancements
- Circuit breaker → fail fast, auto-recovery
- Timeout protection → predictable performance
- Parallel execution → 2-10x speed improvement

### Production Benefits

| Feature | Benefit | Impact |
|---------|---------|--------|
| Circuit Breaker | Prevent cascading failures | 🟢 High |
| Global Timeout | Predictable flow duration | 🟢 High |
| Step Timeout | Catch hung operations early | 🟢 High |
| Parallelization | 2-10x faster execution | 🟢 Very High |

---

## Migration Guide

### Existing Flows

All existing flows will continue to work without changes. The new features are:

- **Backward compatible** - No breaking changes
- **Opt-in timeouts** - Use defaults or configure explicitly
- **Automatic parallelization** - Happens automatically based on dependencies

### Recommended Updates

1. **Add timeouts to long-running steps:**
```typescript
config: {
  prompt: 'Complex task',
  timeout: 60000 // Add timeout
}
```

2. **Set global flow timeout:**
```typescript
config: {
  timeout: 300000 // 5 minutes
}
```

3. **Test parallel execution:**
- Review your flows for opportunities to parallelize
- Ensure steps that can run independently don't have artificial sequential ordering

---

## Testing

Comprehensive test suite available at:
`src/ai/dynamic-flow/__tests__/executor-enhancements.test.ts`

### Test Coverage

- ✅ Circuit breaker state transitions
- ✅ Failure threshold triggers
- ✅ Auto-recovery after reset timeout
- ✅ Global timeout enforcement
- ✅ Per-step timeout enforcement
- ✅ Parallel execution of independent steps
- ✅ Sequential execution of dependent steps
- ✅ Mixed parallel/sequential workflows
- ✅ Combined features integration

Run tests:
```bash
npm test -- executor-enhancements.test.ts
```

---

## Configuration Reference

### ExecutionOptions

```typescript
interface ExecutionOptions {
  timeout?: number;        // Global flow timeout (default: 300000ms)
  stepTimeout?: number;    // Default timeout for all steps (default: 30000ms)
  userId?: string;         // User ID for tracking
  sessionId?: string;      // Session ID for tracking
  dryRun?: boolean;        // Simulate without executing
  debug?: boolean;         // Enable debug logging
  variables?: Record<string, any>; // Additional variables
}
```

### Circuit Breaker Config

```typescript
interface CircuitBreakerConfig {
  failureThreshold: number;      // Failures before opening (default: 5)
  resetTimeout: number;          // Time before retry in ms (default: 60000)
  halfOpenMaxAttempts: number;   // Successes needed to close (default: 3)
}
```

### Step Configuration

```typescript
interface FlowStep {
  id: string;
  name: string;
  type: StepType;
  config: {
    timeout?: number;  // Step-specific timeout
    // ... other config
  };
  errorHandling?: {
    retries?: number;
    continueOnError?: boolean;
    fallback?: string;
  };
}
```

---

## Monitoring & Observability

### Circuit Breaker Metrics

```typescript
const metrics = executor['circuitBreaker'].getMetrics();
console.log({
  state: metrics.state,              // CLOSED, OPEN, or HALF_OPEN
  failureCount: metrics.failureCount,
  lastFailureTime: metrics.lastFailureTime,
  halfOpenAttempts: metrics.halfOpenAttempts
});
```

### Execution Metrics

```typescript
const result = await executor.execute(config, input);

console.log({
  duration: result.duration,
  totalSteps: result.metrics.totalSteps,
  successfulSteps: result.metrics.successfulSteps,
  failedSteps: result.metrics.failedSteps,
  skippedSteps: result.metrics.skippedSteps
});
```

---

## Best Practices

### 1. Set Appropriate Timeouts

```typescript
// Fast operations
config: { timeout: 5000 }

// AI generation
config: { timeout: 30000 }

// Complex workflows
config: { timeout: 120000 }
```

### 2. Design for Parallelization

```typescript
// BAD: Unnecessary sequential dependencies
step2.config.input = '{{steps.step1.output}}'  // Creates dependency
step3.config.input = '{{steps.step1.output}}'  // Creates dependency
step4.config.input = '{{steps.step1.output}}'  // Creates dependency

// GOOD: Independent operations
step2.config.input = '{{input.data}}'  // No dependency
step3.config.input = '{{input.data}}'  // No dependency
step4.config.input = '{{input.data}}'  // No dependency
```

### 3. Monitor Circuit Breaker

```typescript
// Reset circuit breaker if needed
if (circuitBreakerIsStuck) {
  executor['circuitBreaker'].reset();
}
```

### 4. Handle Timeouts Gracefully

```typescript
try {
  const result = await executor.execute(config, input);
} catch (error) {
  if (error instanceof TimeoutError) {
    // Log for monitoring
    logger.warn('Flow timeout', { 
      flowId: config.id, 
      timeoutMs: error.timeoutMs 
    });
    
    // Return partial results or fallback
    return getFallbackResult();
  }
}
```

---

## Troubleshooting

### Circuit Breaker Stuck Open

**Symptom:** All requests fail with "Circuit breaker is OPEN"

**Solutions:**
1. Wait for reset timeout (default 1 minute)
2. Manually reset: `executor['circuitBreaker'].reset()`
3. Check underlying service health

### Unexpected Timeouts

**Symptom:** Operations timing out that should complete

**Solutions:**
1. Increase timeout values
2. Check step dependencies (may be waiting for slow step)
3. Review AI generation parameters (may be too complex)

### Steps Not Parallelizing

**Symptom:** Expected parallel execution but running sequentially

**Solutions:**
1. Check for unintended dependencies (search for `{{steps.X}}`)
2. Review dependency graph in debug mode
3. Verify steps truly are independent

---

## Future Enhancements

Potential future improvements:

- [ ] Configurable parallelism limits (max concurrent steps)
- [ ] Step-level circuit breakers (per step type)
- [ ] Retry with circuit breaker integration
- [ ] Performance profiling and recommendations
- [ ] Visual flow execution timeline
- [ ] Dynamic timeout adjustment based on history

---

**Last Updated:** 2026-01-21
**Version:** 2.0.0
**Status:** ✅ Production Ready
