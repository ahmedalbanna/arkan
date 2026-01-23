# Generate Section API

## Overview

The Generate Section API endpoint provides AI-powered content generation for individual report sections. It supports context-aware generation with dynamic model selection, retry logic, and comprehensive error handling.

## Endpoint

```
POST /api/generate/section
```

## Authentication

Requires a valid Firebase authentication token in the `Authorization` header:

```
Authorization: Bearer <firebase-id-token>
```

## Request Body

### Schema

```typescript
{
  flow: 'generate-section';
  sectionToGenerate: string;
  prompt: string; // Minimum 10 characters
  otherSections?: Record<string, string>;
  externalContext?: Array<{
    fileName: string;
    content: string;
    type: 'context' | 'example' | 'question' | 'textbook' | 'guidelines';
  }>;
  guidelines?: string[];
  instructionText?: string;
  targetAudience?: string;
  tone?: string;
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `flow` | `'generate-section'` | Yes | Must be the literal string `'generate-section'` |
| `sectionToGenerate` | `string` | Yes | Name/title of the section to generate |
| `prompt` | `string` | Yes | System prompt for generation (min 10 chars) |
| `otherSections` | `Record<string, string>` | No | Map of related sections for context (key: title, value: content) |
| `externalContext` | `Array<ExternalFile>` | No | External documents for reference |
| `guidelines` | `string[]` | No | Specific guidelines for the AI to follow |
| `instructionText` | `string` | No | Additional instructions (tone, formality, etc.) |
| `targetAudience` | `string` | No | Target audience for the content |
| `tone` | `string` | No | Desired tone (professional, casual, etc.) |

### Example Request

```json
{
  "flow": "generate-section",
  "sectionToGenerate": "Executive Summary",
  "prompt": "You are an expert business writer. Create a comprehensive executive summary that highlights key findings and recommendations.",
  "otherSections": {
    "Introduction": "This project aims to revolutionize document generation...",
    "Market Analysis": "The market for AI-powered tools is growing at 25% CAGR..."
  },
  "externalContext": [
    {
      "fileName": "market-research.pdf",
      "content": "According to recent studies...",
      "type": "context"
    }
  ],
  "guidelines": [
    "Keep it under 500 words",
    "Focus on business value",
    "Include key metrics"
  ],
  "tone": "professional",
  "targetAudience": "executives"
}
```

## Response

### Success Response (200 OK)

```typescript
{
  [sectionId: string]: string; // Generated markdown content
}
```

### Example Success Response

```json
{
  "Executive Summary": "# Executive Summary\n\nThis comprehensive report presents..."
}
```

## Error Responses

### 400 Bad Request - Validation Error

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "prompt",
      "message": "Prompt must be at least 10 characters"
    }
  ]
}
```

### 402 Payment Required - Insufficient Credits

```json
{
  "status": 402,
  "message": "Insufficient credits. Please purchase more to continue."
}
```

### 429 Too Many Requests - Rate Limit Exceeded

```json
{
  "status": 429,
  "message": "Rate limit exceeded. You can make 20 requests per minute. Please try again in 45 seconds.",
  "retryAfter": 45
}
```

### 500 Internal Server Error

```json
{
  "error": "Generation failed",
  "message": "The AI failed to generate a response. Please try again."
}
```

## Features

### 1. Dynamic Model Selection

The API automatically selects the most appropriate AI model based on section complexity:

- **Simple** (gemma:2b): Basic sections, <400 words, low complexity
- **Medium** (phi3:mini): Standard sections, 400-800 words, moderate complexity
- **Complex** (llama3:8b): Advanced sections, 800-1500 words, high complexity
- **Expert** (qwen2.5): Expert-level sections, >1500 words, very high complexity

Complexity is assessed based on:
- Word count requirement
- Number of guidelines
- Complexity control setting
- Context dependencies
- Number of behaviors
- Section type (text, diagram, table)

### 2. Automatic Retry Logic

The API includes built-in retry logic with exponential backoff for:

- Network timeouts
- Rate limiting from AI service
- Service unavailability
- Model loading delays

**Configuration:**
- Max attempts: 3
- Initial delay: 1 second
- Max delay: 10 seconds
- Backoff multiplier: 2x

**Non-retryable errors:**
- Validation errors
- Authentication errors
- Insufficient credits

### 3. Credit Management

**Cost:** 1 credit per section generation

**Behavior:**
- Credits are checked before generation
- Credits are deducted before AI call
- **Credits are automatically refunded on generation failure**
- No refund on validation errors (before deduction)

### 4. Rate Limiting

Rate limits are enforced per user based on their role:

| Role | Limit | Window |
|------|-------|--------|
| Free | 5 requests | 1 minute |
| Premium | 20 requests | 1 minute |
| Admin | 100 requests | 1 minute |

Rate limit is checked **before** credit deduction.

### 5. Content Validation & Sanitization

All inputs are validated and sanitized:

**Size Limits:**
- Max total context size: 5 MB
- Max external files: 10
- Max section references: 20

**Sanitization:**
- Removes null bytes
- Normalizes line endings
- Removes control characters
- Trims excessive whitespace

