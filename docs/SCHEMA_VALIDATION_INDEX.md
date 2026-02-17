# Schema Validation Documentation Index

Complete documentation for schema validation patterns in Arkan. Use this index to find the right guide for your needs.

## 📚 Documentation Files

### 1. **SCHEMA_VALIDATION_PATTERNS.md** (Complete Reference)
The most comprehensive guide covering all aspects of schema validation.

**Contains:**
- Core concepts and fundamentals
- Detailed schema structure and organization
- The critical flow field pattern
- Step-by-step guide for creating new tools
- Hook integration patterns
- API route integration
- Best practices and common patterns
- Troubleshooting section
- Quick reference checklist

**Read this if:** You need complete understanding or are building complex tools

**Time:** 20-30 minutes to read thoroughly

---

### 2. **SCHEMA_VALIDATION_QUICKSTART.md** (Fast Reference)
A condensed version for quick lookups and common tasks.

**Contains:**
- 5-minute overview
- 3-step guide to adding new tools
- Common schemas (text processing, enums, nested objects)
- Hook usage patterns
- Field types reference table
- Common errors and fixes
- File locations map
- Validation checklist
- Pro tips

**Read this if:** You're adding a tool and need quick answers

**Time:** 5-10 minutes to find what you need

---

### 3. **SCHEMA_VALIDATION_EXAMPLES.md** (Real-World Implementations)
Complete, working code examples for common scenarios.

**Contains:**
- Simple text processing tool (complete example)
- Tool with multiple parameters
- Tool with nested configuration
- Tool with enum selection
- Extending existing schemas
- Full implementations including schemas, flows, hooks, and components

**Read this if:** You want to see complete working examples

**Time:** 10-15 minutes to understand patterns

---

## 🎯 Quick Navigation Guide

### **I want to...**

#### Add a new writing tool
1. Read: **SCHEMA_VALIDATION_QUICKSTART.md** → "Adding a New Writing Tool (3 Steps)"
2. Reference: **SCHEMA_VALIDATION_EXAMPLES.md** → Find similar example
3. Details: **SCHEMA_VALIDATION_PATTERNS.md** → "Creating New Tools"

#### Understand schema validation fundamentals
1. Start: **SCHEMA_VALIDATION_QUICKSTART.md** → "5-Minute Overview"
2. Deep dive: **SCHEMA_VALIDATION_PATTERNS.md** → "Core Concepts"

#### Fix a validation error
1. Quick check: **SCHEMA_VALIDATION_QUICKSTART.md** → "Common Errors & Fixes"
2. Detailed help: **SCHEMA_VALIDATION_PATTERNS.md** → "Troubleshooting"

#### Create a custom hook
1. Pattern: **SCHEMA_VALIDATION_PATTERNS.md** → "Hook Integration"
2. Example: **SCHEMA_VALIDATION_EXAMPLES.md** → "Simple Text Processing Tool"

#### Build complex nested schemas
1. Reference: **SCHEMA_VALIDATION_PATTERNS.md** → "Common Patterns" → "Pattern 2"
2. Example: **SCHEMA_VALIDATION_EXAMPLES.md** → "Tool with Nested Configuration"

#### Deploy new tool to production
1. Checklist: **SCHEMA_VALIDATION_QUICKSTART.md** → "Validation Checklist"
2. Details: **SCHEMA_VALIDATION_PATTERNS.md** → "Best Practices"

---

## 🔑 Key Concepts Summary

### The Most Important Rule
Every API call must include the `flow` field with the exact tool name:
```typescript
{
    flow: 'exact-tool-name',  // ← Required, must match schema literal
    ...otherFields
}
```

### Three-Layer Pattern
1. **Schema** (`src/ai/schemas/flows.ts`) - Defines what fields are valid
2. **Flow** (`src/ai/flows/`) - Implements the business logic
3. **Route** (`src/app/api/writing-tools/[tool]/route.ts`) - Registers the tool

### Two Ways to Call API
```typescript
// Option 1: Generic hook (auto-adds flow)
const { mutate } = useWritingTool('my-tool');
mutate({ text: 'content' });

// Option 2: Custom mutation (manual flow)
mutate({
    flow: 'my-tool',  // ← Must include manually
    text: 'content',
});
```

---

## 📊 Current Implementation Status

### Validation Metrics (as of Feb 2026)
- ✅ **32 Total Flows** - All with corresponding schemas
- ✅ **32 Input Schemas** - All with flow literal fields
- ✅ **100% Schema-to-Flow Mapping** - Perfect coverage
- ✅ **10 Direct API Hooks** - All using correct flow fields
- ✅ **22+ Generic Hook Flows** - Auto-handled by useWritingTool
- ✅ **0 Schema Validation Errors** - All issues resolved

### Recent Fixes
- ✅ Added `flow` field to text stylist mutations (6 tools)
- ✅ Added `flow` field to generate TOC mutation
- ✅ Added `flow` field to AI action mutations (3 tools)
- ✅ Fixed missing `additionalInstructions` field in GenerateTocInputSchema

---

## 📖 Learning Path by Role

