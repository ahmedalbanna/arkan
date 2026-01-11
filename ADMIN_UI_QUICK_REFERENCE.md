# Admin UI Quick Reference Guide

## 🚀 Quick Start

### Accessing Admin UI
```
Base URL: /admin
- Flows: /admin/flows
- Prompts: /admin/prompts
- Tools: /admin/tools
```

---

## 📋 Component Imports

### Flow Builder Components
```typescript
import { FlowCanvas } from '@/components/admin/flow-builder/FlowCanvas';
import { StepEditor } from '@/components/admin/flow-builder/StepEditor';
import { StepLibrary } from '@/components/admin/flow-builder/StepLibrary';
import { FlowList } from '@/components/admin/flow-builder/FlowList';
import { FlowTester } from '@/components/admin/flow-builder/FlowTester';
import { FlowBuilderInterface } from '@/components/admin/flow-builder/FlowBuilderInterface';
```

### Prompt Management Components
```typescript
import { PromptList } from '@/components/admin/prompts/PromptList';
import { PromptEditor } from '@/components/admin/prompts/PromptEditor';
import { VariableEditor } from '@/components/admin/prompts/VariableEditor';
```

### Tool Management Components
```typescript
import { ToolRegistry } from '@/components/admin/tools/ToolRegistry';
```

---

## 🎯 Common Use Cases

### 1. Create a New Flow
```typescript
// In your page component
const [mode, setMode] = useState<'list' | 'edit'>('list');
const [selectedFlow, setSelectedFlow] = useState(null);

// Handler
const handleCreateFlow = () => {
  setSelectedFlow(null);
  setMode('edit');
};

// Render
{mode === 'edit' && (
  <FlowBuilderInterface
    initialFlow={selectedFlow}
    onSave={handleSaveFlow}
    onTest={handleTestFlow}
    availablePrompts={prompts}
    availableTools={tools}
  />
)}
```

### 2. Edit Existing Flow
```typescript
const handleEditFlow = (flow: FlowConfiguration) => {
  setSelectedFlow(flow);
  setMode('edit');
};

<FlowList
  flows={flows}
  onFlowEdit={handleEditFlow}
  onFlowDelete={handleDeleteFlow}
  // ... other handlers
/>
```

### 3. Test a Flow
```typescript
const handleTestFlow = async (flowId: string, input: Record<string, any>) => {
  const response = await fetch('/api/flows/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ flowId, input }),
  });
  return await response.json();
};

<FlowTester
  flow={selectedFlow}
  onTest={handleTestFlow}
/>
```

### 4. Manage Prompt Variables
```typescript
const [variables, setVariables] = useState<PromptVariable[]>([]);

const handleInsertVariable = (variableName: string) => {
  // Insert into prompt template at cursor position
  const newTemplate = `${template}{{${variableName}}}`;
  setTemplate(newTemplate);
};

<VariableEditor
  variables={variables}
  onChange={setVariables}
  onInsertVariable={handleInsertVariable}
/>
```

---

## 🎨 Step Types & Configuration

### GENERATE Step
```typescript
{
  type: 'GENERATE',
  config: {
    type: 'GENERATE',
    promptName: 'my-prompt-template',
    model: 'gemini-2.0-flash-exp',
    temperature: 0.7,
    maxTokens: 2048,
    variables: {
      topic: '{{context.topic}}',
      style: '{{context.style}}'
    }
  }
}
```

### RETRIEVE Step
```typescript
{
  type: 'RETRIEVE',
  config: {
    type: 'RETRIEVE',
    query: '{{context.searchQuery}}',
    collection: 'documents',
    topK: 5,
    threshold: 0.7,
    rerank: true
  }
}
```

### TOOL Step
```typescript
{
  type: 'TOOL',
  config: {
    type: 'TOOL',
    toolName: 'my-custom-tool',
    arguments: {
      param1: '{{context.value1}}',
      param2: '{{context.value2}}'
    }
  }
}
```

### FORMAT Step
```typescript
{
  type: 'FORMAT',
  config: {
    type: 'FORMAT',
    format: 'markdown',
    template: '# {{context.title}}\n\n{{context.content}}'
  }
}
```

### CONDITION Step
```typescript
{
  type: 'CONDITION',
  config: {
    type: 'CONDITION',
    expression: 'context.score > 0.8',
    trueStepId: 'step-high-quality',
    falseStepId: 'step-low-quality'
  }
}
```

### LOOP Step
```typescript
{
  type: 'LOOP',
  config: {
    type: 'LOOP',
    items: 'context.items',
    itemVar: 'item',
    bodyStepId: 'step-process-item',
    maxIterations: 100
  }
}
```

---

## 🔌 API Endpoints

### Flow Management
```typescript
// List flows
GET /api/admin/flows
Response: { flows: FlowConfiguration[] }

// Get single flow
GET /api/admin/flows/:id
Response: { flow: FlowConfiguration }

// Create flow
POST /api/admin/flows
Body: Partial<FlowConfiguration>
Response: { flow: FlowConfiguration }

// Update flow
PUT /api/admin/flows/:id
Body: Partial<FlowConfiguration>
Response: { flow: FlowConfiguration }

// Delete flow
DELETE /api/admin/flows/:id
Response: { success: boolean }

// Test flow
POST /api/flows/test
Body: { flowId: string, input: Record<string, any> }
Response: { output: any, duration: number, steps: StepResult[] }
```

