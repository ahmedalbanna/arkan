# Dynamic AI Flow Management System - Implementation Plan

## Executive Summary

Transform the current static Genkit flows into a dynamic, configuration-driven architecture that allows remote management of flows, prompts, tools, and schemas without code redeployment.

Based on the architecture document `src/ai/new-artchture.md`, this plan outlines the complete implementation strategy.

---

## Architecture Overview

### Current State
- ✅ 54+ static flows defined in TypeScript
- ✅ Hardcoded prompts in flow definitions
- ✅ Fixed tool sequences in code
- ❌ Requires redeployment for any changes

### Target State
- ✅ Dynamic flow execution engine
- ✅ Database-driven configurations
- ✅ Remote management via API
- ✅ Admin UI for flow/prompt editing
- ✅ No redeployment for flow changes

### Key Components

```
┌─────────────────────────────────────────────────────────┐
│                    Admin UI (Frontend)                   │
│            React - Flow Builder & Prompt Editor          │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │   Management API      │
         │   (Express/Next.js)   │
         └───────────┬───────────┘
                     │
         ┌───────────┴───────────┐
         │  Configuration DB     │
         │    (Firestore)        │
         └───────────┬───────────┘
                     │
         ┌───────────┴───────────┐
         │ Dynamic Flow Executor │
         │   (Genkit Runtime)    │
         └───────────────────────┘
```

---

## Phase 1: Database Schema & Models

### Priority: HIGH | Timeline: Week 1

### 1.1 Flow Configuration Schema

**File**: `src/lib/models/flow-config.ts`

Create interfaces for:
- Flow metadata (name, description, version)
- Step definitions (type, tool, prompt, config)
- Input/output schemas
- Execution settings

**Collections**:
- `flowConfigurations` - Active flow definitions
- `flowVersions` - Version history

### 1.2 Prompt Configuration Schema

**File**: `src/lib/models/prompt-config.ts`

Create interfaces for:
- Prompt templates with variables
- Input/output schemas
- Version tracking
- Metadata (category, tags)

**Collections**:
- `promptTemplates` - Dynamic prompts
- `promptVersions` - Prompt history

### 1.3 Tool Registry Schema

**File**: `src/lib/models/tool-config.ts`

Create interfaces for:
- Tool metadata
- Input/output schemas
- Execution configuration

---

## Phase 2: Dynamic Flow Executor Core

### Priority: HIGH | Timeline: Week 1-2

### 2.1 Dynamic Flow Executor

**File**: `src/ai/flows/dynamic-flow-executor.ts`

Key features:
- Load flow configuration from database
- Execute steps sequentially
- Support step types: RETRIEVE, GENERATE, TOOL, FORMAT
- Pass data between steps
- Error handling and rollback

### 2.2 Step Handlers

**File**: `src/ai/dynamic-flow/step-handlers.ts`

Implement handlers:
- `executeRetrieveStep()` - RAG retrieval
- `executeGenerateStep()` - LLM with dynamic prompt
- `executeToolStep()` - Execute registered tools
- `executeFormatStep()` - Output formatting

### 2.3 Context Manager

**File**: `src/ai/dynamic-flow/context-manager.ts`

Features:
- Manage step-to-step data flow
- Variable interpolation
- Context accumulation

### 2.4 Schema Validator

**File**: `src/ai/dynamic-flow/schema-validator.ts`

Features:
- Validate step inputs/outputs
- Dynamic Zod schema generation
- Type-safe transformations

---

## Phase 3: Database Services

### Priority: HIGH | Timeline: Week 2

### 3.1 Flow Configuration Service

**File**: `src/services/flow-config-service.ts`

Functions:
- `getFlowConfiguration(flowName)`
- `updateFlowConfiguration(flowId, config)`
- `createFlowConfiguration(config)`
- `deleteFlowConfiguration(flowId)`
- `listFlowConfigurations()`
- `getFlowVersion(flowId, version)`

### 3.2 Prompt Management Service

**File**: `src/services/prompt-management-service.ts`

