# Dynamic Flow System - Technical Specifications

## Table of Contents
1. [Database Schema Details](#database-schema-details)
2. [Dynamic Flow Executor Architecture](#dynamic-flow-executor-architecture)
3. [API Specifications](#api-specifications)
4. [Step Type Definitions](#step-type-definitions)
5. [Data Flow & Context Management](#data-flow--context-management)
6. [Security & Access Control](#security--access-control)
7. [Error Handling & Recovery](#error-handling--recovery)

---

## Database Schema Details

### 1. Flow Configuration Schema

```typescript
interface FlowConfiguration {
  id: string;
  name: string;
  displayName: string;
  description: string;
  version: number;
  status: 'draft' | 'active' | 'archived';
  category: string;
  tags: string[];
  
  // Step definitions
  steps: FlowStep[];
  
  // Schema definitions
  inputSchema: Record<string, any>; // Zod schema as JSON
  outputSchema: Record<string, any>;
  
  // Metadata
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;
  
  // Settings
  settings: FlowSettings;
}

interface FlowStep {
  id: string;
  type: 'RETRIEVE' | 'GENERATE' | 'TOOL' | 'FORMAT' | 'CONDITION' | 'LOOP';
  name: string;
  description?: string;
  
  // Configuration based on type
  config: StepConfig;
  
  // I/O Schema
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
  
  // Data mapping
  inputMapping?: Record<string, string>; // Map context vars to inputs
  outputMapping?: Record<string, string>; // Map outputs to context vars
  
  // Error handling
  onError?: 'stop' | 'skip' | 'retry';
  retryCount?: number;
  
  // Conditional execution
  condition?: string; // JavaScript expression
}

type StepConfig = 
  | RetrieveStepConfig
  | GenerateStepConfig
  | ToolStepConfig
  | FormatStepConfig
  | ConditionStepConfig
  | LoopStepConfig;

interface RetrieveStepConfig {
  retrieverName: string;
  query: string; // Template string with variables
  topK?: number;
  minScore?: number;
}

interface GenerateStepConfig {
  promptId: string; // Reference to dynamic prompt
  model?: string;
  temperature?: number;
  maxTokens?: number;
  streamResponse?: boolean;
}

interface ToolStepConfig {
  toolName: string;
  parameters: Record<string, any>;
}

interface FormatStepConfig {
  outputFormat: 'json' | 'markdown' | 'html' | 'text';
  template?: string;
}

interface ConditionStepConfig {
  condition: string; // JavaScript expression
  trueSteps: FlowStep[];
  falseSteps?: FlowStep[];
}

interface LoopStepConfig {
  itemsSource: string; // Context variable with array
  itemVariable: string; // Variable name for current item
  steps: FlowStep[];
  maxIterations?: number;
}

interface FlowSettings {
  timeout?: number; // milliseconds
  enableTracing: boolean;
  enableCaching: boolean;
  cacheKeyTemplate?: string;
  requiresAuth: boolean;
  allowedRoles?: string[];
  rateLimitPerMinute?: number;
}
```

### 2. Prompt Configuration Schema

```typescript
interface PromptConfiguration {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  tags: string[];
  
  // Template
  templateContent: string; // With {{variable}} syntax
  systemPrompt?: string;
  
  // Variables
  variables: PromptVariable[];
  
  // Schema
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
  
  // Metadata
  version: number;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Testing
  testCases?: PromptTestCase[];
}

interface PromptVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
  defaultValue?: any;
  validation?: Record<string, any>;
}

interface PromptTestCase {
  id: string;
  name: string;
  input: Record<string, any>;
  expectedOutput?: string;
  lastRunAt?: Timestamp;
  passed?: boolean;
}
```

### 3. Tool Registry Schema

```typescript
interface ToolConfiguration {
  name: string;
  displayName: string;
  description: string;
  category: string;
  
  // Implementation
  type: 'builtin' | 'custom' | 'external';
  handler: string; // Function name or URL
  
  // Schema
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
  
  // Settings
  timeout?: number;
  requiresAuth?: boolean;
  cacheable?: boolean;
  
  // Documentation
  examples?: ToolExample[];
  documentation?: string;
}

interface ToolExample {
  name: string;
  input: Record<string, any>;
  expectedOutput: any;
}
```

### 4. Execution Trace Schema

```typescript
interface ExecutionTrace {
  id: string;
  flowId: string;
  flowVersion: number;
  
  // Execution info
  startTime: Timestamp;
  endTime?: Timestamp;
  duration?: number;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  
  // Input/Output
  input: Record<string, any>;
  output?: any;
  error?: string;
  
  // Step traces
  stepTraces: StepTrace[];
  
  // Metadata
  userId?: string;
  requestId: string;
  environment: 'development' | 'staging' | 'production';
}

interface StepTrace {
  stepId: string;
  stepName: string;
  stepType: string;
  
  startTime: Timestamp;
  endTime?: Timestamp;
  duration?: number;
  status: 'running' | 'completed' | 'failed' | 'skipped';
  
  input: any;
  output?: any;
  error?: string;
  
  // Additional metadata
  model?: string;
  tokenUsage?: {
    input: number;
    output: number;
  };
}
```

---

## Dynamic Flow Executor Architecture

### Core Executor Implementation

```typescript
// src/ai/flows/dynamic-flow-executor.ts

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getFlowConfiguration } from '@/services/flow-config-service';
import { executeStep } from '@/ai/dynamic-flow/step-executor';
import { ContextManager } from '@/ai/dynamic-flow/context-manager';
import { validateSchema } from '@/ai/dynamic-flow/schema-validator';

const DynamicFlowInputSchema = z.object({
  flowName: z.string(),
  payload: z.record(z.any()),
  traceId: z.string().optional(),
});

const DynamicFlowOutputSchema = z.record(z.any());

export const dynamicFlowExecutor = ai.defineFlow(
  {
    name: 'DynamicFlowExecutor',
    inputSchema: DynamicFlowInputSchema,
    outputSchema: DynamicFlowOutputSchema,
  },
  async (input) => {
    // 1. Load flow configuration
    const flowConfig = await getFlowConfiguration(input.flowName);
    
    if (!flowConfig) {
      throw new Error(`Flow not found: ${input.flowName}`);
    }
    
    if (flowConfig.status !== 'active') {
      throw new Error(`Flow is not active: ${input.flowName}`);
    }
    
    // 2. Validate input against flow schema
    const validatedInput = validateSchema(
      input.payload,
      flowConfig.inputSchema
    );
    
    // 3. Initialize context manager
    const context = new ContextManager(validatedInput);
    
    // 4. Execute steps sequentially
    for (const step of flowConfig.steps) {
      try {
        // Check condition if exists
        if (step.condition && !evaluateCondition(step.condition, context)) {
          continue; // Skip this step
        }
        
        // Map inputs from context
        const stepInput = mapInputs(step.inputMapping, context);
        
        // Validate step input
        const validatedStepInput = validateSchema(
          stepInput,
          step.inputSchema
        );
        
        // Execute step
        const stepOutput = await executeStep(
          step,
          validatedStepInput,
          context
        );
        
        // Validate step output
        const validatedStepOutput = validateSchema(
          stepOutput,
          step.outputSchema
        );
        
        // Update context
        context.updateFromStep(step.id, validatedStepOutput, step.outputMapping);
        
      } catch (error) {
        // Handle step error based on configuration
        const handled = await handleStepError(
          error,
          step,
          context,
          flowConfig
        );
        
        if (!handled) {
          throw error; // Re-throw if not handled
        }
      }
    }
    
    // 5. Extract final output
    const output = context.getFinalOutput();
    
    // 6. Validate output against flow schema
    const validatedOutput = validateSchema(
      output,
      flowConfig.outputSchema
    );
    
    return validatedOutput;
  }
);

// Helper functions

function evaluateCondition(
  condition: string,
  context: ContextManager
): boolean {
  // Safe evaluation of condition with context variables
  // Use a sandboxed environment for security
  const contextVars = context.getAllVariables();
  
  try {
    // Create a safe evaluation context
    const func = new Function(...Object.keys(contextVars), `return ${condition}`);
    return func(...Object.values(contextVars));
  } catch (error) {
    console.error('Condition evaluation error:', error);
    return false;
  }
}

function mapInputs(
  mapping: Record<string, string> | undefined,
  context: ContextManager
): Record<string, any> {
  if (!mapping) {
    return context.getAllVariables();
  }
  
  const result: Record<string, any> = {};
  
  for (const [targetKey, sourceExpression] of Object.entries(mapping)) {
    result[targetKey] = context.resolve(sourceExpression);
  }
  
  return result;
}

async function handleStepError(
  error: Error,
  step: FlowStep,
  context: ContextManager,
  flowConfig: FlowConfiguration
): Promise<boolean> {
  switch (step.onError) {
    case 'skip':
      console.warn(`Step ${step.id} failed, skipping:`, error);
      return true;
      
    case 'retry':
      const retryCount = step.retryCount || 3;
      // Implement retry logic
      return false; // Not handled, will retry
      
    case 'stop':
    default:
      return false; // Not handled, will throw
  }
}
```

### Step Executor Implementation

```typescript
// src/ai/dynamic-flow/step-executor.ts

import { FlowStep } from '@/lib/models/flow-config';
import { ContextManager } from './context-manager';
import {
  executeRetrieveStep,
  executeGenerateStep,
  executeToolStep,
  executeFormatStep,
  executeConditionStep,
  executeLoopStep,
} from './step-handlers';

export async function executeStep(
  step: FlowStep,
  input: Record<string, any>,
  context: ContextManager
): Promise<any> {
  console.log(`Executing step: ${step.name} (${step.type})`);
  
  switch (step.type) {
    case 'RETRIEVE':
      return await executeRetrieveStep(step.config, input, context);
      
    case 'GENERATE':
      return await executeGenerateStep(step.config, input, context);
      
    case 'TOOL':
      return await executeToolStep(step.config, input, context);
      
    case 'FORMAT':
      return await executeFormatStep(step.config, input, context);
      
    case 'CONDITION':
      return await executeConditionStep(step.config, input, context);
      
    case 'LOOP':
      return await executeLoopStep(step.config, input, context);
      
    default:
      throw new Error(`Unknown step type: ${step.type}`);
  }
}
```

### Context Manager Implementation

```typescript
// src/ai/dynamic-flow/context-manager.ts

export class ContextManager {
  private variables: Map<string, any> = new Map();
  private history: Array<{ stepId: string; data: any }> = [];
  
  constructor(initialData: Record<string, any>) {
    // Initialize with input data
    for (const [key, value] of Object.entries(initialData)) {
      this.variables.set(key, value);
    }
  }
  
  // Update context from step output
  updateFromStep(
    stepId: string,
    output: any,
    mapping?: Record<string, string>
  ): void {
    // Store in history
    this.history.push({ stepId, data: output });
    
    if (mapping) {
      // Use custom mapping
      for (const [targetVar, sourceExpression] of Object.entries(mapping)) {
        const value = this.resolveExpression(sourceExpression, output);
        this.variables.set(targetVar, value);
      }
    } else {
      // Default: merge output into context
      if (typeof output === 'object' && output !== null) {
        for (const [key, value] of Object.entries(output)) {
          this.variables.set(key, value);
        }
      } else {
        // Store as 'lastResult'
        this.variables.set('lastResult', output);
      }
    }
  }
  
  // Get variable value
  get(key: string): any {
    return this.variables.get(key);
  }
  
  // Set variable value
  set(key: string, value: any): void {
    this.variables.set(key, value);
  }
  
  // Check if variable exists
  has(key: string): boolean {
    return this.variables.has(key);
  }
  
  // Get all variables
  getAllVariables(): Record<string, any> {
    return Object.fromEntries(this.variables);
  }
  
  // Resolve template string with variables
  resolve(template: string): any {
    // Support {{variable}} syntax
    return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const value = this.get(key.trim());
      return value !== undefined ? String(value) : match;
    });
  }
  
  // Resolve expression from object
  private resolveExpression(expression: string, data: any): any {
    // Support nested properties: "data.field.subfield"
    const parts = expression.split('.');
    let current = data;
    
    for (const part of parts) {
      if (current && typeof current === 'object') {
        current = current[part];
      } else {
        return undefined;
      }
    }
    
    return current;
  }
  
  // Get final output
  getFinalOutput(): Record<string, any> {
    // Return all variables as final output
    return this.getAllVariables();
  }
  
  // Get execution history
  getHistory(): Array<{ stepId: string; data: any }> {
    return this.history;
  }
}
```

---

## API Specifications

### Flow Management API

#### GET /api/admin/flows

**Response**:
```typescript
{
  flows: FlowConfiguration[];
  total: number;
  page: number;
  pageSize: number;
}
```

#### POST /api/admin/flows

**Request**:
```typescript
{
  name: string;
  displayName: string;
  description: string;
  category: string;
  steps: FlowStep[];
  inputSchema: object;
  outputSchema: object;
  settings?: FlowSettings;
}
```

**Response**:
```typescript
{
  success: boolean;
  flowId: string;
  flow: FlowConfiguration;
}
```

#### PUT /api/admin/flows/{flowId}/config

**Request**:
```typescript
{
  steps?: FlowStep[];
  inputSchema?: object;
  outputSchema?: object;
  settings?: FlowSettings;
  versionMessage?: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  flow: FlowConfiguration;
  previousVersion: number;
  newVersion: number;
}
```

### Prompt Management API

#### GET /api/admin/prompts

**Response**:
```typescript
{
  prompts: PromptConfiguration[];
  total: number;
}
```

#### PUT /api/admin/prompts/{promptId}

**Request**:
```typescript
{
  templateContent?: string;
  systemPrompt?: string;
  variables?: PromptVariable[];
  inputSchema?: object;
  outputSchema?: object;
}
```

**Response**:
```typescript
{
  success: boolean;
  prompt: PromptConfiguration;
  version: number;
}
```

### Execution API

#### POST /api/flows/execute

**Request**:
```typescript
{
  flowName: string;
  payload: Record<string, any>;
  trace?: boolean;
}
```

**Response**:
```typescript
{
  success: boolean;
  output: any;
  traceId?: string;
  duration: number;
}
```

---

## Security & Access Control

### Authentication
- All management APIs require authentication
- Use Firebase Auth tokens
- Validate user roles before operations

### Authorization
- Admin role for flow/prompt management
- User role for flow execution
- Custom roles per flow configuration

### Input Validation
- Validate all inputs against schemas
- Sanitize user-provided data
- Prevent code injection in templates

### Rate Limiting
- Per-user rate limits
- Per-flow rate limits
- Global system limits

---

## Error Handling & Recovery

### Error Types
1. **Configuration Error** - Invalid flow/prompt config
2. **Validation Error** - Schema validation failed
3. **Execution Error** - Step execution failed
4. **Timeout Error** - Execution exceeded timeout
5. **Resource Error** - External service unavailable

### Recovery Strategies
- Retry with exponential backoff
- Skip step and continue
- Stop and rollback
- Log and notify administrators

---

## Performance Considerations

### Caching
- Cache flow configurations in memory
- Cache prompt templates
- Cache tool schemas
- Invalidate on updates

### Optimization
- Lazy load tool implementations
- Parallel step execution where possible
- Stream responses for long operations
- Compress large payloads

---

## Monitoring & Observability

### Metrics
- Flow execution count
- Average execution time
- Error rates
- Step-level metrics

### Logging
- All configuration changes
- Execution traces
- Error logs with stack traces
- Performance metrics

### Alerts
- High error rates
- Long execution times
- Configuration errors
- System failures

