# n8n AI Orchestration Integration Guide

This document details the architectural integration of **n8n** as the primary AI orchestration engine for the Arkan platform.

## Overview

Arkan has transitioned from a local Genkit/Ollama-based AI engine to an external orchestration model powered by **n8n**. This shift offloads heavy CPU/RAM tasks (like RAG and multi-step agent reasoning) to a dedicated server, significantly improving the performance and scalability of the Next.js application.

### Key Benefits
- **Offloading**: Reduced CPU/RAM usage on the web server.
- **Centralized Logic**: AI agents and system prompts can be updated in the n8n UI without redeploying the app.
- **Advanced Tooling**: n8n provides native nodes for Google Search, Wikipedia, Qdrant, and more.
- **Observability**: Built-in execution logs and visual debugging in n8n.

---

## Technical Architecture

### Hybrid Execution Model
The application uses a hybrid approach to ensure maximum reliability and backward compatibility.

1. **n8n Agents**: All 32 specialized writing tools (Grammar Check, Summarizer, etc.) and RAG-heavy tasks (Chapter/Section generation) are routed to n8n.
2. **Local Fallback**: Complex orchestrators or flows not listed in the n8n map execute locally using the original Genkit implementation.

### Core Components

#### 1. `N8nAiService.ts`
The drop-in replacement for `IAiService`. It manages:
- **Webhook Bridging**: Sends POST requests to the n8n `/webhook/ai-generation` endpoint.
- **Routing**: Uses an internal `N8N_FLOW_MAP` to decide whether a flow runs on n8n or locally.
- **Sanitization**: Uses `cleanAiOutput` to strip conversational filler from AI responses.
- **Telemetry**: Measures and logs the latency of each orchestration call.

#### 2. DI Container (`container.ts`)
The container auto-selects the service implementation:
```typescript
const useN8n = Boolean(process.env.N8N_AI_WEBHOOK_URL);
const AiServiceImpl = useN8n ? N8nAiService : GenkitAiService;
container.register(IAiServiceToken, { useClass: AiServiceImpl });
```

---

## n8n Workflow Configuration

### Workflow Details
- **Workflow ID**: `uduvS9JJKfnunoyv`
- **Webhook Endpoint**: `/webhook/ai-generation`
- **Supported Actions**: `generateText`, `runFlow`, `retrieveContext`, `generateChapterWithRAG`, `generateSectionWithRAG`.

### The 3-Connection Rule
For any specialized agent to function in the n8n workflow, it **MUST** have three specific connections:
1. **Route Flow** (Main Output) → **Agent** (Main Input)
2. **OpenRouter Chat Model** (Model Output) → **Agent** (ai_languageModel Input)
3. **Agent** (Main Output) → **Prepare Response** (Main Input)

*Missing any of these will result in a silent failure or a timeout.*

### AI Stack in n8n
- **LLM**: OpenRouter (`openrouter/auto`)
- **Embeddings**: Ollama (`nomic-embed-text:latest`)
- **Vector Store**: Qdrant (`arkan_vectors` collection)
- **Tools**: Wikipedia, Calculator, Vector Store Retriever

---

## Environment Variables

Add the following to your `.env` file to enable n8n orchestration:

```env
# n8n AI Orchestration
N8N_AI_WEBHOOK_URL=https://vmi2935537.contaboserver.net/webhook/ai-generation
N8N_API_URL=https://vmi2935537.contaboserver.net/api/v1/
N8N_API_KEY=your_public_api_key_here
```

---

## Deployment & Updates

### Updating Workflows via API
When updating the workflow via the n8n Public API, the payload must be strictly filtered to include only:
- `name`
- `nodes`
- `connections`
- `settings`

Including additional keys (like `id`, `versionId`, `meta`, or `pinData`) will cause a **400 Bad Request** error.

### Testing
Use the following `curl` command to verify the integration:
```bash
curl -X POST https://your-n8n-domain.com/webhook/ai-generation \
  -H "Content-Type: application/json" \
  -d '{"action": "generateText", "flowName": "summarize", "prompt": "Test summary", "text": "Text to summarize"}'
```
