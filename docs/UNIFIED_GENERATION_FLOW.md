# Unified AI Generation Flow

**Date:** January 23, 2026  
**Status:** ✅ Complete  
**Impact:** High - Single API for All Text Generation Tasks

---

## Overview

The Unified Generation Flow provides **one API endpoint** and **one AI flow** for all text generation tasks in the Arkan platform. Whether you need to generate sections, correct grammar, translate text, or perform any custom generation, you use the same simple interface.

**Key Principle:** Any feature that needs AI text generation prepares system instructions and user prompt, then calls the unified `/api/generate` route with a process name.

---

## Architecture

### Single Flow for All Tasks

```
┌─────────────────────────────────────────────────────────────────┐
│                       Any Feature                                │
│  (Section, Grammar, Translation, Summarization, etc.)           │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
         Prepare: System Prompt + User Prompt + Process Name
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│             POST /api/generate (Unified Route)                   │
│  - Authentication & Authorization                                │
│  - Rate Limiting                                                 │
│  - Credit Management (deduct & refund)                          │
│  - Validation                                                    │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│          generateUnified() - Single AI Flow                      │
│  - Select model based on process type                           │
│  - Call AI with retry logic                                     │
│  - Parse response (handles all formats)                         │
│  - Return unified output                                         │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
                  Generated Content
```

---

## Process Types

The system supports multiple generation processes:

```typescript
enum GenerationProcessType {
  SECTION = 'section',           // Generate report sections
  GRAMMAR = 'grammar',           // Grammar correction
  TRANSLATION = 'translation',   // Text translation
  SUMMARIZATION = 'summarization', // Text summarization
  EXPANSION = 'expansion',       // Text expansion
  REWRITE = 'rewrite',          // Text rewriting
  CHAT = 'chat',                // Chat/conversation
  CUSTOM = 'custom',            // Custom generation
}
```

Each process type has:
- **Default model** (optimized for that task)
- **Default temperature** (accuracy vs creativity)
- **Max tokens** (appropriate for output length)

---

## API Interface

### Request Schema

```typescript
{
  // Process identification
  processType: GenerationProcessType;  // What kind of generation
  processId: string;                   // Unique ID for this task
  
  // Prompts (required)
  systemPrompt: string;                // System instructions (min 10 chars)
  userPrompt: string;                  // User task (min 10 chars)
  
  // Optional configuration
  modelConfig?: {
    modelName?: string;                // Override default model
    temperature?: number;              // Override temperature (0.0-2.0)
    maxTokens?: number;               // Override max tokens
  };
  
  // Optional metadata
  metadata?: Record<string, any>;     // For logging/tracking
}
```

### Response Schema

```typescript
{
  processType: GenerationProcessType;  // Echo of process type
  processId: string;                   // Echo of process ID
  content: string;                     // Generated content (markdown)
  
  metadata: {
    modelUsed: string;                 // Actual model used
    generatedAt: string;               // ISO timestamp
    tokensUsed?: number;              // Tokens consumed (if available)
    processingTimeMs: number;         // How long it took
  }
}
```

---

## Usage Examples

### 1. Generate a Section

```typescript
import { generateSection } from '@/services/api/unifiedGenerationService';

// In your component/hook
const token = await firebaseUser.getIdToken();

const result = await generateSection(
  'intro-section',                    // Section ID
  systemPrompt,                       // Built by PromptBuilder
  userPrompt,                         // Built by PromptBuilder
  token
);

console.log(result.content);         // Generated markdown
console.log(result.metadata.modelUsed); // Which model was used
```

### 2. Correct Grammar

```typescript
import { correctGrammar } from '@/services/api/unifiedGenerationService';

const token = await firebaseUser.getIdToken();

const result = await correctGrammar(
  'text-1',                           // Text ID
  'This are a text with grammer errors.', // Text to correct
  token
);

console.log(result.content);         // "This is a text with grammar errors."
```

### 3. Translate Text

