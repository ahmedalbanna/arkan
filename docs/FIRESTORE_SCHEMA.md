# Firestore Schema Documentation
**Week 1 - Day 1-2: Database Models**

This document describes the Firestore collections and document structures for the Dynamic Flow System.

## Collections Overview

```
firestore/
├── flows/                    # Flow configurations
│   ├── {flowId}/
│   │   └── versions/        # Flow version history
│   │       └── {versionId}
│
├── prompts/                 # Prompt configurations
│   ├── {promptId}/
│   │   └── versions/       # Prompt version history
│   │       └── {versionId}
│
├── tools/                   # Tool registry
│   └── {toolName}/
│
├── executions/              # Flow execution traces
│   └── {executionId}/
│       └── steps/          # Step-level traces
│           └── {stepId}
│
├── prompt_categories/       # Prompt organization
│   └── {categoryId}/
│
└── prompt_templates/        # Pre-built prompts
    └── {templateId}/
```

---

## Collection: `flows`

**Purpose**: Store dynamic flow configurations

### Document Structure

```typescript
{
  id: string;                          // Document ID = Flow ID
  name: string;                        // "Academic Literature Review"
  description: string;                 // "Generates comprehensive lit review..."
  version: string;                     // "1.2.0"
  status: 'draft' | 'active' | 'deprecated' | 'archived';
  
  tags: string[];                      // ["academic", "research", "rag"]
  category: string;                    // "academic-writing"
  
  inputSchema: {
    type: 'zod';
    fields: [
      {
        name: 'topic';
        type: 'string';
        label: 'Research Topic';
        required: true;
        description: 'The main topic to research';
      },
      // ... more fields
    ];
    required: true;
  };
  
  outputSchema: {
    type: 'zod';
    fields: [
      {
        name: 'review';
        type: 'string';
        label: 'Literature Review';
        required: true;
      }
    ];
  };
  
  steps: [
    {
      id: 'step-1';
      name: 'Retrieve Research Papers';
      type: 'retrieve';
      description: 'Search academic database';
      config: {
        type: 'retrieve';
        query: '{{topic}}';
        collection: 'academic_papers';
        limit: 10;
        minScore: 0.7;
        outputVariable: 'papers';
      };
      errorHandling: {
        onError: 'retry';
      };
      retry: {
        maxAttempts: 3;
        delay: 1000;
        backoff: 'exponential';
      };
    },
    {
      id: 'step-2';
      name: 'Generate Review';
      type: 'generate';
      config: {
        type: 'generate';
        prompt: 'prompt-academic-review-v2';  // Reference to prompt
        variables: {
          topic: '{{topic}}';
          papers: '{{papers}}';
        };
        outputVariable: 'review';
        outputFormat: 'markdown';
      };
    },
    // ... more steps
  ];
  
  config: {
    timeout: 300000;                   // 5 minutes
    cache: true;
    cacheTTL: 3600;                    // 1 hour
    tracing: true;
    defaultModel: {
      name: 'gemini-1.5-pro';
      temperature: 0.7;
      maxTokens: 4000;
    };
  };
  
  metadata: {
    createdAt: Timestamp;
    updatedAt: Timestamp;
    createdBy: 'user-123';
    updatedBy: 'user-123';
    isPublic: false;
    stats: {
      totalExecutions: 1250;
      successfulExecutions: 1180;
      failedExecutions: 70;
      avgExecutionTime: 45000;        // 45 seconds
      lastExecutedAt: Timestamp;
    };
  };
}
```

### Indexes Required

```javascript
// Composite indexes
flows: {
  status + updatedAt (desc)
  category + status + updatedAt (desc)
  tags (array) + status
  'metadata.isPublic' + status
}
```

### Security Rules

```javascript
match /flows/{flowId} {
  // Read: authenticated users
  allow read: if request.auth != null;
  
  // Write: admin only
  allow create, update: if request.auth != null && 
                           get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
  
  // Delete: super admin only
  allow delete: if request.auth != null && 
                   get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'superadmin';
}
```

---

## Collection: `flows/{flowId}/versions`

**Purpose**: Store flow version history

### Document Structure

```typescript
{
  version: string;                    // "1.2.0"
  changeDescription: string;          // "Added error handling to RAG step"
  createdAt: Timestamp;
  createdBy: string;                  // "user-123"
  configuration: FlowConfiguration;   // Full flow config snapshot
}
```

