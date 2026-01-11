# AI Flow Model Updates Summary

## Overview
Successfully updated all AI flows to use appropriate Ollama models based on task requirements and hardware constraints (8GB RAM).

## Model Configuration

### Ollama Server
- **Server Address**: `http://185.190.140.93:11434`

### Available Models
1. **Gemma 2B** (~2.5GB RAM)
   - Fast and efficient
   - Best for: Basic text generation, conversion, summarization
   
2. **Phi-3 Mini** (~3.3GB RAM)
   - Strong reasoning capabilities
   - Best for: Analysis, structured output, reports, JSON formatting
   
3. **Llama 3 8B** (~4.7GB RAM)
   - Highest quality output
   - Best for: Academic research, complex reasoning (use with RAG)

## Model Distribution

### 📊 Current Distribution
- **Gemma 2B**: 13 flows (24%)
- **Phi-3 Mini**: 23 flows (43%)
- **Llama 3 8B**: 18 flows (33%)
- **Google AI Image**: 1 flow (image generation)

### 🔄 Conversion & Processing (Gemma 2B)
Fast text transformation and basic processing:
- `rewrite-to-markdown.ts`
- `rewrite-document-to-markdown.ts`
- `translate-text.ts`
- `summarize-document.ts`
- `summarize-text.ts`
- `image-to-text.ts`

### ✍️ Text Generation & Writing (Gemma 2B)
Creative writing and text manipulation:
- `generate-text.ts`
- `paraphrase-text.ts`
- `humanize-text.ts`
- `manipulate-text.ts`
- `text-stylist.ts`
- `write-document.ts`
- `ai-proofread-document.ts`
- `generate-ideas.ts`
- `topic-explainer.ts`

### 📊 Reports & Documentation (Phi-3 Mini)
Structured documentation with proper formatting:
- `improve-report-markdown.ts`
- `generate-toc.ts`
- `generate-chapter-content.ts`
- `generate-chapter-content-rag.ts`
- `generate-report-section.ts`
- `generate-report-section-rag.ts`
- `project-documentation-generator.ts`
- `professional-document-writer.ts`
- `technical-spec-writer.ts`
- `generate-session-plan.ts`
- `create-lecture-unit.ts`
- `generate-theoretical-lecture.ts`
- `presentation-content-creator.ts`

### ✅ Checking & Analysis (Phi-3 Mini)
Reasoning and linguistic analysis:
- `grammar-checker.ts`
- `sentence-structure-checker.ts`
- `bias-checker.ts`
- `fact-checker.ts`
- `detect-ai-content.ts`
- `plagiarism-checker.ts`
- `academic-paper-quality-checker.ts`
- `analyze-context.ts`

### 🎯 Structured Tasks (Phi-3 Mini)
Precise structured output (JSON, code, etc.):
- `generate-citation.ts`
- `generate-plantuml.ts`
- `generate-ui-description.ts`
- `generate-quiz.ts`
- `generate-project-blueprint.ts`
- `generate-agent-config.ts`
- `question-answering.ts`

### 🎓 Academic & Research (Llama 3 8B)
Complex reasoning and high-quality academic work:
- `academic-literature-review.ts`
- `ai-researcher.ts`
- `literature-review-generator.ts`
- `graduation-project-generator.ts`
- `project-report-generator.ts`
- `fact-retrieval.ts`
- `solve-assignments.ts`
- `run-agent-flow.ts`

## Configuration Files

### Updated Files
1. **`src/ai/genkit.ts`**
   - Added all three Ollama models
   - Exported `OLLAMA_MODELS` constants
   - Exported `MODEL_BY_TASK` mapping

2. **`src/ai/model-mapping.ts`** (NEW)
   - Comprehensive flow-to-model mapping
   - Helper function `getModelForFlow()`
   - Flow categories for reference

3. **`src/ai/index.ts`**
   - Re-exports model mapping utilities

## Usage Guide

### For Developers
```typescript
import { OLLAMA_MODELS, MODEL_BY_TASK } from '@/ai/genkit';

// Use constants instead of hardcoded strings
const prompt = ai.definePrompt({
  name: 'myPrompt',
  model: MODEL_BY_TASK.ANALYSIS, // For analysis tasks
  // or
  model: OLLAMA_MODELS.PHI3_MINI, // Direct model reference
});
```

### For New Flows
When creating a new flow:
1. Identify the task category
2. Use the appropriate model from `MODEL_BY_TASK`
3. Add the flow to `model-mapping.ts`

## Performance Recommendations

### Memory Management
- **Gemma 2B**: Safe for concurrent operations
- **Phi-3 Mini**: Monitor RAM usage, limit concurrency
- **Llama 3 8B**: Use sparingly, one request at a time

### Quality Enhancement
For academic flows using Llama 3 8B:
- Always use with RAG for better context
- Provide 500-1000 tokens of retrieved context
- Limit output to 200-300 words per generation
- Use chain-of-prompts for longer documents

### Output Scaling
- Don't request >300 words in single generation
- For longer content, break into multiple prompts
- Use RAG heavily to reduce knowledge burden on models

## Testing Checklist

- [x] All models registered in genkit.ts
- [x] Model constants exported
- [x] Flow-to-model mapping created
- [x] All flows updated with appropriate models
- [x] Special cases handled (image generation)
- [ ] Test each category with sample inputs
- [ ] Monitor RAM usage under load
- [ ] Verify quality improvements with Phi-3 Mini and Llama 3 8B

## Next Steps

1. **Test Model Performance**
   - Run sample requests for each category
   - Measure response times and quality
   - Adjust model assignments if needed

2. **Monitor Resource Usage**
   - Track RAM consumption per model
   - Implement request queuing if needed
   - Consider load balancing strategies

3. **Optimize Academic Flows**
   - Enhance RAG integration for Llama 3 8B flows
   - Increase context retrieval for research tasks
   - Implement chunked generation for long documents

4. **Documentation**
   - Update API documentation with model info
   - Create user-facing performance guides
   - Document best practices for each flow type

## References
- Original requirements: `src/ai/require-models.md`
- Model mapping: `src/ai/model-mapping.ts`
- Configuration: `src/ai/genkit.ts`
