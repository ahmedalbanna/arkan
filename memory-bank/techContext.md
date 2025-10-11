# Technical Context: Arkan

## Technology Stack

### Frontend Framework
- **Next.js 15.3.3**: React-based full-stack framework
- **React 18.3.1**: Component-based UI library
- **TypeScript 5**: Type-safe JavaScript development
- **Turbopack**: Fast bundler for development

### UI and Styling
- **Tailwind CSS 3.4.17**: Utility-first CSS framework
- **Radix UI**: Unstyled, accessible UI components
- **Lucide React**: Icon library
- **Next Themes**: Dark/light mode theming
- **Class Variance Authority**: Component variant management

### State Management
- **Zustand 4.5.4**: Lightweight state management
- **TanStack Query 5.51.1**: Server state management
- **React Hook Form 7.54.2**: Form state management

### Backend and Database
- **Firebase 11.10.0**: Backend-as-a-Service
- **Firestore**: NoSQL document database
- **Firebase Auth**: User authentication
- **Firebase Admin 13.4.0**: Server-side Firebase SDK
- **Firebase Hosting**: Static site hosting

### AI and Machine Learning
- **Genkit 1.19.2**: AI orchestration framework
- **Google AI**: AI model integration
- **OpenAI Integration**: Additional AI capabilities
- **Zod 3.24.2**: Schema validation for AI inputs/outputs

### Document Processing
- **PptxGenJS 3.12.0**: PowerPoint generation
- **DocX 8.5.0**: Word document generation
- **jsPDF 3.0.0**: PDF generation
- **PDF.js 5.4.54**: PDF parsing and rendering
- **html2canvas 1.4.1**: HTML to image conversion

### File Handling
- **React Dropzone 14.2.3**: File upload interface
- **File Saver 2.0.5**: File download functionality
- **JSZip 3.10.1**: Archive file handling
- **Turndown 7.1.3**: HTML to Markdown conversion

### Development Tools
- **ESLint 9.35.0**: Code linting
- **Jest 29.7.0**: Testing framework
- **TypeDoc 0.28.13**: Documentation generation
- **TSX 4.16.2**: TypeScript execution

### Build and Deployment
- **Next.js Build**: Static site generation
- **Firebase CLI**: Deployment automation
- **PostCSS 8.5.6**: CSS processing
- **Autoprefixer 10.4.21**: CSS vendor prefixing

## Development Environment

### Prerequisites
- **Node.js**: Version 20 or higher
- **npm/yarn**: Package manager
- **Firebase CLI**: Firebase development tools
- **Git**: Version control

### Local Development Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start AI development server
npm run genkit:dev

# Run tests
npm test

# Type checking
npm run typecheck

# Linting
npm run lint
```

### Environment Configuration
- **Development**: `http://localhost:9002`
- **AI Development**: Genkit development server
- **Firebase Emulators**: Local Firebase services
- **Environment Variables**: `.env.local` for secrets

## Project Structure

### Core Directories
```
src/
├── app/                 # Next.js app router pages
├── components/          # Reusable UI components
├── core/               # Core reusable functionality
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries and models
├── ai/                 # AI flows and configurations
├── services/           # External service integrations
├── context/            # React context providers
└── locales/            # Internationalization files
```

