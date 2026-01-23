# System Patterns - Arkan

## Architecture Patterns

### 1. Layered Architecture

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│    (React Components + Pages)           │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         State Management Layer          │
│    (Zustand + React Query + Dexie)      │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│           API/Service Layer             │
│    (Next.js API Routes + Services)      │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│          Data/Backend Layer             │
│         (Firebase + Genkit AI)          │
└─────────────────────────────────────────┘
```

### 2. Component Patterns

**Atomic Design Structure:**
- **Atoms**: Button, Input, Label (shadcn/ui)
- **Molecules**: FormField, Card, Dialog
- **Organisms**: ReportModeGenerator, FileManager
- **Templates**: Builder page, Dashboard
- **Pages**: Next.js route pages

**Component Organization:**
```
src/components/
├── ui/               # Atomic components (shadcn/ui)
├── shared/           # Reusable molecules
├── auth/             # Authentication components
├── report-mode/      # Feature-specific organisms
│   ├── dialogs/
│   ├── generation-tools/
│   ├── section-controls/
│   └── session/
└── home/             # Landing page components
```

### 3. State Management Patterns

**Three-Tier State:**

```typescript
// 1. Client State (Zustand) - UI & transient data
const useBuilderStore = create<BuilderState>((set) => ({
  currentProject: null,
  selectedChapter: null,
  isGenerating: false,
}));

// 2. Server State (React Query) - Backend data with caching
const { data: projects } = useQuery({
  queryKey: ['projects'],
  queryFn: () => api.getProjects(),
  staleTime: 5 * 60 * 1000,
});

// 3. Local State (Dexie/IndexedDB) - Offline persistence
const db = new Dexie('ArkanDB');
db.version(1).stores({
  projects: '++id, userId, lastModified',
});
```

### 4. Data Flow Pattern

**Unidirectional Data Flow:**
```
User Action
    ↓
Component Event Handler
    ↓
Store Action (Zustand)
    ↓
API Call (React Query mutation)
    ↓
Backend (Firebase)
    ↓
Cache Update (React Query)
    ↓
Component Re-render
```

### 5. API Route Pattern

**Standardized API Handler:**
```typescript
// Pattern: withAuth wrapper for protected routes
export async function POST(request: Request) {
  return withAuth(async (req, { user, db }) => {
    // 1. Validate input with Zod
    const body = await req.json();
    const validated = schema.parse(body);
    
    // 2. Check permissions
    if (!hasPermission(user, validated)) {
      return ApiResponse.error('Unauthorized', 403);
    }
    
    // 3. Business logic
    const result = await performOperation(validated);
    
    // 4. Return typed response
    return ApiResponse.success(result);
  }, { requireAuth: true, requireAdmin: false })(request);
}
```

**Error Handling Pattern:**
```typescript
// Centralized error handling
try {
  // Operation
} catch (error) {
  if (error instanceof ZodError) {
    return ApiResponse.error('Validation failed', 400, error.errors);
  }
  if (error instanceof FirebaseError) {
    return handleFirebaseError(error);
  }
  return ApiResponse.error('Internal server error', 500);
}
```

### 6. AI Generation Pattern

**Flow-Based Generation:**
```typescript
// Pattern: Prompt → Context → Generate → Post-process
async function generateSection(input: GenerationInput) {
  // 1. Build prompt with context
  const prompt = buildPrompt({
    template: 'section-generation',
    context: {
      guidelines: input.guidelines,
      previousSections: input.context,
      externalContext: input.files,
    }
  });
  
  // 2. Select appropriate model
  const model = selectModelByTask(input.taskType);
  
  // 3. Generate with retry logic
  const result = await retryWithBackoff(() => 
    genkit.generate({
      model,
      prompt,
      config: { temperature: 0.7, maxTokens: 2000 }
    })
  );
  
  // 4. Post-process and validate
  return validateAndFormat(result);
}
```

**Model Selection Pattern:**
```typescript
// Task-specific model routing
const MODEL_STRATEGY = {
  'quick-conversion': OLLAMA_MODELS.GEMMA_2B,
  'structured-report': OLLAMA_MODELS.PHI3_MINI,
  'academic-content': OLLAMA_MODELS.LLAMA3_8B,
  'general-task': OLLAMA_MODELS.QWEN2_5,
};