### Indexes Required

```javascript
versions: {
  createdAt (desc)
}
```

---

## Collection: `prompts`

**Purpose**: Store reusable prompt templates

### Document Structure

```typescript
{
  id: string;                         // Document ID
  name: string;                       // "Academic Review Generator"
  description: string;
  version: string;                    // "2.1.0"
  status: 'draft' | 'testing' | 'active' | 'deprecated' | 'archived';
  
  tags: string[];                     // ["academic", "review"]
  category: string;                   // "academic-writing"
  language: string;                   // "en" | "ar"
  
  template: string;                   // Actual prompt with {{variables}}
  // Example:
  // "Generate a comprehensive literature review on {{topic}}. 
  //  Use the following papers: {{papers}}. 
  //  Focus on {{focus_areas}}."
  
  variables: [
    {
      name: 'topic';
      label: 'Research Topic';
      type: 'string';
      required: true;
      description: 'Main research topic';
      placeholder: 'Enter your research topic';
    },
    {
      name: 'papers';
      label: 'Research Papers';
      type: 'array';
      required: true;
      description: 'Retrieved papers from RAG';
    },
    {
      name: 'focus_areas';
      label: 'Focus Areas';
      type: 'array';
      required: false;
      defaultValue: [];
    }
  ];
  
  outputFormat: {
    type: 'markdown';
    validate: true;
    parseInstructions: 'Extract markdown sections';
  };
  
  modelConfig: {
    preferredModel: 'gemini-1.5-pro';
    temperature: 0.7;
    maxTokens: 4000;
    topP: 0.9;
  };
  
  examples: [
    {
      id: 'example-1';
      input: {
        topic: 'Machine Learning in Healthcare';
        papers: [...];
        focus_areas: ['diagnosis', 'treatment'];
      };
      output: '# Literature Review\n\n...';
      description: 'Healthcare ML review example';
    }
  ];
  
  metadata: {
    createdAt: Timestamp;
    updatedAt: Timestamp;
    createdBy: 'user-123';
    updatedBy: 'user-456';
    isPublic: true;
    source: 'internal';
    stats: {
      totalUses: 450;
      successfulUses: 445;
      failedUses: 5;
      avgTokensUsed: 3500;
      avgExecutionTime: 12000;        // 12 seconds
      lastUsedAt: Timestamp;
      avgRating: 4.5;
    };
  };
}
```

### Indexes Required

```javascript
prompts: {
  status + updatedAt (desc)
  category + status
  tags (array) + status
  language + status
  'metadata.isPublic' + status
}
```

---

## Collection: `tools`

**Purpose**: Tool registry for dynamic flows

### Document Structure

```typescript
{
  name: string;                       // Document ID = Tool name
  displayName: string;                // "Google Search"
  description: string;
  category: string;                   // "search", "formatting", "analysis"
  
  inputSchema: {
    type: 'zod';
    fields: [
      {
        name: 'query';
        type: 'string';
        required: true;
      }
    ];
  };
  
  outputSchema: {
    type: 'zod';
    fields: [
      {
        name: 'results';
        type: 'array';
      }
    ];
  };
  
  config: {
    timeout: 30000;
    rateLimit: {
      maxRequests: 100;
      windowSeconds: 60;
    };
  };
  
  metadata: {
    createdAt: Timestamp;
    isBuiltIn: true;                  // Built-in vs custom
    isEnabled: true;
    stats: {
      totalCalls: 5000;
      successfulCalls: 4950;
      failedCalls: 50;
      avgExecutionTime: 2000;
    };
  };
}
```

---

## Collection: `executions`

**Purpose**: Store flow execution traces for debugging and analytics

### Document Structure

```typescript
{
  id: string;                         // Document ID
  flowId: string;
  flowVersion: string;
  
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  
  input: Record<string, any>;         // Input data
  output: Record<string, any>;        // Output data
  
  startTime: Timestamp;
  endTime: Timestamp;
  duration: number;                   // milliseconds
  
  context: Record<string, any>;       // Variables during execution
  
  error: {
    message: string;
    stack: string;
    stepId: string;                   // Where error occurred
  } | null;
  
  metadata: {
    userId: string;
    environment: 'production' | 'staging' | 'development';
    region: string;
    modelUsage: {
      totalTokens: number;
      promptTokens: number;
      completionTokens: number;
    };
  };
}
```

