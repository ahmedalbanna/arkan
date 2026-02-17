# Arkan Development Guide

## Project Overview

**Arkan** is a sophisticated AI-powered platform for writing and document generation, built for academics, professionals, and students. It combines cutting-edge AI technology with intuitive user experience to democratize access to professional-grade writing tools.

### System Architecture Overview

The system is organized into 13 core modules, each handling specific responsibilities:

| Module | Location | Purpose |
|--------|----------|---------|
| **AI Engine** | `src/ai/` | Genkit flows, schemas, and AI operations (23+ flows) |
| **Frontend/UI** | `src/app/`, `src/components/` | Next.js pages and React components |
| **API & Backend** | `src/app/api/` | REST endpoints for all system operations |
| **State Management** | `src/hooks/`, `src/context/` | Zustand stores and custom React hooks |
| **Database & Services** | `src/lib/db/`, `src/services/` | Firebase, SQLite, and service layer |
| **RAG System** | `src/lib/rag/` | Vector store (Qdrant), embeddings, retrieval |
| **Document Processing** | `src/lib/` | Converters (MD→DOCX/PPTX), exporters, parsers |
| **Utilities** | `src/lib/utils/`, `src/ai/utils/` | Helper functions, validators, formatters |
| **Models & Types** | `src/lib/models/`, `src/types/` | TypeScript definitions and data models |
| **Configuration** | Root & `next.config.ts` | Next.js, Tailwind, Firebase, TypeScript configs |
| **Internationalization** | `src/locales/` | English and Arabic language support |
| **Testing** | `jest.config.js`, `__tests__/` | Jest and React Testing Library setup |
| **Scripts & Tools** | `scripts/` | Qdrant management, migrations, demo data |

**Key Pattern**: Each module maintains single responsibility with clear interfaces between them. The `src/services/api/` layer acts as the primary integration point between frontend and backend.

### Technology Stack
- **Frontend**: Next.js 15 with React 18, TypeScript, Tailwind CSS
- **AI Engine**: Google Genkit with Gemini 2.5 Flash Lite model  
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **UI Framework**: Radix UI components with shadcn/ui
- **State Management**: Zustand + React Query (TanStack)
- **Testing**: Jest with React Testing Library
- **Build Tools**: Turbopack, ESLint, TypeScript

## Development Environment Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase CLI
- Git

### Getting Started
```bash
# Install dependencies
npm install

# Setup local database
npm run setup-agent-db

# Start development server with Turbopack
npm run dev

# Start Genkit AI development server (separate terminal)
npm run genkit:dev

# Run tests
npm test

# Type checking
npm run typecheck
```

### Firebase Setup
```bash
# Start Firebase emulators for local development
firebase emulators:start

# Seed the database with initial data
npm run seed
```

## Architecture & Code Organization

### Directory Structure
```
src/
├── ai/                 # AI flows, schemas, and Genkit configuration
│   ├── flows/          # Individual AI operations (23+ tools)
│   ├── schemas/        # Zod validation schemas
│   └── core/           # Core AI functionality
├── app/                # Next.js App Router pages and API routes
├── components/         # Reusable UI components (organized by domain)
├── hooks/              # Custom React hooks (grouped by functionality)
├── lib/                # Utility libraries and database operations
├── services/           # API service layers and external integrations
└── types/              # TypeScript type definitions
```

### Key Files & Directories

#### AI System
- `src/ai/flows/index.ts` - Barrel exports for all AI flows
- `src/ai/schemas/` - Type-safe validation for AI inputs/outputs
- `src/ai/genkit.ts` - Genkit AI configuration
- `src/ai/core/context.ts` - Context-aware report generation

#### Database & Services
- `src/lib/db/` - SQLite database setup and queries
- `src/services/api/` - Service layer for API calls
- `src/lib/firebase/` - Firebase configuration and utilities

#### UI Components
- `src/components/ui/` - Base UI components (shadcn/ui)
- `src/components/writing-tools/` - Writing tool specific components
- `src/components/shared/` - Shared application components

## Development Best Practices

### Code Style & Conventions

#### File Naming
- Use kebab-case for files and directories
- Use PascalCase for React components
- Use camelCase for functions and variables
- Barrel exports: Always include `index.ts` files for clean imports

#### TypeScript Guidelines
- Enable strict mode (already configured)
- Use type imports where possible: `import type { User } from '@/types'`
- Define schemas with Zod for runtime validation
- Prefer interfaces over type aliases for object shapes

