# Dynamic Flow System API Documentation

## Overview

The Dynamic Flow System provides a comprehensive REST API for managing and executing AI-powered workflows. This API enables you to create, update, execute, and monitor dynamic flows, prompts, and tools.

**Base URL**: `http://localhost:3000/api` (Development)

**API Version**: 1.0.0

---

## Table of Contents

1. [Authentication](#authentication)
2. [Flow Management APIs](#flow-management-apis)
3. [Prompt Management APIs](#prompt-management-apis)
4. [Tool Registry APIs](#tool-registry-apis)
5. [Flow Execution APIs](#flow-execution-apis)
6. [Trace & Monitoring APIs](#trace--monitoring-apis)
7. [Error Responses](#error-responses)
8. [Data Models](#data-models)

---

## Authentication

Currently, the API uses placeholder authentication. All endpoints marked with 🔒 will require proper authentication in production.

**TODO**: Implement JWT-based authentication
- Add `Authorization: Bearer <token>` header
- User roles: `admin`, `user`, `viewer`

---

## Flow Management APIs

### List All Flows

Get a list of all flows with optional filtering.

**Endpoint**: `GET /api/admin/flows`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | No | Filter by status: `active`, `draft`, `archived`, `deprecated` |
| category | string | No | Filter by category |
| tags | string | No | Comma-separated tags |
| limit | number | No | Maximum number of results |

**Example Request**:
```bash
GET /api/admin/flows?status=active&limit=10
```

**Example Response**:
```json
{
  "success": true,
  "flows": [
    {
      "id": "flow_abc123",
      "name": "content-generation-flow",
      "displayName": "Content Generation Flow",
      "description": "Generate high-quality content with RAG",
      "version": 1,
      "status": "active",
      "category": "content",
      "tags": ["generation", "rag"],
      "steps": [...],
      "createdAt": "2026-01-10T10:00:00Z",
      "updatedAt": "2026-01-10T10:00:00Z"
    }
  ],
  "total": 1
}
```

---

### Create Flow

Create a new flow configuration.

**Endpoint**: `POST /api/admin/flows` 🔒

**Request Body**:
```json
{
  "name": "my-custom-flow",
  "displayName": "My Custom Flow",
  "description": "A custom workflow for processing data",
  "category": "analysis",
  "tags": ["custom", "analysis"],
  "inputSchema": {
    "type": "object",
    "properties": {
      "query": { "type": "string" }
    },
    "required": ["query"]
  },
  "outputSchema": {
    "type": "object",
    "properties": {
      "result": { "type": "string" }
    }
  },
  "steps": [
    {
      "id": "step1",
      "name": "Retrieve Context",
      "type": "retrieve",
      "handler": "retrieve",
      "inputMapping": {
        "query": "$.input.query"
      },
      "outputMapping": {
        "context": "$.context"
      }
    },
    {
      "id": "step2",
      "name": "Generate Response",
      "type": "generate",
      "handler": "generate",
      "inputMapping": {
        "prompt": "Generate a response using: {{context}}"
      },
      "outputMapping": {
        "result": "$.text"
      }
    }
  ]
}
```

**Example Response**:
```json
{
  "success": true,
  "flow": {
    "id": "flow_xyz789",
    "name": "my-custom-flow",
    "version": 1,
    "status": "draft",
    ...
  },
  "message": "Flow created successfully"
}
```

---

### Get Flow by ID

Retrieve details of a specific flow.

**Endpoint**: `GET /api/admin/flows/{flowId}`

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| flowId | string | Yes | Unique flow identifier |

**Example Response**:
```json
{
  "success": true,
  "flow": {
    "id": "flow_abc123",
    "name": "content-generation-flow",
    "displayName": "Content Generation Flow",
    "version": 3,
    "status": "active",
    "steps": [...],
    "inputSchema": {...},
    "outputSchema": {...},
    "metadata": {...}
  }
}
```

---

### Update Flow

Update an existing flow configuration.

**Endpoint**: `PUT /api/admin/flows/{flowId}` 🔒

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| flowId | string | Yes | Unique flow identifier |

**Request Body**:
```json
{
  "displayName": "Updated Flow Name",
  "description": "Updated description",
  "status": "active",
  "steps": [...],
  "versionMessage": "Added new validation step"
}
```

**Example Response**:
```json
{
  "success": true,
  "flow": {
    "id": "flow_abc123",
    "version": 4,
    "status": "active",
    ...
  },
  "message": "Flow updated successfully"
}
```

---

### Delete Flow

Delete (archive) a flow.

**Endpoint**: `DELETE /api/admin/flows/{flowId}` 🔒

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| flowId | string | Yes | Unique flow identifier |

**Example Response**:
```json
{
  "success": true,
  "message": "Flow deleted successfully"
}
```

---

### Get Flow Versions

Retrieve version history of a flow.

**Endpoint**: `GET /api/admin/flows/{flowId}/versions`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| limit | number | No | Maximum versions to return (default: 10) |

**Example Response**:
```json
{
  "success": true,
  "versions": [
    {
      "version": 3,
      "message": "Added error handling",
      "createdAt": "2026-01-10T12:00:00Z",
      "createdBy": "user123"
    },
    {
      "version": 2,
      "message": "Updated step configuration",
      "createdAt": "2026-01-09T10:00:00Z",
      "createdBy": "user123"
    }
  ],
  "total": 2
}
```

---

## Prompt Management APIs

### List All Prompts

Get a list of all prompt templates.

**Endpoint**: `GET /api/admin/prompts`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | No | Filter by status: `active`, `draft`, `archived` |
| category | string | No | Filter by category |
| tags | string | No | Comma-separated tags |
| limit | number | No | Maximum number of results |

**Example Response**:
```json
{
  "success": true,
  "prompts": [
    {
      "id": "prompt_abc123",
      "name": "summarization-prompt",
      "displayName": "Text Summarization",
      "template": "Summarize the following text:\n\n{{text}}",
      "variables": ["text"],
      "status": "active",
      "category": "summarization"
    }
  ],
  "total": 1
}
```

---

### Create Prompt

Create a new prompt template.

**Endpoint**: `POST /api/admin/prompts` 🔒

**Request Body**:
```json
{
  "name": "custom-prompt",
  "displayName": "Custom Prompt",
  "description": "A custom prompt for specific use case",
  "template": "You are a helpful assistant. {{instruction}}\n\nContext: {{context}}\n\nQuery: {{query}}",
  "variables": ["instruction", "context", "query"],
  "category": "custom",
  "tags": ["assistant", "custom"]
}
```

**Example Response**:
```json
{
  "success": true,
  "prompt": {
    "id": "prompt_xyz789",
    "name": "custom-prompt",
    "version": 1,
    ...
  },
  "message": "Prompt created successfully"
}
```

---

### Get Prompt by ID

**Endpoint**: `GET /api/admin/prompts/{promptId}`

### Update Prompt

**Endpoint**: `PUT /api/admin/prompts/{promptId}` 🔒

### Delete Prompt

**Endpoint**: `DELETE /api/admin/prompts/{promptId}` 🔒

---

## Tool Registry APIs

### List All Tools

Get a list of all registered tools.

**Endpoint**: `GET /api/admin/tools`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| type | string | No | Filter by type: `builtin`, `custom`, `external` |
| category | string | No | Filter by category |
| status | string | No | Filter by status: `active`, `inactive` |
| tags | string | No | Comma-separated tags |

**Example Response**:
```json
{
  "success": true,
  "tools": [
    {
      "name": "checkGrammar",
      "displayName": "Grammar Checker",
      "description": "Analyzes text for grammatical errors",
      "type": "builtin",
      "category": "grammar-style",
      "status": "active",
      "inputSchema": {...},
      "outputSchema": {...}
    }
  ],
  "total": 24
}
```

---

### Register Tool

Register a new tool in the registry.

**Endpoint**: `POST /api/admin/tools` 🔒

**Request Body**:
```json
{
  "name": "customTool",
  "displayName": "My Custom Tool",
  "description": "A custom tool for specific operations",
  "type": "custom",
  "category": "custom",
  "handler": "async (params) => { /* implementation */ }",
  "inputSchema": {
    "type": "object",
    "properties": {
      "input": { "type": "string" }
    }
  },
  "outputSchema": {
    "type": "object",
    "properties": {
      "result": { "type": "string" }
    }
  }
}
```

---

### Get Tool by Name

**Endpoint**: `GET /api/admin/tools/{toolName}`

### Execute Tool

**Endpoint**: `POST /api/admin/tools/{toolName}/execute` 🔒

**Request Body**:
```json
{
  "parameters": {
    "text": "Sample text to process"
  }
}
```

---

## Flow Execution APIs

### Execute Flow

Execute a flow with provided input.

**Endpoint**: `POST /api/flows/execute` 🔒

**Request Body**:
```json
{
  "flowName": "content-generation-flow",
  "payload": {
    "query": "What is machine learning?",
    "context": "academic"
  },
  "userId": "user123",
  "enableTracing": true
}
```

**Example Response**:
```json
{
  "success": true,
  "executionId": "exec_abc123",
  "traceId": "trace_xyz789",
  "output": {
    "result": "Machine learning is a subset of artificial intelligence...",
    "metadata": {
      "tokensUsed": 150,
      "duration": 2500
    }
  },
  "steps": [
    {
      "stepId": "step1",
      "name": "Retrieve Context",
      "status": "completed",
      "duration": 500
    },
    {
      "stepId": "step2",
      "name": "Generate Response",
      "status": "completed",
      "duration": 2000
    }
  ]
}
```

---

### Test Flow

Test a flow configuration without saving it.

**Endpoint**: `POST /api/flows/test` 🔒

**Request Body**:
```json
{
  "flowConfig": {
    "name": "test-flow",
    "steps": [...]
  },
  "payload": {
    "query": "test input"
  }
}
```

**Example Response**:
```json
{
  "success": true,
  "result": {
    "output": {...},
    "steps": [...]
  },
  "message": "Flow test completed successfully"
}
```

---

## Trace & Monitoring APIs

### Get Execution Trace

Retrieve detailed execution trace for debugging.

**Endpoint**: `GET /api/admin/traces/{traceId}`

**Example Response**:
```json
{
  "success": true,
  "trace": {
    "id": "trace_xyz789",
    "flowName": "content-generation-flow",
    "executionId": "exec_abc123",
    "startTime": "2026-01-10T10:00:00Z",
    "endTime": "2026-01-10T10:00:02Z",
    "duration": 2500,
    "status": "completed",
    "steps": [
      {
        "stepId": "step1",
        "name": "Retrieve Context",
        "type": "retrieve",
        "startTime": "2026-01-10T10:00:00Z",
        "endTime": "2026-01-10T10:00:00.5Z",
        "duration": 500,
        "input": {...},
        "output": {...},
        "metadata": {
          "sources": [...]
        }
      }
    ]
  },
  "formatted": "Step 1: Retrieve Context (500ms)\n  Status: completed\n  Sources: 5 documents\n..."
}
```

---

## Error Responses

All API endpoints return consistent error responses:

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation error: query parameter is required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Flow not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to execute flow: Database connection error"
}
```

---

## Data Models

### Flow Configuration

```typescript
interface FlowConfig {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  version: number;
  status: 'active' | 'draft' | 'archived' | 'deprecated';
  category?: string;
  tags?: string[];
  inputSchema: JSONSchema;
  outputSchema: JSONSchema;
  steps: FlowStep[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}
```

### Flow Step

```typescript
interface FlowStep {
  id: string;
  name: string;
  type: 'retrieve' | 'generate' | 'tool' | 'format';
  handler: string;
  inputMapping: Record<string, string>;
  outputMapping: Record<string, string>;
  config?: Record<string, any>;
  retryPolicy?: RetryPolicy;
  timeout?: number;
}
```

### Prompt Config

```typescript
interface PromptConfig {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  template: string;
  variables: string[];
  version: number;
  status: 'active' | 'draft' | 'archived';
  category?: string;
  tags?: string[];
  examples?: PromptExample[];
  metadata?: Record<string, any>;
}
```

### Tool Config

```typescript
interface ToolConfig {
  name: string;
  displayName: string;
  description: string;
  type: 'builtin' | 'custom' | 'external';
  category: string;
  status: 'active' | 'inactive';
  inputSchema: JSONSchema;
  outputSchema: JSONSchema;
  handler?: string;
  endpoint?: string;
  examples?: ToolExample[];
  metadata?: Record<string, any>;
}
```

---

## Rate Limiting

**TODO**: Implement rate limiting
- Default: 100 requests per minute per user
- Admin endpoints: 1000 requests per minute

---

## Versioning

API versioning follows semantic versioning:
- Current version: `v1`
- Future versions will be accessible via `/api/v2/...`

---

## Support

For issues or questions:
- GitHub Issues: [repository-url]
- Documentation: [docs-url]
- Email: support@example.com

---

**Last Updated**: January 11, 2026
