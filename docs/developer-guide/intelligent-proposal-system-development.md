# دليل المطورين - نظام توليد أقسام المقترح الذكي

## 🏗️ نظرة عامة على البنية

### المكونات الأساسية

```
src/
├── ai/
│   ├── core/                     # النظام الذكي الأساسي
│   │   ├── context-analyzer.ts   # محلل السياق
│   │   ├── intelligent-prompt-builder.ts  # بناء Prompts ذكي
│   │   ├── adaptive-model-selector.ts     # اختيار النماذج
│   │   ├── output-quality-validator.ts   # مُقيم الجودة
│   │   ├── iterative-improvement-engine.ts # محرك التحسين
│   │   └── performance-monitor.ts # مراقب الأداء
│   ├── flows/
│   │   └── generate-proposal-section.ts  # تدفق Genkit
│   ├── prompts/
│   │   └── generate-proposal.ts  # Prompts محسنة
│   └── templates/
│       └── proposal-section-templates.ts # القوالب الجاهزة
├── components/intelligent-proposal/
│   ├── ProposalSectionGenerator.tsx     # المولد الرئيسي
│   ├── ProposalTemplateSelector.tsx     # اختيار القوالب
│   ├── ProposalSectionPreview.tsx       # معاينة النتائج
│   ├── PerformanceMonitor.tsx           # مراقبة الأداء
│   └── examples/
│       └── ProposalWorkspaceExample.tsx # مثال شامل
├── hooks/
│   └── use-intelligent-proposal.ts     # React Hooks
└── services/
    └── intelligent-proposal-service.ts # خدمة API
```

## 🧠 النظام الذكي الأساسي

### 1. محلل السياق (Context Analyzer)

```typescript
// src/ai/core/context-analyzer.ts
export class ContextAnalyzer {
  static async analyzeContext(input: AnalyzeContextInput): Promise<ContextAnalysisResult> {
    // تحليل نوع المحتوى
    // تحديد مستوى التعقيد
    // استخراج الكيانات الرئيسية
    // تحديد الجمهور المستهدف
    // اقتراح النموذج المناسب
  }
}
```

**الاستخدام:**
```typescript
const analysis = await ContextAnalyzer.analyzeContext({
  userInput: "تطوير تطبيق جوال",
  externalContext: files,
  guidelines: ["يجب أن يكون مفصل", "ركز على التقنية"]
});
```

### 2. بناء Prompts الذكي (Intelligent Prompt Builder)

```typescript
// src/ai/core/intelligent-prompt-builder.ts
export class IntelligentPromptBuilder {
  static buildPrompt(config: PromptBuildingConfig): PromptTemplate {
    // بناء system prompt محسن
    // إضافة السياق المناسب
    // تخصيص التعليمات
    // تحديد القيود والمحددات
  }

  static compilePrompt(template: PromptTemplate): string {
    // تجميع جميع أجزاء الـ prompt
    // تطبيق المتغيرات
    // تحسين الهيكل النهائي
  }
}
```

### 3. اختيار النماذج التكيفي (Adaptive Model Selector)

```typescript
// src/ai/core/adaptive-model-selector.ts
export class AdaptiveModelSelector {
  static selectOptimalModel(
    contextAnalysis: ContextAnalysisResult,
    taskType: TaskType
  ): ModelConfig {
    // تقييم النماذج المتاحة
    // حساب نقاط الملاءمة
    // اختيار النموذج الأمثل
    // تكوين المعاملات
  }
}
```

### 4. مُقيم الجودة (Output Quality Validator)

```typescript
// src/ai/core/output-quality-validator.ts
export class OutputQualityValidator {
  static async validateOutput(
    output: string,
    originalInput: string,
    contextAnalysis: ContextAnalysisResult
  ): Promise<ValidationResult> {
    // تقييم الاكتمال
    // فحص الدقة
    // تحليل الوضوح
    // قياس الصلة
    // تحديد المشاكل والحلول
  }
}
```

### 5. محرك التحسين التكراري (Iterative Improvement Engine)

