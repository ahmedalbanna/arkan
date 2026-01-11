# Dynamic Flow System - Core Components

This directory contains the core components of the dynamic flow execution system.

## Overview

The dynamic flow system allows flows to be configured in a database and executed at runtime without code changes. This enables remote management, real-time updates, and visual flow building.

## Components

### 1. Context Manager (`context-manager.ts`)

**Purpose**: Manages data flow between steps in a flow execution.

**Key Features**:
- Variable storage and retrieval
- Template string resolution with `{{variable}}` syntax
- Step-to-step data mapping
- Execution history tracking
- Context snapshots and cloning
- Condition evaluation

**Usage**:
```typescript
import { ContextManager } from './context-manager';

const context = new ContextManager({ input: 'value' });
context.set('variable', 'data');
const value = context.get('variable');
const resolved = context.resolve('Hello {{variable}}');
```

### 2. Schema Validator (`schema-validator.ts`)

**Purpose**: Validates data against JSON schemas using Zod.

**Key Features**:
- Dynamic Zod schema generation from JSON
- Type validation (string, number, boolean, array, object)
- Constraint validation (min/max, patterns, enums)
- Input/output validation for steps
- Detailed error reporting

**Usage**:
```typescript
import { schemaValidator, validateSchema } from './schema-validator';

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1 },
    age: { type: 'number', min: 0 },
  },
  required: ['name'],
};

const validatedData = validateSchema(data, schema);
```

### 3. Step Executor (`step-executor.ts`) - Coming Next

**Purpose**: Executes individual steps based on their type.

**Will Support**:
- GENERATE: LLM text generation
- RETRIEVE: RAG context retrieval
- TOOL: External tool execution
- FORMAT: Output formatting
- CONDITION: Conditional branching
- LOOP: Iterative processing

## Database Models

### Flow Configuration (`src/lib/models/flow-config.ts`)

Defines the structure of flows stored in Firestore:
- Flow metadata (name, description, version)
- Step definitions
- Input/output schemas
- Settings and permissions

### Prompt Configuration (`src/lib/models/prompt-config.ts`)

Defines prompt templates:
- Template content with variables
- Variable definitions and validation
- Version history
- Test cases

### Tool Configuration (`src/lib/models/tool-config.ts`)

Defines available tools:
- Tool metadata
- Input/output schemas
- Handler references
- Examples and documentation

### Execution Trace (`src/lib/models/execution-trace.ts`)

Tracks flow execution for debugging:
- Execution status and timing
- Step-by-step trace
- Input/output at each step
- Error details
- Performance metrics

## Dynamic Flow Executor

### Main Executor (`src/ai/flows/dynamic-flow-executor.ts`)

**Purpose**: Main entry point for executing dynamic flows.

**Flow**:
1. Load flow configuration from database
2. Validate input against flow schema
3. Initialize context manager
4. Execute steps sequentially
5. Handle errors and retries
6. Validate and return output
7. Save execution trace

**Usage**:
```typescript
import { dynamicFlowExecutor } from '@/ai/flows/dynamic-flow-executor';

const result = await dynamicFlowExecutor({
  flowName: 'generate-text',
  payload: {
    userPrompt: 'Write a story',
  },
  userId: 'user123',
  enableTracing: true,
});

console.log(result.output);
```

## Architecture

```
Input Data
    ↓
Context Manager (initialize with input)
    ↓
For each step:
    ↓
Map inputs from context
    ↓
Validate input (Schema Validator)
    ↓
Execute step (Step Executor)
    ↓
Validate output (Schema Validator)
    ↓
Update context
    ↓
Next step or complete
    ↓
Extract final output
    ↓
Return result
```

## Error Handling

### Error Strategies

1. **stop** (default): Stop execution and throw error
2. **skip**: Log error and continue to next step
3. **retry**: Retry step with exponential backoff

### Custom Errors

- `FlowNotFoundError`: Flow doesn't exist in database
- `FlowNotActiveError`: Flow is not in active status
- `StepExecutionError`: Step execution failed
- `ValidationError`: Schema validation failed
- `StepValidationError`: Step input/output validation failed

