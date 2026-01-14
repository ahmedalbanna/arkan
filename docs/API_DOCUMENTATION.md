# Dynamic Flow System - API Documentation

**Version**: 1.0.0  
**Base URL**: `/api`  
**Authentication**: Header `x-user-id` (to be replaced with proper auth)

---

## 📚 Table of Contents

1. [Flow Management API](#flow-management-api)
2. [Prompt Management API](#prompt-management-api)
3. [Execution API](#execution-api)
4. [Tools API](#tools-api)
5. [Error Responses](#error-responses)
6. [Examples](#examples)

---

## Flow Management API

### List Flows

**GET** `/api/admin/flows`

List all flows with optional filtering.

**Query Parameters:**
- `search` (string, optional) - Search flows by name/description
- `status` (string, optional) - Filter by status: `draft`, `active`, `deprecated`, `archived`
- `category` (string, optional) - Filter by category
- `tags` (string, optional) - Comma-separated tags
- `limit` (number, optional, default: 50) - Maximum results

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "flow-1",
      "name": "My Flow",
      "description": "Description",
      "version": "1.0.0",
      "status": "active",
      "tags": ["tag1", "tag2"],
      "steps": [...],
      "metadata": {...}
    }
  ],
  "count": 10
}
```

---

### Create Flow

**POST** `/api/admin/flows`

Create a new flow.

**Headers:**
- `x-user-id` (string, required) - User ID

**Request Body:**
```json
{
  "id": "my-flow",
  "name": "My Flow",
  "description": "Flow description",
  "version": "1.0.0",
  "status": "draft",
  "tags": ["tag1"],
  "inputSchema": {
    "type": "zod",
    "fields": [...],
    "required": true
  },
  "outputSchema": {
    "type": "zod",
    "fields": [...],
    "required": true
  },
  "steps": [
    {
      "id": "step-1",
      "name": "Step Name",
      "type": "generate",
      "config": {...}
    }
  ],
  "config": {
    "timeout": 60000,
    "cache": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {...},
  "message": "Flow created successfully"
}
```

---

### Get Flow

**GET** `/api/admin/flows/{flowId}`

Get a specific flow by ID.

**Query Parameters:**
- `version` (string, optional) - Get specific version

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "flow-1",
    "name": "My Flow",
    ...
  }
}
```

---

### Update Flow

**PUT** `/api/admin/flows/{flowId}`

Update a flow.

**Query Parameters:**
- `changeDescription` (string, optional) - Description of changes

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "status": "active",
  ...
}
```

**Response:**
```json
{
  "success": true,
  "data": {...},
  "message": "Flow updated successfully"
}
```

---

### Delete Flow

**DELETE** `/api/admin/flows/{flowId}`

Delete a flow and all its versions.

**Response:**
```json
{
  "success": true,
  "message": "Flow deleted successfully"
}
```

---

### List Flow Versions

**GET** `/api/admin/flows/{flowId}/versions`

List all versions of a flow.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "version": "1.0.0",
      "changeDescription": "Initial version",
      "createdAt": "2026-01-14T00:00:00.000Z",
      "createdBy": "user-123",
      "configuration": {...}
    }
  ],
  "count": 5
}
```

---

### Rollback Flow Version

**POST** `/api/admin/flows/{flowId}/versions`

Rollback to a previous version.

**Request Body:**
```json
{
  "version": "1.0.0"
}
```

**Response:**
```json
{
  "success": true,
  "data": {...},
  "message": "Rolled back to version 1.0.0"
}
```

---

## Prompt Management API

### List Prompts

**GET** `/api/admin/prompts`

List all prompts with optional filtering.

**Query Parameters:**
- `search` (string, optional) - Search prompts
- `status` (string, optional) - Filter by status
- `category` (string, optional) - Filter by category
- `language` (string, optional) - Filter by language (`en`, `ar`)
- `tags` (string, optional) - Comma-separated tags
- `limit` (number, optional, default: 50) - Maximum results

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "prompt-1",
      "name": "My Prompt",
      "template": "Generate {{content}}",
      "variables": [...],
      ...
    }
  ],
  "count": 10
}
```

---

### Create Prompt

**POST** `/api/admin/prompts`

Create a new prompt.

**Request Body:**
```json
{
  "id": "my-prompt",
  "name": "My Prompt",
  "description": "Prompt description",
  "version": "1.0.0",
  "template": "Generate content about {{topic}}",
  "variables": [
    {
      "name": "topic",
      "label": "Topic",
      "type": "string",
      "required": true
    }
  ],
  "outputFormat": {
    "type": "text"
  },
  "modelConfig": {
    "temperature": 0.7,
    "maxTokens": 2048
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {...},
  "message": "Prompt created successfully"
}
```

---

### Get Prompt

**GET** `/api/admin/prompts/{promptId}`

Get a specific prompt.

**Query Parameters:**
- `version` (string, optional) - Get specific version

---

### Update Prompt

**PUT** `/api/admin/prompts/{promptId}`

Update a prompt.

---

### Delete Prompt

**DELETE** `/api/admin/prompts/{promptId}`

Delete a prompt.

---

## Execution API

### Execute Flow

**POST** `/api/flows/execute`

Execute a flow with given input.

**Request Body:**
```json
{
  "flowId": "my-flow",
  "version": "1.0.0",
  "input": {
    "param1": "value1",
    "param2": "value2"
  },
  "includeTrace": true,
  "ignoreStatus": false
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "output": {
      "result": "Generated output"
    },
    "trace": {
      "flowId": "my-flow",
      "status": "completed",
      "duration": 5000,
      "steps": [...]
    },
    "executionTime": 5000
  }
}
```

**Response (Failure):**
```json
{
  "success": false,
  "error": "Flow execution failed",
  "message": "Error details",
  "trace": {...}
}
```

---

### Test Flow

**POST** `/api/flows/test`

Test a flow configuration without saving it.

**Request Body:**
```json
{
  "flow": {
    "id": "test-flow",
    "name": "Test Flow",
    "version": "1.0.0",
    "inputSchema": {...},
    "outputSchema": {...},
    "steps": [...],
    "config": {}
  },
  "input": {
    "param1": "value1"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "output": {...},
    "trace": {...},
    "context": {...},
    "executionTime": 3000,
    "stepsExecuted": 5,
    "errors": []
  }
}
```

---

## Tools API

### List Tools

**GET** `/api/admin/tools`

List all available tools.

**Query Parameters:**
- `search` (string, optional) - Search tools
- `category` (string, optional) - Filter by category
- `enabled` (boolean, optional) - Filter by enabled status
- `isBuiltIn` (boolean, optional) - Filter built-in tools
- `tags` (string, optional) - Comma-separated tags
- `limit` (number, optional, default: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "google-search",
      "displayName": "Google Search",
      "category": "search",
      "enabled": true,
      "isBuiltIn": true,
      ...
    }
  ],
  "count": 4
}
```