### Indexes Required

```javascript
executions: {
  flowId + startTime (desc)
  status + startTime (desc)
  'metadata.userId' + startTime (desc)
}
```

### TTL Policy

```javascript
// Auto-delete executions older than 90 days
executions: {
  ttl: {
    field: 'startTime',
    days: 90
  }
}
```

---

## Collection: `executions/{executionId}/steps`

**Purpose**: Step-level execution traces

### Document Structure

```typescript
{
  id: string;                         // Step ID
  stepIndex: number;                  // Order in flow
  stepType: string;                   // 'retrieve', 'generate', etc.
  
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  
  input: Record<string, any>;
  output: any;
  
  startTime: Timestamp;
  endTime: Timestamp;
  duration: number;
  
  retryCount: number;
  
  error: {
    message: string;
    stack: string;
  } | null;
  
  metadata: {
    modelUsed: string;
    tokensUsed: number;
    cacheHit: boolean;
  };
}
```

---

## Collection: `prompt_categories`

**Purpose**: Organize prompts into categories

### Document Structure

```typescript
{
  id: string;
  name: string;                       // "Academic Writing"
  description: string;
  parentId: string | null;            // For nested categories
  icon: string;                       // Icon name
  order: number;                      // Sort order
  
  metadata: {
    createdAt: Timestamp;
    promptCount: number;              // Number of prompts in category
  };
}
```

---

## Collection: `prompt_templates`

**Purpose**: Pre-built prompt templates for users

### Document Structure

```typescript
{
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  
  template: PromptConfiguration;      // Full prompt config
  
  featured: boolean;                  // Show on homepage
  order: number;
  
  metadata: {
    createdAt: Timestamp;
    usageCount: number;
    rating: number;
  };
}
```

---

## Data Migration Notes

### From Static Flows to Dynamic

When migrating existing flows:

1. **Extract prompt text** → Create `prompts` documents
2. **Extract flow logic** → Create `flows` documents
3. **Map tool calls** → Update `tools` registry
4. **Create test cases** → Validate migration
5. **Update references** → Point to new IDs

### Backward Compatibility

During transition:
- Keep old flow code alongside new
- Add feature flag: `USE_DYNAMIC_FLOWS`
- Compare outputs for validation
- Gradual rollout by flow category

---

## Backup & Recovery

### Backup Strategy

```bash
# Daily backup
firebase firestore:export gs://arkan-backups/$(date +%Y%m%d)

# Backup before major changes
firebase firestore:export gs://arkan-backups/pre-migration-$(date +%Y%m%d)
```

### Point-in-Time Recovery

Firestore automatically maintains 7-day point-in-time recovery.

---

## Performance Considerations

### Caching Strategy

- Cache flow configurations: 1 hour TTL
- Cache prompt templates: 30 minutes TTL
- Cache tool schemas: 24 hours TTL
- No caching for executions (always fresh)

### Query Optimization

- Always use indexed queries
- Limit result sets (default: 50)
- Use cursors for pagination
- Avoid subcollection queries without parent filter

### Cost Optimization

- Use cached reads where possible
- Batch write operations
- Archive old executions
- Compress large documents

---

## Security Best Practices

1. **Never store sensitive data** in flow configurations
2. **Use environment variables** for API keys
3. **Validate all inputs** before execution
4. **Rate limit** execution APIs
5. **Audit log** all configuration changes
6. **Encrypt** sensitive outputs

---

## Monitoring & Alerts

### Key Metrics to Track

- Execution success rate
- Average execution time
- Error rate by flow
- Token usage
- Cache hit rate

### Alert Thresholds

- Error rate > 5%: Warning
- Error rate > 10%: Critical
- Avg execution time > 2x baseline: Warning
- Token usage > budget: Warning

---

## Next Steps

After setting up Firestore schema:

1. ✅ Create TypeScript models (`flow-config.ts`, `prompt-config.ts`)
2. ⏭️ Implement Context Manager
3. ⏭️ Implement Schema Validator
4. ⏭️ Create database service layer
5. ⏭️ Build management APIs

---

**Status**: ✅ Schema documentation complete  
**Last Updated**: 2026-01-14  
**Next Review**: Week 2
