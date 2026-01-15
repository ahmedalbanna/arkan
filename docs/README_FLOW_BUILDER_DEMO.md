# Flow Builder Demo App

## Overview

An interactive demo application showcasing the dynamic flow builder system. Users can create, configure, and test AI flows using a visual drag-and-drop interface.

## Features

### 🎨 Visual Flow Builder
- **Drag-and-drop interface** - Intuitive step reordering
- **Step library** - 7 step types with search and filtering
- **Real-time validation** - Immediate feedback on configuration
- **Visual canvas** - See your flow structure at a glance

### 📦 Pre-built Examples
1. **Simple Text Summarizer** (1 step)
   - Basic AI generation flow
   - Perfect for beginners
   
2. **RAG Question Answering** (3 steps)
   - Retrieve → Generate → Format
   - Demonstrates RAG integration
   
3. **Content Generation Pipeline** (4 steps)
   - Generate → Tool → Improve → Format
   - Advanced multi-step workflow

### 🔧 Step Types Available
- **Generate** - AI model text generation
- **Retrieve** - RAG context retrieval
- **Tool** - Custom tool execution
- **Transform** - Data transformation
- **Format** - Output formatting
- **Condition** - Branching logic
- **Loop** - Array iteration

## Access the Demo

### Local Development
```bash
npm run dev
```

Navigate to: `http://localhost:3000/demo/flow-builder`

### Pages Available
1. `/demo/flow-builder` - Interactive flow builder demo
2. `/demo/dynamic-flows` - Overview and statistics dashboard

## Using the Flow Builder

### Quick Start
1. Click **"Create New Flow"** or select an example
2. Add steps from the library on the left
3. Click a step to configure it
4. Use variable syntax: `{{input}}` or `{{step-1.output}}`
5. Test your flow with the Play button
6. Export as JSON for deployment

### Variable References
```
{{input}}           - Reference input data
{{step-1.output}}   - Reference previous step output
{{step-2.context}}  - Access nested properties
```

### Configuration Tips
- **Temperature**: 0.3 for factual, 0.8 for creative
- **maxTokens**: Limit to control costs
- **Model**: Use `gemini-2.0-flash-exp` for best results

## Example Flow JSON

```json
{
  "id": "simple-summarizer",
  "name": "Simple Text Summarizer",
  "version": "1.0.0",
  "steps": [
    {
      "id": "step-1",
      "type": "generate",
      "name": "Summarize Text",
      "config": {
        "model": "gemini-2.0-flash-exp",
        "prompt": "Summarize: {{input}}",
        "temperature": 0.7,
        "maxTokens": 500
      }
    }
  ],
  "inputSchema": {
    "type": "object",
    "properties": {
      "input": { "type": "string" }
    }
  }
}
```

## Architecture

### Components
```
src/app/demo/flow-builder/
├── page.tsx              - Main demo page
└── layout.tsx            - Layout configuration

src/components/admin/flow-builder/
├── FlowBuilderInterface.tsx  - Main builder interface
├── FlowCanvas.tsx            - Visual canvas for steps
├── StepLibrary.tsx           - Step type library
├── StepEditor.tsx            - Step configuration editor
└── FlowSettings.tsx          - Flow-level settings
```

### Data Models
- `FlowConfiguration` - Complete flow definition
- `FlowStep` - Individual step configuration
- Input/Output schemas using JSON Schema

## Integration with Dynamic Flows System

The flow builder creates JSON configurations that are:
- ✅ Compatible with the dynamic flow executor
- ✅ Version control friendly (Git)
- ✅ Deployable to production
- ✅ Testable with the built-in tester

## Best Practices

### Flow Design
- Keep flows focused on one task
- Use descriptive step names
- Document complex logic
- Define clear input/output schemas

### Performance
- Cache repeated operations
- Set appropriate token limits
- Use conditional execution when possible
- Monitor execution traces

### Testing
- Test with various inputs
- Validate edge cases
- Check error handling
- Verify output format

## Troubleshooting

### Common Issues

**Steps not appearing**
- Check that the step library is loaded
- Verify step type is registered

**Variables not resolving**
- Ensure correct syntax: `{{variable}}`
- Check step ID references
- Verify data flow between steps

**Generation errors**
- Check model availability
- Verify API keys are set
- Review prompt format
- Check token limits

## Next Steps

1. ✅ Create your first flow
2. ✅ Test with sample data
3. ✅ Export as JSON
4. 🚀 Deploy to production

## Links

- [Dynamic Flows Documentation](../../../docs/README.md)
- [API Documentation](../../../docs/API_DOCUMENTATION.md)
- [Migration Guide](../../../MIGRATION_100_PERCENT_COMPLETE.md)

## Support

For questions or issues:
- Check the in-app guide (click "Guide" button)
- Review example flows
- See the dynamic-flows.md roadmap

---

**Status**: ✅ Production Ready
**Version**: 1.0.0
**Last Updated**: 2026-01-14
