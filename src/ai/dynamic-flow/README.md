# Dynamic Flow System - Core Components

This directory contains the core components of the Dynamic Flow System.

## 📁 Files

### Core Components

- **`context-manager.ts`** ✅ 
  - Manages execution context and variable storage
  - Supports nested object access with dot notation
  - Template string resolution with `{{variable}}` syntax
  - Scope management for loops and nested contexts
  - Parent-child context inheritance

- **`schema-validator.ts`** ✅
  - Dynamic Zod schema generation from configuration
  - Runtime validation of flow inputs and outputs
  - Support for all schema field types (string, number, boolean, array, object, enum, etc.)
  - Validation rules (min, max, pattern, email, url, etc.)
  - JSON Schema conversion

- **`step-executor.ts`** ⏳ (Coming in Week 2)
  - Individual step execution logic
  - Step-specific handlers

- **`step-handlers.ts`** ⏳ (Coming in Week 2)
  - RETRIEVE: RAG retrieval from vector database
  - GENERATE: LLM text generation
  - TOOL: Tool execution
  - FORMAT: Output formatting
  - TRANSFORM: Data transformation

- **`template-engine.ts`** ⏳ (Coming in Week 2)
  - Advanced template processing
  - Custom template functions

- **`condition-evaluator.ts`** ⏳ (Coming in Week 7)
  - Conditional logic evaluation
  - Expression parsing

## 🧪 Tests

All core components have comprehensive unit tests in `__tests__/`:

- ✅ `context-manager.test.ts` - 100+ test cases
- ✅ `schema-validator.test.ts` - 50+ test cases
- ⏳ `step-executor.test.ts` (Coming in Week 2)

## 🚀 Usage Examples

### Context Manager

```typescript
import { ContextManager } from './context-manager';

// Create context with initial data
const ctx = new ContextManager({
  user: { name: 'Ahmed', age: 25 },
  items: ['apple', 'banana']
});

// Get values
ctx.get('user.name'); // 'Ahmed'
ctx.get('items[0]');   // 'apple'

// Resolve templates
ctx.resolve('Hello {{user.name}}!'); // 'Hello Ahmed!'

// Handle scopes (for loops)
ctx.pushScope({ item: 'apple' });
ctx.get('item'); // 'apple'
ctx.popScope();
```

### Schema Validator

```typescript
import { SchemaValidator } from './schema-validator';

// Define schema
const schema = {
  type: 'zod',
  fields: [
    {
      name: 'email',
      type: 'string',
      required: true,
      validation: [
        { type: 'email', message: 'Invalid email' }
      ]
    }
  ],
  required: true
};

// Validate data
const result = SchemaValidator.validate(
  { email: 'test@example.com' },
  schema
);

if (result.success) {
  console.log('Valid:', result.data);
} else {
  console.log('Errors:', result.errors);
}
```

## 🏗️ Architecture

### Context Manager Flow

```
Input Variables
     ↓
ContextManager
     ├─ Variable Storage (Map)
     ├─ Scope Stack (Array of Maps)
     ├─ Parent Context (Optional)
     └─ Template Resolution
          ↓
Resolved Output
```

### Schema Validator Flow

```
Schema Definition
     ↓
Zod Schema Generation
     ├─ Field Type Mapping
     ├─ Validation Rules
     └─ Required/Optional
          ↓
Runtime Validation
     ↓
Success/Error Result
```

## 📝 Implementation Status

### Week 1 ✅ COMPLETED
- [x] Context Manager - Full implementation
- [x] Schema Validator - Full implementation
- [x] Unit tests - Comprehensive coverage
- [x] Documentation - Complete

### Week 2 (Next Steps)
- [ ] Step Handlers implementation
- [ ] Tool Registry setup
- [ ] Template Engine
- [ ] Integration with DynamicFlowExecutor

## 🔗 Related Files

- **Flow Executor**: `../flows/dynamic-flow-executor.ts`
- **Type Definitions**: `../../lib/models/flow-config.ts`, `../../lib/models/prompt-config.ts`
- **Database Schema**: `../../../docs/FIRESTORE_SCHEMA.md`

## 📚 Documentation

- [Dynamic Flows Roadmap](../../../../dynamic-flows.md)
- [Firestore Schema](../../../docs/FIRESTORE_SCHEMA.md)
- [Architecture Overview](../../../../ARCHITECTURE.md)

## 🧑‍💻 Development

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test context-manager.test.ts

# Run with coverage
npm test -- --coverage
```

### Code Quality

- TypeScript strict mode enabled
- Comprehensive JSDoc comments
- Error handling with custom error classes
- Extensive unit test coverage

## 🎯 Key Features

### Context Manager
- ✅ Nested object access (`user.address.city`)
- ✅ Array indexing (`items[0]`)
- ✅ Template variables (`{{name}}`)
- ✅ Default values (`{{name|Guest}}`)
- ✅ Scope management (for loops)
- ✅ Parent-child contexts
- ✅ Context cloning and merging

### Schema Validator
- ✅ All field types supported
- ✅ Validation rules (min, max, length, pattern, email, url)
- ✅ Nested objects and arrays
- ✅ Optional and required fields
- ✅ Default values
- ✅ JSON Schema conversion
- ✅ Type-safe Zod schemas

## 🔜 Coming Soon

### Week 2 Additions
1. **Step Handlers** - Execute different step types
2. **Tool Registry** - Manage available tools
3. **Template Engine** - Advanced templating
4. **Integration Tests** - End-to-end flow testing

### Week 7 Additions
1. **Condition Evaluator** - Complex conditional logic
2. **Loop Support** - Iterate over collections
3. **Parallel Execution** - Run steps in parallel

---

**Last Updated**: 2026-01-14  
**Status**: Week 1 Complete ✅  
**Next Milestone**: Week 2 - Step Handlers & Services
