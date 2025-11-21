# System Patterns - Arkan

## Architectural Patterns

### 1. Modular AI Flow Pattern
**Purpose**: Standardized approach for creating AI-powered operations

```typescript
// Pattern Template
const aiFlowPattern = ai.defineFlow({
  name: 'flowName',
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
}, async (input) => {
  // Validation
  const validatedInput = InputSchema.parse(input);
  
  // Processing
  const result = await processWithAI(validatedInput);
  
  // Output formatting
  return OutputSchema.parse(result);
});
```

**Usage Examples**:
- Text generation flows (`generate-text.ts`)
- Document analysis flows (`analyze-context.ts`)
- Content manipulation flows (`paraphrase-text.ts`)

**Benefits**:
- Type safety with Zod schemas
- Consistent error handling
- Reusable flow patterns
- Easy testing and maintenance

### 2. Component Composition Pattern
**Purpose**: Building complex UI components from smaller, reusable pieces

```typescript
// Compound Component Pattern
const ReportGenerator = {
  Root: ReportGeneratorRoot,
  Section: ReportSection,
  Controls: SectionControls,
  Preview: SectionPreview,
};

// Usage
<ReportGenerator.Root>
  <ReportGenerator.Section>
    <ReportGenerator.Controls />
    <ReportGenerator.Preview />
  </ReportGenerator.Section>
</ReportGenerator.Root>
```

**Implementation Examples**:
- Writing tools (`src/components/writing-tools/`)
- Admin dashboard components (`src/components/admin/`)
- UI components (`src/components/ui/`)

### 3. Service Layer Pattern
**Purpose**: Abstracting API calls and business logic from components

```typescript
// Service Pattern
class WritingToolsService {
  async generateText(input: GenerateTextInput): Promise<GenerateTextOutput> {
    return this.apiCall('/api/generate/text', input);
  }
  
  private async apiCall<T>(endpoint: string, data: any): Promise<T> {
    // Centralized error handling, loading states, etc.
  }
}
```

**Benefits**:
- Centralized API logic
- Consistent error handling
- Easy testing and mocking
- Reusable across components

## Design Patterns

### 1. Custom Hook Pattern
**Purpose**: Encapsulating stateful logic and side effects

```typescript
// Custom Hook Pattern
function useWritingTool<TInput, TOutput>(
  toolName: string,
  apiEndpoint: string
) {
  const [input, setInput] = useState<TInput>();
  const [output, setOutput] = useState<TOutput>();
  const [isLoading, setIsLoading] = useState(false);
  
  const generate = async (data: TInput) => {
    setIsLoading(true);
    try {
      const result = await apiCall(apiEndpoint, data);
      setOutput(result);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return { input, output, isLoading, generate };
}
```

**Usage Examples**:
- Writing tool hooks (`src/hooks/writing-tools/`)
- Data fetching hooks (`src/hooks/data/`)
- Core functionality hooks (`src/hooks/core/`)

### 2. Provider Pattern
**Purpose**: Sharing state and functionality across component trees

```typescript
// Provider Pattern
const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Auth logic here
  
  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**Implementation Examples**:
- Authentication context (`src/context/AuthContext.tsx`)
- Localization context (`src/context/LocalizationContext.tsx`)
- Theme providers (`src/components/shared/ThemeProvider.tsx`)

### 3. Repository Pattern
**Purpose**: Abstracting data access layer from business logic

```typescript
// Repository Pattern
interface UserRepository {
  findById(id: string): Promise<User>;
  create(userData: CreateUserInput): Promise<User>;
  update(id: string, updates: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
}

class FirebaseUserRepository implements UserRepository {
  // Firebase-specific implementations
}
```

## State Management Patterns

### 1. Zustand Store Pattern
**Purpose**: Lightweight state management for client-side state

```typescript
// Zustand Store Pattern
interface StoreState {
  data: any[];
  isLoading: boolean;
  error: string | null;
}

interface StoreActions {
  fetchData: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const useStore = create<StoreState & StoreActions>((set, get) => ({
  // State
  data: [],
  isLoading: false,
  error: null,
  
  // Actions
  fetchData: async () => {
    set({ isLoading: true });
    try {
      const data = await apiCall();
      set({ data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  clearError: () => set({ error: null }),
  reset: () => set({ data: [], isLoading: false, error: null }),
}));
```

### 2. React Query Pattern
**Purpose**: Server state management with caching and synchronization

```typescript
// React Query Pattern
function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}

function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });
}
```

## Error Handling Patterns

### 1. Document Processing Error Handling (Updated December 2024)
**Purpose**: Robust error handling for document generation and conversion

```typescript
// Document Processing Error Handler Pattern
async function processDocumentContent(content: any, options: ProcessingOptions) {
  try {
    // Validate input first
    if (!content || typeof content !== 'object') {
      throw new ValidationError('Invalid content structure');
    }

    // Process with fallback mechanisms
    const result = await processContent(content);
    
    if (!result || result.length === 0) {
      console.warn('Empty result from content processing, using fallback');
      return createFallbackContent(content);
    }
    
    return result;
  } catch (error) {
    console.error('Content processing failed:', error);
    
    // Return graceful fallback instead of crashing
    return createErrorFallback(error, content);
  }
}

// Example: Table processing with error handling
function processTable(tableNode: any): TableElement[] {
  try {
    if (!tableNode.children || tableNode.children.length === 0) {
      return [createPlaceholderTable('[Empty table]')];
    }

    return tableNode.children.map(processTableRow);
  } catch (error) {
    console.error('Table processing error:', error);
    return [createPlaceholderTable('[Table processing error]')];
  }
}
```

### 2. Centralized Error Handling
**Purpose**: Consistent error handling across the application

```typescript
// Error Handler Pattern
class ErrorHandler {
  static handle(error: Error, context?: string): void {
    // Log error
    console.error(`Error in ${context}:`, error);
    
    // Show user-friendly message
    toast.error(this.getUserMessage(error));
    
    // Report to monitoring service
    this.reportError(error, context);
  }
  
