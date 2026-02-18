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

## PostgreSQL Migration Patterns

### Prisma Version Compatibility
- **Prisma 7.x Breaking Changes**: Prisma 7.x introduced significant changes to configuration and migration patterns that caused compatibility issues
  - **Solution**: Downgrade to Prisma 5.22.0 for stable migration workflows
  - **Migration Commands**: Use `npx prisma migrate dev` instead of `prisma db push` for production-ready migrations
  - **Configuration**: Keep `url` in `datasource db` block for migration tools, even when using separate config files

### Docker Container Database Operations
- **Use Docker exec for database operations**: When working with Dockerized PostgreSQL, use `docker exec` commands instead of installing local tools
  - Backup: `docker exec arkan-postgres pg_dump -U user dbname | gzip > backup.sql.gz`
  - SQL execution: `docker exec -i arkan-postgres psql -U user -d dbname < script.sql`
  - This avoids local tooling dependencies and ensures consistency

### Prisma Query Type Handling
- **BigInt Type Conversions**: PostgreSQL COUNT queries return `bigint` type, must be converted to JavaScript numbers
  - Pattern: `const result = await prisma.$queryRaw<Array<{ count: bigint }>>`; then `Number(result[0].count)`
  - **Common Error**: "Cannot mix BigInt and other types" when using raw COUNT results without conversion

### Table Naming Conventions
- **Prisma uses snake_case in database**: Even when Prisma schema uses PascalCase model names, actual PostgreSQL tables use snake_case
  - Schema: `model User` → Database: `users` table
  - Schema: `model CreditLedger` → Database: `credit_ledger` table
  - **Always verify actual table names** with `\dt` in psql before writing raw SQL queries or optimization scripts

### Prisma Field Relationship Queries
- **Use field names not relation names**: When querying for null relationships, use the field name (`userId`) not the relation name (`user`)
  - ❌ Incorrect: `where: { user: null }`
  - ✅ Correct: `where: { userId: null }`
  - **Note**: Required fields (non-nullable) cannot use `null` checks - use raw SQL with `NOT EXISTS` instead

### Health Check Script Patterns
- **Graceful degradation for missing data**: Health checks should default to "healthy" status when data doesn't exist yet
  - Don't fail validation if checking transaction status types that don't exist in the schema
  - Use try/catch with sensible defaults rather than hard failures
  - **Pattern**: For checks that might error on empty databases, catch and return healthy status with descriptive message

### File Content Generation Issues
- **Tool output truncation in message history**: When file content is very large, the system may truncate it with placeholder text like "Tool call argument 'initial_content' pruned from message history"
  - This corrupts the file with literal placeholder text
  - **Solution**: When creating files with large content (>500 lines), verify the file was created correctly immediately after
  - If corrupted, use `find_and_replace_code` to fix, or recreate with smaller content chunks

### Migration Script Organization
- **Create dedicated migration directories**: Keep migration scripts organized in `scripts/migration/` and `scripts/production/`
  - Export scripts: `export-firebase-users.ts`, `export-firestore-data.ts`
  - Import scripts: `migrate-users.ts`, `migrate-transactions.ts`, `migrate-projects.ts`
  - Validation: `validate-migration.ts`, `post-cutover-validation.ts`
  - This separation makes it clear which scripts run in which environment

### Testing Script Dependencies
- **Separate test scripts for different environments**: Create environment-specific test scripts to avoid dependency issues
  - `post-cutover-validation.ts` - Requires Firebase connection for production validation
  - `validate-postgres-only.ts` - PostgreSQL-only validation for local/dev testing
  - This prevents test failures due to missing Firebase credentials in development

## NextAuth & Authentication Migration Patterns

### Hasura JWT Configuration
- **JWT Secret Synchronization**: Hasura's `HASURA_GRAPHQL_JWT_SECRET` must exactly match the secret used by NextAuth to sign JWTs
  - **Common Issue**: Hardcoded secrets in docker-compose.yml don't update when container is restarted with `docker restart`
  - **Solution**: Use `docker compose down <service>` then `docker compose up -d <service>` to apply new environment variables
  - **Verification**: Check with `docker exec <container> env | grep JWT_SECRET`

### JWT Token Generation Best Practices
- **Avoid Double Timestamps**: Don't manually add `iat` field when using `jwt.sign()` with options parameter
  - ❌ Wrong: `jwt.sign({ iat: Date.now(), ...claims }, secret, { expiresIn: '1d' })`
  - ✅ Correct: `jwt.sign({ ...claims }, secret, { expiresIn: '1d' })` (iat added automatically)
  - **Symptom**: JWT signature verification failures even with correct secret
  