---

### Register Tool

**POST** `/api/admin/tools`

Register a new custom tool.

**Request Body:**
```json
{
  "name": "my-tool",
  "displayName": "My Custom Tool",
  "description": "Tool description",
  "category": "custom",
  "inputSchema": {...},
  "outputSchema": {...},
  "implementation": {
    "type": "external",
    "externalUrl": "https://api.example.com/tool"
  }
}
```

---

### Get Tool

**GET** `/api/admin/tools/{toolName}`

Get tool details.

**Query Parameters:**
- `includeStats` (boolean, optional) - Include usage statistics

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "google-search",
    "displayName": "Google Search",
    "stats": {
      "totalCalls": 150,
      "successfulCalls": 145,
      "failedCalls": 5,
      "avgExecutionTime": 2000
    },
    ...
  }
}
```

---

### Update Tool

**PUT** `/api/admin/tools/{toolName}`

Update tool configuration.

---

### Delete Tool

**DELETE** `/api/admin/tools/{toolName}`

Delete a custom tool (built-in tools cannot be deleted).

---

### Enable/Disable Tool

**PATCH** `/api/admin/tools/{toolName}`

Enable or disable a tool.

**Request Body:**
```json
{
  "enabled": true
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `405` - Method Not Allowed
- `500` - Internal Server Error

---

## Examples

### Example 1: Create and Execute a Simple Flow

**Step 1: Create Flow**
```bash
curl -X POST http://localhost:3000/api/admin/flows \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-123" \
  -d '{
    "id": "greeting-flow",
    "name": "Greeting Flow",
    "version": "1.0.0",
    "status": "active",
    "inputSchema": {
      "type": "zod",
      "fields": [
        {"name": "name", "type": "string", "required": true}
      ],
      "required": true
    },
    "outputSchema": {
      "type": "zod",
      "fields": [
        {"name": "greeting", "type": "string", "required": true}
      ],
      "required": true
    },
    "steps": [
      {
        "id": "step-1",
        "name": "Format Greeting",
        "type": "format",
        "config": {
          "type": "format",
          "template": "Hello, {{name}}!",
          "format": "text",
          "outputVariable": "greeting"
        }
      }
    ],
    "config": {}
  }'
```

**Step 2: Execute Flow**
```bash
curl -X POST http://localhost:3000/api/flows/execute \
  -H "Content-Type: application/json" \
  -d '{
    "flowId": "greeting-flow",
    "input": {
      "name": "Ahmed"
    },
    "includeTrace": true
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "output": {
      "greeting": "Hello, Ahmed!"
    },
    "executionTime": 50
  }
}
```

---

### Example 2: List Active Flows

```bash
curl "http://localhost:3000/api/admin/flows?status=active&limit=10"
```

---

### Example 3: Search Prompts

```bash
curl "http://localhost:3000/api/admin/prompts?search=academic&language=en"
```

---

## Rate Limiting

Currently not implemented. To be added in future versions.

---

## Webhooks

Currently not implemented. To be added in future versions.

---

## Changelog

### Version 1.0.0 (2026-01-14)
- Initial API release
- Flow Management API
- Prompt Management API
- Execution API
- Tools API

---

**Last Updated**: 2026-01-14  
**Maintained by**: Dynamic Flow System Team
