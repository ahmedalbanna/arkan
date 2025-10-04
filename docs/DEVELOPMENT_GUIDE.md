# دليل التطوير - Arkan

## نظرة عامة

هذا الدليل يغطي جميع جوانب التطوير في مشروع Arkan، من إعداد البيئة إلى أفضل الممارسات في كتابة الكود.

## إعداد بيئة التطوير

### 1. متطلبات النظام
- **Node.js**: 18.0.0 أو أحدث
- **npm**: 9.0.0 أو أحدث
- **Git**: 2.30.0 أو أحدث
- **VS Code**: مع الإضافات الموصى بها

### 2. إضافات VS Code المطلوبة
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "firebase.vscode-firebase-explorer",
    "ms-vscode.vscode-json"
  ]
}
```

### 3. إعدادات VS Code
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

## معايير الكود

### 1. TypeScript
```typescript
// ✅ جيد: استخدام أنواع واضحة
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

// ❌ سيء: استخدام any
const user: any = {};

// ✅ جيد: استخدام generic types
function createArray<T>(items: T[]): T[] {
  return [...items];
}
```

### 2. React Components
```typescript
// ✅ جيد: مكون وظيفي مع TypeScript
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
};

// ❌ سيء: مكون بدون أنواع
const Button = ({ children, onClick }) => {
  return <button onClick={onClick}>{children}</button>;
};
```

### 3. Hooks
```typescript
// ✅ جيد: hook مخصص مع أنواع
export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [storedValue, setValue];
};
```

### 4. Error Handling
```typescript
// ✅ جيد: معالجة أخطاء شاملة
export const safeApiCall = async <T>(
  apiCall: () => Promise<T>
): Promise<{ data?: T; error?: string }> => {
  try {
    const data = await apiCall();
    return { data };
  } catch (error) {
    console.error('API call failed:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// ❌ سيء: تجاهل الأخطاء
const data = await apiCall(); // قد يفشل بدون معالجة
```

## هيكل المشروع

### 1. تنظيم الملفات
```
src/
├── components/
│   ├── ui/                 # مكونات واجهة المستخدم الأساسية
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   ├── forms/              # مكونات النماذج
│   │   ├── LoginForm.tsx
│   │   └── ProjectForm.tsx
│   └── features/           # مكونات الميزات
│       ├── ProjectCard.tsx
│       └── UserProfile.tsx
├── hooks/                  # Hooks مخصصة
│   ├── useAuth.ts
│   ├── useProjects.ts
│   └── useLocalStorage.ts
├── lib/                    # مكتبات مساعدة
│   ├── models/             # نماذج البيانات
│   ├── utils/              # وظائف مساعدة
│   └── validations/        # مخططات التحقق
└── services/               # خدمات API
    ├── auth.service.ts
    └── project.service.ts
```

### 2. تسمية الملفات
```typescript
// ✅ جيد: أسماء واضحة ومتسقة
UserProfile.tsx
useUserProfile.ts
user.service.ts
UserSchema.ts

// ❌ سيء: أسماء غير واضحة
comp1.tsx
hook.ts
service.ts
```

## إدارة الحالة

### 1. Zustand Store
```typescript
// store/app.store.ts
interface AppState {
  user: User | null;
  projects: Project[];
  isLoading: boolean;
}

interface AppActions {
  setUser: (user: User | null) => void;
  addProject: (project: Project) => void;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState & AppActions>((set, get) => ({
  // State
  user: null,
  projects: [],
  isLoading: false,

  // Actions
  setUser: (user) => set({ user }),
  addProject: (project) => set((state) => ({
    projects: [...state.projects, project]
  })),
  setLoading: (isLoading) => set({ isLoading }),
}));
```

### 2. React Query
```typescript
// hooks/useProjects.ts
export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: ProjectService.getAllProjects,
    staleTime: 5 * 60 * 1000, // 5 دقائق
    cacheTime: 30 * 60 * 1000, // 30 دقيقة
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ProjectService.createProject,
    onSuccess: (newProject) => {
      queryClient.setQueryData(['projects'], (old: Project[]) => [
        ...(old || []),
        newProject
      ]);
    },
  });
};
```

## الذكاء الاصطناعي

### 1. Genkit Flows
```typescript
// ai/flows/generateProposal.ts
export const generateProposal = defineFlow({
  name: 'generateProposal',
  inputSchema: ProposalInputSchema,
  outputSchema: ProposalOutputSchema,
}, async (input) => {
  try {
    // تحليل المدخلات
    const analysis = await analyzeInput(input);

    // توليد المحتوى
    const content = await generateContent(analysis);

    // التحقق من الجودة
    const quality = await validateQuality(content);

    if (quality.score < 0.8) {
      // تحسين المحتوى
      return await improveContent(content, quality.feedback);
    }

    return content;
  } catch (error) {
    console.error('Proposal generation failed:', error);
    throw new Error('Failed to generate proposal');
  }
});
```

### 2. AI Hooks
```typescript
// hooks/useAI.ts
export const useAI = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateContent = async (input: AIInput) => {
    setIsGenerating(true);
    setError(null);

    try {
      const result = await aiService.generate(input);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  return { generateContent, isGenerating, error };
};
```

## الاختبار

### 1. اختبارات الوحدة
```typescript
// __tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('should render with correct text', () => {
    render(<Button onClick={() => {}}>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button onClick={() => {}} disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### 2. اختبارات التكامل
```typescript
// __tests__/integration/projectCreation.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProjectForm } from '@/components/forms/ProjectForm';

describe('Project Creation Flow', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  it('should create project successfully', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ProjectForm />
      </QueryClientProvider>
    );

    // ملء النموذج
    fireEvent.change(screen.getByLabelText('Project Name'), {
      target: { value: 'Test Project' }
    });
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Test Description' }
    });

    // إرسال النموذج
    fireEvent.click(screen.getByRole('button', { name: 'Create Project' }));

    // انتظار النجاح
    await waitFor(() => {
      expect(screen.getByText('Project created successfully')).toBeInTheDocument();
    });
  });
});
```

## الأداء

### 1. تحسين التحميل
```typescript
// تحميل كسول للمكونات
const LazyProjectList = lazy(() => import('@/components/ProjectList'));

// استخدام مع Suspense
<Suspense fallback={<LoadingSpinner />}>
  <LazyProjectList />
</Suspense>
```

### 2. تحسين الصور
```typescript
// استخدام Next.js Image
import Image from 'next/image';

<Image
  src="/project-image.jpg"
  alt="Project Image"
  width={400}
  height={300}
  priority={false}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### 3. تحسين الحزم
```typescript
// تقسيم الكود حسب المسارات
const routes = [
  {
    path: '/dashboard',
    component: lazy(() => import('@/pages/Dashboard')),
  },
  {
    path: '/projects',
    component: lazy(() => import('@/pages/Projects')),
  },
];
```

## الأمان

### 1. التحقق من البيانات
```typescript
// استخدام Zod للتحقق
import { z } from 'zod';

export const CreateProjectSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  tags: z.array(z.string()).optional(),
});

export type CreateProjectData = z.infer<typeof CreateProjectSchema>;
```

### 2. حماية API
```typescript
// middleware للمصادقة
export const authMiddleware = async (req: NextRequest) => {
  const token = req.headers.get('authorization');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = await verifyToken(token);
    req.user = decoded;
    return NextResponse.next();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
};
```

## النشر

### 1. متغيرات البيئة
```bash
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 2. بناء المشروع
```bash
# بناء الإنتاج
npm run build

# تشغيل الإنتاج محلياً
npm run start

# فحص الحزم
npm run analyze
```

## المراقبة

### 1. تتبع الأخطاء
```typescript
// تتبع الأخطاء
export const errorHandler = (error: Error, context: string) => {
  console.error(`Error in ${context}:`, error);

  // إرسال إلى خدمة المراقبة
  if (process.env.NODE_ENV === 'production') {
    // إرسال إلى Sentry أو خدمة مشابهة
  }
};
```

### 2. تحليل الأداء
```typescript
// قياس الأداء
export const performanceMonitor = {
  start: (name: string) => performance.mark(`${name}-start`),
  end: (name: string) => {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
  },
};
```

## أفضل الممارسات

### 1. كتابة الكود
- استخدم أسماء واضحة ومفهومة
- اكتب تعليقات مفيدة
- اتبع مبدأ DRY (Don't Repeat Yourself)
- استخدم TypeScript بشكل صحيح

### 2. إدارة الحالة
- استخدم Zustand للدولة العامة
- استخدم React Query للبيانات الخادم
- تجنب التداخل في الحالة
- استخدم useCallback و useMemo بحذر

### 3. الأداء
- استخدم تحميل كسول للمكونات الثقيلة
- استخدم React.memo للمكونات البطيئة
- تجنب إعادة الرسم غير الضرورية
- استخدم التخزين المؤقت بذكاء

### 4. الأمان
- تحقق من جميع المدخلات
- استخدم HTTPS في الإنتاج
- لا تخزن بيانات حساسة في localStorage
- استخدم CSP (Content Security Policy)

## الخلاصة

هذا الدليل يغطي جميع جوانب التطوير في Arkan. اتبع هذه المبادئ والمعايير لضمان:
- **جودة عالية** في الكود
- **أداء ممتاز** للتطبيق
- **أمان قوي** للبيانات
- **قابلية صيانة** عالية

للمزيد من التفاصيل، راجع:
- [دليل المعمارية](ARCHITECTURE.md)
- [مرجع API](API_REFERENCE.md)
- [مكتبة المكونات](COMPONENT_LIBRARY.md)