### Hasura Table Permissions Setup
- **Permission Creation Required**: Tracking tables in Hasura is not enough - must explicitly create permissions for each role
  - Track table: `pg_track_table` API call
  - Create permission: `pg_create_select_permission` with role and filter rules
  - **Pattern**: USER role filters by `user_id: { _eq: "X-Hasura-User-Id" }` for data isolation
  - **Admin role**: No filter (`{}`) for full access

### GraphQL Schema Field Naming
- **snake_case vs camelCase**: Hasura exposes database fields as-is (snake_case), not camelCase
  - Database: `user_id`, `created_at`
  - GraphQL Query: Must use `user_id`, not `userId`
  - **Mistake**: Copying field names from Prisma schema (PascalCase/camelCase) into GraphQL queries causes "field not found" errors

### Client Component Directive Requirements  
- **QueryProvider Must Be Client Component**: React Query's `QueryClientProvider` requires `'use client'` directive
  - **Error**: "createContext only works in Client Components" when missing directive
  - **Solution**: Add `'use client'` at top of `QueryProvider.tsx`
  - **Pattern**: Any component using React Context hooks must be a client component

### Authentication Migration Strategy
- **Dual-System Coexistence**: Keep old Firebase auth context while introducing NextAuth to avoid breaking existing code
  - Layer approach: `SessionProvider` → `NextAuthProvider` → `AuthProvider` (old) → App
  - New components use `useSession()` from NextAuth
  - Old components continue using Firebase context until migration complete
  - **Benefit**: Gradual migration without big-bang rewrites

## Next.js Server/Client Component Architecture

### Critical: Server Components Cannot Use Client Context
- **The Pattern**: Root layout components that are Server Components (async, using server-only functions) cannot directly use client-side providers that require React Context
  - ❌ Wrong: Async RootLayout → QueryClientProvider (requires `'use client'`)
  - ✅ Right: Async RootLayout → Client Wrapper Component (RootProviders) → QueryClientProvider
- **Solution**: Create a dedicated client component wrapper (`RootProviders.tsx` with `'use client'`) that contains ALL context providers
  - This wrapper receives children and fontClassName from the server component
  - All providers (QueryProvider, ThemeProvider, SessionProvider, etc.) live inside this client component
  - The server component stays clean and can use server-only functions (cookies(), headers(), etc.)
- **Why It Matters**: React Context hooks (useContext, useSession, etc.) require browser JavaScript runtime and cannot run on the server
- **Common Mistake**: Mixing server and client concerns in a single component leads to "React Context is unavailable in Server Components" error

### Authentication Flow: Server vs Client Separation
- **Server-Side Auth** (in RootLayout):
  - Use `cookies()` and `headers()` to check session validity
  - Implement redirects for auth/public routes
  - Keep authentication checks on the server for security
- **Client-Side Auth** (in NextAuthProvider):
  - Use `useSession()` to get session data on client
  - Populate user profile and context
  - Handle real-time session updates
- **Boundary**: The async RootLayout handles auth checks and redirects; RootProviders handles client-side session management

## Authentication & Password Management

### Critical: Signup Endpoint Must Hash Passwords
- **The Problem**: Signup endpoints that don't store bcrypt-hashed passwords cause immediate login failures
  - ❌ Wrong: Create user in Firebase, rely on Firebase's password storage (PostgreSQL `password_hash` stays NULL)
  - ✅ Right: Hash password with bcrypt, explicitly store in `password_hash` field in PostgreSQL
- **Solution Pattern**:
  ```typescript
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,  // MUST be explicitly set
      // ... other fields
    },
  });
  ```
- **Why**: NextAuth's credentials provider compares incoming passwords against `password_hash` field using bcrypt.compare()
- **Common Mistake**: Hashing password for validation but forgetting to store it in the create/update operation

### Seed Script Password Initialization
- **Both create AND update operations must set passwordHash**:
  - ❌ Wrong: `update: {}` - skips password hash on existing users
  - ✅ Right: `update: { passwordHash: hashedPassword }` - updates password on re-run
- **Pattern for idempotent seed scripts**:
  ```typescript
  const hash = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: { passwordHash: hash },  // Always update hash
    create: {
      email: 'user@example.com',
      passwordHash: hash,  // Must be in create too
      // ... other fields
    },
  });
  ```

## Firebase to NextAuth Migration Patterns

### Large-Scale Authentication Migration Strategy
- **Approach**: Use dual-provider pattern (Phase 1) → Safe migrations (Phase 2-3) → Cleanup (Phase 4)
  - Phase 1: Update infrastructure (token generation, API service layer)
  - Phase 2: Migrate data hooks (use consistent patterns across 20+ files)
  - Phase 3: Migrate pages and complex components
  - Phase 4: Remove legacy code and verify
