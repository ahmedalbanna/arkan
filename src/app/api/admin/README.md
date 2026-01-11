# Dynamic Flow Management API

Complete REST API for managing flows, prompts, tools, and monitoring executions.

## Base URL

```
/api/admin
```

---

## Authentication

⚠️ **TODO**: All admin endpoints require authentication. Currently using placeholder `userId = 'system'`. 

Implement authentication by:
1. Using Next.js middleware
2. Checking Firebase Auth session
3. Validating user roles/permissions

---

## API Endpoints

### Flow Management

#### List Flows
```http
GET /api/admin/flows
```

**Query Parameters:**
- `status` - Filter by status (draft, active, archived)
- `category` - Filter by category
- `tags` - Comma-separated list of tags
- `limit` - Maximum number of results

**Response:**
```json
{
  "success": true,
  "flows": [...],
  "total": 10
}
```

#### Create Flow
```http
POST /api/admin/flows
```

**Body:**
```json
{
  "name": "my-flow",
  "displayName": "My Flow",
  "description": "Flow description",
  "category": "text-generation",
  "steps": [...],
  "inputSchema": {...},
  "outputSchema": {...}
}
```

#### Get Flow
```http
GET /api/admin/flows/{flowId}
```

#### Update Flow
```http
PUT /api/admin/flows/{flowId}
```

**Body:**
```json
{
  "displayName": "Updated name",
  "steps": [...],
  "versionMessage": "Updated step configuration"
}
```

#### Delete Flow
```http
DELETE /api/admin/flows/{flowId}
```

#### Get Flow Versions
```http
GET /api/admin/flows/{flowId}/versions?limit=10
```

#### Restore Flow Version
```http
POST /api/admin/flows/{flowId}/versions/restore
```

**Body:**
```json
{
  "version": 3
}
```

---

### Prompt Management

#### List Prompts
```http
GET /api/admin/prompts
```

**Query Parameters:**
- `status` - Filter by status
- `category` - Filter by category
- `tags` - Comma-separated tags
- `limit` - Maximum results

#### Create Prompt
```http
POST /api/admin/prompts
```

**Body:**
```json
{
  "name": "my-prompt",
  "displayName": "My Prompt",
  "category": "text-generation",
  "templateContent": "Hello {{name}}!",
  "variables": [
    {
      "name": "name",
      "type": "string",
      "required": true
    }
  ]
}
```

#### Get Prompt
```http
GET /api/admin/prompts/{promptId}
```

#### Update Prompt
```http
PUT /api/admin/prompts/{promptId}
```

#### Delete Prompt
```http
DELETE /api/admin/prompts/{promptId}
```

#### Render Prompt
```http
POST /api/admin/prompts/{promptId}/render
```

**Body:**
```json
{
  "variables": {
    "name": "World"
  }
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "promptId": "...",
    "version": 1,
    "renderedPrompt": "Hello World!",
    "variables": {...}
  }
}
```

#### Test Prompt
```http
POST /api/admin/prompts/{promptId}/test
```

**Response:**
```json
{
  "success": true,
  "results": [...],
  "summary": {
    "total": 5,
    "passed": 4,
    "failed": 1,
    "passRate": 80
  }
}
```

---

### Tool Management

#### List Tools
```http
GET /api/admin/tools
```

**Query Parameters:**
- `type` - Filter by type (builtin, custom, external)
- `category` - Filter by category
- `status` - Filter by status
- `tags` - Comma-separated tags

#### Register Tool
```http
POST /api/admin/tools
```

**Body:**
```json
{
  "name": "my-tool",
  "displayName": "My Tool",
  "type": "custom",
  "category": "util",
  "handler": "path/to/handler",
  "inputSchema": {...},
  "outputSchema": {...}
}
```

#### Get Tool
```http
GET /api/admin/tools/{toolName}
```

**Response:**
```json
{
  "success": true,
  "tool": {...},
  "documentation": "# Tool Documentation\n..."
}
```

#### Update Tool
```http
PUT /api/admin/tools/{toolName}
```

#### Execute Tool
```http
POST /api/admin/tools/{toolName}/execute
```

**Body:**
```json
{
  "parameters": {
    "param1": "value1"
  },
  "timeout": 30000
}
```

---

### Flow Execution

#### Execute Flow
```http
POST /api/flows/execute
```

**Body:**
```json
{
  "flowName": "my-flow",
  "payload": {
    "input": "test"
  },
  "userId": "user123",
  "enableTracing": true
}
```

**Response:**
```json
{
  "success": true,
  "output": {...},
  "executionId": "exec_123",
  "traceId": "trace_456",
  "duration": 1234
}
```