```typescript
import { translateText } from '@/services/api/unifiedGenerationService';

const token = await firebaseUser.getIdToken();

const result = await translateText(
  'text-2',                           // Text ID
  'Hello, how are you?',             // Text to translate
  'Spanish',                          // Target language
  token
);

console.log(result.content);         // "Hola, ¿cómo estás?"
```

### 4. Summarize Text

```typescript
import { summarizeText } from '@/services/api/unifiedGenerationService';

const token = await firebaseUser.getIdToken();

const result = await summarizeText(
  'doc-1',                            // Document ID
  longText,                           // Text to summarize
  token,
  100                                 // Max 100 words
);

console.log(result.content);         // Brief summary
```

### 5. Custom Generation

```typescript
import { generateCustom } from '@/services/api/unifiedGenerationService';

const token = await firebaseUser.getIdToken();

const result = await generateCustom(
  'task-1',
  'You are a poet. Write in haiku format.',
  'Write a haiku about technology.',
  token,
  { temperature: 0.8 }               // Higher creativity
);

console.log(result.content);         // Technology haiku
```

---

## Default Model Configurations

Each process type has optimized defaults:

| Process Type | Model | Temperature | Max Tokens | Rationale |
|-------------|-------|-------------|------------|-----------|
| **SECTION** | gemma:2b | 0.3 | 3000 | Fast, good quality for documents |
| **GRAMMAR** | phi3:mini | 0.1 | 2000 | High accuracy needed |
| **TRANSLATION** | phi3:mini | 0.2 | 2000 | Accuracy + naturalness |
| **SUMMARIZATION** | gemma:2b | 0.3 | 1000 | Concise, fast |
| **EXPANSION** | llama3:8b | 0.5 | 3000 | Creativity + detail |
| **REWRITE** | phi3:mini | 0.4 | 2000 | Balanced style adaptation |
| **CHAT** | llama3:8b | 0.7 | 2000 | Conversational, engaging |
| **CUSTOM** | gemma:2b | 0.5 | 2000 | General purpose |

**You can override these** by providing `modelConfig` in your request.

---

## Adding a New Generation Feature

### Step 1: Define Your Prompts

```typescript
// In your feature file or hook
const systemPrompt = `You are an expert [ROLE].
Your task is to [TASK DESCRIPTION].

Instructions:
- [Instruction 1]
- [Instruction 2]
- Return ONLY the [OUTPUT TYPE] (no JSON, no metadata)`;

const userPrompt = `[USER TASK DESCRIPTION]

${inputText}

Return only the [OUTPUT TYPE].`;
```

### Step 2: Call the Unified API

```typescript
import { generateUnifiedApi } from '@/services/api/unifiedGenerationService';
import { GenerationProcessType } from '@/ai/schemas/unified-generation';

const token = await firebaseUser.getIdToken();

const result = await generateUnifiedApi(
  {
    processType: GenerationProcessType.CUSTOM, // or SECTION, GRAMMAR, etc.
    processId: 'your-unique-id',
    systemPrompt,
    userPrompt,
    modelConfig: {                            // Optional
      modelName: 'ollama/llama3:8b',
      temperature: 0.6,
    },
  },
  token
);

// Use result.content
```

### Step 3: That's It!

No need to:
- ❌ Create a new API route
- ❌ Create a new AI flow
- ❌ Handle authentication/credits/rate limiting
- ❌ Parse AI responses
- ❌ Handle retries

Everything is handled by the unified flow! ✅

---

## Helper Functions

### Pre-built Helpers in `unifiedGenerationService.ts`

```typescript
// Section generation
await generateSection(sectionId, systemPrompt, userPrompt, token, modelConfig?);

// Grammar correction
await correctGrammar(textId, text, token);

// Translation
await translateText(textId, text, targetLanguage, token);

// Summarization
await summarizeText(textId, text, token, maxWords?);

// Expansion
await expandText(textId, text, targetLength, token);

// Rewriting
await rewriteText(textId, text, style, token);

// Custom
await generateCustom(processId, systemPrompt, userPrompt, token, modelConfig?);
```