```typescript
// src/ai/core/iterative-improvement-engine.ts
export class IterativeImprovementEngine {
  static async runImprovementSession(
    originalInput: string,
    taskType: TaskType,
    domain: string,
    externalContext?: ExternalContext[],
    config: ImprovementConfig = {}
  ): Promise<ImprovementSession> {
    // تشغيل عدة تكرارات
    // تحسين تدريجي للجودة
    // تتبع التقدم
    // إرجاع أفضل نتيجة
  }
}
```

## 🔄 تدفق Genkit

### إعداد التدفق الأساسي

```typescript
// src/ai/flows/generate-proposal-section.ts
export const generateProposalSection = ai.defineFlow(
  {
    name: 'generateProposalSection',
    inputSchema: ProposalSectionInputSchema,
    outputSchema: ProposalSectionOutputSchema,
  },
  async (input: ProposalSectionInput): Promise<ProposalSectionOutput> => {
    // 1. تحليل السياق
    const contextAnalysis = await ContextAnalyzer.analyzeContext(input);

    // 2. اختيار النموذج
    const modelConfig = AdaptiveModelSelector.selectOptimalModel(
      contextAnalysis,
      'generation'
    );

    // 3. بناء Prompt ذكي
    const promptTemplate = IntelligentPromptBuilder.buildPrompt({
      taskType: 'generation',
      domain: 'proposal-sections',
      contextAnalysis,
      userInput: input.projectContext.description
    });

    // 4. التوليد والتحسين
    let result = await generateWithModel(promptTemplate, modelConfig);

    // 5. تقييم الجودة
    const validation = await OutputQualityValidator.validateOutput(
      result.content,
      input.projectContext.description,
      contextAnalysis
    );

    // 6. التحسين التكراري (إذا لزم الأمر)
    if (validation.needsImprovement && input.intelligentSettings?.enableIterativeImprovement) {
      const session = await IterativeImprovementEngine.runImprovementSession(
        input.projectContext.description,
        'generation',
        'proposal-sections',
        input.externalContext,
        {
          maxIterations: input.intelligentSettings.maxIterations || 3,
          qualityThreshold: input.intelligentSettings.qualityThreshold || 80
        }
      );
      result.content = session.finalOutput;
    }

    return result;
  }
);
```

## 🎨 مكونات React

### 1. المولد الرئيسي

```typescript
// src/components/intelligent-proposal/ProposalSectionGenerator.tsx
export function ProposalSectionGenerator({
  initialType = 'executive_summary',
  projectData,
  existingSections,
  onSectionGenerated
}: ProposalSectionGeneratorProps) {
  // إدارة الحالة
  const [selectedType, setSelectedType] = useState(initialType);
  const [projectContext, setProjectContext] = useState(projectData);
  const [style, setStyle] = useState<ProposalStyle>(defaultStyle);

  // استخدام Hook المخصص
  const generator = useProposalSectionGenerator({
    type: selectedType,
    projectContext,
    style,
    onSuccess: onSectionGenerated
  });

  // واجهة المستخدم مع 5 تبويبات
  return (
    <Card>
      <Tabs defaultValue="section-settings">
        <TabsList>
          <TabsTrigger value="section-settings">إعدادات القسم</TabsTrigger>
          <TabsTrigger value="templates">القوالب</TabsTrigger>
          <TabsTrigger value="project-context">سياق المشروع</TabsTrigger>
          <TabsTrigger value="style-settings">الأسلوب</TabsTrigger>
          <TabsTrigger value="advanced-settings">إعدادات متقدمة</TabsTrigger>
        </TabsList>

        {/* محتوى التبويبات */}
      </Tabs>
    </Card>
  );
}
```

### 2. اختيار القوالب

