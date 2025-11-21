# Technical Context - Arkan

## Technology Stack

### Frontend Framework
- **Next.js 15**: React-based full-stack framework with App Router
- **React 18**: Latest React with concurrent features and server components
- **TypeScript**: Full type safety across the application
- **Tailwind CSS**: Utility-first CSS framework for rapid styling

### AI Integration
- **Google Genkit**: AI framework for building and deploying AI applications
- **Gemini 2.5 Flash Lite**: Google's latest language model for text generation
- **Zod Schemas**: Type-safe validation for AI inputs and outputs
- **Custom AI Flows**: Modular AI operations with consistent interfaces

### Backend Services
- **Firebase Authentication**: Secure user authentication and session management
- **Firestore Database**: NoSQL document database for real-time data
- **Firebase Storage**: File storage for documents and media
- **Firebase Functions**: Serverless functions for backend logic
- **Firebase Hosting**: Static site hosting and CDN

### UI Framework & Components
- **Radix UI**: Accessible, unstyled component primitives
- **shadcn/ui**: Beautiful component library built on Radix
- **Lucide Icons**: Modern icon library for consistent iconography
- **Custom Theming**: Dark/light mode with CSS variables

### State Management
- **Zustand**: Lightweight state management for client state
- **React Query (TanStack)**: Server state management and caching
- **Custom Hooks**: Reusable logic abstraction
- **Context APIs**: Shared state for authentication and localization

## Architecture Patterns

### Code Organization
```
src/
├── ai/                 # AI flows and configurations
├── app/                # Next.js App Router pages
├── components/         # Reusable UI components
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries and helpers
├── services/           # API service layers
└── types/              # TypeScript type definitions
```

### AI Flow Architecture
```typescript
// Clean AI flow pattern
const generateTextFlow = ai.defineFlow({
  name: 'generateTextFlow',
  inputSchema: GenerateTextInputSchema,
  outputSchema: GenerateTextOutputSchema,
}, async input => {
  const { output } = await promptTemplate(input);
  return output!;
});
```

### Component Patterns
- **Barrel Exports**: Clean import paths using index.ts files
- **Compound Components**: Complex UI patterns with sub-components
- **Render Props**: Flexible component composition
- **Custom Hooks**: Business logic separation from UI

### Data Flow Patterns
- **Server Actions**: Next.js server-side form handling
- **API Routes**: RESTful endpoints for external integrations
- **Real-time Updates**: Firebase real-time subscriptions
- **Optimistic Updates**: Immediate UI feedback with rollback

## Development Environment

### Build Tools
- **Turbopack**: Fast bundler for development (Next.js 15)
- **ESLint**: Code linting with custom rules
- **Prettier**: Code formatting for consistency
- **Jest**: Unit testing framework
- **TypeScript Compiler**: Type checking and compilation

### Development Workflow
- **Hot Reload**: Instant feedback during development
- **Type Safety**: Compile-time error detection
- **Incremental Builds**: Fast build times with caching
- **Source Maps**: Debugging support in production

## Security Architecture

### Authentication & Authorization
- **Firebase Auth**: Secure authentication with multiple providers
- **Session Management**: Server-side session validation
- **Route Protection**: Middleware-based route guards
- **Role-Based Access**: Admin and user permission systems

### Data Security
- **Firestore Rules**: Database-level security rules
- **Input Validation**: Zod schema validation
- **XSS Protection**: React's built-in XSS prevention
- **CSRF Protection**: Next.js built-in CSRF protection

## Performance Optimization

### Frontend Performance
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component with lazy loading
- **Font Optimization**: Custom font loading strategies
- **Bundle Analysis**: Webpack bundle analyzer integration

### Backend Performance
- **Firebase Caching**: Firestore query result caching
- **CDN Distribution**: Global content delivery
- **Function Optimization**: Cold start reduction strategies
- **Real-time Optimization**: Efficient listener management

## Internationalization (i18n)

### Language Support
- **English**: Primary language with full feature support
- **Arabic**: Complete RTL support with custom layouts
- **Dynamic Loading**: Language resources loaded on demand
- **Cultural Adaptation**: Locale-specific formatting and conventions

### RTL Implementation
- **CSS Logical Properties**: Direction-agnostic styling
- **Custom RTL Components**: Specialized layouts for Arabic
- **Font Loading**: Language-specific font optimization
- **Text Direction**: Automatic text direction detection

## Deployment & Infrastructure

### Hosting Platform
- **Firebase Hosting**: Static site hosting with global CDN
- **Automatic Deployments**: Git-based deployment pipeline
- **Preview Deployments**: Branch-based preview environments
- **Custom Domains**: Production domain configuration

### Environment Management
- **Development**: Local development with Firebase emulators
- **Staging**: Pre-production testing environment
- **Production**: Live environment with monitoring
- **Environment Variables**: Secure configuration management

## Monitoring & Analytics

### Application Monitoring
- **Firebase Analytics**: User behavior tracking
- **Performance Monitoring**: Real-time performance metrics
- **Error Tracking**: Automated error reporting
- **Custom Events**: Business metric tracking

### Development Tools
- **Firebase Console**: Database and user management
- **Next.js Analytics**: Build and runtime analytics
- **Browser DevTools**: Development debugging
- **Lighthouse**: Performance and accessibility auditing

## Third-Party Integrations

### Document Processing
- **PDF Processing**: PDF parsing and text extraction
- **Document Conversion**: DOCX/PPTX generation libraries
- **Image Processing**: OCR and handwriting recognition
- **Diagram Generation**: PlantUML and diagram rendering

### AI Services
- **Google AI Platform**: Gemini model access
- **Custom AI Endpoints**: Specialized model integrations
- **Rate Limiting**: API usage optimization
- **Fallback Strategies**: Model availability handling