#### Component Patterns
```typescript
// Preferred component structure
interface ComponentProps {
  children?: React.ReactNode;
  className?: string;
}

export function Component({ children, className }: ComponentProps) {
  // Implementation
}
```

#### Custom Hooks Pattern
```typescript
// Business logic separation
export function useFeatureName() {
  const [state, setState] = useState();
  
  // Logic here
  
  return {
    // Return object with clear API
  };
}
```

### AI Flow Development

#### Creating New AI Flows
1. Define input/output schemas in `src/ai/schemas/flows.ts`
2. Create flow file in `src/ai/flows/`
3. Export from `src/ai/flows/index.ts`
4. Add corresponding UI component in `src/components/writing-tools/`

#### AI Flow Template
```typescript
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FlowInputSchema = z.object({
  // Define input structure
});

const FlowOutputSchema = z.object({
  // Define output structure
});

export const myAiFlow = ai.defineFlow({
  name: 'myAiFlow',
  inputSchema: FlowInputSchema,
  outputSchema: FlowOutputSchema,
}, async (input) => {
  // Implementation
});
```

### State Management Patterns

#### Zustand Store Structure
```typescript
interface StoreState {
  // State shape
}

interface StoreActions {
  // Action methods
}

export const useStore = create<StoreState & StoreActions>((set, get) => ({
  // Implementation
}));
```

#### React Query Integration
- Use React Query for server state management
- Zustand for client-side UI state only
- Custom hooks to encapsulate query logic

### Database Patterns

#### Firestore Best Practices
- Use subcollections for related data
- Implement proper security rules in `firestore.rules`
- Batch operations for multiple writes
- Use transactions for data consistency

#### SQLite Local Database
- Agent configurations stored locally
- Use prepared statements for queries
- Database schema in `src/lib/db/agent-database.sql`

## UI Development Guidelines

### Component Design System
- Use Radix UI primitives for accessibility
- Extend with Tailwind CSS for styling
- Follow shadcn/ui patterns for consistency
- Support both light/dark themes

### Responsive Design
- Mobile-first approach
- Use Tailwind responsive prefixes
- Test on various screen sizes
- Consider RTL layout for Arabic support

### Internationalization (i18n)
- Support English and Arabic
- Use proper RTL layout techniques
- Font loading for different languages
- Cultural adaptation for date/number formats

## API Development

### Next.js API Routes
- Place in `src/app/api/` directory
- Use TypeScript for type safety
- Implement proper error handling
- Follow RESTful conventions

### Server Actions
- Use for form submissions
- Validate inputs with Zod schemas
- Handle errors gracefully
- Return appropriate status codes

### Firebase Integration
- Use Firebase Admin SDK on server
- Client SDK for frontend operations
- Implement proper authentication checks
- Follow Firebase security best practices

## Testing Strategy

### Unit Testing
- Jest with React Testing Library
- Test components in isolation
- Mock external dependencies
- Focus on user interactions

### Integration Testing
- Test API routes with real database
- Use Firebase emulators for testing
- Test critical user flows
- Performance testing for AI operations

## Performance Optimization

### Frontend Performance
- Use Next.js Image optimization
- Implement code splitting
- Lazy load components where appropriate
- Optimize bundle size with webpack-bundle-analyzer

### AI Operations
- Cache AI responses when appropriate
- Implement request debouncing
- Stream responses for long operations
- Handle rate limiting gracefully

### Database Optimization
- Index frequently queried fields
- Use Firestore compound queries efficiently
- Implement pagination for large datasets
- Cache static data appropriately

## Security Guidelines

### Authentication & Authorization
- Use Firebase Auth for user management
- Implement role-based access control
- Protect sensitive routes with middleware
- Validate user permissions server-side

### Data Protection
- Validate all inputs with Zod schemas
- Sanitize user content before storage
- Implement proper CORS policies
- Use HTTPS in production

### AI Safety
- Implement content filtering
- Rate limit AI operations per user
- Monitor for abuse patterns
- Validate AI outputs before display

## Common Development Patterns

### Error Handling
```typescript
// Consistent error handling pattern
try {
  const result = await apiCall();
  return { success: true, data: result };
} catch (error) {
  console.error('Operation failed:', error);
  return { 
    success: false, 
    error: error instanceof Error ? error.message : 'Unknown error' 
  };
}
```

### Loading States
```typescript
// Standard loading pattern
const { data, isLoading, error } = useQuery({
  queryKey: ['resource'],
  queryFn: fetchResource,
});

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorDisplay error={error} />;
return <DataDisplay data={data} />;
```

