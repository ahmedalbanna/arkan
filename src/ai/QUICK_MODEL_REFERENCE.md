# Quick Model Reference Guide

## When to Use Which Model?

### 🚀 Gemma 2B - Fast & Efficient
**Use for**: Basic text operations that need speed
- Text generation and creative writing
- Translation and conversion
- Summarization
- Paraphrasing and text manipulation

**Characteristics**:
- ⚡ Fastest response time
- 💾 Lowest memory usage (~2.5GB)
- ✅ Can handle multiple concurrent requests
- ⚠️ May struggle with complex reasoning

### 🧠 Phi-3 Mini - Smart & Structured
**Use for**: Tasks requiring reasoning or precise formatting
- Grammar and language analysis
- Structured output (JSON, Markdown)
- Report generation and documentation
- Citations, diagrams (PlantUML)
- Quality checking and validation

**Characteristics**:
- 🎯 Excellent instruction following
- 📊 Great at structured formats
- 💪 Strong analytical capabilities
- 💾 Moderate memory usage (~3.3GB)

### 🎓 Llama 3 8B - Quality & Intelligence
**Use for**: Complex academic and research tasks
- Academic literature reviews
- Research papers
- Graduation projects
- Complex problem solving
- Assignment solutions

**Characteristics**:
- ⭐ Highest quality output
- 🔬 Best reasoning capabilities
- ⚠️ Slower response time
- 💾 Highest memory usage (~4.7GB)
- 📚 **Always use with RAG** for best results

## Quick Decision Tree

```
Need to process text?
├─ Is it academic research?
│  └─ YES → Llama 3 8B (with RAG)
│
├─ Does it need precise formatting/structure?
│  └─ YES → Phi-3 Mini
│
├─ Does it need deep analysis?
│  └─ YES → Phi-3 Mini
│
└─ Is it basic text generation/conversion?
   └─ YES → Gemma 2B
```

## Model Constants

```typescript
import { OLLAMA_MODELS, MODEL_BY_TASK } from '@/ai/genkit';

// Direct model references
OLLAMA_MODELS.GEMMA_2B      // 'ollama/gemma:2b'
OLLAMA_MODELS.PHI3_MINI     // 'ollama/phi3:mini'
OLLAMA_MODELS.LLAMA3_8B     // 'ollama/llama3:8b'

// Task-based selection
MODEL_BY_TASK.CONVERSION       // Gemma 2B
MODEL_BY_TASK.TEXT_GENERATION  // Gemma 2B
MODEL_BY_TASK.REPORTS          // Phi-3 Mini
MODEL_BY_TASK.ANALYSIS         // Phi-3 Mini
MODEL_BY_TASK.STRUCTURED       // Phi-3 Mini
MODEL_BY_TASK.ACADEMIC         // Llama 3 8B
```

## Performance Tips

### For Gemma 2B
- ✅ Use for high-volume requests
- ✅ Perfect for real-time interactions
- ⚠️ Keep prompts simple and clear
- ⚠️ Don't expect deep reasoning

### For Phi-3 Mini
- ✅ Ideal for structured output
- ✅ Excellent for quality checks
- ✅ Use detailed instructions
- ⚠️ Limit concurrent requests to 2-3

### For Llama 3 8B
- ✅ **Must use with RAG** for academic tasks
- ✅ Provide 500-1000 tokens of context
- ✅ Best for critical, high-quality outputs
- ⚠️ Run one request at a time
- ⚠️ Limit output to 200-300 words per call
- ⚠️ Use chunked generation for long content

## Server Configuration

**Ollama Server**: `http://185.190.140.93:11434`

All models are configured and ready to use. No additional setup required.
