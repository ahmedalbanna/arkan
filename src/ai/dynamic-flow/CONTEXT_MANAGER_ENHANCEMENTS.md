# Context Manager Enhancements

## Overview

The Context Manager has been enhanced with three powerful features for better state management in dynamic flow execution:

1. **Variable Immutability** - Prevent accidental overwrites of critical variables
2. **Variable History Tracking** - Track all changes to variables over time
3. **Variable Type Constraints** - Runtime type validation for variables

---

## 1. Variable Immutability

### Purpose
Protect critical variables from accidental modification, ensuring data integrity throughout flow execution.

### Features

- **Immutable variables** cannot be modified once set
- Attempts to modify throw descriptive errors
- Helper methods for easy immutable variable management
- Per-variable immutability control

### Usage

#### Setting Immutable Variables

```typescript
// Method 1: Using options
contextManager.setVariable(context, 'apiKey', 'sk-123456', {
  immutable: true
});

// Method 2: Using helper method
contextManager.setImmutableVariable(context, 'userId', 'user-123');

// This will throw an error
contextManager.setVariable(context, 'apiKey', 'new-key');
// Error: Cannot modify immutable variable: apiKey
```

#### Checking Immutability

```typescript
const isImmutable = contextManager.isImmutable(context, 'apiKey');
console.log(isImmutable); // true
```

### Use Cases

- **API Keys**: Protect credentials from accidental changes
- **User IDs**: Ensure user context remains consistent
- **Configuration Constants**: Lock down critical config values
- **Input Data**: Preserve original input throughout execution
- **Flow Metadata**: Protect flow ID, trace ID, etc.

### Example: Protecting Critical Data

```typescript
async function executeSecureFlow(config: FlowConfiguration, input: any) {
  const context = await contextManager.initialize({
    input,
    config,
    options: {},
    traceId: generateTraceId()
  });

  // Protect critical values
  contextManager.setImmutableVariable(context, 'userId', input.userId);
  contextManager.setImmutableVariable(context, 'apiKey', process.env.API_KEY);
  contextManager.setImmutableVariable(context, 'traceId', context.traceId);

  // These are safe - can be modified
  contextManager.setVariable(context, 'status', 'processing');
  contextManager.setVariable(context, 'progress', 0);

  // This would throw an error
  // contextManager.setVariable(context, 'userId', 'different-user');
}
```

---

## 2. Variable History Tracking

### Purpose
Track all changes to variables over time for debugging, auditing, and time-travel debugging.

### Features

- **Automatic history tracking** for all variable changes
- **Operation tracking**: Set, Update, Delete
- **Timestamp tracking** for each change
- **Source tracking**: Which step made the change
- **Time-travel queries**: Get variable value at any point in time
- **Deep cloning**: History entries are independent of current values

### Usage

#### Basic History Tracking

```typescript
// History is tracked automatically
contextManager.setVariable(context, 'status', 'pending');
contextManager.setVariable(context, 'status', 'processing');
contextManager.setVariable(context, 'status', 'completed');

// Get complete history
const history = contextManager.getVariableHistory(context, 'status');
console.log(history);
// [
//   { value: 'pending', timestamp: 1234567890, operation: 'set', source: undefined },
//   { value: 'processing', timestamp: 1234567891, operation: 'update', source: undefined },
//   { value: 'completed', timestamp: 1234567892, operation: 'update', source: undefined }
// ]
```

#### Tracking Source

```typescript
// Track which step made the change
contextManager.setVariable(context, 'data', initialData, {
  source: 'step1:fetch'
});

contextManager.setVariable(context, 'data', processedData, {
  source: 'step2:process'
});

const history = contextManager.getVariableHistory(context, 'data');
console.log(history[0].source); // 'step1:fetch'
console.log(history[1].source); // 'step2:process'
```

#### Time-Travel Queries

```typescript
// Get value at specific timestamp
const valueAtTime = contextManager.getVariableAtTime(
  context,
  'status',
  specificTimestamp
);

// Get all changes across all variables
const allChanges = contextManager.getAllVariableChanges(context);
for (const [varName, history] of allChanges) {
  console.log(`${varName}: ${history.length} changes`);
}
```

#### History in Snapshots

```typescript
const snapshot = contextManager.snapshot(context);
console.log(snapshot.variableHistory);
// {
//   status: [{ value: 'pending', timestamp: 123, operation: 'set' }, ...],
//   counter: [{ value: 0, timestamp: 124, operation: 'set' }, ...]
// }
```

### Use Cases

- **Debugging**: Understand how variables changed during execution
- **Auditing**: Track who/what made changes
- **Rollback**: Restore previous states
- **Performance Analysis**: Identify unnecessary updates
- **Flow Optimization**: Analyze variable access patterns
- **Time-Travel Debugging**: Inspect state at any point

### Example: Audit Trail