### Form Handling
```typescript
// React Hook Form with Zod validation
const form = useForm<FormData>({
  resolver: zodResolver(formSchema),
});

const onSubmit = async (data: FormData) => {
  // Handle form submission
};
```

## Environment Configuration

### Development
- Use Firebase emulators for local development
- Hot reload with Turbopack
- Debug mode for AI operations

### Production
- Firebase Hosting for deployment
- Environment variables for sensitive data
- Monitoring and analytics enabled

## Troubleshooting Common Issues

### AI Flow Issues
- Check Genkit server is running: `npm run genkit:dev`
- Verify API keys in environment variables
- Check input schema validation

### Database Issues
- Reset local agent database: `npm run reset-agent-db`
- Check Firestore security rules
- Verify Firebase configuration

### Build Issues
- Clear Next.js cache: `rm -rf .next`
- Check TypeScript errors: `npm run typecheck`
- Verify all dependencies are installed

## Contributing Guidelines

### Code Review Process
1. Create feature branch from main
2. Implement changes with tests
3. Ensure all checks pass
4. Submit pull request with clear description
5. Address review feedback

### Commit Convention
- Use conventional commits format
- Include scope when appropriate: `feat(ai): add new flow`
- Write clear, descriptive messages

### Documentation
- Update relevant documentation with changes
- Include JSDoc comments for complex functions
- Update type definitions when needed

### Code Cleaning Checklist
When cleaning code in any folder, ensure:
- Remove unused imports
- Fix ESLint warnings
- Improve code formatting
- Optimize imports
- Remove dead code

## Schema Validation Patterns

### Critical Knowledge: Genkit Flow Schemas
All Genkit flow input schemas follow a strict pattern that must be maintained:

**Required Pattern:**
```typescript
export const MyFlowInputSchema = z.object({
  flow: z.literal('my-flow-name'),  // MUST match flow key in API route
  // ... other required fields
  optionalField: z.string().optional(),
});
```

**Key Requirements:**
1. **Every input schema MUST have a `flow` field** with a literal value matching the flow's identifier
2. **Flow literal value MUST exactly match** the key used in the API route's `toolConfig` mapping
3. **Custom mutations must include the flow field** - use generic `useWritingTool` hook when possible to auto-inject it
4. **Schema extensions must be traced** - many schemas extend `BaseTextInputSchema`, `BaseControlsSchema`, etc., so verify inherited fields

### Hook Patterns for API Calls

**Pattern 1: Generic Hook (Recommended)**
```typescript
// Automatically adds flow field - use for new tools
const { mutation } = useWritingTool('my-flow-name', MyFlowInputSchema);
mutation.mutate({ /* other fields */ });
```

**Pattern 2: Custom Mutations (Requires Flow Field)**
```typescript
// When custom mutation is needed, manually include flow field
return writingToolApi('/api/writing-tools/my-tool', {
  data: {
    flow: 'my-flow-name',  // MUST be included
    field1: value1,
    field2: value2,
  },
  token
});
```

### Schema Validation Checklist
Before submitting API calls or adding new flows:
- [ ] Input schema exists in `src/ai/schemas/flows.ts`
- [ ] Schema has `flow: z.literal('flow-name')` field
- [ ] Flow literal matches the flow's identifier
- [ ] All fields sent in API call are defined in schema
- [ ] Extended schemas have been traced for inherited fields
- [ ] Optional fields are marked with `.optional()`
- [ ] Flow implementation is exported from `src/ai/flows/`
- [ ] Flow is registered in API route `toolConfig` mapping

### Common Mistakes to Avoid
1. **Forgetting the flow field** - All API calls to writing-tools endpoint must include it
2. **Mismatched literal values** - Flow literal must match the API route key exactly
3. **Not tracing schema extensions** - Extended schemas may have hidden required fields
4. **Schema-only changes** - If updating a schema, verify the hook/mutation still matches
5. **Using direct fetch instead of hooks** - Use `useWritingTool` or existing service abstractions

### Investigation Tips for Schema Issues
1. **Start with schemas first** - Don't search for issues in hooks; understand schema requirements first
2. **Map data flow** - Understand: UI Component → Hook → Service → API Route → Schema
3. **Check both directions** - Schemas can be incomplete too (e.g., GenerateTocInputSchema missing field)
4. **Use API route as source of truth** - The `toolConfig` in `/api/writing-tools/[tool]/route.ts` shows all registered flows