---

## Benefits

### 1. Simplicity ⭐⭐⭐⭐⭐
- One API endpoint for everything
- One AI flow to maintain
- Consistent interface across all features

### 2. Maintainability ⭐⭐⭐⭐⭐
- Changes in one place affect all features
- Easy to add new generation types
- Centralized error handling, logging, retry logic

### 3. Consistency ⭐⭐⭐⭐⭐
- Same authentication/authorization
- Same credit management
- Same rate limiting
- Same response format

### 4. Feature Velocity ⭐⭐⭐⭐⭐
- Add new AI features in minutes
- No backend infrastructure needed
- Focus on prompts, not plumbing

### 5. Testing ⭐⭐⭐⭐⭐
- Test once, works everywhere
- Single test suite for all generation
- Easy to mock for feature tests

---

## Features Included

### ✅ Authentication & Authorization
- Firebase token verification
- User role checking
- Automatic token refresh

### ✅ Credit Management
- Automatic credit deduction (1 credit per generation)
- Automatic refund on failure
- Balance checking before generation

### ✅ Rate Limiting
- Role-based limits (5/20/100 per minute)
- Per-user tracking
- Clear error messages with retry time

### ✅ Retry Logic
- Exponential backoff (1s → 2s → 4s → 10s max)
- Smart error classification (retryable vs. not)
- Max 3 attempts by default
- Automatic recovery from transient errors

### ✅ Response Parsing
- Handles 7+ different response formats
- Works with all model sizes (2B to 8B+)
- Plain text generation (no JSON schema issues)
- Extracts from: text, content, output, response, message, candidates

### ✅ Logging & Analytics
- Process type tracking
- Model usage tracking
- Processing time tracking
- Success/failure rates
- User activity tracking

### ✅ Error Handling
- Detailed error messages
- User-friendly responses
- Automatic credit refund on errors
- Proper HTTP status codes

---

## Migration Guide

### From Old Section Generation

**Before:**
```typescript
import { generateReportSectionApi } from '@/services/api/reportService';

const body = {
  sectionToGenerate: section.id,
  prompt: section.buildActionPrompt(),
  otherSections: section.getContextAsRecord(currentProject),
  externalContext: section.getExternalContextAsArray(currentProject),
  guidelines: section.guidelines,
  // ... many more fields
};

const response = await generateReportSectionApi(body, token);
const content = response[section.id];
```

**After:**
```typescript
import { generateSection } from '@/services/api/unifiedGenerationService';

const systemPrompt = PromptBuilder.buildSectionSystemPrompt(section, project);
const userPrompt = PromptBuilder.buildSectionUserPrompt(section, project);

const result = await generateSection(section.id, systemPrompt, userPrompt, token);
const content = result.content; // That's it!
```

### From Custom API Routes

**Before:** Create `/api/generate/grammar`, `/api/generate/translate`, etc.

**After:** Use unified `/api/generate` with different `processType`

---

## Performance

### Typical Response Times

| Process Type | Model | Avg Time | Content Length |
|-------------|-------|----------|----------------|
| SECTION | gemma:2b | 3-5s | 500-1000 words |
| GRAMMAR | phi3:mini | 2-3s | Same as input |
| TRANSLATION | phi3:mini | 2-4s | Same as input |
| SUMMARIZATION | gemma:2b | 2-3s | 100-200 words |
| EXPANSION | llama3:8b | 5-8s | 2x input |
| REWRITE | phi3:mini | 3-5s | Same as input |
| CHAT | llama3:8b | 3-6s | 200-500 words |

**Note:** Times vary based on server load, content complexity, and model availability.

---

## Best Practices

### 1. Write Clear Prompts

✅ **Good System Prompt:**
```
You are an expert grammar checker.
Your task is to correct errors while preserving meaning.

Instructions:
- Fix grammar and spelling
- Keep the original voice
- Return ONLY the corrected text
```

❌ **Bad System Prompt:**
```
Fix grammar
```

### 2. Provide Context in User Prompt