### Prompt Management
```typescript
// List prompts
GET /api/admin/prompts
Response: { prompts: PromptConfiguration[] }

// Create prompt
POST /api/admin/prompts
Body: Partial<PromptConfiguration>
Response: { prompt: PromptConfiguration }

// Update prompt
PUT /api/admin/prompts/:id
Body: Partial<PromptConfiguration>
Response: { prompt: PromptConfiguration }

// Delete prompt
DELETE /api/admin/prompts/:id
Response: { success: boolean }
```

### Tool Management
```typescript
// List tools
GET /api/admin/tools
Response: { tools: ToolConfiguration[] }

// Get tool details
GET /api/admin/tools/:name
Response: { tool: ToolConfiguration }
```

---

## 🎭 Component Props Reference

### FlowCanvas
```typescript
interface FlowCanvasProps {
  steps: FlowStep[];
  selectedStepId?: string;
  onStepSelect?: (stepId: string) => void;
  onStepAdd?: (afterStepId?: string) => void;
  onStepDelete?: (stepId: string) => void;
  onStepReorder?: (stepId: string, newIndex: number) => void;
  readOnly?: boolean;
}
```

### StepEditor
```typescript
interface StepEditorProps {
  step: FlowStep;
  onSave: (step: FlowStep) => void;
  onCancel: () => void;
  availablePrompts?: Array<{ name: string; displayName: string }>;
  availableTools?: Array<{ name: string; description: string }>;
}
```

### FlowList
```typescript
interface FlowListProps {
  flows: FlowConfiguration[];
  onFlowSelect?: (flow: FlowConfiguration) => void;
  onFlowCreate?: () => void;
  onFlowEdit?: (flow: FlowConfiguration) => void;
  onFlowDelete?: (flowId: string) => void;
  onFlowDuplicate?: (flow: FlowConfiguration) => void;
  onFlowTest?: (flow: FlowConfiguration) => void;
  onFlowArchive?: (flowId: string) => void;
  onFlowRestore?: (flowId: string) => void;
}
```

### VariableEditor
```typescript
interface VariableEditorProps {
  variables: PromptVariable[];
  onChange: (variables: PromptVariable[]) => void;
  onInsertVariable?: (variableName: string) => void;
}
```

---

## 🎨 Styling & Theming

### Color Scheme for Step Types
```typescript
const stepTypeColors = {
  GENERATE: 'yellow-600', // AI generation
  RETRIEVE: 'blue-600',   // Data retrieval
  TOOL: 'purple-600',     // Tool execution
  FORMAT: 'green-600',    // Formatting
  CONDITION: 'orange-600', // Conditional logic
  LOOP: 'pink-600'        // Iteration
};
```

### Status Colors
```typescript
const statusColors = {
  active: 'green-500',
  draft: 'yellow-500',
  archived: 'gray-500',
  success: 'green-500',
  error: 'red-500',
  running: 'blue-500'
};
```

---

## 📝 Best Practices

### 1. Error Handling
```typescript
try {
  const response = await fetch('/api/admin/flows', {
    method: 'POST',
    body: JSON.stringify(flowData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create flow');
  }
  
  toast({
    title: 'Success',
    description: 'Flow created successfully',
  });
} catch (error) {
  toast({
    title: 'Error',
    description: error.message,
    variant: 'destructive',
  });
}
```

### 2. Loading States
```typescript
const [isLoading, setIsLoading] = useState(false);

const fetchData = async () => {
  setIsLoading(true);
  try {
    // Fetch data
  } finally {
    setIsLoading(false);
  }
};
```

### 3. Optimistic Updates
```typescript
const handleDelete = async (id: string) => {
  // Optimistically update UI
  setFlows(flows.filter(f => f.id !== id));
  
  try {
    await fetch(`/api/admin/flows/${id}`, { method: 'DELETE' });
  } catch (error) {
    // Rollback on error
    await fetchFlows();
    toast({ title: 'Error', variant: 'destructive' });
  }
};
```

### 4. Keyboard Shortcuts
```typescript
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 's':
          e.preventDefault();
          handleSave();
          break;
        case 't':
          e.preventDefault();
          handleTest();
          break;
      }
    }
  };
  
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

---

## 🔍 Troubleshooting

### Common Issues

**Issue**: Steps not appearing in canvas
```typescript
// Solution: Check that steps array is properly passed
<FlowCanvas steps={flow.steps || []} />
```

**Issue**: Step editor not opening
```typescript
// Solution: Ensure step is selected and sheet is shown
const [showStepEditor, setShowStepEditor] = useState(false);
const [selectedStep, setSelectedStep] = useState(null);

<Sheet open={showStepEditor && !!selectedStep}>
```

**Issue**: Variables not inserting into template
```typescript
// Solution: Ensure cursor position tracking
const handleInsertVariable = (name: string) => {
  const textarea = textareaRef.current;
  const pos = textarea.selectionStart;
  const newValue = 
    value.substring(0, pos) + 
    `{{${name}}}` + 
    value.substring(pos);
  setValue(newValue);
};
```

---

## 📚 Additional Resources

- [Full Documentation](./WEEK_4_ADMIN_UI_COMPLETE.md)
- [Dynamic Flow Roadmap](./DYNAMIC_FLOW_ROADMAP.md)
- [Flow Configuration Models](./src/lib/models/flow-config.ts)
- [Prompt Configuration Models](./src/lib/models/prompt-config.ts)
- [Tool Configuration Models](./src/lib/models/tool-config.ts)

---

**Last Updated**: January 11, 2026  
**Version**: 1.0.0
