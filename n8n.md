Writing n8n workflow JSON requires understanding how n8n represents visual logic as a structured data object. When you export a workflow or look at its underlying code, it
follows a specific schema.

Here is a breakdown of the core components within an n8n JSON file:

                                                                             1. High-Level Structure

An n8n workflow is a single JSON object containing:

 • nodes: An array of objects, where each object defines a specific task (Webhook, Code, HTTP Request, etc.).
 • connections: An object that defines how data flows between those nodes.
 • settings: Configuration for the workflow (e.g., error handling, execution variables).
 • meta: Versioning and instance information.

                                                                               2. Node Definition

Each node in the nodes array typically includes:

 • parameters: The specific configuration for that node (e.g., the URL for an HTTP request or the JavaScript for a Code node).
 • id: A unique UUID for the node.
 • name: The display name of the node.
 • type: The internal identifier for the node type (e.g., n8n-nodes-base.httpRequest).
 • typeVersion: To ensure compatibility as nodes are updated.
 • position: An array [x, y] defining where the node sits on the visual canvas.

                                                                          3. Connections (The "Lines")

The connections object maps node names to their outputs and inputs. It uses a multi-dimensional array structure:

```json
"connections": {
  "Source Node Name": {
    "main": [
      [
        {
          "node": "Destination Node Name",
          "type": "main",
          "index": 0
        }
      ]
    ]
  }
}
```

 • main: The primary data output.
 • index: Used if a node has multiple inputs (rare) or if you're using branches.

                                                                         4. Expressions and Dynamic Data

n8n uses a template-like syntax for expressions, which are stored as strings in the JSON:

 • ={{ ... }}: This tells n8n to evaluate the content as JavaScript/JSONata.
 • Example: ={{ $json.body.prompt }} accesses the "prompt" field from the incoming JSON body.

                                                                                5. Advanced Logic

 • Code Nodes: Contain raw JavaScript in the jsCode parameter.
 • Wait/Merge Nodes: Handle timing and data synchronization.
 • Static Data: Some workflows store "memory" (like the last time they ran) in a staticData field, though this isn't usually in the base export.

                                                                     Example from our n8n_ai_workflow.json:

If you look at the file I created earlier, you'll see how the Switch node (Route Action) uses parameters to define routing rules and connections to send data to either the
Ollama node or the Code node based on the user's action.

Would you like me to:

      ]
    ]
  }
}
```

 • main: The primary data output.
 • index: Used if a node has multiple inputs (rare) or if you're using branches.

                                                                         4. Expressions and Dynamic Data

n8n uses a template-like syntax for expressions, which are stored as strings in the JSON:

 • ={{ ... }}: This tells n8n to evaluate the content as JavaScript/JSONata.
 • Example: ={{ $json.body.prompt }} accesses the "prompt" field from the incoming JSON body.

                                                                                5. Advanced Logic

 • Code Nodes: Contain raw JavaScript in the jsCode parameter.
 • Wait/Merge Nodes: Handle timing and data synchronization.
 • Static Data: Some workflows store "memory" (like the last time they ran) in a staticData field, though this isn't usually in the base export.

                                                                     Example from our n8n_ai_workflow.json:

If you look at the file I created earlier, you'll see how the Switch node (Route Action) uses parameters to define routing rules and connections to send data to either the
Ollama node or the Code node based on the user's action.



I can write definitions for hundreds of different n8n nodes, covering everything from core logic to complex AI and third-party integrations.

Essentially, if a node exists in the n8n node library, I can generate the corresponding JSON structure for it. Here are the categories I am most proficient in:

                                                                           1. Core Logic & Flow Nodes

These are the "brain" of any workflow:

 • Webhook: For receiving data from your Next.js app.
 • HTTP Request: For calling external APIs or sending data back to your app.
 • Code (JavaScript): For complex data manipulation that standard nodes can't handle.
 • Switch / Filter: For conditional routing (e.g., "If action is 'generate', go left; else, go right").
 • Set / Edit Fields: For cleaning up and formatting data.
 • Merge / Wait: For synchronizing multiple data streams.

                                                                       2. AI & LangChain Nodes (Advanced)

Since this project is AI-focused, I can write nodes for:

 • AI Agent: The main orchestrator for autonomous tasks.
 • Chains: LLM Chain, Retrieval QA Chain, etc.
 • Models: Ollama (local), OpenAI, Anthropic, Google Gemini.
 • Vector Stores: Qdrant (which you use), Pinecone, Milvus.
 • Tools: Custom Calculator, Google Search, Wikipedia.
 • Memory: Window Buffer Memory, Redis Chat Memory.

                                                                       3. Productivity & Dev Integrations

 • Atlassian: Jira (create/update issues) and Confluence (create/update pages).
 • Google Services: Sheets, Drive, Gmail, Calendar.
 • Communication: Slack, Discord, Telegram, Microsoft Teams.
 • Development: GitHub (PRs, Issues), GitLab, AWS S3.

                                                                                4. Database Nodes

 • PostgreSQL / MySQL: For direct database interactions.
 • Redis: For caching or high-speed state management.
 • MongoDB: For unstructured data storage.

                                                                                How I write them:

I don't just provide a list; I can write the exact JSON object for each node, including:

 1 Parameters: All the settings (URLs, methods, credentials).
 2 Expressions: Dynamic logic (e.g., ={{ $json.body.id }}).
 3 Connections: The "wiring" that connects the output of one node to the input of the next.

Would you like me to write a specific "Advanced Node Definition" for you now? For example:

 • A Qdrant Vector Store node that performs a similarity search.
 • A Jira node that automatically creates a ticket when an AI generation fails.
 • An AI Agent node that uses LangChain to decide which tool to call.

## OUR N8N API
 https://vmi2935537.contaboserver.net/api/v1/
 API KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMGQzOGVhOS0wMjFjLTQ4NjAtYjdmMC1iYzVjNjYyNzkxYjciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc1NTE3MzQ2fQ.fDM8tKSr21XEX_AivOfgRx38djbHl8j0VxnLUANNyGA