```typescript
// src/components/intelligent-proposal/ProposalTemplateSelector.tsx
export function ProposalTemplateSelector({
  sectionType,
  onTemplateSelect,
  onCustomContent
}: ProposalTemplateSelectorProps) {
  const templates = getTemplatesForSection(sectionType);
  const [selectedTemplate, setSelectedTemplate] = useState<ProposalTemplate | null>(null);
  const [templateVariables, setTemplateVariables] = useState<Record<string, any>>({});

  const handleTemplateSelect = (template: ProposalTemplate) => {
    setSelectedTemplate(template);
    // تهيئة المتغيرات بالقيم الافتراضية
    const initialVariables = template.variables.reduce((acc, variable) => {
      acc[variable.key] = variable.defaultValue || '';
      return acc;
    }, {} as Record<string, any>);
    setTemplateVariables(initialVariables);
  };

  return (
    <div className="space-y-6">
      {/* قائمة القوالب */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map(template => (
          <TemplateCard
            key={template.id}
            template={template}
            isSelected={selectedTemplate?.id === template.id}
            onSelect={() => handleTemplateSelect(template)}
          />
        ))}
      </div>

      {/* تخصيص المتغيرات */}
      {selectedTemplate && (
        <TemplateVariablesEditor
          template={selectedTemplate}
          variables={templateVariables}
          onChange={setTemplateVariables}
        />
      )}
    </div>
  );
}
```

## 🪝 React Hooks

### Hook المولد الرئيسي

```typescript
// src/hooks/use-intelligent-proposal.ts
export function useProposalSectionGenerator(config: UseProposalSectionGeneratorConfig) {
  const [state, setState] = useState<ProposalSectionGeneratorState>({
    isGenerating: false,
    result: null,
    error: null,
    progress: { message: '', percentage: 0 },
    estimatedTime: '30 ثانية',
    qualityScore: 0,
    executionTime: 0,
    iterations: 0
  });

  const generateMutation = useMutation({
    mutationFn: async (options: ProposalSectionGenerationOptions) => {
      return intelligentProposalService.generateSection(options);
    },
    onSuccess: (result) => {
      setState(prev => ({
        ...prev,
        isGenerating: false,
        result,
        qualityScore: result.qualityScore,
        executionTime: result.metadata.executionTime,
        iterations: result.metadata.iterations
      }));

      config.onSuccess?.(result);
    },
    onError: (error) => {
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: error.message
      }));

      config.onError?.(error.message);
    }
  });

  const generateSection = useCallback(() => {
    const options: ProposalSectionGenerationOptions = {
      type: config.type,
      projectContext: config.projectContext,
      style: config.style || defaultStyle,
      complexity: config.complexity || 'detailed',
      intelligentSettings: config.intelligentSettings
    };

    generateMutation.mutate(options);
  }, [config, generateMutation]);

  return {
    ...state,
    generateSection,
    canGenerate: !state.isGenerating
  };
}
```

## 🌐 خدمة API

### الخدمة الأساسية

```typescript
// src/services/intelligent-proposal-service.ts
export class IntelligentProposalService {
  private baseUrl = '/api/generate/proposal-section';

  async generateSection(options: ProposalSectionGenerationOptions): Promise<ProposalSectionResult> {
    try {
      const response = await apiClient.post(this.baseUrl, options);
      return response.data;
    } catch (error) {
      console.error('خطأ في توليد قسم المقترح:', error);
      throw new Error('فشل في توليد قسم المقترح');
    }
  }

  async generateCompleteProposal(options: CompleteProposalGenerationOptions): Promise<CompleteProposalResult> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/complete`, options);
      return response.data;
    } catch (error) {
      console.error('خطأ في توليد المقترح الكامل:', error);
      throw new Error('فشل في توليد المقترح الكامل');
    }
  }

  async validateSection(type: ProposalSectionType, content: string): Promise<ValidationResult> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/validate`, { type, content });
      return response.data;
    } catch (error) {
      throw new Error('فشل في التحقق من صحة القسم');
    }
  }
}

export const intelligentProposalService = new IntelligentProposalService();
```

## 📊 مراقبة الأداء

### تطبيق مراقبة الأداء

```typescript
// src/ai/core/performance-monitor.ts
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  recordMetrics(metrics: PerformanceMetrics): void {
    this.metrics.push(metrics);

    // الاحتفاظ بآخر 1000 قياس فقط
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  getPerformanceStats(): PerformanceStats {
    const recentMetrics = this.metrics.slice(-50);

    return {
      averageExecutionTime: this.calculateAverage(recentMetrics, 'executionTime'),
      averageQualityScore: this.calculateAverage(recentMetrics, 'qualityScore'),
      successRate: this.calculateSuccessRate(recentMetrics),
      totalOperations: this.metrics.length,
      systemHealth: this.getSystemHealth()
    };
  }
}
```