function selectModelByTask(taskType: TaskType): string {
  return MODEL_STRATEGY[taskType] || MODEL_STRATEGY['general-task'];
}
```

### 7. Authentication Pattern

**Multi-Layer Auth:**
```typescript
// 1. Firebase Auth (Client)
const { user } = useAuth();

// 2. Session Cookie (Server)
const session = cookies().get('session');
const decodedToken = await adminAuth.verifySessionCookie(session);

// 3. Firestore User Profile
const userProfile = await db.collection('users').doc(uid).get();

// 4. Role-Based Access Control
if (userProfile.role !== 'admin') {
  throw new Error('Insufficient permissions');
}
```

### 8. Data Modeling Pattern

**Class-Based Models with Immutability:**
```typescript
export class Project {
  constructor(private props: ProjectProperties) {}
  
  // Immutable updates
  public with(updates: Partial<ProjectProperties>): Project {
    return new Project({ ...this.props, ...updates });
  }
  
  // Business logic encapsulation
  public addChapter(chapter: Chapter): Project {
    return this.with({
      chapters: [...this.props.chapters, chapter]
    });
  }
  
  // Computed properties
  get totalSections(): number {
    return this.props.chapters.reduce(
      (sum, ch) => sum + ch.sections.length, 0
    );
  }
  
  // Serialization
  toFirestore(): FirestoreDocument {
    return { ...this.props, updatedAt: serverTimestamp() };
  }
}
```

### 9. Export Generation Pattern

**Multi-Format Pipeline:**
```typescript
// Pattern: Parse → Transform → Format → Export
class DocumentExporter {
  async export(project: Project, format: ExportFormat) {
    // 1. Parse markdown to AST
    const ast = this.markdownParser.parse(project.content);
    
    // 2. Transform for target format
    const transformed = this.transformers[format].transform(ast);
    
    // 3. Apply styling
    const styled = this.stylers[format].apply(transformed, project.styles);
    
    // 4. Generate binary
    return this.generators[format].generate(styled);
  }
}

