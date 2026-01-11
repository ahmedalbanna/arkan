# Week 4 Quick Reference

## 🎨 Admin UI Components

### Flow Builder (6 Components)
All located in `src/components/admin/flow-builder/`

#### 1. FlowBuilderInterface
**Purpose**: Main container for flow creation/editing  
**Features**: Dual-view (Builder/Settings), step management, save/test actions  
**Lines**: 308

#### 2. FlowCanvas
**Purpose**: Visual drag-and-drop canvas  
**Features**: Step visualization, color-coded types, connection indicators  
**Lines**: 275

#### 3. StepEditor
**Purpose**: Configure individual steps  
**Features**: Type-specific editors, advanced options, tabbed interface  
**Lines**: 567

#### 4. StepLibrary
**Purpose**: Browse and add step types  
**Features**: Categorized steps, descriptions, quick add  
**Lines**: 241

#### 5. FlowList
**Purpose**: List and manage flows  
**Features**: Search, filter, CRUD operations  
**Lines**: 314

#### 6. FlowTester
**Purpose**: Test flow execution  
**Features**: Payload editor, trace viewer, metrics  
**Lines**: 301

---

### Prompt Editor (4 Components)
All located in `src/components/admin/prompts/`

#### 1. PromptEditor
**Purpose**: Create/edit prompt templates  
**Features**: Template editor, variable management, live preview  
**Lines**: 366

#### 2. VariableEditor
**Purpose**: Manage prompt variables  
**Features**: Type selection, descriptions, inline editing  
**Lines**: 304

#### 3. PromptList
**Purpose**: List and manage prompts  
**Features**: Search, filter, CRUD operations  
**Lines**: 317

#### 4. PromptTester
**Purpose**: Test prompt execution  
**Features**: Variable inputs, model config, result display  
**Lines**: 523

---

## 🎯 Step Types Supported

| Type | Icon | Color | Purpose |
|------|------|-------|---------|
| **GENERATE** | ⚡ Zap | Yellow | Generate text with LLM |
| **RETRIEVE** | 💾 Database | Blue | Fetch context from RAG |
| **TOOL** | 🔧 Wrench | Purple | Execute a tool |
| **FORMAT** | 📄 FileText | Green | Format output |
| **CONDITION** | 🔀 GitBranch | Orange | Conditional branching |
| **LOOP** | 🔄 RefreshCw | Pink | Iterative processing |

---

## 📝 Variable Types

| Type | Color | Icon | Description |
|------|-------|------|-------------|
| **string** | Blue | 🔤 | Text values |
| **number** | Green | 🔢 | Numeric values |
| **boolean** | Purple | ☑️ | True/false |
| **array** | Orange | 📋 | Lists |
| **object** | Pink | 📦 | Complex objects |

---

## 🔗 Usage Examples

### Create a Flow
```typescript
1. Navigate to /admin/flows
2. Click "Create New Flow"
3. FlowBuilderInterface opens
4. Configure flow settings
5. Add steps from StepLibrary
6. Configure each step with StepEditor
7. Click "Save"
```

### Edit a Prompt
```typescript
1. Navigate to /admin/prompts
2. Click on a prompt to edit
3. PromptEditor opens
4. Edit template content
5. Manage variables in sidebar
6. Preview with sample data
7. Click "Save"
```

### Test a Flow
```typescript
1. Open flow in FlowBuilderInterface
2. Click "Test Flow"
3. FlowTester opens
4. Enter test payload
5. Click "Execute"
6. View results and trace
```

---

## 📊 Statistics

- **Total Components**: 10
- **Total Lines**: 3,516
- **Step Types**: 6
- **Variable Types**: 5
- **API Endpoints**: Integrated with all Week 3 APIs

---

## 🎨 UI Features

### Design
- ✅ shadcn/ui components
- ✅ Radix UI primitives
- ✅ Tailwind CSS styling
- ✅ Dark mode support
- ✅ Responsive design

### Interactions
- ✅ Drag-and-drop
- ✅ Keyboard navigation
- ✅ Real-time preview
- ✅ Inline editing
- ✅ Toast notifications

### Accessibility
- ✅ ARIA labels
- ✅ Focus management
- ✅ Screen reader support
- ✅ Color contrast
- ✅ Semantic HTML

---

## 🚀 Key Pages

**Flow Management**: `/admin/flows`  
**Prompt Management**: `/admin/prompts`

---

## ✅ Week 4 Complete!

All Admin UI components are fully implemented and integrated with Week 3 APIs.