### مكون مراقبة الأداء

```typescript
// src/components/intelligent-proposal/PerformanceMonitor.tsx
export function PerformanceMonitor() {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);

  useEffect(() => {
    const refreshData = () => {
      const stats = performanceMonitor.getPerformanceStats();
      setPerformanceData(stats);
    };

    refreshData();
    const interval = setInterval(refreshData, 30000); // تحديث كل 30 ثانية

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* مؤشرات الأداء الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="متوسط وقت التنفيذ"
          value={`${(performanceData?.averageExecutionTime / 1000).toFixed(1)}s`}
          icon={<Clock />}
        />
        <MetricCard
          title="متوسط الجودة"
          value={performanceData?.averageQualityScore.toFixed(1)}
          icon={<TrendingUp />}
        />
        <MetricCard
          title="معدل النجاح"
          value={`${performanceData?.successRate.toFixed(1)}%`}
          icon={<CheckCircle />}
        />
        <MetricCard
          title="إجمالي العمليات"
          value={performanceData?.totalOperations.toLocaleString()}
          icon={<Activity />}
        />
      </div>

      {/* حالة النظام */}
      <SystemHealthCard health={performanceData?.systemHealth} />
    </div>
  );
}
```

## 🧪 الاختبار

### اختبار المكونات الأساسية

```typescript
// __tests__/ai/core/context-analyzer.test.ts
describe('ContextAnalyzer', () => {
  test('should analyze simple project description', async () => {
    const input = {
      userInput: 'تطوير تطبيق جوال لإدارة المهام',
      externalContext: [],
      guidelines: []
    };

    const result = await ContextAnalyzer.analyzeContext(input);

    expect(result.contentType).toBe('technical');
    expect(result.complexityLevel).toBe('intermediate');
    expect(result.targetAudience).toBe('technical');
    expect(result.keyEntities).toContain('تطبيق جوال');
  });

  test('should handle complex project with external context', async () => {
    const input = {
      userInput: 'نظام إدارة المستشفيات الذكي',
      externalContext: [
        {
          fileName: 'requirements.pdf',
          content: 'متطلبات النظام تشمل إدارة المرضى والمواعيد...',
          type: 'context'
        }
      ],
      guidelines: ['يجب أن يكون متوافق مع معايير الخصوصية الطبية']
    };

    const result = await ContextAnalyzer.analyzeContext(input);

    expect(result.complexityLevel).toBe('advanced');
    expect(result.specificRequirements).toContain('معايير الخصوصية الطبية');
  });
});
```

### اختبار المكونات

```typescript
// __tests__/components/ProposalSectionGenerator.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProposalSectionGenerator } from '@/components/intelligent-proposal/ProposalSectionGenerator';

describe('ProposalSectionGenerator', () => {
  test('should render all tabs', () => {
    render(<ProposalSectionGenerator />);

    expect(screen.getByText('إعدادات القسم')).toBeInTheDocument();
    expect(screen.getByText('القوالب')).toBeInTheDocument();
    expect(screen.getByText('سياق المشروع')).toBeInTheDocument();
    expect(screen.getByText('الأسلوب')).toBeInTheDocument();
    expect(screen.getByText('إعدادات متقدمة')).toBeInTheDocument();
  });

  test('should generate section when form is submitted', async () => {
    const onSectionGenerated = jest.fn();

    render(
      <ProposalSectionGenerator
        onSectionGenerated={onSectionGenerated}
      />
    );

    // ملء النموذج
    fireEvent.change(screen.getByLabelText('عنوان المشروع'), {
      target: { value: 'مشروع تجريبي' }
    });

    fireEvent.change(screen.getByLabelText('وصف المشروع'), {
      target: { value: 'وصف تجريبي للمشروع' }
    });

    // إرسال النموذج
    fireEvent.click(screen.getByText('توليد القسم'));

    // انتظار النتيجة
    await waitFor(() => {
      expect(onSectionGenerated).toHaveBeenCalled();
    });
  });
});
```

## 🚀 النشر والتطوير

### إعداد البيئة التطويرية

```bash
# تثبيت التبعيات
npm install

# تشغيل الخادم التطويري
npm run dev

# تشغيل Genkit في وضع التطوير
npm run genkit:dev

# تشغيل الاختبارات
npm test

# فحص الأنواع
npm run typecheck
```

