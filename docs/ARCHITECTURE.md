# دليل المعمارية - Arkan

## نظرة عامة

Arkan مبني على معمارية حديثة ومتدرجة تستخدم أفضل الممارسات في تطوير تطبيقات الويب الحديثة. هذا الدليل يشرح الهيكل العام للمشروع والمبادئ المعمارية المتبعة.

## المبادئ المعمارية

### 1. فصل الاهتمامات (Separation of Concerns)
- **العرض**: مكونات React منفصلة
- **المنطق**: خدمات وhooks منفصلة
- **البيانات**: نماذج ومخازن منفصلة
- **الذكاء الاصطناعي**: طبقة منفصلة مع Genkit

### 2. قابلية التوسع (Scalability)
- هيكل مجزأ قابل للتوسع
- تحميل كسول للمكونات
- تقسيم الكود حسب المسارات
- إدارة حالة مركزية

### 3. قابلية الصيانة (Maintainability)
- كود منظم وموثق
- اختبارات شاملة
- معايير كود موحدة
- توثيق شامل

## الهيكل العام

```
arkan/
├── src/                           # الكود المصدري
│   ├── app/                       # صفحات التطبيق (App Router)
│   │   ├── (auth)/               # مجموعة صفحات المصادقة
│   │   ├── (dashboard)/         # مجموعة صفحات لوحة التحكم
│   │   ├── api/                 # نقاط نهاية API
│   │   ├── globals.css          # الأنماط العامة
│   │   └── layout.tsx           # التخطيط الرئيسي
│   ├── components/              # مكونات React
│   │   ├── ui/                  # مكونات واجهة المستخدم الأساسية
│   │   ├── forms/               # مكونات النماذج
│   │   ├── layouts/             # تخطيطات الصفحات
│   │   └── features/            # مكونات الميزات
│   ├── hooks/                   # Hooks مخصصة
│   │   ├── useAuth.ts           # hook المصادقة
│   │   ├── useProjects.ts       # hook إدارة المشاريع
│   │   └── useAI.ts             # hook الذكاء الاصطناعي
│   ├── lib/                     # مكتبات مساعدة
│   │   ├── models/              # نماذج البيانات
│   │   ├── utils/               # وظائف مساعدة
│   │   ├── validations/         # مخططات التحقق
│   │   └── constants/           # الثوابت
│   ├── services/                # خدمات API
│   │   ├── auth.service.ts      # خدمة المصادقة
│   │   ├── project.service.ts   # خدمة المشاريع
│   │   └── ai.service.ts        # خدمة الذكاء الاصطناعي
│   ├── ai/                      # تكامل الذكاء الاصطناعي
│   │   ├── config/              # إعدادات النماذج
│   │   ├── flows/               # تدفقات AI
│   │   ├── prompts/             # النصوص الموجهة
│   │   ├── schemas/             # مخططات التحقق
│   │   └── tools/               # أدوات AI
│   ├── core/                    # الوظائف الأساسية
│   │   ├── auth/                # نظام المصادقة
│   │   ├── storage/             # إدارة التخزين
│   │   └── utils/               # أدوات أساسية
│   └── types/                   # تعريفات TypeScript
├── docs/                        # التوثيق
├── public/                      # الملفات العامة
├── tests/                       # الاختبارات
└── config files                 # ملفات الإعداد
```

## طبقات المعمارية

### 1. طبقة العرض (Presentation Layer)
```typescript
// مكونات React مع Tailwind CSS
export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold">{project.title}</h3>
      <p className="text-gray-600">{project.description}</p>
    </div>
  );
};
```

### 2. طبقة المنطق (Business Logic Layer)
```typescript
// Hooks لإدارة المنطق
export const useProjectManagement = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  const createProject = async (data: CreateProjectData) => {
    // منطق إنشاء المشروع
  };

  return { projects, createProject };
};
```

### 3. طبقة البيانات (Data Layer)
```typescript
// نماذج البيانات مع Zod
export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string(),
  createdAt: z.date(),
});

export type Project = z.infer<typeof ProjectSchema>;
```

### 4. طبقة الخدمات (Service Layer)
```typescript
// خدمات API
export class ProjectService {
  static async createProject(data: CreateProjectData): Promise<Project> {
    const response = await fetch('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  }
}
```

### 5. طبقة الذكاء الاصطناعي (AI Layer)
```typescript
// تدفقات AI مع Genkit
export const generateProposal = defineFlow({
  name: 'generateProposal',
  inputSchema: ProposalInputSchema,
  outputSchema: ProposalOutputSchema,
}, async (input) => {
  // منطق توليد المقترح
});
```

## إدارة الحالة