#### Test Flow
```http
POST /api/flows/test
```

**Body:**
```json
{
  "flowConfig": {...},
  "payload": {...}
}
```

---

### Execution Traces

#### List Traces
```http
GET /api/admin/traces
```

**Query Parameters:**
- `flowId` - Filter by flow ID
- `flowName` - Filter by flow name
- `status` - Filter by status (completed, failed, etc.)
- `userId` - Filter by user
- `startDate` - Filter by start date (ISO 8601)
- `endDate` - Filter by end date
- `hasError` - Filter for errors (true/false)
- `minDuration` - Minimum duration in ms
- `maxDuration` - Maximum duration in ms

#### Get Trace
```http
GET /api/admin/traces/{traceId}
```

**Response:**
```json
{
  "success": true,
  "trace": {
    "id": "trace_123",
    "flowName": "my-flow",
    "status": "completed",
    "stepTraces": [...]
  },
  "formatted": "Execution Trace: trace_123\n..."
}
```

---

### Analytics

#### Get Flow Analytics
```http
GET /api/admin/analytics?flowId={flowId}&period={period}
```

**Query Parameters:**
- `flowId` - Flow ID (required)
- `period` - Time period (hour, day, week, month)

**Response:**
```json
{
  "success": true,
  "analytics": {
    "totalExecutions": 100,
    "successfulExecutions": 95,
    "failedExecutions": 5,
    "averageDuration": 1234,
    "successRate": 0.95,
    "p95Duration": 2000
  }
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message"
}
```

**HTTP Status Codes:**
- `400` - Bad Request (validation error)
- `404` - Not Found
- `408` - Request Timeout (tool execution)
- `500` - Internal Server Error

---

## Usage Examples

### Create and Execute a Flow

```typescript
// 1. Create flow
const createResponse = await fetch('/api/admin/flows', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'hello-world',
    displayName: 'Hello World Flow',
    steps: [{
      id: 'step-1',
      type: 'GENERATE',
      name: 'Generate Greeting',
      config: {
        type: 'GENERATE',
        promptId: 'greeting-prompt',
        model: 'ollama/gemma:2b'
      },
      inputSchema: { type: 'object', properties: { name: { type: 'string' } } },
      outputSchema: { type: 'object', properties: { greeting: { type: 'string' } } }
    }],
    inputSchema: { type: 'object', properties: { name: { type: 'string' } } },
    outputSchema: { type: 'object', properties: { greeting: { type: 'string' } } }
  })
});

const { flow } = await createResponse.json();

// 2. Execute flow
const executeResponse = await fetch('/api/flows/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    flowName: 'hello-world',
    payload: { name: 'World' }
  })
});

const result = await executeResponse.json();
console.log(result.output); // { greeting: "Hello World!" }
```

### Render Prompt with Variables

```typescript
const response = await fetch('/api/admin/prompts/my-prompt-id/render', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    variables: {
      name: 'Alice',
      topic: 'AI'
    }
  })
});

const { result } = await response.json();
console.log(result.renderedPrompt);
```

### Get Flow Analytics

```typescript
const response = await fetch('/api/admin/analytics?flowId=flow-123&period=day');
const { analytics } = await response.json();

console.log(`Success Rate: ${analytics.successRate * 100}%`);
console.log(`Average Duration: ${analytics.averageDuration}ms`);
```

---

## Testing with cURL

### List Flows
```bash
curl http://localhost:3000/api/admin/flows
```

### Create Flow
```bash
curl -X POST http://localhost:3000/api/admin/flows \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test-flow",
    "displayName": "Test Flow",
    "steps": [],
    "inputSchema": {},
    "outputSchema": {}
  }'
```

### Execute Flow
```bash
curl -X POST http://localhost:3000/api/flows/execute \
  -H "Content-Type: application/json" \
  -d '{
    "flowName": "test-flow",
    "payload": { "input": "test" }
  }'
```

---

## Next Steps

1. **Add Authentication**
   - Implement middleware for admin routes
   - Check Firebase Auth session
   - Validate user roles

2. **Add Rate Limiting**
   - Implement per-user rate limits
   - Protect against abuse

3. **Add Caching**
   - Cache flow configurations
   - Cache prompt templates
   - Cache tool metadata

4. **Add Webhooks**
   - Notify on flow completion
   - Alert on failures

5. **Add API Documentation**
   - Generate OpenAPI/Swagger docs
   - Create Postman collection

---

## Related Documentation

- **Services Layer**: `src/services/`
- **Database Models**: `src/lib/models/`
- **Dynamic Executor**: `src/ai/flows/dynamic-flow-executor.ts`
- **Planning Docs**: Root directory