## Week 1 Progress

### ✅ Completed

1. **Database Models**
   - ✅ `flow-config.ts` - Flow configuration schema
   - ✅ `prompt-config.ts` - Prompt template schema
   - ✅ `tool-config.ts` - Tool registry schema
   - ✅ `execution-trace.ts` - Execution tracking schema

2. **Core Components**
   - ✅ `context-manager.ts` - Data flow management
   - ✅ `schema-validator.ts` - Dynamic validation
   - ✅ `dynamic-flow-executor.ts` - Main executor

### 🚧 Next Steps (Week 1 Remaining)

3. **Step Handlers** (Day 5)
   - [ ] `step-executor.ts` - Step execution dispatcher
   - [ ] `step-handlers.ts` - Individual step implementations
   - [ ] Integration tests

### 📋 Upcoming (Week 2)

4. **Database Services**
   - [ ] `flow-config-service.ts` - CRUD for flows
   - [ ] `prompt-management-service.ts` - CRUD for prompts
   - [ ] `tool-registry-service.ts` - Tool management

5. **Tool Registry**
   - [ ] `tool-registry.ts` - Tool registration system
   - [ ] Built-in tool mapping

## Testing

### Unit Tests

Create tests for each component:

```typescript
// __tests__/context-manager.test.ts
describe('ContextManager', () => {
  it('should store and retrieve variables', () => {
    const context = new ContextManager({ input: 'test' });
    context.set('key', 'value');
    expect(context.get('key')).toBe('value');
  });
  
  it('should resolve template strings', () => {
    const context = new ContextManager({ name: 'World' });
    expect(context.resolve('Hello {{name}}')).toBe('Hello World');
  });
});
```

## Configuration Example

### Simple Text Generation Flow

```json
{
  "name": "generate-text",
  "displayName": "Text Generation",
  "status": "active",
  "steps": [
    {
      "id": "step-1",
      "type": "GENERATE",
      "name": "Generate Text",
      "config": {
        "type": "GENERATE",
        "promptId": "text-generation-prompt",
        "model": "ollama/gemma:2b",
        "temperature": 0.7
      },
      "inputSchema": {
        "type": "object",
        "properties": {
          "prompt": { "type": "string" }
        }
      },
      "outputSchema": {
        "type": "object",
        "properties": {
          "text": { "type": "string" }
        }
      }
    }
  ],
  "inputSchema": {
    "type": "object",
    "properties": {
      "prompt": { "type": "string" }
    }
  },
  "outputSchema": {
    "type": "object",
    "properties": {
      "text": { "type": "string" }
    }
  }
}
```

## Development Guidelines

### Adding a New Step Type

1. Add type to `StepType` in `flow-config.ts`
2. Create config interface (e.g., `MyStepConfig`)
3. Add to `StepConfig` union type
4. Implement handler in `step-handlers.ts`
5. Add dispatcher case in `step-executor.ts`
6. Write tests

### Adding a New Tool

1. Create tool configuration in database
2. Register tool in tool registry
3. Implement tool handler
4. Add examples and documentation
5. Write tests

## Performance Considerations

- **Caching**: Flow configurations are cached in memory
- **Validation**: Schema validation adds ~10ms overhead
- **Context**: Minimize context size for better performance
- **Tracing**: Disable in production if not needed

## Security

- All inputs are validated against schemas
- Condition evaluation is sandboxed
- Tool execution requires proper authentication
- Audit logs for all configuration changes

## Resources

- **Planning Docs**: See root directory for implementation plans
- **Technical Specs**: `DYNAMIC_FLOW_TECHNICAL_SPECS.md`
- **Migration Guide**: `MIGRATION_GUIDE.md`
- **Roadmap**: `DYNAMIC_FLOW_ROADMAP.md`

## Support

For questions or issues:
- Check documentation in planning docs
- Review code comments
- Create GitHub issue
- Contact: [Team Lead]

---

**Status**: Week 1 - Foundation Complete ✅  
**Next**: Implement step handlers and database services
