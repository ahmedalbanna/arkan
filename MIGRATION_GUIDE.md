# Migration Guide: Static to Dynamic Flows

## Overview

This guide provides step-by-step instructions for migrating existing static Genkit flows to the new dynamic flow system.

---

## Table of Contents

1. [Pre-Migration Checklist](#pre-migration-checklist)
2. [Migration Strategy](#migration-strategy)
3. [Step-by-Step Migration Process](#step-by-step-migration-process)
4. [Example Migrations](#example-migrations)
5. [Testing & Validation](#testing--validation)
6. [Rollback Plan](#rollback-plan)
7. [Post-Migration Tasks](#post-migration-tasks)

---

## Pre-Migration Checklist

### ✅ Prerequisites

- [ ] Dynamic flow system fully implemented and tested
- [ ] Database schema created and deployed
- [ ] Management APIs deployed and accessible
- [ ] Admin UI ready for flow management
- [ ] Migration scripts tested in staging environment
- [ ] Backup of current production database
- [ ] Monitoring and alerting configured

### ✅ System Requirements

- [ ] Node.js 18+ installed
- [ ] Firebase Admin SDK configured
- [ ] Access to Firestore database
- [ ] Admin credentials for API access
- [ ] Development environment for testing

---

## Migration Strategy

### Phased Approach

We'll migrate flows in phases based on complexity and usage:

**Phase 1: Simple Flows (Week 1)**
- Text generation flows
- Translation flows
- Summarization flows
- **Total**: ~15 flows

**Phase 2: Analysis Flows (Week 2)**
- Grammar checking
- Bias detection
- Fact checking
- **Total**: ~10 flows

**Phase 3: Complex Flows (Week 3)**
- Report generation
- Documentation generation
- Project generation
- **Total**: ~15 flows

**Phase 4: Academic Flows (Week 4)**
- Literature reviews
- Research papers
- Academic analysis
- **Total**: ~10 flows

**Phase 5: Remaining Flows (Week 5)**
- All other flows
- Custom/specialized flows
- **Total**: ~8 flows

### Dual-Mode Operation

During migration:
1. Keep existing static flows operational
2. Deploy dynamic flows in parallel
3. Gradually route traffic to dynamic flows
4. Monitor performance and errors
5. Roll back if issues detected

---

## Step-by-Step Migration Process

### Step 1: Analyze Existing Flow

```bash
# Run analysis script
npm run analyze-flow -- --flow=generate-text
```

This will output:
- Flow name and description
- Number of steps
- Tools used
- Prompts used
- Input/output schemas
- Dependencies

### Step 2: Extract Prompts

For each flow, extract hardcoded prompts to database:

**Script**: `scripts/extract-prompts.ts`

```typescript
import { extractPromptFromFlow } from './migration-utils';

// Extract prompt from generate-text flow
const prompt = await extractPromptFromFlow('generate-text');

// Save to database
await createPrompt({
  name: 'generate-text-prompt',
  displayName: 'Text Generation Prompt',
  category: 'text-generation',
  templateContent: prompt.template,
  systemPrompt: prompt.system,
  variables: prompt.variables,
  inputSchema: prompt.inputSchema,
  outputSchema: prompt.outputSchema,
});
```

### Step 3: Create Flow Configuration

Map the static flow to a dynamic configuration:

**Script**: `scripts/create-flow-config.ts`

```typescript
import { createFlowConfiguration } from '@/services/flow-config-service';

const flowConfig = {
  name: 'generate-text',
  displayName: 'Text Generation',
  description: 'Generate text based on user input',
  category: 'text-generation',
  
  steps: [
    {
      id: 'step-1',
      type: 'GENERATE',
      name: 'Generate Text',
      config: {
        promptId: 'generate-text-prompt',
        model: 'ollama/gemma:2b',
        temperature: 0.7,
      },
      inputSchema: {
        prompt: { type: 'string' },
        context: { type: 'string', optional: true },
      },
      outputSchema: {
        text: { type: 'string' },
      },
      inputMapping: {
        prompt: 'userPrompt',
        context: 'contextData',
      },
      outputMapping: {
        text: 'generatedText',
      },
    },
  ],
  
  inputSchema: {
    userPrompt: { type: 'string' },
    contextData: { type: 'string', optional: true },
  },
  
  outputSchema: {
    generatedText: { type: 'string' },
  },
  
  settings: {
    timeout: 30000,
    enableTracing: true,
    enableCaching: false,
  },
};

await createFlowConfiguration(flowConfig);
```

### Step 4: Test Dynamic Flow

```typescript
// Test the dynamic flow
import { dynamicFlowExecutor } from '@/ai/flows/dynamic-flow-executor';

const result = await dynamicFlowExecutor({
  flowName: 'generate-text',
  payload: {
    userPrompt: 'Write a short story about a robot',
  },
});

console.log(result);
```

### Step 5: Compare Outputs

Run comparison tests:

```typescript
// scripts/compare-outputs.ts

import { generateText } from '@/ai/flows/generate-text'; // Static
import { dynamicFlowExecutor } from '@/ai/flows/dynamic-flow-executor';

const testInputs = [
  { userPrompt: 'Test 1...' },
  { userPrompt: 'Test 2...' },
  // ... more test cases
];

for (const input of testInputs) {
  const staticResult = await generateText(input);
  const dynamicResult = await dynamicFlowExecutor({
    flowName: 'generate-text',
    payload: input,
  });
  
  // Compare results
  compareResults(staticResult, dynamicResult.generatedText);
}
```

### Step 6: Update API Routes

Update API routes to use dynamic executor:

```typescript
// Before
import { generateText } from '@/ai/flows/generate-text';

export async function POST(request: Request) {
  const body = await request.json();
  const result = await generateText(body);
  return Response.json(result);
}

// After
import { dynamicFlowExecutor } from '@/ai/flows/dynamic-flow-executor';

export async function POST(request: Request) {
  const body = await request.json();
  const result = await dynamicFlowExecutor({
    flowName: 'generate-text',
    payload: body,
  });
  return Response.json(result);
}
```

### Step 7: Deploy & Monitor

1. Deploy changes to staging
2. Run smoke tests
3. Monitor for 24 hours
4. Deploy to production with gradual rollout
5. Monitor performance and errors

---

## Example Migrations

### Example 1: Simple Text Generation Flow

**Original Flow** (`generate-text.ts`):

```typescript
export const generateText = ai.defineFlow(
  {
    name: 'generateText',
    inputSchema: z.object({
      prompt: z.string(),
      context: z.string().optional(),
    }),
    outputSchema: z.string(),
  },
  async ({ prompt, context }) => {
    const response = await ai.generate({
      model: 'ollama/gemma:2b',
      prompt: `${context ? `Context: ${context}\n\n` : ''}${prompt}`,
      config: {
        temperature: 0.7,
      },
    });
    
    return response.text;
  }
);
```

**Migrated Configuration**:

```json
{
  "name": "generate-text",
  "displayName": "Text Generation",
  "steps": [
    {
      "id": "generate-step",
      "type": "GENERATE",
      "name": "Generate Text",
      "config": {
        "promptId": "text-generation-prompt",
        "model": "ollama/gemma:2b",
        "temperature": 0.7
      },
      "inputSchema": {
        "prompt": { "type": "string" },
        "context": { "type": "string", "optional": true }
      },
      "outputSchema": {
        "text": { "type": "string" }
      }
    }
  ],
  "inputSchema": {
    "prompt": { "type": "string" },
    "context": { "type": "string", "optional": true }
  },
  "outputSchema": {
    "text": { "type": "string" }
  }
}
```

**Prompt Template**:

```json
{
  "name": "text-generation-prompt",
  "templateContent": "{{#if context}}Context: {{context}}\n\n{{/if}}{{prompt}}",
  "variables": [
    {
      "name": "prompt",
      "type": "string",
      "required": true
    },
    {
      "name": "context",
      "type": "string",
      "required": false
    }
  ]
}
```

### Example 2: Multi-Step Flow with RAG

**Original Flow** (`generate-report-section-rag.ts`):

```typescript
export const generateReportSectionRAG = ai.defineFlow(
  {
    name: 'generateReportSectionRAG',
    inputSchema: GenerateReportSectionInputSchema,
    outputSchema: GenerateReportSectionOutputSchema,
  },
  async (input) => {
    // Step 1: Retrieve context
    const retrievedDocs = await retrieve({
      retriever: qdrantRetriever,
      query: input.topic,
    });
    
    const context = retrievedDocs.map(doc => doc.text).join('\n\n');
    
    // Step 2: Generate section
    const response = await ai.generate({
      model: 'ollama/phi3:mini',
      prompt: `Topic: ${input.topic}\nContext: ${context}\nGenerate a report section.`,
    });
    
    return { content: response.text };
  }
);
```

**Migrated Configuration**:

```json
{
  "name": "generate-report-section-rag",
  "displayName": "Generate Report Section (RAG)",
  "steps": [
    {
      "id": "retrieve-step",
      "type": "RETRIEVE",
      "name": "Retrieve Context",
      "config": {
        "retrieverName": "qdrant-retriever",
        "query": "{{topic}}",
        "topK": 5
      },
      "inputSchema": {
        "topic": { "type": "string" }
      },
      "outputSchema": {
        "documents": { "type": "array" }
      },
      "outputMapping": {
        "documents": "retrievedContext"
      }
    },
    {
      "id": "generate-step",
      "type": "GENERATE",
      "name": "Generate Section",
      "config": {
        "promptId": "report-section-prompt",
        "model": "ollama/phi3:mini",
        "temperature": 0.5
      },
      "inputSchema": {
        "topic": { "type": "string" },
        "context": { "type": "string" }
      },
      "outputSchema": {
        "content": { "type": "string" }
      }
    }
  ],
  "inputSchema": {
    "topic": { "type": "string" },
    "guidelines": { "type": "string", "optional": true }
  },
  "outputSchema": {
    "content": { "type": "string" }
  }
}
```

### Example 3: Complex Flow with Tool Calls

**Original Flow** (`academic-literature-review.ts`):

```typescript
export const academicLiteratureReview = ai.defineFlow(
  {
    name: 'academicLiteratureReview',
    inputSchema: LiteratureReviewInputSchema,
    outputSchema: LiteratureReviewOutputSchema,
  },
  async (input) => {
    // Step 1: Search for papers
    const papers = await searchPapers(input.topic);
    
    // Step 2: Analyze each paper
    const analyses = [];
    for (const paper of papers) {
      const analysis = await analyzePaper(paper);
      analyses.push(analysis);
    }
    
    // Step 3: Generate review
    const review = await ai.generate({
      model: 'ollama/llama3:8b',
      prompt: `Generate literature review for: ${input.topic}\nAnalyses: ${JSON.stringify(analyses)}`,
    });
    
    return { review: review.text };
  }
);
```

**Migrated Configuration**:

```json
{
  "name": "academic-literature-review",
  "displayName": "Academic Literature Review",
  "steps": [
    {
      "id": "search-step",
      "type": "TOOL",
      "name": "Search Papers",
      "config": {
        "toolName": "search-papers",
        "parameters": {
          "query": "{{topic}}"
        }
      },
      "inputSchema": {
        "topic": { "type": "string" }
      },
      "outputSchema": {
        "papers": { "type": "array" }
      }
    },
    {
      "id": "analyze-loop",
      "type": "LOOP",
      "name": "Analyze Papers",
      "config": {
        "itemsSource": "papers",
        "itemVariable": "paper",
        "steps": [
          {
            "id": "analyze-step",
            "type": "TOOL",
            "name": "Analyze Paper",
            "config": {
              "toolName": "analyze-paper",
              "parameters": {
                "paper": "{{paper}}"
              }
            }
          }
        ]
      },
      "outputMapping": {
        "results": "analyses"
      }
    },
    {
      "id": "generate-review",
      "type": "GENERATE",
      "name": "Generate Review",
      "config": {
        "promptId": "literature-review-prompt",
        "model": "ollama/llama3:8b",
        "temperature": 0.7
      },
      "inputSchema": {
        "topic": { "type": "string" },
        "analyses": { "type": "array" }
      },
      "outputSchema": {
        "review": { "type": "string" }
      }
    }
  ]
}
```

---

## Testing & Validation

### Automated Tests

Create test suite for each migrated flow:

```typescript
// __tests__/flows/generate-text.test.ts

import { dynamicFlowExecutor } from '@/ai/flows/dynamic-flow-executor';

describe('generate-text flow', () => {
  it('should generate text from prompt', async () => {
    const result = await dynamicFlowExecutor({
      flowName: 'generate-text',
      payload: {
        userPrompt: 'Write a haiku about coding',
      },
    });
    
    expect(result.generatedText).toBeDefined();
    expect(typeof result.generatedText).toBe('string');
    expect(result.generatedText.length).toBeGreaterThan(0);
  });
  
  it('should handle context', async () => {
    const result = await dynamicFlowExecutor({
      flowName: 'generate-text',
      payload: {
        userPrompt: 'Summarize this',
        contextData: 'Long text...',
      },
    });
    
    expect(result.generatedText).toBeDefined();
  });
  
  it('should handle errors gracefully', async () => {
    await expect(
      dynamicFlowExecutor({
        flowName: 'generate-text',
        payload: {},
      })
    ).rejects.toThrow();
  });
});
```

### Manual Testing Checklist

For each migrated flow:

- [ ] Test with valid inputs
- [ ] Test with edge cases
- [ ] Test with invalid inputs
- [ ] Test error handling
- [ ] Test timeout scenarios
- [ ] Compare output with static flow
- [ ] Measure performance (latency)
- [ ] Check memory usage
- [ ] Verify tracing works
- [ ] Test in staging environment

### Performance Benchmarks

```typescript
// scripts/benchmark-flow.ts

import { benchmark } from './benchmark-utils';

const results = await benchmark('generate-text', {
  iterations: 100,
  inputs: [
    { userPrompt: 'Test 1' },
    { userPrompt: 'Test 2' },
    // ... more
  ],
});

console.log('Average latency:', results.avgLatency);
console.log('P95 latency:', results.p95Latency);
console.log('Error rate:', results.errorRate);
```

---

## Rollback Plan

### Immediate Rollback

If critical issues detected:

1. **Switch traffic back to static flows**
   ```bash
   npm run rollback-flow -- --flow=generate-text
   ```

2. **Disable dynamic executor**
   ```typescript
   // In API route
   const USE_DYNAMIC = false; // Toggle this
   ```

3. **Monitor for stabilization**

### Partial Rollback

If issues with specific flows:

1. Mark flow as inactive in database
2. Route traffic to static flow
3. Investigate and fix issues
4. Re-enable when ready

### Data Rollback

If configuration corrupted:

1. Restore from backup
   ```bash
   npm run restore-flow-config -- --date=2024-01-10
   ```

2. Verify configurations
3. Resume operations

---

## Post-Migration Tasks

### Week 1 After Migration

- [ ] Monitor error rates daily
- [ ] Check performance metrics
- [ ] Review user feedback
- [ ] Optimize slow flows
- [ ] Update documentation

### Week 2-4 After Migration

- [ ] Analyze usage patterns
- [ ] Identify optimization opportunities
- [ ] Create reusable flow templates
- [ ] Train team on flow management
- [ ] Remove old static flow code

### Ongoing

- [ ] Regular performance reviews
- [ ] User training sessions
- [ ] Flow optimization
- [ ] Documentation updates
- [ ] Feature enhancements

---

## Migration Automation Scripts

### Generate Migration Plan

```bash
npm run generate-migration-plan
```

Outputs:
- List of all flows to migrate
- Complexity rating for each
- Estimated migration time
- Dependencies between flows

### Batch Migration

```bash
npm run migrate-flows -- --batch=phase1
```

Migrates multiple flows in one batch:
- Extracts prompts
- Creates configurations
- Runs tests
- Generates report

### Validation Script

```bash
npm run validate-migration
```

Validates:
- All flows have configurations
- All prompts extracted
- All tools registered
- No broken references

---

## Troubleshooting

### Common Issues

**Issue**: Flow configuration not found
**Solution**: Check flow name matches exactly, verify database connection

**Issue**: Step execution fails
**Solution**: Check step configuration, verify tool/prompt exists

**Issue**: Schema validation errors
**Solution**: Review input/output schemas, check data types

**Issue**: Performance degradation
**Solution**: Enable caching, optimize prompts, check database queries

**Issue**: Inconsistent outputs
**Solution**: Compare prompts, check model settings, verify context handling

---

## Support & Resources

- **Documentation**: `/docs/dynamic-flows/`
- **Migration Scripts**: `/scripts/migration/`
- **Test Utilities**: `/scripts/test-utils/`
- **Slack Channel**: `#dynamic-flows-migration`
- **On-call Engineer**: See runbook

---

## Success Criteria

Migration is considered successful when:

- ✅ All flows migrated and functional
- ✅ Performance within 10% of static flows
- ✅ Error rate < 0.1%
- ✅ All tests passing
- ✅ Team trained on new system
- ✅ Documentation complete
- ✅ Monitoring in place
- ✅ Rollback plan tested