✅ **Good User Prompt:**
```
Correct the grammar in this email draft:

[text]

Return only the corrected version (no explanations).
```

❌ **Bad User Prompt:**
```
[text]
```

### 3. Choose the Right Process Type

- Use specific types (GRAMMAR, TRANSLATION) when available
- Use CUSTOM for one-off or experimental tasks
- Process type determines default model and config

### 4. Use Metadata for Tracking

```typescript
{
  processType: GenerationProcessType.SECTION,
  processId: section.id,
  systemPrompt: '...',
  userPrompt: '...',
  metadata: {
    projectId: project.id,
    userId: user.id,
    featureName: 'report-builder',
    version: '1.0',
  },
}
```

### 5. Handle Errors Gracefully

```typescript
try {
  const result = await generateSection(...);
  // Use result.content
} catch (error) {
  if (error.message.includes('Rate limit')) {
    // Show retry time
  } else if (error.message.includes('credits')) {
    // Prompt to purchase
  } else {
    // General error
  }
}
```

---

## Testing

### Unit Tests

```typescript
// Test your prompt building
describe('MyFeature prompts', () => {
  it('should build correct system prompt', () => {
    const prompt = buildMySystemPrompt();
    expect(prompt).toContain('expected instructions');
  });
});
```

### Integration Tests

```typescript
// Test with unified generation (mocked)
describe('MyFeature generation', () => {
  it('should generate content', async () => {
    mockGenerateUnified.mockResolvedValue({
      content: 'Generated content',
      // ...
    });
    
    const result = await myFeatureGenerate();
    expect(result).toBeDefined();
  });
});
```

### Running Tests

```bash
# Test unified flow
npm test -- generate-unified.test.ts

# Test your feature
npm test -- my-feature.test.ts
```

---

## Troubleshooting

### Issue: Empty responses

**Cause:** Prompts unclear or model producing no output

**Solution:**
- Check system prompt has clear instructions
- Verify user prompt provides context
- Try a larger model
- Check model is running (Ollama)

### Issue: Wrong format output

**Cause:** Model not following instructions

**Solution:**
- Add explicit output format instructions
- Use lower temperature for accuracy
- Try different model
- Add examples in prompt

### Issue: Rate limited

**Cause:** Too many requests

**Solution:**
- Wait for retry time (shown in error)
- Upgrade user to premium
- Implement request queuing

### Issue: Poor quality

**Cause:** Wrong model or temperature

**Solution:**
- Use larger model for complex tasks
- Adjust temperature (lower = more focused)
- Improve prompts with more context
- Add examples

---

## Future Enhancements

### Planned Features

🔄 **Streaming Responses**
- Real-time content streaming
- Progress indicators
- Cancellation support

🔄 **Prompt Templates**
- Library of optimized prompts
- Easy customization
- Version control

🔄 **A/B Testing**
- Compare different prompts
- Measure success rates
- Optimize automatically

🔄 **Analytics Dashboard**
- Usage by process type
- Model performance comparison
- Cost tracking
- Success rates

---

## Summary

The Unified Generation Flow provides a **single, simple interface** for all text generation needs:

✅ **One API:** `/api/generate` for everything  
✅ **One Flow:** `generateUnified()` handles all types  
✅ **One Interface:** Same request/response format  
✅ **Many Features:** Section, Grammar, Translation, and more  

**To add a new AI feature:**
1. Define your prompts
2. Call `generateUnifiedApi()` with a process type
3. Done!

No infrastructure needed, no complexity added. Just focus on writing good prompts! 🚀

---

## Related Documentation

- [Simplified Generation Flow](./SIMPLIFIED_GENERATION_FLOW.md)
- [Gemma 2B JSON Fix](./FIX_GEMMA_JSON_OUTPUT.md)
- [PromptBuilder](../src/lib/prompt-builder.ts)
- [Unified Generation Schema](../src/ai/schemas/unified-generation.ts)
- [Unified Generation Service](../src/services/api/unifiedGenerationService.ts)

---

**Last Updated:** January 23, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