### متغيرات البيئة

```env
# .env.local
GENKIT_ENV=dev
GOOGLE_AI_API_KEY=your_api_key
FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### بناء الإنتاج

```bash
# بناء التطبيق
npm run build

# تشغيل الإنتاج محلياً
npm start

# نشر على Firebase
firebase deploy
```

## 🔧 التخصيص والتوسع

### إضافة نوع قسم جديد

1. **أضف النوع للتعداد**:
```typescript
// src/services/intelligent-proposal-service.ts
export type ProposalSectionType =
  | 'executive_summary'
  | 'problem_statement'
  // ... الأنواع الموجودة
  | 'new_section_type'; // النوع الجديد
```

2. **أضف معلومات القسم**:
```typescript
export const PROPOSAL_SECTION_TYPES: Record<ProposalSectionType, ProposalSectionInfo> = {
  // ... الأقسام الموجودة
  new_section_type: {
    type: 'new_section_type',
    title: 'القسم الجديد',
    description: 'وصف القسم الجديد',
    category: 'planning',
    complexity: 'detailed',
    estimatedLength: 300,
    dependencies: ['objectives'],
    keyElements: ['العنصر الأول', 'العنصر الثاني'],
    useCases: ['الاستخدام الأول', 'الاستخدام الثاني'],
    icon: '🆕'
  }
};
```

3. **أضف قوالب للقسم الجديد**:
```typescript
// src/ai/templates/proposal-section-templates.ts
export const NEW_SECTION_TEMPLATES: ProposalTemplate[] = [
  {
    id: 'new_section_basic',
    name: 'قالب أساسي للقسم الجديد',
    description: 'قالب بسيط للقسم الجديد',
    category: 'basic',
    sectionType: 'new_section_type',
    template: 'محتوى القالب مع {{متغير_1}} و {{متغير_2}}',
    variables: [
      {
        key: 'متغير_1',
        label: 'المتغير الأول',
        type: 'text',
        required: true,
        placeholder: 'أدخل قيمة المتغير الأول'
      }
    ]
  }
];
```

### إضافة نموذج AI جديد

1. **أضف النموذج للتكوين**:
```typescript
// src/ai/config/models.ts
export const newModel = {
  name: 'new-model-name',
  temperature: 0.7,
  maxOutputTokens: 8192
};
```

2. **أضف النموذج لمُختار النماذج**:
```typescript
// src/ai/core/adaptive-model-selector.ts
private static getAvailableModels() {
  return [
    // ... النماذج الموجودة
    {
      id: 'new-model',
      name: 'New Model',
      strengths: ['specific_task', 'high_quality'],
      weaknesses: ['speed'],
      maxTokens: 16384,
      languages: ['ar', 'en'],
      costEfficiency: 'medium'
    }
  ];
}
```

### إضافة مقياس جودة جديد

```typescript
// src/ai/core/output-quality-validator.ts
export const QualityMetricsSchema = z.object({
  // ... المقاييس الموجودة
  newMetric: z.number().min(0).max(100).describe('مقياس جديد للجودة'),
});

// في دالة التقييم
private static async evaluateNewMetric(
  output: string,
  context: ContextAnalysisResult
): Promise<number> {
  // منطق تقييم المقياس الجديد
  return score;
}
```

## 📚 الموارد الإضافية

### الوثائق المرجعية
- [Genkit Documentation](https://firebase.google.com/docs/genkit)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Radix UI Documentation](https://www.radix-ui.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

### أمثلة الكود
- [مثال شامل للاستخدام](../examples/intelligent-proposal-example.ts)
- [اختبارات الوحدة](../../__tests__/ai/core/)
- [مكونات الواجهة](../../src/components/intelligent-proposal/)

### أدوات التطوير
- **TypeScript**: للتحقق من الأنواع
- **ESLint**: لفحص جودة الكود
- **Jest**: للاختبارات
- **Storybook**: لتطوير المكونات (اختياري)

---

**تم إعداد هذا الدليل لمساعدة المطورين على فهم وتطوير نظام توليد أقسام المقترح الذكي بكفاءة وفعالية.**