Functions:
- `getPromptById(promptId)`
- `updatePrompt(promptId, template)`
- `createPrompt(config)`
- `deletePrompt(promptId)`
- `listPrompts()`
- `getPromptVersion(promptId, version)`

### 3.3 Tool Registry Service

**File**: `src/services/tool-registry-service.ts`

Functions:
- `getToolByName(toolName)`
- `listAvailableTools()`
- `getToolSchema(toolName)`
- `registerTool(tool)`

---

## Phase 4: Management API Layer

### Priority: MEDIUM | Timeline: Week 3

### 4.1 Flow Management API

**Files**:
- `src/app/api/admin/flows/route.ts`
- `src/app/api/admin/flows/[flowId]/route.ts`
- `src/app/api/admin/flows/[flowId]/config/route.ts`

**Endpoints**:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/flows` | List all flows |
| POST | `/api/admin/flows` | Create new flow |
| GET | `/api/admin/flows/{flowId}` | Get flow details |
| PUT | `/api/admin/flows/{flowId}/config` | Update flow config |
| DELETE | `/api/admin/flows/{flowId}` | Delete flow |
| GET | `/api/admin/flows/{flowId}/versions` | Get versions |

### 4.2 Prompt Management API

**Files**:
- `src/app/api/admin/prompts/route.ts`
- `src/app/api/admin/prompts/[promptId]/route.ts`

**Endpoints**:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/prompts` | List all prompts |
| POST | `/api/admin/prompts` | Create new prompt |
| GET | `/api/admin/prompts/{promptId}` | Get prompt details |
| PUT | `/api/admin/prompts/{promptId}` | Update prompt |
| DELETE | `/api/admin/prompts/{promptId}` | Delete prompt |

### 4.3 Tool Registry API

**File**: `src/app/api/admin/tools/route.ts`

**Endpoints**:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/tools` | List all tools |
| GET | `/api/admin/tools/{toolName}` | Get tool schema |

### 4.4 Dynamic Execution API

**File**: `src/app/api/flows/execute/route.ts`

**Endpoints**:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/flows/execute` | Execute dynamic flow |
| POST | `/api/flows/test` | Test flow configuration |

### 4.5 Trace API

**File**: `src/app/api/admin/traces/[traceId]/route.ts`

**Endpoints**:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/traces/{traceId}` | Get execution trace |

---

## Phase 5: Admin UI Components

### Priority: MEDIUM | Timeline: Week 4

### 5.1 Flow Builder Interface

**File**: `src/components/admin/flow-builder/FlowBuilderInterface.tsx`

Features:
- Visual flow builder
- Drag-and-drop steps
- Step configuration panel
- Flow preview
- Save/publish controls

### 5.2 Prompt Editor

**File**: `src/components/admin/prompts/PromptEditor.tsx`

Features:
- Rich text editor
- Variable syntax highlighting
- Schema editor for I/O
- Version history viewer
- Test prompt functionality

### 5.3 Tool Browser

**File**: `src/components/admin/tools/ToolBrowser.tsx`

Features:
- List available tools
- View tool documentation
- View schemas
- Test tool execution

### 5.4 Flow Tester

**File**: `src/components/admin/flow-builder/FlowTester.tsx`

Features:
- Input form generator
- Execute flow
- Step-by-step execution view
- Inspect intermediate results
- Error display and debugging

---

## Implementation Schedule

### Week 1: Foundation
- ✅ Database schemas
- ✅ Model interfaces
- ✅ Dynamic executor core

### Week 2: Services
- ✅ Flow config service
- ✅ Prompt service
- ✅ Tool registry

### Week 3: APIs
- ✅ Flow management API
- ✅ Prompt management API
- ✅ Execution API

### Week 4: UI
- ✅ Flow builder
- ✅ Prompt editor
- ✅ Testing interface

### Week 5: Migration
- ✅ Migration scripts
- ✅ Testing
- ✅ Documentation

---

## Next Steps

1. Review and approve this plan
2. Set up project tracking (Jira/GitHub Projects)
3. Begin Phase 1 implementation
4. Create proof-of-concept with 2-3 flows
5. Gather feedback and iterate