```typescript
async function executeWithAudit(config: FlowConfiguration, input: any) {
  const context = await contextManager.initialize(/* ... */);

  // Execute steps with source tracking
  for (const step of config.steps) {
    const result = await executeStep(step, context);
    
    // Track changes with source
    contextManager.setVariable(context, 'lastResult', result, {
      source: `step:${step.id}`
    });
  }

  // Generate audit report
  const allChanges = contextManager.getAllVariableChanges(context);
  const auditLog = [];
  
  for (const [varName, history] of allChanges) {
    for (const entry of history) {
      auditLog.push({
        variable: varName,
        value: entry.value,
        timestamp: new Date(entry.timestamp).toISOString(),
        operation: entry.operation,
        source: entry.source
      });
    }
  }

  return { result, auditLog };
}
```

---

## 3. Variable Type Constraints

### Purpose
Enforce type safety at runtime with custom validation rules.

### Features

- **Type validation**: string, number, boolean, object, array, any
- **Required constraints**: Ensure values are not null/undefined
- **Custom validators**: Implement complex validation logic
- **Error messages**: Provide clear feedback on validation failures
- **Constraint persistence**: Constraints apply to all future updates

### Usage

#### Basic Type Constraints

```typescript
// String constraint
contextManager.setVariable(context, 'name', 'John', {
  constraint: { type: 'string' }
});

// Number constraint
contextManager.setVariable(context, 'age', 25, {
  constraint: { type: 'number' }
});

// This will throw an error
contextManager.setVariable(context, 'age', 'twenty-five');
// Error: Variable "age" must be of type "number" but got "string"
```

#### Required Constraints

```typescript
contextManager.setVariable(context, 'userId', 'user-123', {
  constraint: {
    type: 'string',
    required: true
  }
});

// This will throw an error
contextManager.setVariable(context, 'userId', null);
// Error: Variable "userId" is required but got null
```

#### Custom Validators

```typescript
contextManager.setVariable(context, 'percentage', 50, {
  constraint: {
    type: 'number',
    validator: (value) => value >= 0 && value <= 100,
    errorMessage: 'Percentage must be between 0 and 100'
  }
});

// This will throw an error
contextManager.setVariable(context, 'percentage', 150);
// Error: Variable "percentage" failed custom validation. Percentage must be between 0 and 100
```

#### Setting Constraints Separately

```typescript
// Set constraint without setting value
contextManager.setVariableConstraint(context, 'email', {
  type: 'string',
  validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  errorMessage: 'Invalid email format'
});

// Later, when setting the value, constraint will be enforced
contextManager.setVariable(context, 'email', 'user@example.com'); // Valid
contextManager.setVariable(context, 'email', 'invalid-email'); // Throws error
```

#### Array and Object Constraints

```typescript
// Array constraint
contextManager.setVariable(context, 'items', [1, 2, 3], {
  constraint: { type: 'array' }
});

// Object constraint
contextManager.setVariable(context, 'user', { name: 'John' }, {
  constraint: { type: 'object' }
});

// Any type (no validation)
contextManager.setVariable(context, 'flexible', anyValue, {
  constraint: { type: 'any' }
});
```

### Use Cases

- **Input Validation**: Validate external input before processing
- **Type Safety**: Ensure variables have expected types
- **Business Rules**: Enforce domain constraints (e.g., age > 0)
- **Format Validation**: Email, phone, URL patterns
- **Range Validation**: Min/max values, length constraints
- **Cross-Variable Validation**: Complex validation logic

### Example: Complex Validation

```typescript
// Validate user object with multiple constraints
contextManager.setVariable(context, 'user', {
  name: 'John Doe',
  email: 'john@example.com',
  age: 30
}, {
  constraint: {
    type: 'object',
    validator: (user) => {
      // Custom validation logic
      return user.name && 
             user.name.length >= 2 &&
             /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email) &&
             user.age >= 18 &&
             user.age <= 120;
    },
    errorMessage: 'User object must have valid name (2+ chars), email, and age (18-120)'
  }
});

// Validate score with multiple rules
contextManager.setVariable(context, 'score', 85, {
  constraint: {
    type: 'number',
    required: true,
    validator: (value) => {
      return Number.isInteger(value) && value >= 0 && value <= 100;
    },
    errorMessage: 'Score must be an integer between 0 and 100'
  }
});
```

---

## 4. Combined Features

### Immutable + Type Constraints

```typescript
contextManager.setVariable(context, 'apiKey', 'sk-123456', {
  immutable: true,
  constraint: {
    type: 'string',
    required: true,
    validator: (key) => key.startsWith('sk-'),
    errorMessage: 'API key must start with "sk-"'
  }
});

// Protected and validated
```

### History + Constraints

```typescript
contextManager.setVariable(context, 'balance', 0, {
  constraint: {
    type: 'number',
    validator: (v) => v >= 0,
    errorMessage: 'Balance cannot be negative'
  },
  source: 'initialization'
});

contextManager.setVariable(context, 'balance', 100, {
  source: 'deposit'
});

contextManager.setVariable(context, 'balance', 50, {
  source: 'withdrawal'
});

// Get audit trail with validated changes
const history = contextManager.getVariableHistory(context, 'balance');
// All entries are guaranteed to have non-negative values
```

### All Three Features