  private static getUserMessage(error: Error): string {
    if (error.message.includes('network')) {
      return 'Connection error. Please check your internet connection.';
    }
    return 'An unexpected error occurred. Please try again.';
  }
}
```

### 2. Error Boundary Pattern
**Purpose**: Catching and handling React component errors

```typescript
// Error Boundary Pattern
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    ErrorHandler.handle(error, 'ErrorBoundary');
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

## Security Patterns

### 1. Authentication Guard Pattern
**Purpose**: Protecting routes and components from unauthorized access

```typescript
// Auth Guard Pattern
function withAuth<T extends object>(Component: ComponentType<T>) {
  return function AuthGuard(props: T) {
    const { user, isLoading } = useAuth();
    
    if (isLoading) return <LoadingSpinner />;
    if (!user) return <LoginPrompt />;
    
    return <Component {...props} />;
  };
}

// Usage
const ProtectedPage = withAuth(DashboardPage);
```

### 2. Image Processing Error Pattern (Updated December 2024)
**Purpose**: Handling image processing failures gracefully

```typescript
// Robust Image Processing Pattern
async function processImageWithFallback(imageUrl: string, altText?: string) {
  try {
    // Validate URL first
    if (!imageUrl || imageUrl.trim() === '') {
      throw new ValidationError('Empty image URL');
    }

    const imageBuffer = await getImageBuffer(imageUrl);
    
    if (!imageBuffer || imageBuffer.byteLength === 0) {
      throw new ProcessingError('Invalid image buffer');
    }

    return {
      type: 'image',
      data: imageBuffer,
      success: true
    };
  } catch (error) {
    console.warn(`Image processing failed for ${imageUrl}:`, error);
    
    // Return text fallback instead of breaking document
    return {
      type: 'text',
      content: altText || '[Image not available]',
      success: false,
      originalUrl: imageUrl
    };
  }
}
```

### 3. Input Validation Pattern
**Purpose**: Validating user inputs with Zod schemas

```typescript
// Validation Pattern
const CreateUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(error.errors);
    }
    throw error;
  }
}
```

## Performance Patterns

### 1. Lazy Loading Pattern
**Purpose**: Loading components and resources on demand

```typescript
// Lazy Loading Pattern
const LazyComponent = lazy(() => import('./HeavyComponent'));

function ParentComponent() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <LazyComponent />
    </Suspense>
  );
}
```

### 2. Memoization Pattern
**Purpose**: Optimizing expensive computations and re-renders

```typescript
// Memoization Pattern
const ExpensiveComponent = memo(({ data }: Props) => {
  const processedData = useMemo(() => {
    return expensiveProcessing(data);
  }, [data]);
  
  const handleClick = useCallback((id: string) => {
    // Handle click
  }, []);
  
  return <div>{/* Rendered content */}</div>;
});
```

## Testing Patterns

### 1. Component Testing Pattern
**Purpose**: Consistent testing approach for React components

```typescript
// Component Test Pattern
describe('ComponentName', () => {
  const defaultProps = {
    // Default props
  };
  
  const renderComponent = (props = {}) => {
    return render(
      <TestProviders>
        <ComponentName {...defaultProps} {...props} />
      </TestProviders>
    );
  };
  
  it('should render correctly', () => {
    renderComponent();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
  
  it('should handle user interactions', async () => {
    renderComponent();
    await user.click(screen.getByRole('button'));
    expect(mockFunction).toHaveBeenCalled();
  });
});
```

### 2. API Testing Pattern
**Purpose**: Testing API routes and services

```typescript
// API Test Pattern
describe('API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should return expected data', async () => {
    const mockData = { id: '1', name: 'Test' };
    mockService.getData.mockResolvedValue(mockData);
    
    const response = await GET(new Request('http://localhost/api/test'));
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toEqual(mockData);
  });
});
```

## Best Practices Summary

### Code Organization
- Use barrel exports for clean imports
- Implement consistent naming conventions
- Separate concerns with clear boundaries
- Keep components small and focused

### Performance
- Implement lazy loading for large components
- Use React.memo and useMemo appropriately
- Optimize database queries with proper indexing
- Cache frequently accessed data

### Security
- Validate all inputs on both client and server
- Implement proper authentication and authorization
- Use HTTPS for all communications
- Sanitize user-generated content

### Maintainability
- Write comprehensive tests for critical functionality
- Document complex business logic
- Use TypeScript for type safety
- Follow consistent code formatting