### 6. Generation Logging

All successful generations are logged for analytics:

```typescript
{
  agentId: string;        // Section name
  userId: string;         // User ID
  input: object;          // Request data
  output: object;         // Generated content
  creditCost: number;     // Credits deducted
  timestamp: Date;        // Generation time
}
```

## Usage Examples

### Basic Generation

```typescript
const response = await fetch('/api/generate/section', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${firebaseToken}`,
  },
  body: JSON.stringify({
    flow: 'generate-section',
    sectionToGenerate: 'Introduction',
    prompt: 'Write a compelling introduction for a technical whitepaper.',
  }),
});

const result = await response.json();
console.log(result.Introduction); // Generated content
```

### With Context

```typescript
const response = await fetch('/api/generate/section', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    flow: 'generate-section',
    sectionToGenerate: 'Methodology',
    prompt: 'Describe the research methodology in detail.',
    otherSections: {
      'Introduction': 'This study investigates...',
      'Literature Review': 'Previous research shows...',
    },
    guidelines: [
      'Explain the research design',
      'Justify the approach',
      'Include data collection methods',
    ],
  }),
});
```

### Error Handling

```typescript
try {
  const response = await fetch('/api/generate/section', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.json();
    
    if (response.status === 402) {
      // Handle insufficient credits
      console.error('Please purchase more credits');
    } else if (response.status === 429) {
      // Handle rate limit
      const retryAfter = error.retryAfter;
      console.error(`Rate limited. Retry in ${retryAfter}s`);
    } else {
      console.error('Generation failed:', error.message);
    }
    
    return;
  }

  const result = await response.json();
  // Process successful result
} catch (error) {
  console.error('Network error:', error);
}
```

## Performance

### Typical Response Times

| Complexity | Model | Avg Time | Token Count |
|------------|-------|----------|-------------|
| Simple | gemma:2b | 3-5s | ~500 |
| Medium | phi3:mini | 5-8s | ~1000 |
| Complex | llama3:8b | 10-15s | ~2000 |
| Expert | qwen2.5 | 15-25s | ~3000 |

*Times vary based on server load and content complexity*

### Optimization Tips

1. **Minimize context size** - Only include relevant sections
2. **Use concise prompts** - Be specific but brief
3. **Set appropriate word counts** - Don't request more than needed
4. **Reuse generated content** - Cache results when possible
5. **Batch operations** - Generate multiple sections in parallel

## Best Practices

### 1. Prompt Engineering

**Good:**
```json
{
  "prompt": "You are a technical writer specializing in API documentation. Create clear, concise documentation with code examples.",
  "guidelines": [
    "Use simple language",
    "Include practical examples",
    "Explain error cases"
  ]
}
```

**Bad:**
```json
{
  "prompt": "Write something about APIs",
  "guidelines": []
}
```

### 2. Context Management

**Good:**
```json
{
  "otherSections": {
    "Architecture": "High-level system design...",
    "Requirements": "Key functional requirements..."
  }
}
```

**Bad:**
```json
{
  "otherSections": {
    "Section1": "...",
    "Section2": "...",
    "Section3": "...",
    // ... 50 more sections
  }
}
```

### 3. Error Recovery

```typescript
async function generateWithRetry(body, maxRetries = 2) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch('/api/generate/section', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        return await response.json();
      }

      if (response.status === 429) {
        const error = await response.json();
        await sleep(error.retryAfter * 1000);
        continue;
      }

      throw new Error(`Generation failed: ${response.statusText}`);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(1000 * Math.pow(2, i));
    }
  }
}
```

## Security

### Authentication

- All requests must include a valid Firebase ID token
- Tokens are verified server-side
- Expired tokens are rejected with 401

### Authorization

- Users can only generate sections for their own projects
- Credits are verified before generation
- Rate limits prevent abuse

### Input Validation

- All inputs are validated with Zod schemas
- Content is sanitized before processing
- Size limits prevent resource exhaustion

## Monitoring & Analytics

Generated metrics:
- Generation success/failure rate
- Average response time by model
- Credit consumption per user
- Rate limit hits
- Error distribution

## Changelog

### Version 1.1.0 (2026-01-23)
- ✅ Added dynamic model selection
- ✅ Implemented retry logic with exponential backoff
- ✅ Added automatic credit refund on failure
- ✅ Implemented rate limiting
- ✅ Added content validation and sanitization
- ✅ Improved error handling and messages
- ✅ Added comprehensive logging

### Version 1.0.0 (Initial)
- Basic section generation
- Firebase authentication
- Credit deduction
- Simple error handling

## Related Documentation

- [AI Models Guide](./ai-models.md)
- [Credit System](./credits.md)
- [Rate Limiting](./rate-limiting.md)
- [Error Handling](./error-handling.md)
- [Prompt Engineering Best Practices](./prompt-engineering.md)

## Support

For issues or questions:
- GitHub Issues: [arkan/issues](https://github.com/arkan/issues)
- Documentation: [docs.arkan.dev](https://docs.arkan.dev)
- Email: support@arkan.dev