- **Why Dual Provider Works**: Keep legacy AuthContext alongside NextAuthContext during transition, both exposing `useAuth()` hook for backwards compatibility
- **Critical Files to Update First**:
  - `src/lib/utils/authUtils.ts` - Token generation (blocks everything)
  - `src/services/api/apiService.ts` - API layer (used by 50+ files)
  - `src/components/shared/RootProviders.tsx` - Provider stack
- **Pattern for Migration**: 
  ```typescript
  // OLD (Firebase)
  const { firebaseUser } = useAuth();
  const token = await getAuthenticatedToken(firebaseUser);
  
  // NEW (NextAuth)
  const { data: session } = useSession();
  const token = session.user.id; // No async needed
  ```

### Bulk Migration Best Practices
- **Sed Command Dangers**: Regex replacements can corrupt code (e.g., `if (navigator.onLine if (navigator.onLine && firebaseUser)if...`)
  - ✅ Better: Use simple, single-pattern sed commands
  - ✅ Better: Verify each file after batch changes
  - ❌ Avoid: Complex nested sed patterns on same line
- **Verification Strategy**:
  ```bash
  # After batch migration, check for corrupted patterns
  grep -r "if (navigator.onLine if\|firebaseUser)if" src/
  grep -r "getIdToken()" src/ | grep -v "userCredential.user"
  ```
- **Error Pattern Recognition**: Build errors with "Parsing ecmascript source code failed" often indicate sed corruption - check for duplicated keywords/conditions
- **Progressive Verification**: Fix errors as they appear in build output rather than trying to catch all at once

### NextAuth Session Token Handling
- **Key Difference**: NextAuth provides token via session, no async `getIdToken()` call needed
  - Firebase: `const token = await firebaseUser.getIdToken()`
  - NextAuth: `const token = session.user.id` or `session.user.accessToken`
- **Session Field Verification**: Must verify actual token field name in NextAuth config's jwt callback before migrating
- **Compatibility Layer**: Map NextAuth session to Firebase-like object for backwards compatibility:
  ```typescript
  const firebaseUser = session?.user ? {
    uid: session.user.id,
    email: session.user.email,
  } : null;
  ```

## Environment Configuration Anti-Patterns

### Critical: Prevent Duplicate Environment Variables
- **The Problem**: Multiple conflicting values for same variable causes last-one-wins behavior
  - ❌ Wrong: DATABASE_URL appears 4 times with different values, last one is a placeholder template
  - ✅ Right: Single, definitive entry for each environment variable
- **Common Location**: .env files often accumulate entries from documentation sections, examples, and configuration samples
- **Detection Strategy**:
  ```bash
  grep "DATABASE_URL" .env  # Find ALL occurrences
  wc -l .env               # Check file size for accumulation
  ```
- **Fix Strategy**:
  1. Identify all duplicate entries: `grep -n "VARIABLE_NAME" .env`
  2. Understand which one is correct (usually the most recent non-template one)
  3. Remove ALL duplicates except the correct one
  4. For sensitive variables, verify Prisma can connect: test with `npx prisma db execute --stdin`
- **Prisma-Specific**: Duplicate DATABASE_URL entries cause "Can't reach database server at `HOST:5432`" error (the placeholder's HOST value gets used)

### Environment Variables for Client Access
- **Public vs Private**: Only prefix with `NEXT_PUBLIC_` if the variable should be accessible in browser code
  - ❌ Wrong: `HASURA_ADMIN_SECRET` only in .env (inaccessible in GraphQL client)
  - ✅ Right: `NEXT_PUBLIC_HASURA_ADMIN_SECRET` for client-side GraphQL operations
- **Security Note**: Admin secrets in `NEXT_PUBLIC_*` are only safe for development. For production, keep admin secret server-side and create API routes that use it

### NextAuth Configuration Validation
- **Required Settings**: NEXTAUTH_SECRET and NEXTAUTH_URL must be valid (not placeholder templates)
  - NEXTAUTH_SECRET: Real 32+ character string (generate with `openssl rand -base64 32`)
  - NEXTAUTH_URL: Valid URL that matches deployment domain
- **Development**: Can use simple values like `your-secret-key` and `http://localhost:3000`
- **Error Signal**: If NextAuth gives "Unexpected end of JSON input" during session parsing, check for placeholder values in configuration

## Resources

### External Documentation
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Google Genkit Documentation](https://firebase.google.com/docs/genkit)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Radix UI Documentation](https://radix-ui.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

### Project-Specific Resources
- `memory-bank/` - Project context and documentation
- `docs/` - Additional project documentation
- `docs/migration/` - PostgreSQL migration guides and documentation
- `.rovodev/subagents/` - AI agent configurations