# System Patterns: Arkan

## Architecture Overview
Arkan follows a modern, modular architecture built on Next.js 15 with Firebase backend, emphasizing separation of concerns, reusability, and maintainability.

## Core Architectural Principles

### 1. Model-Driven Architecture
- **Single Source of Truth**: Each data entity has a dedicated model class
- **Encapsulation**: Business logic contained within model classes
- **Type Safety**: Strong TypeScript typing throughout the system
- **Serialization**: Consistent JSON serialization patterns

### 2. Enhanced UI/UX Architecture (NEW MAJOR PATTERN)
- **Modern Design System**: Complete overhaul with glass morphism, gradients, and modern patterns
- **Smart Animation System**: Intersection Observer-based animations for optimal performance
- **Component Library**: Enhanced UI components with hover effects and micro-interactions
- **Responsive Design**: Mobile-first responsive design patterns
- **Visual Effects**: Floating animations, gradient backgrounds, shadow effects
- **Glass Morphism**: Advanced glass morphism effects throughout the application
- **Interactive Elements**: Enhanced UI components with hover effects and micro-interactions

### 3. Component-Based UI
- **Atomic Design**: Reusable UI components with clear hierarchy
- **Radix UI Foundation**: Accessible, unstyled components
- **Tailwind CSS**: Utility-first styling approach with enhanced animations
- **Theme System**: Dark/light mode with consistent theming
- **Enhanced Components**: Modern UI components with glass morphism and gradients

### 4. Intelligent AI Integration Pattern (ENHANCED)
- **Genkit Framework**: Structured AI flow management with intelligent enhancements
- **Context-Aware Analysis**: Deep understanding of user input, complexity, and requirements
- **Adaptive Model Selection**: Smart model choice based on task type and context analysis
- **Dynamic Prompt Engineering**: Context-aware prompt building with optimization
- **Quality Validation**: Multi-metric assessment of output quality and completeness
- **Iterative Improvement**: Automatic refinement through multiple iterations
- **Separation of Concerns**: Prompts, flows, tools, and intelligence modules in separate layers
- **Schema Validation**: Enhanced Zod schemas with quality validation
- **Error Handling**: Comprehensive error management with fallback strategies
- **Comprehensive Documentation**: Complete documentation system with JSDoc, API docs, examples, and best practices
- **Comprehensive Testing**: Complete test coverage for all AI core components with 150+ test cases

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

### 2. Enhanced AI Flow Architecture
```
config/     → AI model configurations
prompts/    → Intelligent prompt definitions with context analysis
flows/      → Enhanced business logic with quality validation
tools/      → External tool integrations
schemas/    → Zod validation schemas with quality metrics
core/       → NEW: Intelligent AI system components with comprehensive documentation and testing
  ├── README.md                    → System overview and architecture
  ├── index.ts                     → Unified intelligent system interface
  ├── types.ts                     → Comprehensive type definitions
  ├── context-analyzer.ts          → Deep context understanding
  ├── intelligent-prompt-builder.ts → Dynamic prompt optimization
  ├── output-quality-validator.ts   → Multi-metric quality assessment
  ├── adaptive-model-selector.ts    → Smart model selection
  ├── iterative-improvement-engine.ts → Automatic output refinement
  ├── performance-monitor.ts       → Real-time performance tracking
  ├── ai-error-handler.ts          → Advanced error handling
  ├── context-organizer.ts         → Knowledge-based context organization
  ├── usage-examples.md            → Practical usage examples
  ├── best-practices.md            → Comprehensive best practices guide
  ├── troubleshooting.md          → Detailed troubleshooting guide
  ├── contributing.md              → Developer contribution guide
  ├── documentation-index.md       → Complete documentation index
  └── __tests__/                   → Comprehensive test suite
      ├── README.md                → Test documentation
      ├── index.md                 → Test index
      ├── package.json             → Test configuration
      ├── jest.setup.js            → Jest setup
      ├── intelligent-ai-system.test.ts
      ├── context-analyzer.test.ts
      ├── adaptive-model-selector.test.ts
      ├── intelligent-prompt-builder.test.ts
      ├── output-quality-validator.test.ts
      ├── iterative-improvement-engine.test.ts
      ├── performance-monitor.test.ts
      ├── ai-error-handler.test.ts
      ├── context-organizer.test.ts
      └── integration.test.ts
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

### 1. Enhanced Intelligent AI Generation Flow
1. **User Input** → Form validation and initial processing
2. **Context Analysis** → Deep understanding of requirements, complexity, and audience
3. **Model Selection** → Adaptive selection based on task type and context analysis
4. **Prompt Engineering** → Dynamic prompt building with context optimization
5. **AI Flow Execution** → Enhanced Genkit flow with intelligent model configuration
6. **Quality Assessment** → Multi-metric validation of output quality
7. **Iterative Improvement** → Automatic refinement if quality threshold not met
8. **Result Processing** → Enhanced schema validation with quality checks
9. **State Update** → Project model update with quality metrics
10. **UI Refresh** → Component re-rendering with quality indicators
11. **Testing Validation** → Comprehensive test coverage for all AI components
12. **Quality Assurance** → All tests passing with comprehensive coverage

### 2. Traditional AI Generation Flow (Legacy)
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
- **AI Core Testing**: Comprehensive test suite for all AI core components
  - Context Analyzer: 15+ test cases covering all analysis scenarios
  - Adaptive Model Selector: 20+ test cases for model selection logic
  - Intelligent Prompt Builder: 18+ test cases for prompt construction
  - Output Quality Validator: 16+ test cases for quality assessment
  - Iterative Improvement Engine: 22+ test cases for improvement workflows
  - Performance Monitor: 25+ test cases for monitoring and reporting
  - AI Error Handler: 18+ test cases for error handling and recovery
  - Context Organizer: 20+ test cases for context organization

### 2. Integration Testing
- **API Testing**: Endpoint functionality
- **AI Flow Testing**: Generation pipeline validation
- **User Flow Testing**: Complete user journeys
- **AI System Integration**: End-to-end AI workflow testing with 15+ test cases
- **Cross-Component Testing**: Testing interaction between AI core components

### 3. Test Organization
- **Test Structure**: Organized test files in `__tests__/` directories
- **Test Documentation**: Comprehensive README and documentation for all tests
- **Test Configuration**: Complete Jest setup with TypeScript support
- **Quality Assurance**: All tests passing with comprehensive coverage

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
- **Performance Analytics**: Real-time performance tracking
- **Error Analysis**: Comprehensive error monitoring and recovery
- **Documentation Analytics**: Usage tracking of documentation and examples
- **Testing Analytics**: Test coverage and quality metrics tracking
- **Quality Assurance**: Comprehensive test coverage for all AI components