## TypeScript & Type Safety Patterns

### Next.js 15 Breaking Changes
- **API Route Parameters**: Next.js 15 changed route handler `params` from synchronous to async (`Promise<{...}>`)
  - Old pattern: `async (request, { params }: { params: { [key: string]: string } })`
  - New pattern: `async (request, { params }: { params: Promise<{ [key: string]: string }> })`
  - Middleware patterns (like `withAuth`) need updating to await params before passing to handlers
  - All 40+ API routes need this update when upgrading to Next.js 15

### Enum Schema Export Pitfalls
- **Duplicate Exports**: When multiple schema files export enums with same names (e.g., `CitationStyle`, `ProjectTypeSchema`), use explicit re-exports with `export type` and `export` separately
- **Missing Type Exports**: Schema enum types must be explicitly exported alongside their schema objects
  - Pattern: `export type { MyType } from './enums'; export { MySchemaSchema } from './enums';`
- **Schema Extensions**: When schemas extend other schemas, verify all inherited fields are available in barrel exports

### Implicit Any Type Issues
- **Array Methods**: `map()`, `filter()`, `forEach()` callbacks on arrays from external sources often have implicit `any` types
  - Solution: Add explicit type annotations: `map((item: any) => ...)` or use type guards
- **Zod Schema Options**: `ZodSchema.options.map()` returns `any` type elements, requires explicit typing

### Firebase Admin SDK Quirks
- **Firestore Functions**: Functions like `collection`, `doc`, `setDoc`, `getDocs`, `query`, `where` are NOT exported from `firebase-admin/firestore`
- **Correct Pattern**: Import from `firebase-admin/firestore` only: `Timestamp`, `getFirestore`, `type Firestore`
- **Workaround**: Stub unavailable functions locally or use alternative Firebase Admin methods

### Component Type Mismatches
- **Shallow Object Returns**: Be careful when mapping over objects that return shallow types (e.g., `{ id, title }`)
  - If you need nested properties, fetch full objects: `project?.getSection(s.id)` rather than assuming the mapped type includes them
- **Switch Statement Default Cases**: Exhaustive switch statements must have default cases to satisfy TypeScript, even for enums marked as complete

### Common Patterns to Avoid
1. **Forgetting to Initialize Variables Before Try/Catch**: Variables used in catch blocks must be declared outside try block
2. **Mismatched Type Assertions**: When using `as const` for literal types, ensure the value actually matches the expected literal
3. **Callback Parameter Types**: Don't rely on TypeScript inference for callback parameters from dynamic data structures

### ESLint and Build Configuration Issues
- **Deprecated Next.js Options**: `swcMinify` and `experimental.turbo` are deprecated in Next.js 15 and should be removed from `next.config.ts`
- **Development-Only Options**: `experimental.allowDevelopmentBuild` requires `NODE_ENV=development` and is inappropriate for production builds - remove it
- **Unused Import Fixes**: When fixing ESLint unused import errors, use the following patterns:
  - Unused imports: Remove entirely or comment them out
  - Unused parameters: Prefix with underscore (e.g., `_request`, `_user`)
  - Unused variables: Either remove or prefix with underscore
  - Unused schema exports: Check both schema files and barrel exports (index.ts files) for orphaned exports
- **Destructured Variable Handling**: When destructuring and some values are unused, use the underscore prefix pattern:
  - Example: `const { lineColor: _lineColor, ...used } = styles.footnote;`
  - This is better than creating intermediate variables you don't use
- **Build Error Investigation**: When `npm run build` hangs or times out during ESLint checks, the build process may still be running in the background. Allow sufficient timeout (600+ seconds) and monitor `/tmp/build.log` for detailed output
- **Bulk Error Fixing Strategy**: When facing 80+ ESLint errors across many files:
  1. First fix configuration issues (deprecated options) to reduce noise
  2. Use `npm run build 2>&1 | grep "^\./src" | grep "Error:"` to get a sorted list of affected files
  3. Group fixes by file type (flows, API routes, components, services) for efficiency
  4. Prioritize files with the most errors to maximize impact per fix
  5. Use parallel fixes when errors follow the same pattern (e.g., unused parameters)

## Resources

### External Documentation
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Google Genkit Documentation](https://firebase.google.com/docs/genkit)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Radix UI Documentation](https://radix-ui.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Project-Specific Resources
- `memory-bank/` - Project context and documentation
- `docs/` - Additional project documentation
- `.rovodev/subagents/` - AI agent configurations