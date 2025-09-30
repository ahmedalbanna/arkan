# System Patterns: Arkan

## Architecture Overview
Arkan follows a modern, modular architecture built on Next.js 15 with Firebase backend, emphasizing separation of concerns, reusability, and maintainability.

## Core Architectural Principles

### 1. Model-Driven Architecture
- **Single Source of Truth**: Each data entity has a dedicated model class
- **Encapsulation**: Business logic contained within model classes
- **Type Safety**: Strong TypeScript typing throughout the system
- **Serialization**: Consistent JSON serialization patterns

### 2. Component-Based UI
- **Atomic Design**: Reusable UI components with clear hierarchy
- **Radix UI Foundation**: Accessible, unstyled components
- **Tailwind CSS**: Utility-first styling approach
- **Theme System**: Dark/light mode with consistent theming

### 3. AI Integration Pattern
- **Genkit Framework**: Structured AI flow management
- **Separation of Concerns**: Prompts, flows, and tools in separate modules
- **Schema Validation**: Zod schemas for AI input/output validation
- **Error Handling**: Comprehensive error management for AI operations

## Key System Patterns

### 1. Project State Management
```typescript
// Central Project model with Zustand store
class Project {
  // Encapsulated state with private properties
  // Public getters/setters for controlled access
  // Business logic methods for state manipulation
}

// Global state management
const useBuilderStore = create<ProjectState>((set, get) => ({
  project: new Project(defaultProject),
  // State management methods
}));
```

### 2. AI Flow Architecture
```
config/     → AI model configurations
prompts/    → Prompt definitions
flows/      → Business logic orchestration
tools/      → External tool integrations
schemas/    → Zod validation schemas
```

### 3. Hook Factory Pattern
```typescript
// Reusable hook factories for different tool types
export const useTextProcessor = (config: TextProcessorConfig) => {
  // Common text processing logic
  // Tool-specific implementations
  // Error handling and state management
};
```

### 4. Feature Flag System
```typescript
// Dynamic feature enabling/disabling
const isFeatureEnabled = (feature: string) => {
  return features[feature]?.isEnabled ?? false;
};
```

## Data Flow Patterns

### 1. AI Generation Flow
1. **User Input** → Form validation
2. **Context Preparation** → File uploads and context processing
3. **AI Flow Execution** → Genkit flow with prompt and model
4. **Result Processing** → Schema validation and error handling
5. **State Update** → Project model update
6. **UI Refresh** → Component re-rendering

### 2. File Upload Flow
1. **File Selection** → Drag & drop or file picker
2. **Validation** → File type and size checks
3. **Processing** → Text extraction and parsing
4. **Context Addition** → Project external context update
5. **UI Feedback** → Progress indicators and success messages

### 3. Export Flow
1. **Content Preparation** → Project data serialization
2. **Template Application** → Template-based formatting
3. **File Generation** → DOCX/PPTX/PDF creation
4. **Download Trigger** → Browser download initiation

## Component Patterns

### 1. Page Layout Pattern
```typescript
// Consistent page structure
export default function PageName() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <PageHeader />
      <PageContent />
      <PageActions />
    </div>
  );
}
```

### 2. Form Handling Pattern
```typescript
// Unified form management
const formHandler = useFormHandler({
  schema: validationSchema,
  onSubmit: handleSubmit,
  defaultValues: initialValues,
});
```

### 3. Loading State Pattern
```typescript
// Consistent loading states
const { isProcessing, startProcessing, stopProcessing } = useProcessingState();
```

## Error Handling Patterns

### 1. Centralized Error Management
```typescript
// Global error handler
export class ErrorHandler {
  static handle(error: unknown, context: string) {
    // Error classification and logging
    // User-friendly error messages
    // Recovery suggestions
  }
}
```

### 2. AI Error Handling
```typescript
// AI-specific error management
try {
  const result = await aiFlow.execute(input);
} catch (error) {
  ErrorHandler.handle(error, 'ai-generation');
  // Fallback strategies
}
```

## Security Patterns

### 1. Authentication Flow
- **Server-side Auth Check**: Every request validated
- **Session Management**: Firebase session cookies
- **Route Protection**: Public/private route separation
- **Role-based Access**: Admin/user permission levels

### 2. Data Validation
- **Input Sanitization**: All user inputs validated
- **Schema Validation**: Zod schemas for all data
- **File Upload Security**: Type and size validation
- **XSS Prevention**: Content sanitization

## Performance Patterns

### 1. Code Splitting
- **Route-based Splitting**: Page-level code splitting
- **Component Lazy Loading**: Heavy components loaded on demand
- **Dynamic Imports**: Conditional feature loading

### 2. Caching Strategy
- **React Query**: Server state caching
- **Zustand Persistence**: Client state persistence
- **Static Generation**: Pre-built pages where possible

### 3. Bundle Optimization
- **Tree Shaking**: Unused code elimination
- **Asset Optimization**: Image and font optimization
- **Dependency Analysis**: Regular dependency auditing

## Testing Patterns

### 1. Unit Testing
- **Jest Framework**: Test runner and assertions
- **Component Testing**: React Testing Library
- **Hook Testing**: Custom hook test utilities
- **Model Testing**: Business logic validation

### 2. Integration Testing
- **API Testing**: Endpoint functionality
- **AI Flow Testing**: Generation pipeline validation
- **User Flow Testing**: Complete user journeys

## Deployment Patterns

### 1. Firebase Integration
- **Firebase Hosting**: Static site hosting
- **Firestore**: NoSQL database
- **Firebase Auth**: User authentication
- **Firebase Functions**: Serverless functions

### 2. Environment Management
- **Development**: Local development with hot reload
- **Staging**: Pre-production testing environment
- **Production**: Live application deployment

## Monitoring and Observability

### 1. Error Tracking
- **Error Logging**: Comprehensive error capture
- **Performance Monitoring**: Application performance metrics
- **User Analytics**: Usage pattern analysis

### 2. AI Monitoring
- **Generation Tracking**: AI operation monitoring
- **Cost Tracking**: Credit usage monitoring
- **Quality Metrics**: Output quality assessment