```typescript
// Ultimate protection: immutable, tracked, and validated
contextManager.setVariable(context, 'configuration', {
  apiUrl: 'https://api.example.com',
  timeout: 30000,
  retries: 3
}, {
  immutable: true,  // Cannot be changed
  constraint: {     // Must be valid object
    type: 'object',
    required: true,
    validator: (config) => {
      return config.apiUrl &&
             config.timeout > 0 &&
             config.retries >= 0;
    },
    errorMessage: 'Invalid configuration object'
  },
  source: 'system:init'  // Track origin
});

// This creates:
// - An immutable variable that cannot be modified
// - A validated object that meets all constraints
// - A history entry tracking when and where it was set
```

---

## 5. API Reference

### Setting Variables

```typescript
setVariable(
  context: ExecutionContext,
  name: string,
  value: any,
  options?: VariableOptions
): void

interface VariableOptions {
  immutable?: boolean;           // Make variable immutable
  trackHistory?: boolean;         // Track history (default: true)
  constraint?: VariableConstraint; // Type constraint
  source?: string;                // Source identifier
}
```

### Immutability

```typescript
setImmutableVariable(
  context: ExecutionContext,
  name: string,
  value: any,
  options?: Omit<VariableOptions, 'immutable'>
): void

isImmutable(context: ExecutionContext, name: string): boolean
```

### History

```typescript
getVariableHistory(
  context: ExecutionContext,
  name: string
): VariableHistoryEntry[]

interface VariableHistoryEntry {
  value: any;
  timestamp: number;
  operation: 'set' | 'delete' | 'update';
  source?: string;
}

getVariableAtTime(
  context: ExecutionContext,
  name: string,
  timestamp: number
): any

getAllVariableChanges(
  context: ExecutionContext
): Map<string, VariableHistoryEntry[]>
```

### Constraints

```typescript
setVariableConstraint(
  context: ExecutionContext,
  name: string,
  constraint: VariableConstraint
): void

getVariableConstraint(
  context: ExecutionContext,
  name: string
): VariableConstraint | undefined

interface VariableConstraint {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'any';
  required?: boolean;
  validator?: (value: any) => boolean;
  errorMessage?: string;
}
```

---

## 6. Best Practices

### When to Use Immutability

✅ **Use for:**
- API keys and secrets
- User IDs and authentication tokens
- Flow configuration
- Input data that should remain unchanged
- Trace IDs and metadata

❌ **Don't use for:**
- Temporary working variables
- Counter variables
- Status flags that need to change
- Cached results

### When to Track History

✅ **Use for:**
- Critical business data
- User-facing data that may need rollback
- Debugging complex flows
- Audit requirements
- Variables that change frequently

❌ **Don't use for:**
- Large objects (history creates copies)
- High-frequency updates
- Temporary calculations
- Internal loop variables

### When to Use Constraints

✅ **Use for:**
- External input validation
- API response validation
- User-provided data
- Critical business rules
- Cross-service data contracts

❌ **Don't use for:**
- Internal variables you control
- Performance-critical paths
- Variables with dynamic types
- Temporary calculations

---

## 7. Performance Considerations

### Memory Usage

**History Tracking:**
- Each change creates a deep clone
- Memory grows with number of changes
- Consider disabling for high-frequency updates

```typescript
// Disable history for temporary variables
contextManager.setVariable(context, 'tempVar', value, {
  trackHistory: false
});
```

**Deep Cloning:**
- Handles nested objects, arrays, Maps, Sets, Dates
- Can be expensive for large objects
- Use immutable data structures if possible

### Validation Performance

**Custom Validators:**
- Run on every variable update
- Keep validators simple and fast
- Cache validation results if possible

```typescript
// Good: Simple, fast validation
validator: (v) => typeof v === 'number' && v > 0

// Bad: Complex, slow validation
validator: (v) => {
  // Expensive operation
  return validateAgainstDatabase(v);
}
```

---

## 8. Migration Guide

### Existing Code

```typescript
// Old way
context.variables.set('myVar', value);
```

### New Way (Backward Compatible)

```typescript
// Still works - no changes needed
contextManager.setVariable(context, 'myVar', value);

// Or with new features
contextManager.setVariable(context, 'myVar', value, {
  immutable: true,
  constraint: { type: 'string' },
  source: 'step1'
});
```

### Gradual Adoption

1. **Start with constraints** on external inputs
2. **Add immutability** to critical values
3. **Enable history** for debugging specific issues
4. **Expand** as needed based on requirements

---

## 9. Testing

Comprehensive test suite available at:
`src/ai/dynamic-flow/__tests__/context-manager-enhancements.test.ts`

**Test Coverage:**
- ✅ 31 tests passing
- ✅ All three features tested independently
- ✅ Combined feature interactions tested
- ✅ Edge cases covered

Run tests:
```bash
npm test -- context-manager-enhancements.test.ts
```

---

## 10. Examples

See the test file for comprehensive examples of:
- Immutability protection
- History tracking and time-travel
- Type constraints with custom validators
- Combined features
- Edge cases and error handling

---

**Last Updated:** 2026-01-21
**Version:** 2.0.0
**Status:** ✅ Production Ready