### 1. Zustand للدولة العامة
```typescript
interface AppState {
  user: User | null;
  projects: Project[];
  currentProject: Project | null;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  projects: [],
  currentProject: null,

  setUser: (user) => set({ user }),
  addProject: (project) => set((state) => ({
    projects: [...state.projects, project]
  })),
}));
```

### 2. React Query للبيانات الخادم
```typescript
export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: ProjectService.getAllProjects,
    staleTime: 5 * 60 * 1000, // 5 دقائق
  });
};
```

## تدفق البيانات

### 1. تدفق البيانات أحادي الاتجاه
```
User Action → Component → Hook → Service → API → Database
                ↓
            State Update → Component Re-render
```

### 2. مثال عملي: إنشاء مشروع جديد
```typescript
// 1. المستخدم يملأ النموذج
const CreateProjectForm = () => {
  const { createProject } = useProjectManagement();

  const handleSubmit = async (data: CreateProjectData) => {
    await createProject(data); // 2. استدعاء Hook
  };
};

// 3. Hook يستدعي الخدمة
const useProjectManagement = () => {
  const createProject = async (data: CreateProjectData) => {
    const project = await ProjectService.createProject(data); // 4. استدعاء الخدمة
    useAppStore.getState().addProject(project); // 5. تحديث الحالة
  };
};

// 6. الخدمة تستدعي API
class ProjectService {
  static async createProject(data: CreateProjectData) {
    const response = await fetch('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  }
}
```

## الأمان

### 1. المصادقة والتفويض
```typescript
// حماية المسارات
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <LoginPage />;

  return <>{children}</>;
};
```

### 2. التحقق من البيانات
```typescript
// مخططات Zod للتحقق
export const CreateProjectSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  tags: z.array(z.string()).optional(),
});
```

### 3. حماية API
```typescript
// middleware للمصادقة
export const authMiddleware = async (req: NextRequest) => {
  const token = req.headers.get('authorization');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // التحقق من صحة الرمز
};
```

## الأداء

### 1. تحميل كسول
```typescript
// تحميل كسول للمكونات
const LazyComponent = lazy(() => import('./HeavyComponent'));

// استخدام مع Suspense
<Suspense fallback={<LoadingSpinner />}>
  <LazyComponent />
</Suspense>
```

### 2. تقسيم الكود
```typescript
// تقسيم حسب المسارات
const routes = [
  {
    path: '/dashboard',
    component: lazy(() => import('./pages/Dashboard')),
  },
  {
    path: '/projects',
    component: lazy(() => import('./pages/Projects')),
  },
];
```

### 3. التخزين المؤقت
```typescript
// React Query للتخزين المؤقت
export const useProject = (id: string) => {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => ProjectService.getProject(id),
    staleTime: 10 * 60 * 1000, // 10 دقائق
    cacheTime: 30 * 60 * 1000, // 30 دقيقة
  });
};
```

## الاختبار

### 1. اختبارات الوحدة
```typescript
// اختبار المكونات
describe('ProjectCard', () => {
  it('should render project title', () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText(mockProject.title)).toBeInTheDocument();
  });
});
```

### 2. اختبارات التكامل
```typescript
// اختبار تدفق البيانات
describe('Project Creation Flow', () => {
  it('should create project and update state', async () => {
    const { result } = renderHook(() => useProjectManagement());

    await act(async () => {
      await result.current.createProject(mockProjectData);
    });

    expect(result.current.projects).toContainEqual(
      expect.objectContaining(mockProjectData)
    );
  });
});
```

## النشر

### 1. البيئات
- **Development**: التطوير المحلي
- **Staging**: اختبار ما قبل الإنتاج
- **Production**: البيئة الحية

### 2. CI/CD
```yaml
# GitHub Actions
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Firebase
        run: firebase deploy --token ${{ secrets.FIREBASE_TOKEN }}
```

## المراقبة والتحليل

### 1. تتبع الأخطاء
```typescript
// تتبع الأخطاء
export const errorHandler = (error: Error, context: string) => {
  console.error(`Error in ${context}:`, error);
  // إرسال إلى خدمة المراقبة
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

## الخلاصة

معمارية Arkan مصممة لتكون:
- **قابلة للتوسع**: يمكن إضافة ميزات جديدة بسهولة
- **قابلة للصيانة**: كود منظم وموثق
- **آمنة**: حماية شاملة للبيانات والمستخدمين
- **سريعة**: أداء محسن وتحميل سريع
- **موثوقة**: اختبارات شاملة ومعالجة أخطاء

هذه المعمارية تضمن أن المشروع يمكن أن ينمو ويتطور مع الحفاظ على جودة عالية وأداء ممتاز.