### AI Architecture
```
src/ai/
├── config/             # AI model configurations
├── prompts/            # Prompt definitions
├── flows/              # Categorized AI flows system
│   ├── registry.ts              # Central flow registry
│   ├── unified.ts               # Unified interface
│   ├── index.ts                 # Main index
│   ├── text-processing.ts       # Text processing flows (8 flows)
│   ├── content-generation.ts    # Content generation flows (9 flows)
│   ├── document-processing.ts   # Document processing flows (10 flows)
│   ├── analysis.ts              # Analysis flows (5 flows)
│   ├── academic.ts              # Academic flows (5 flows)
│   ├── visual.ts                # Visual flows (2 flows)
│   └── __tests__/               # Comprehensive test suite
│       └── categorized-flows.test.ts
├── tools/              # External AI tools
├── schemas/            # Zod validation schemas
└── core/               # Enhanced AI core system with comprehensive documentation and testing
    ├── README.md                    # System overview
    ├── index.ts                     # Unified interface
    ├── types.ts                     # Type definitions
    ├── context-analyzer.ts          # Context analysis
    ├── adaptive-model-selector.ts   # Model selection
    ├── intelligent-prompt-builder.ts # Prompt building
    ├── iterative-improvement-engine.ts # Improvement engine
    ├── output-quality-validator.ts   # Quality validation
    ├── performance-monitor.ts       # Performance monitoring
    ├── ai-error-handler.ts          # Error handling
    ├── context-organizer.ts         # Context organization
    ├── usage-examples.md            # Usage examples
    ├── best-practices.md            # Best practices
    ├── troubleshooting.md          # Troubleshooting guide
    ├── contributing.md              # Contributing guide
    ├── documentation-index.md       # Documentation index
    └── __tests__/                   # Comprehensive test suite
        ├── README.md                # Test documentation
        ├── index.md                 # Test index
        ├── package.json             # Test configuration
        ├── jest.setup.js            # Jest setup
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

### Core System
```
src/core/
├── hooks/              # Reusable hooks
├── types/              # Shared type definitions
├── utils/              # Utility functions
├── constants/          # Application constants
└── examples/           # Usage examples
```

## Key Dependencies

### AI and ML
- `@genkit-ai/firebase`: Firebase AI integration
- `@genkit-ai/googleai`: Google AI models
- `@genkit-ai/next`: Next.js AI integration
- `@genkit-ai/evaluator`: AI evaluation tools

### UI Components
- `@radix-ui/*`: Accessible UI primitives
- `@dnd-kit/*`: Drag and drop functionality
- `embla-carousel-react`: Carousel component
- `react-resizable-panels`: Resizable panel layout

### Data Processing
- `@tanstack/react-table`: Data table component
- `recharts`: Chart and visualization library
- `date-fns`: Date manipulation utilities
- `uuid`: Unique identifier generation

### Content Processing
- `react-markdown`: Markdown rendering
- `remark-*`: Markdown processing plugins
- `rehype-*`: HTML processing plugins
- `marked`: Markdown parsing

## Configuration Files

### Next.js Configuration
- `next.config.ts`: Next.js settings and rewrites
- `next-env.d.ts`: Next.js type definitions

### TypeScript Configuration
- `tsconfig.json`: TypeScript compiler options
- `tsconfig.tsbuildinfo`: Build cache

### Tailwind Configuration
- `tailwind.config.ts`: Tailwind CSS customization
- `postcss.config.mjs`: PostCSS processing

### Testing Configuration
- `jest.config.js`: Jest test configuration
- `jest.setup.js`: Jest setup and mocks

### Firebase Configuration
- `firebase.json`: Firebase project configuration
- `firestore.rules`: Firestore security rules
- `storage.rules`: Firebase Storage rules
- `firestore.indexes.json`: Database indexes

## Performance Considerations

### Bundle Optimization
- **Code Splitting**: Route-based and component-based splitting
- **Tree Shaking**: Unused code elimination
- **Dynamic Imports**: Lazy loading of heavy components
- **Asset Optimization**: Image and font optimization

### Runtime Performance
- **React Query**: Efficient server state caching
- **Zustand**: Minimal re-renders with selective subscriptions
- **Memoization**: React.memo and useMemo for expensive operations
- **Virtual Scrolling**: For large data sets

### AI Performance
- **Streaming**: Real-time AI response streaming
- **Caching**: AI response caching for repeated requests
- **Error Handling**: Graceful degradation on AI failures
- **Rate Limiting**: Prevent excessive AI API calls

## Security Measures

### Authentication
- **Firebase Auth**: Secure user authentication
- **Session Management**: Secure session cookie handling
- **Route Protection**: Server-side authentication checks
- **Role-based Access**: Admin and user permission levels

### Data Security
- **Input Validation**: Zod schema validation
- **XSS Prevention**: Content sanitization
- **CSRF Protection**: Cross-site request forgery prevention
- **File Upload Security**: Type and size validation

### API Security
- **Rate Limiting**: API endpoint protection
- **Input Sanitization**: All inputs validated and sanitized
- **Error Handling**: Secure error messages
- **CORS Configuration**: Proper cross-origin settings

## Deployment Architecture

### Firebase Hosting
- **Static Site**: Pre-built Next.js application
- **CDN Distribution**: Global content delivery
- **Custom Domain**: Custom domain configuration
- **SSL/TLS**: Automatic HTTPS encryption

### Database
- **Firestore**: NoSQL document database
- **Security Rules**: Database access control
- **Indexes**: Optimized query performance
- **Backup**: Automatic data backup

### Monitoring
- **Firebase Analytics**: User behavior tracking
- **Error Reporting**: Application error monitoring
- **Performance Monitoring**: Application performance metrics
- **Custom Logging**: Application-specific logging

## Development Workflow

### Code Quality
- **ESLint**: Code style and error checking
- **TypeScript**: Compile-time type checking
- **Prettier**: Code formatting (if configured)
- **Husky**: Git hooks for quality checks
- **JSDoc**: Comprehensive documentation with JSDoc comments
- **API Documentation**: Detailed API reference with examples
- **Best Practices**: Comprehensive guides for optimal usage
- **Troubleshooting**: Detailed troubleshooting guides
- **Comprehensive Testing**: Complete test coverage for all AI core components
- **Quality Assurance**: All tests passing with comprehensive coverage

### Testing Strategy
- **Unit Tests**: Component and function testing
- **Integration Tests**: API and flow testing
- **E2E Tests**: End-to-end user journey testing
- **AI Tests**: AI flow and response testing
- **Comprehensive AI Core Testing**: Complete test suite for all AI core components with 150+ test cases
  - Context Analyzer: 15+ test cases covering all analysis scenarios
  - Adaptive Model Selector: 20+ test cases for model selection logic
  - Intelligent Prompt Builder: 18+ test cases for prompt construction
  - Output Quality Validator: 16+ test cases for quality assessment
  - Iterative Improvement Engine: 22+ test cases for improvement workflows
  - Performance Monitor: 25+ test cases for monitoring and reporting
  - AI Error Handler: 18+ test cases for error handling and recovery
  - Context Organizer: 20+ test cases for context organization
  - Integration Tests: 15+ test cases for end-to-end AI workflows
- **Test Documentation**: Comprehensive README and documentation for all tests
- **Test Configuration**: Complete Jest setup with TypeScript support
- **Quality Assurance**: All tests passing with comprehensive coverage

### Version Control
- **Git**: Source code version control
- **Branching Strategy**: Feature-based development
- **Code Review**: Pull request reviews
- **CI/CD**: Automated testing and deployment