### **For Developers Adding New Tools**
1. **Start Here:** SCHEMA_VALIDATION_QUICKSTART.md
2. **Then See:** SCHEMA_VALIDATION_EXAMPLES.md (find similar tool)
3. **Reference:** SCHEMA_VALIDATION_PATTERNS.md (when stuck)

### **For Code Reviewers**
1. **Reference:** SCHEMA_VALIDATION_PATTERNS.md → "Best Practices"
2. **Checklist:** SCHEMA_VALIDATION_QUICKSTART.md → "Validation Checklist"
3. **Examples:** SCHEMA_VALIDATION_EXAMPLES.md (verify pattern match)

### **For DevOps/Deployment**
1. **Before Deploy:** SCHEMA_VALIDATION_QUICKSTART.md → "Before Deploying"
2. **Monitoring:** SCHEMA_VALIDATION_PATTERNS.md → "Common Errors"

### **For New Team Members**
1. **Orientation:** SCHEMA_VALIDATION_QUICKSTART.md → "5-Minute Overview"
2. **Deep Learning:** SCHEMA_VALIDATION_PATTERNS.md
3. **Practice:** SCHEMA_VALIDATION_EXAMPLES.md

---

## 🔧 File Organization Reference

```
Schema Validation System
├── Schema Definition
│   └── src/ai/schemas/flows.ts (32 InputSchemas + OutputSchemas)
│
├── Flow Implementation
│   └── src/ai/flows/ (32 flow implementations)
│
├── Hook Integration
│   ├── src/hooks/writing-tools/use-writing-tool.ts (generic)
│   └── src/hooks/writing-tools/use-*-logic.ts (specific)
│
└── API Route
    └── src/app/api/writing-tools/[tool]/route.ts (router)
```

---

## 📋 Common Tasks Checklist

### Adding a Tool
- [ ] Define schema in `src/ai/schemas/flows.ts`
- [ ] Create flow in `src/ai/flows/[tool].ts`
- [ ] Export from `src/ai/flows/index.ts`
- [ ] Register in API route `toolConfig`
- [ ] Create hook (if needed)
- [ ] Add to component

### Creating a Hook
- [ ] Use generic `useWritingTool` if simple
- [ ] Or create custom mutation with `flow` field
- [ ] Test with sample data
- [ ] Add error handling

### Testing Validation
- [ ] Verify `flow` field matches schema literal
- [ ] Check all required fields are present
- [ ] Validate field types match schema
- [ ] Test with missing optional fields
- [ ] Ensure error messages are clear

### Deploying
- [ ] All schemas have `flow` literals
- [ ] All hooks include `flow` in requests
- [ ] All tools registered in `toolConfig`
- [ ] No unused schemas or flows
- [ ] Validation tests pass

---

## 🔍 Validation Rules Summary

| Rule | What | Why |
|------|------|-----|
| **Flow Field** | Must include `flow: 'exact-name'` | Identifies which tool to run |
| **Literal Type** | Use `z.literal()` not `z.string()` | Type safety and validation |
| **Kebab-Case** | `my-tool` not `myTool` or `my_tool` | Consistency with URLs |
| **Required Fields** | No `.optional()` | Ensures data is present |
| **Optional Fields** | Include `.optional()` | Allows omitting fields |
| **Schema Naming** | `*InputSchema` and `*OutputSchema` | Clear convention |
| **Flow Naming** | camelCase (`myTool`) | Matches JS function names |

---

## 🆘 Getting Help

### If you have a question about...

**Schema structure**
→ See SCHEMA_VALIDATION_PATTERNS.md → "Schema Structure"

**Creating a new tool**
→ See SCHEMA_VALIDATION_QUICKSTART.md → "Adding a New Tool"

**Hook integration**
→ See SCHEMA_VALIDATION_PATTERNS.md → "Hook Integration"

**Validation errors**
→ See SCHEMA_VALIDATION_QUICKSTART.md → "Common Errors"

**Code examples**
→ See SCHEMA_VALIDATION_EXAMPLES.md

**Best practices**
→ See SCHEMA_VALIDATION_PATTERNS.md → "Best Practices"

---

## 📞 Quick Reference Links

| Document | Purpose | Best For |
|----------|---------|----------|
| SCHEMA_VALIDATION_PATTERNS.md | Complete reference | Deep learning |
| SCHEMA_VALIDATION_QUICKSTART.md | Fast lookup | Quick answers |
| SCHEMA_VALIDATION_EXAMPLES.md | Code examples | Learning by example |

---

## 🎓 Related Documentation

- [Main Development Guide](./README.md)
- [TypeScript Patterns](./TYPESCRIPT_PATTERNS.md)
- [API Development](./README.md)
- [Architecture](./blueprint.md)

---

## 📝 Notes for Future Improvements

Areas to expand documentation:
- [ ] Video tutorials for common tasks
- [ ] Interactive schema builder examples
- [ ] Performance optimization guide
- [ ] Advanced error handling patterns
- [ ] Schema versioning strategies
- [ ] Migration guides for schema updates

---

**Last Updated:** February 2026  
**Version:** 1.0  
**Maintained By:** Development Team