// Format-specific transformers
const transformers = {
  docx: new DocxTransformer(),
  pptx: new PptxTransformer(),
  pdf: new PdfTransformer(),
};
```

### 10. Caching Strategy

**Multi-Level Caching:**
```typescript
// Level 1: React Query (Memory)
queryClient.setQueryData(['project', id], data, {
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Level 2: IndexedDB (Local Storage)
await db.projects.put({
  id,
  data,
  cachedAt: Date.now(),
});

// Level 3: Firestore (Server)
await db.collection('projects').doc(id).set(data, { merge: true });
```

**Cache Invalidation:**
```typescript
// Invalidate on mutation
const mutation = useMutation({
  mutationFn: updateProject,
  onSuccess: (data, variables) => {
    // Invalidate related queries
    queryClient.invalidateQueries(['projects']);
    queryClient.invalidateQueries(['project', variables.id]);
    
    // Update cache optimistically
    queryClient.setQueryData(['project', variables.id], data);
  },
});
```

### 11. Error Boundary Pattern

**Currently Missing - Recommended:**
```typescript
// Recommended implementation
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to monitoring service
    logErrorToService(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### 12. Form Handling Pattern

**React Hook Form + Zod:**
```typescript
// Pattern: Schema → Form → Validation → Submit
const formSchema = z.object({
  title: z.string().min(1, 'Title required'),
  content: z.string().optional(),
});

const form = useForm<FormData>({
  resolver: zodResolver(formSchema),
  defaultValues: { title: '', content: '' },
});

const onSubmit = form.handleSubmit(async (data) => {
  await mutation.mutateAsync(data);
  form.reset();
});
```

### 13. File Upload Pattern

**Multi-Stage Upload:**
```typescript
// Pattern: Select → Validate → Process → Upload → Store
async function uploadFile(file: File) {
  // 1. Client-side validation
  if (!isValidFile(file)) throw new Error('Invalid file');
  
  // 2. Process if needed (resize image, extract text)
  const processed = await processFile(file);
  
  // 3. Upload to Firebase Storage
  const storageRef = ref(storage, `uploads/${userId}/${file.name}`);
  const snapshot = await uploadBytes(storageRef, processed);
  
  // 4. Get download URL
  const downloadURL = await getDownloadURL(snapshot.ref);
  
  // 5. Store metadata in Firestore
  await db.collection('files').add({
    userId,
    name: file.name,
    url: downloadURL,
    uploadedAt: serverTimestamp(),
  });
  
  return downloadURL;
}
```

### 14. Internationalization Pattern

**i18next Setup:**
```typescript
// Pattern: Detect → Load → Translate
i18n
  .use(initReactI18next)
  .init({
    resources: { en, ar },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

// Usage with RTL support
const { t, i18n } = useTranslation();
const direction = i18n.language === 'ar' ? 'rtl' : 'ltr';

return <div dir={direction}>{t('key')}</div>;
```

### 15. Optimistic Updates Pattern

**React Query Optimistic:**
```typescript
const mutation = useMutation({
  mutationFn: updateProject,
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(['project', newData.id]);
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(['project', newData.id]);
    
    // Optimistically update
    queryClient.setQueryData(['project', newData.id], newData);
    
    // Return rollback function
    return { previous };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(
      ['project', newData.id],
      context?.previous
    );
  },
  onSettled: (data, error, variables) => {
    // Refetch to ensure consistency
    queryClient.invalidateQueries(['project', variables.id]);
  },
});
```

## Design Patterns Used

### Creational Patterns
- **Factory Pattern**: Model creation (Project.create())
- **Builder Pattern**: Prompt building, document generation
- **Singleton Pattern**: Firebase instances, database connections

### Model Best Practices

**Immutable Class-Based Models:**
```typescript
// Example: Project Model (Production-Ready Pattern)
export class Project {
  // All properties readonly
  public readonly id: string;
  public readonly name: string;
  public readonly content: ProjectContent;
  
  constructor(props: ProjectProperties) {
    // Validation at entry point
    if (props.name !== undefined && props.name.trim() === '') {
      throw new ProjectValidationError('Project name cannot be empty');
    }
    
    // Initialize with defaults
    this.id = props.id || uuidv4();
    this.name = props.name || 'Untitled Project';
    
    // Validate content structure
    this.content = validateAndConvertContent(props.content);
  }
  
  // Immutable updates return new instances
  public with(props: Partial<ProjectProperties>): Project {
    return new Project({ ...this.toStateObject(), ...props });
  }
  
  // Business logic methods
  public addChapter(title: string): Project {
    const newChapter = new Chapter({ title, sections: [] });
    return this.with({ content: [...this.content, newChapter] });
  }
  
  // Serialization for persistence
  public toStateObject(): ProjectProperties {
    return { id: this.id, name: this.name, /* ... */ };
  }
}
```

**Model Validation Pattern:**
```typescript
// Separate validation utilities
// src/lib/models/project-validation.ts

export const ProjectPropertiesSchema = z.object({
  name: z.string().min(1).max(200),
  complexity: z.number().min(0).max(100),
  // ... all fields validated
});

export class ProjectValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly errors?: z.ZodError
  ) {
    super(message);
    this.name = 'ProjectValidationError';
  }
}

export function validateProjectProperties(props: unknown) {
  try {
    return ProjectPropertiesSchema.parse(props);
  } catch (error) {
    throw new ProjectValidationError(/* ... */);
  }
}
```

**Documentation Standards:**
```typescript
/**
 * Updates a section using an updater function
 * 
 * @param id - Section ID to update
 * @param updater - Function that receives current section and returns updated section
 * @returns New Project instance with updated section, or same instance if not found
 * @throws {ProjectValidationError} If validation fails
 * 
 * @example
 * ```typescript
 * const updated = project.updateSection('s-1', section => 
 *   section.with({ content: 'New content' })
 * );
 * ```
 */
public updateSection(id: string, updater: (s: Section) => Section): Project {
  // Implementation
}
```

**Testing Standards:**
```typescript
// Comprehensive test coverage
describe('Project Model', () => {
  describe('constructor', () => {
    it('should validate required fields', () => {
      expect(() => new Project({ name: '' }))
        .toThrow('Project name cannot be empty');
    });
  });
  
  describe('immutability', () => {
    it('should return new instance on update', () => {
      const original = new Project({ name: 'Original' });
      const updated = original.with({ name: 'Updated' });
      
      expect(updated).not.toBe(original);
      expect(original.name).toBe('Original');
    });
  });
});
```

**Model Checklist (Established Pattern):**
- ✅ All properties `readonly`
- ✅ Validation in constructor (Zod + custom logic)
- ✅ Custom error classes (ModelValidationError)
- ✅ JSDoc on all public methods
- ✅ Immutable update methods
- ✅ `with()` method for partial updates
- ✅ `toStateObject()` for serialization
- ✅ Separate validation utilities (model-validation.ts)
- ✅ 70%+ test coverage (target: 80%+)
- ✅ Works on client AND server (no 'use client')
- ✅ Helper methods for common operations
- ✅ Business logic methods where appropriate
- ✅ Usage examples in JSDoc
- ✅ ID-based operations (not array indices)

**Production-Ready Models (Reference):**
- ✅ Project Model: 89.71% coverage (38 tests) - `src/lib/models/project.ts`
- ✅ User Model: 87.87% coverage (46 tests) - `src/lib/models/user.ts`
- ✅ Chapter Model: 100% coverage (42 tests) - `src/lib/models/chapter.ts`
- ✅ Section Model: 86.17% coverage (35 tests) - `src/lib/models/section.ts`

**Anti-Patterns to Avoid:**
- ❌ 'use client' in models (prevents SSR)
- ❌ Mutable properties (use readonly)
- ❌ Silent failures (validate inputs, throw errors)
- ❌ Missing documentation (JSDoc all public methods)
- ❌ Mixing concerns (keep models pure, move logic to utilities)
- ❌ Using array indices instead of IDs (fragile, breaks on reorder)
- ❌ Incomplete test coverage (<70%)
- ❌ No validation (always validate constructor inputs)
- ❌ Poor error messages (be specific about what failed)

---

### Structural Patterns
- **Adapter Pattern**: Firebase to app model conversion
- **Facade Pattern**: API services wrapping Firebase
- **Decorator Pattern**: HOCs (withAuth, withValidation)

### Behavioral Patterns
- **Observer Pattern**: React Query subscriptions, Zustand stores
- **Strategy Pattern**: Model selection, export formats
- **Command Pattern**: API mutations, undo/redo
- **Template Method**: Document generation pipeline

## Anti-Patterns to Avoid

❌ **Prop Drilling**: Use context or state management instead
❌ **God Objects**: Keep components focused and single-purpose
❌ **Tight Coupling**: Use dependency injection and interfaces
❌ **Magic Numbers**: Use constants and enums
❌ **Console.log in Production**: Use proper logging service
❌ **Hardcoded Values**: Use environment variables
❌ **Large Components**: Split into smaller, reusable pieces
❌ **Mutation of State**: Use immutable updates
❌ **Synchronous Heavy Operations**: Use async/await and workers

## Best Practices Checklist

✅ **TypeScript strict mode** enabled
✅ **Component composition** over inheritance
✅ **Custom hooks** for reusable logic
✅ **Error boundaries** (recommended, not implemented)
✅ **Lazy loading** for code splitting (recommended)
✅ **Memoization** for expensive computations
✅ **Debouncing** for frequent operations
✅ **Optimistic updates** for better UX
✅ **Centralized error handling**
✅ **Consistent naming conventions**
✅ **Modular file structure**
✅ **Separation of concerns**
