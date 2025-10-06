# أنماط النظام - مشروع Arkan

## الأنماط المعمارية

### 1. معمارية المكونات (Component Architecture)
```typescript
// مثال على مكون جيد
interface ComponentProps {
  title: string;
  onAction: () => void;
  variant?: 'primary' | 'secondary';
}

export const Component: React.FC<ComponentProps> = ({
  title,
  onAction,
  variant = 'primary'
}) => {
  return (
    <div className="component-wrapper">
      <h2>{title}</h2>
      <button onClick={onAction} className={`btn-${variant}`}>
        Action
      </button>
    </div>
  );
};
```

### 2. معمارية الـ Hooks
```typescript
// مثال على hook جيد
export function useCustomHook(options: HookOptions) {
  const [state, setState] = useState(initialState);

  const action = useCallback(async () => {
    try {
      const result = await apiCall();
      setState(result);
    } catch (error) {
      handleError(error);
    }
  }, [dependencies]);

  return { state, action };
}
```

### 3. معمارية الخدمات (Services Architecture)
```typescript
// مثال على خدمة جيدة
export class DataService {
  private static instance: DataService;

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  async fetchData<T>(endpoint: string): Promise<T> {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }
}
```

## أنماط الذكاء الاصطناعي

### 1. نمط التحليل الذكي (Intelligent Analysis Pattern)
```typescript
// تحليل السياق
const contextAnalysis = await ContextAnalyzer.analyzeContext({
  userInput: input,
  externalContext: context,
  guidelines: guidelines
});

// اختيار النموذج
const modelConfig = AdaptiveModelSelector.selectOptimalModel(
  contextAnalysis,
  'generation'
);
```

### 2. نمط التحسين التكراري (Iterative Improvement Pattern)
```typescript
// جلسة التحسين
const improvementSession = await IterativeImprovementEngine.runImprovementSession(
  input,
  'generation',
  'domain',
  context,
  {
    maxIterations: 3,
    qualityThreshold: 85,
    improvementStrategy: 'balanced'
  }
);
```

### 3. نمط تقييم الجودة (Quality Validation Pattern)
```typescript
// تقييم الجودة
const validation = await OutputQualityValidator.validateOutput(
  output,
  input,
  contextAnalysis
);

if (validation.needsImprovement) {
  // تطبيق التحسين
}
```

## أنماط إدارة البيانات

### 1. نمط TanStack Query
```typescript
// Query للبيانات
export function useDataQuery(id: string) {
  return useQuery({
    queryKey: ['data', id],
    queryFn: () => fetchData(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Mutation للتحديث
export function useDataMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateData,
    onSuccess: () => {
      queryClient.invalidateQueries(['data']);
    },
  });
}
```

### 2. نمط Zustand Store
```typescript
// Store للحالة المحلية
interface StoreState {
  data: Data[];
  loading: boolean;
  error: string | null;
  actions: {
    setData: (data: Data[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
  };
}

export const useStore = create<StoreState>((set) => ({
  data: [],
  loading: false,
  error: null,
  actions: {
    setData: (data) => set({ data }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
  },
}));
```

## أنماط معالجة الأخطاء

### 1. نمط Error Boundary
```typescript
// Error Boundary للمكونات
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

### 2. نمط معالجة الأخطاء المركزية
```typescript
// معالج الأخطاء المركزي
export const handleError = (error: unknown, context?: string) => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';

  // تسجيل الخطأ
  console.error(`Error in ${context}:`, errorMessage);

  // إظهار إشعار للمستخدم
  toast({
    title: 'Error',
    description: errorMessage,
    variant: 'destructive',
  });

  // إرسال الخطأ لخدمة المراقبة
  if (process.env.NODE_ENV === 'production') {
    // sendToMonitoring(error, context);
  }
};
```

## أنماط الأمان

### 1. نمط التحقق من الصحة
```typescript
// Schema للتحقق من البيانات
const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(2).max(50),
  role: z.enum(['user', 'admin']),
});

// استخدام Schema
export function validateUser(data: unknown): User {
  try {
    return UserSchema.parse(data);
  } catch (error) {
    throw new ValidationError('Invalid user data', error);
  }
}
```

### 2. نمط المصادقة
```typescript
// Hook للمصادقة
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading };
}
```

## أنماط الأداء

### 1. نمط Lazy Loading
```typescript
// Lazy loading للمكونات
const LazyComponent = lazy(() => import('./HeavyComponent'));

export function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LazyComponent />
    </Suspense>
  );
}
```

### 2. نمط Memoization
```typescript
// Memoization للحسابات المعقدة
export function ExpensiveComponent({ data }: Props) {
  const processedData = useMemo(() => {
    return data.map(item => processItem(item));
  }, [data]);

  const handleClick = useCallback((id: string) => {
    // handle click
  }, []);

  return (
    <div>
      {processedData.map(item => (
        <Item key={item.id} data={item} onClick={handleClick} />
      ))}
    </div>
  );
}
```

## أنماط الاختبار

### 1. نمط اختبار المكونات
```typescript
// اختبار المكون
describe('Component', () => {
  test('renders correctly', () => {
    render(<Component title="Test" onAction={jest.fn()} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  test('calls onAction when clicked', () => {
    const mockAction = jest.fn();
    render(<Component title="Test" onAction={mockAction} />);

    fireEvent.click(screen.getByRole('button'));
    expect(mockAction).toHaveBeenCalledTimes(1);
  });
});
```

### 2. نمط اختبار الـ Hooks
```typescript
// اختبار الـ Hook
describe('useCustomHook', () => {
  test('initializes with default values', () => {
    const { result } = renderHook(() => useCustomHook());
    expect(result.current.state).toBe(defaultValue);
  });

  test('updates state when action is called', async () => {
    const { result } = renderHook(() => useCustomHook());

    await act(async () => {
      await result.current.action();
    });

    expect(result.current.state).toBe(expectedValue);
  });
});
```

## أنماط التوثيق

### 1. نمط JSDoc
```typescript
/**
 * Generates a project proposal using AI
 * @param input - The input data for proposal generation
 * @param options - Optional configuration for generation
 * @returns Promise that resolves to the generated proposal
 * @throws {ValidationError} When input validation fails
 * @throws {GenerationError} When AI generation fails
 * @example
 * ```typescript
 * const proposal = await generateProposal({
 *   projectIdea: "Build a mobile app",
 *   guidelines: ["Use modern tech stack"]
 * });
 * ```
 */
export async function generateProposal(
  input: ProposalInput,
  options?: GenerationOptions
): Promise<ProjectProposal> {
  // Implementation
}
```

## الخلاصة

هذه الأنماط تشكل الأساس التقني لمشروع Arkan، وتضمن:
- **الوضوح**: كود واضح ومفهوم
- **القابلية للصيانة**: سهولة التطوير والصيانة
- **الأداء**: أداء عالي ومحسن
- **الأمان**: حماية شاملة للبيانات
- **الجودة**: كود عالي الجودة وموثوق
