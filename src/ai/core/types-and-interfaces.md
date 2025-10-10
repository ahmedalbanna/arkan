# Types and Interfaces - الأنواع والواجهات

## نظرة عامة

هذا الملف يحتوي على جميع الأنواع والواجهات المستخدمة في نظام الذكاء الاصطناعي المحسن. يوفر تعريفات TypeScript شاملة لضمان الأمان النوعي والتوافق.

## الأنواع الأساسية

### ContextAnalysisResult

```typescript
/**
 * نتيجة تحليل السياق الشاملة
 */
export interface ContextAnalysisResult {
  /** نوع المحتوى المطلوب */
  contentType: 'technical' | 'business' | 'academic' | 'creative' | 'mixed';

  /** مستوى التعقيد المطلوب */
  complexityLevel: 'basic' | 'intermediate' | 'advanced' | 'expert';

  /** الجمهور المستهدف */
  targetAudience: 'general' | 'technical' | 'executive' | 'academic' | 'student';

  /** اللغة والثقافة */
  language: 'ar' | 'en';
  culturalContext: 'middle-east' | 'western' | 'global';

  /** المتطلبات المحددة */
  specificRequirements: string[];

  /** السياق الخارجي المتاح */
  availableContext: {
    files: Array<{ name: string; type: string; relevance: number }>;
    previousSections: string[];
    guidelines: string[];
    organizedContext?: OrganizedContext;
  };

  /** التوصيات للنموذج */
  modelRecommendation: {
    primary: string;
    fallback: string;
    reasoning: string;
  };
}
```

### ModelConfig

```typescript
/**
 * تكوين النموذج المختار
 */
export interface ModelConfig {
  /** معرف النموذج */
  modelId: string;

  /** درجة الحرارة (0-1) */
  temperature: number;

  /** الحد الأقصى لعدد الرموز المخرجة */
  maxOutputTokens: number;

  /** معامل التنويع (0-1) */
  topP?: number;

  /** عدد الخيارات الأعلى */
  topK?: number;

  /** تبرير اختيار النموذج */
  reasoning: string;
}
```

### ModelSelectionCriteria

```typescript
/**
 * معايير اختيار النموذج
 */
export interface ModelSelectionCriteria {
  /** نوع المهمة */
  taskType: 'generation' | 'analysis' | 'translation' | 'improvement' | 'creative' | 'technical';

  /** تعقيد المحتوى */
  contentComplexity: 'low' | 'medium' | 'high' | 'expert';

  /** طول المخرجات المتوقع */
  outputLength: 'short' | 'medium' | 'long' | 'very_long';

  /** متطلبات الدقة */
  accuracyRequirement: 'standard' | 'high' | 'critical';

  /** متطلبات السرعة */
  speedRequirement: 'fast' | 'balanced' | 'quality_first';

  /** حجم السياق */
  contextSize: number;

  /** متطلبات اللغة */
  languageRequirement: 'ar' | 'en' | 'multilingual';
}
```

## أنواع المحفزات

### PromptTemplate

```typescript
/**
 * قالب المحفز المبني
 */
export interface PromptTemplate {
  /** System prompt محسن */
  system: string;

  /** قسم السياق والمعلومات */
  context: string;

  /** التعليمات المفصلة */
  instructions: string;

  /** الأمثلة للإرشاد (اختياري) */
  examples?: string;

  /** القيود والمحددات (اختياري) */
  constraints?: string;

  /** تنسيق المخرجات المطلوب (اختياري) */
  outputFormat?: string;
}
```

### PromptBuildingConfig

```typescript
/**
 * تكوين بناء المحفز
 */
export interface PromptBuildingConfig {
  /** نوع المهمة */
  taskType: 'generation' | 'analysis' | 'translation' | 'improvement';

  /** المجال أو التخصص */
  domain: string;

  /** نتيجة تحليل السياق */
  contextAnalysis: ContextAnalysisResult;

  /** المدخل من المستخدم */
  userInput: string;

  /** السياق الخارجي (اختياري) */
  externalContext?: Array<{ fileName: string; content: string; type: string }>;

  /** المخرجات السابقة (اختياري) */
  previousOutput?: string;

  /** رقم التكرار (اختياري) */
  iterationCount?: number;
}
```

## أنواع التحسين التكراري

### ImprovementSession

```typescript
/**
 * جلسة التحسين التكراري
 */
export interface ImprovementSession {
  /** معرف الجلسة الفريد */
  sessionId: string;

  /** المدخل الأصلي */
  originalInput: string;

  /** نتيجة تحليل السياق */
  contextAnalysis: ContextAnalysisResult;

  /** التكرارات المنفذة */
  iterations: ImprovementIteration[];

  /** المخرجات النهائية */
  finalOutput: string;

  /** نقاط التحسين الإجمالية */
  totalImprovementScore: number;

  /** حالة الجلسة */
  status: 'in_progress' | 'completed' | 'failed';

  /** الحد الأقصى للتكرارات */
  maxIterations: number;

  /** حد الجودة المطلوبة */
  qualityThreshold: number;
}
```

### ImprovementIteration

```typescript
/**
 * تكرار واحد في جلسة التحسين
 */
export interface ImprovementIteration {
  /** رقم التكرار */
  iterationNumber: number;

  /** المدخل لهذا التكرار */
  input: string;

  /** المخرجات لهذا التكرار */
  output: string;

  /** نقاط الجودة المحققة */
  qualityScore: number;

  /** المشاكل المكتشفة */
  issues: string[];

  /** التحسينات المقترحة */
  improvements: string[];

  /** النموذج المستخدم */
  modelUsed: string;

  /** وقت التنفيذ */
  timestamp: Date;
}
```

### ImprovementConfig

```typescript
/**
 * تكوين التحسين التكراري
 */
export interface ImprovementConfig {
  /** الحد الأقصى للتكرارات (افتراضي: 3) */
  maxIterations?: number;

  /** حد الجودة المطلوبة (افتراضي: 85) */
  qualityThreshold?: number;

  /** استراتيجية التحسين */
  improvementStrategy?: 'aggressive' | 'balanced' | 'conservative';

  /** مجالات التركيز */
  focusAreas?: Array<'completeness' | 'accuracy' | 'clarity' | 'structure' | 'relevance'>;

  /** السماح بتبديل النماذج (افتراضي: true) */
  allowModelSwitching?: boolean;
}
```

## أنواع تقييم الجودة

### ValidationResult

```typescript
/**
 * نتيجة التقييم الشاملة
 */
export interface ValidationResult {
  /** هل المخرجات صالحة */
  isValid: boolean;

  /** مقاييس الجودة */
  metrics: QualityMetrics;

  /** المشاكل المكتشفة */
  issues: QualityIssue[];

  /** الاقتراحات للتحسين */
  suggestions: string[];

  /** هل يحتاج تحسين */
  needsImprovement: boolean;

  /** محفز التحسين (اختياري) */
  improvementPrompt?: string;
}
```

### QualityMetrics

```typescript
/**
 * مقاييس الجودة
 */
export interface QualityMetrics {
  /** الاكتمال (0-100) */
  completeness: number;

  /** الدقة (0-100) */
  accuracy: number;

  /** الصلة (0-100) */
  relevance: number;

  /** الوضوح (0-100) */
  clarity: number;

  /** الهيكل (0-100) */
  structure: number;

  /** الإجمالي (0-100) */
  overall: number;
}
```

### QualityIssue

```typescript
/**
 * مشكلة جودة
 */
export interface QualityIssue {
  /** نوع المشكلة */
  type: 'missing_content' | 'unclear_language' | 'poor_structure' | 'irrelevant_content' | 'factual_error';

  /** شدة المشكلة */
  severity: 'low' | 'medium' | 'high' | 'critical';

  /** وصف المشكلة */
  description: string;

  /** الحل المقترح */
  suggestion: string;

  /** موقع المشكلة (اختياري) */
  location?: string;
}
```

## أنواع مراقبة الأداء

### PerformanceSession

```typescript
/**
 * جلسة مراقبة الأداء
 */
export interface PerformanceSession {
  /** معرف الجلسة الفريد */
  sessionId: string;

  /** وقت البداية */
  startTime: Date;

  /** وقت النهاية (اختياري) */
  endTime?: Date;

  /** نوع المهمة */
  taskType: string;

  /** المجال أو التخصص */
  domain: string;

  /** المدخل من المستخدم */
  userInput: string;

  /** مقاييس الأداء */
  metrics: PerformanceMetrics;

  /** تحليل السياق (اختياري) */
  contextAnalysis?: any;

  /** تكوين النموذج (اختياري) */
  modelConfig?: any;

  /** حالة الجلسة */
  status: 'running' | 'completed' | 'failed';

  /** الأخطاء المسجلة */
  errors: string[];
}
```

### PerformanceMetrics

```typescript
/**
 * مقاييس الأداء
 */
export interface PerformanceMetrics {
  /** وقت التنفيذ الإجمالي بالميلي ثانية */
  executionTime: number;

  /** وقت تحليل السياق */
  contextAnalysisTime: number;

  /** وقت اختيار النموذج */
  modelSelectionTime: number;

  /** وقت بناء المحفز */
  promptBuildingTime: number;

  /** وقت التوليد */
  generationTime: number;

  /** وقت التحقق من الجودة */
  qualityValidationTime: number;

  /** وقت التحسين التكراري (اختياري) */
  iterativeImprovementTime?: number;

  /** نقاط الجودة */
  qualityScore: number;

  /** عدد تكرارات التحسين */
  improvementIterations: number;

  /** الدقة النهائية */
  finalAccuracy: number;

  /** عدد الرموز المستخدمة */
  tokensUsed: number;

  /** عدد تبديلات النماذج */
  modelSwitches: number;

  /** استخدام الذاكرة بالميجابايت */
  memoryUsage: number;

  /** معدل النجاح */
  successRate: number;

  /** عدد الأخطاء */
  errorCount: number;

  /** هل تم استخدام الخطة الاحتياطية */
  fallbackUsed: boolean;
}
```

### PerformanceReport

```typescript
/**
 * تقرير الأداء الشامل
 */
export interface PerformanceReport {
  /** إجمالي الجلسات */
  totalSessions: number;

  /** متوسط وقت التنفيذ */
  averageExecutionTime: number;

  /** متوسط نقاط الجودة */
  averageQualityScore: number;

  /** معدل النجاح */
  successRate: number;

  /** الأخطاء الشائعة */
  mostCommonErrors: Array<{ error: string; count: number }>;

  /** اتجاهات الأداء */
  performanceTrends: Array<{ date: string; avgTime: number; avgQuality: number }>;

  /** إحصائيات استخدام النماذج */
  modelUsageStats: Array<{ model: string; usage: number; avgQuality: number }>;

  /** التوصيات */
  recommendations: string[];
}
```

## أنواع معالجة الأخطاء

### AIErrorContext

```typescript
/**
 * سياق خطأ الذكاء الاصطناعي
 */
export interface AIErrorContext {
  /** النموذج المستخدم */
  model: string;

  /** المحفز المستخدم */
  prompt: string;

  /** المدخلات */
  input: any;

  /** تحليل السياق (اختياري) */
  contextAnalysis?: ContextAnalysisResult;

  /** رقم المحاولة */
  attempt: number;

  /** الحد الأقصى للمحاولات */
  maxAttempts: number;

  /** النموذج الاحتياطي (اختياري) */
  fallbackModel?: string;
}
```

### AIErrorRecoveryStrategy

```typescript
/**
 * استراتيجية تعافي خطأ الذكاء الاصطناعي
 */
export interface AIErrorRecoveryStrategy {
  /** نوع الاستراتيجية */
  type: 'retry' | 'fallback_model' | 'simplified_prompt' | 'cached_response' | 'manual';

  /** وصف الاستراتيجية */
  description: string;

  /** الإجراء المطلوب */
  action: () => Promise<any>;

  /** مستوى الثقة (0-1) */
  confidence: number;
}
```

## أنواع تنظيم السياقات

### ContextItem

```typescript
/**
 * عنصر سياق واحد
 */
export interface ContextItem {
  /** اسم الملف */
  fileName: string;

  /** محتوى السياق */
  content: string;

  /** نوع السياق */
  type: ContextType;

  /** صلة السياق (اختياري) */
  relevance?: number;

  /** مستوى المعرفة (اختياري) */
  knowledgeLevel?: KnowledgeLevel;

  /** أولوية السياق (اختياري) */
  priority?: ContextPriority;

  /** بيانات إضافية (اختياري) */
  metadata?: {
    wordCount?: number;
    complexity?: 'low' | 'medium' | 'high';
    domain?: string;
    language?: 'ar' | 'en';
  };
}
```

### OrganizedContext

```typescript
/**
 * السياقات المنظمة
 */
export interface OrganizedContext {
  /** السياقات الأساسية (الأولوية العالية) */
  foundational: ContextItem[];

  /** السياقات المفاهيمية (الأولوية المتوسطة) */
  conceptual: ContextItem[];

  /** السياقات الإجرائية (الأولوية المتوسطة) */
  procedural: ContextItem[];

  /** السياقات المرجعية (الأولوية المنخفضة) */
  reference: ContextItem[];

  /** السياقات الإرشادية (أولوية خاصة) */
  guidelines: ContextItem[];

  /** إحصائيات التنظيم */
  statistics: {
    totalItems: number;
    byType: Record<ContextType, number>;
    byPriority: Record<ContextPriority, number>;
    averageRelevance: number;
  };
}
```

## الأنواع المساعدة

### ContextType

```typescript
/**
 * أنواع السياق المختلفة
 */
export type ContextType = 'context' | 'example' | 'question' | 'textbook' | 'guidelines';
```

### KnowledgeLevel

```typescript
/**
 * مستويات المعرفة
 */
export type KnowledgeLevel = 'foundational' | 'conceptual' | 'procedural' | 'metacognitive';
```

### ContextPriority

```typescript
/**
 * أولويات السياق
 */
export type ContextPriority = 'critical' | 'important' | 'supporting' | 'reference';
```

### TaskType

```typescript
/**
 * أنواع المهام المدعومة
 */
export type TaskType = 'generation' | 'analysis' | 'translation' | 'improvement' | 'creative' | 'technical';
```

### ContentType

```typescript
/**
 * أنواع المحتوى
 */
export type ContentType = 'technical' | 'business' | 'academic' | 'creative' | 'mixed';
```

### ComplexityLevel

```typescript
/**
 * مستويات التعقيد
 */
export type ComplexityLevel = 'basic' | 'intermediate' | 'advanced' | 'expert';
```

### TargetAudience

```typescript
/**
 * الجماهير المستهدفة
 */
export type TargetAudience = 'general' | 'technical' | 'executive' | 'academic' | 'student';
```

### Language

```typescript
/**
 * اللغات المدعومة
 */
export type Language = 'ar' | 'en';
```

### CulturalContext

```typescript
/**
 * السياقات الثقافية
 */
export type CulturalContext = 'middle-east' | 'western' | 'global';
```

### ErrorSeverity

```typescript
/**
 * شدة الأخطاء
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
```

### ImprovementStrategy

```typescript
/**
 * استراتيجيات التحسين
 */
export type ImprovementStrategy = 'aggressive' | 'balanced' | 'conservative';
```

### FocusArea

```typescript
/**
 * مجالات التركيز
 */
export type FocusArea = 'completeness' | 'accuracy' | 'clarity' | 'structure' | 'relevance';
```

### QualityIssueType

```typescript
/**
 * أنواع مشاكل الجودة
 */
export type QualityIssueType = 'missing_content' | 'unclear_language' | 'poor_structure' | 'irrelevant_content' | 'factual_error';
```

### RecoveryStrategyType

```typescript
/**
 * أنواع استراتيجيات التعافي
 */
export type RecoveryStrategyType = 'retry' | 'fallback_model' | 'simplified_prompt' | 'cached_response' | 'manual';
```

## أمثلة الاستخدام

### 1. استخدام الأنواع الأساسية

```typescript
import { ContextAnalysisResult, ModelConfig, ModelSelectionCriteria } from '@/ai/core';

// تحليل السياق
const analysis: ContextAnalysisResult = {
  contentType: 'technical',
  complexityLevel: 'advanced',
  targetAudience: 'technical',
  language: 'ar',
  culturalContext: 'middle-east',
  specificRequirements: ['يجب أن يكون النظام آمناً'],
  availableContext: {
    files: [],
    previousSections: [],
    guidelines: []
  },
  modelRecommendation: {
    primary: 'googleai/gemini-1.5-pro',
    fallback: 'googleai/gemini-2.0-flash',
    reasoning: 'Complex technical content requires advanced reasoning capabilities'
  }
};

// تكوين النموذج
const modelConfig: ModelConfig = {
  modelId: 'googleai/gemini-1.5-pro',
  temperature: 0.3,
  maxOutputTokens: 8192,
  topP: 0.8,
  topK: 20,
  reasoning: 'تم اختيار النموذج للأسباب التالية: دقة عالية مطلوبة'
};

// معايير الاختيار
const criteria: ModelSelectionCriteria = {
  taskType: 'generation',
  contentComplexity: 'high',
  outputLength: 'long',
  accuracyRequirement: 'critical',
  speedRequirement: 'quality_first',
  contextSize: 5000,
  languageRequirement: 'ar'
};
```

### 2. استخدام أنواع المحفزات

```typescript
import { PromptTemplate, PromptBuildingConfig } from '@/ai/core';

// قالب المحفز
const promptTemplate: PromptTemplate = {
  system: 'أنت خبير متخصص في software_engineering...',
  context: '--- السياق والمعلومات المتاحة ---\n...',
  instructions: '--- التعليمات المفصلة ---\n...',
  examples: '--- أمثلة للإرشاد ---\n...',
  constraints: '--- القيود والمحددات ---\n...',
  outputFormat: '--- تنسيق المخرجات المطلوب ---\n...'
};

// تكوين بناء المحفز
const promptConfig: PromptBuildingConfig = {
  taskType: 'generation',
  domain: 'software_engineering',
  contextAnalysis: analysis,
  userInput: 'أنشئ نظام إدارة قاعدة بيانات',
  externalContext: [
    {
      fileName: 'requirements.txt',
      content: 'متطلبات المشروع...',
      type: 'context'
    }
  ],
  previousOutput: 'مخرجات سابقة...',
  iterationCount: 2
};
```

### 3. استخدام أنواع التحسين التكراري

```typescript
import { ImprovementSession, ImprovementIteration, ImprovementConfig } from '@/ai/core';

// تكرار التحسين
const iteration: ImprovementIteration = {
  iterationNumber: 1,
  input: 'أنشئ نظام إدارة قاعدة بيانات',
  output: 'نظام إدارة قاعدة بيانات بسيط...',
  qualityScore: 75,
  issues: ['محتوى غير مكتمل', 'يحتاج المزيد من التفاصيل'],
  improvements: ['أضف المزيد من التفاصيل', 'حسن الهيكل'],
  modelUsed: 'googleai/gemini-1.5-pro',
  timestamp: new Date()
};

// تكوين التحسين
const improvementConfig: ImprovementConfig = {
  maxIterations: 3,
  qualityThreshold: 85,
  improvementStrategy: 'balanced',
  focusAreas: ['completeness', 'accuracy', 'structure'],
  allowModelSwitching: true
};

// جلسة التحسين
const session: ImprovementSession = {
  sessionId: 'session_1234567890_abc123',
  originalInput: 'أنشئ نظام إدارة قاعدة بيانات',
  contextAnalysis: analysis,
  iterations: [iteration],
  finalOutput: 'نظام إدارة قاعدة بيانات محسن...',
  totalImprovementScore: 15,
  status: 'completed',
  maxIterations: 3,
  qualityThreshold: 85
};
```

### 4. استخدام أنواع تقييم الجودة

```typescript
import { ValidationResult, QualityMetrics, QualityIssue } from '@/ai/core';

// مقاييس الجودة
const metrics: QualityMetrics = {
  completeness: 80,
  accuracy: 90,
  relevance: 85,
  clarity: 75,
  structure: 70,
  overall: 80
};

// مشكلة الجودة
const issue: QualityIssue = {
  type: 'missing_content',
  severity: 'high',
  description: 'المحتوى يفتقر للتفاصيل المطلوبة',
  suggestion: 'أضف المزيد من التفاصيل لتغطية جميع جوانب الموضوع',
  location: 'القسم الثاني'
};

// نتيجة التقييم
const validation: ValidationResult = {
  isValid: true,
  metrics: metrics,
  issues: [issue],
  suggestions: ['أضف المزيد من التفاصيل', 'حسن الهيكل'],
  needsImprovement: true,
  improvementPrompt: 'يرجى تحسين المحتوى التالي...'
};
```

### 5. استخدام أنواع مراقبة الأداء

```typescript
import { PerformanceSession, PerformanceMetrics, PerformanceReport } from '@/ai/core';

// مقاييس الأداء
const metrics: PerformanceMetrics = {
  executionTime: 5000,
  contextAnalysisTime: 1000,
  modelSelectionTime: 200,
  promptBuildingTime: 800,
  generationTime: 2500,
  qualityValidationTime: 500,
  qualityScore: 85,
  improvementIterations: 2,
  finalAccuracy: 87,
  tokensUsed: 1500,
  modelSwitches: 1,
  memoryUsage: 256,
  successRate: 100,
  errorCount: 0,
  fallbackUsed: false
};

// جلسة الأداء
const session: PerformanceSession = {
  sessionId: 'perf_1234567890_abc123',
  startTime: new Date(),
  endTime: new Date(),
  taskType: 'generation',
  domain: 'business',
  userInput: 'أنشئ خطة عمل',
  metrics: metrics,
  contextAnalysis: analysis,
  modelConfig: modelConfig,
  status: 'completed',
  errors: []
};

// تقرير الأداء
const report: PerformanceReport = {
  totalSessions: 100,
  averageExecutionTime: 4500,
  averageQualityScore: 82,
  successRate: 95,
  mostCommonErrors: [
    { error: 'timeout', count: 5 },
    { error: 'rate_limit', count: 3 }
  ],
  performanceTrends: [
    { date: '2024-01-01', avgTime: 4000, avgQuality: 80 },
    { date: '2024-01-02', avgTime: 4500, avgQuality: 82 }
  ],
  modelUsageStats: [
    { model: 'googleai/gemini-1.5-pro', usage: 60, avgQuality: 85 },
    { model: 'googleai/gemini-2.0-flash', usage: 40, avgQuality: 78 }
  ],
  recommendations: [
    'الأداء جيد - استمر في المراقبة',
    'راجع النماذج المستخدمة'
  ]
};
```

## أفضل الممارسات

### 1. استخدام الأنواع الصحيحة

```typescript
// ✅ جيد - استخدام الأنواع الصحيحة
const analysis: ContextAnalysisResult = {
  contentType: 'technical', // نوع صحيح
  complexityLevel: 'advanced', // مستوى صحيح
  targetAudience: 'technical', // جمهور صحيح
  language: 'ar', // لغة صحيحة
  culturalContext: 'middle-east', // سياق صحيح
  specificRequirements: ['متطلب 1', 'متطلب 2'],
  availableContext: {
    files: [],
    previousSections: [],
    guidelines: []
  },
  modelRecommendation: {
    primary: 'googleai/gemini-1.5-pro',
    fallback: 'googleai/gemini-2.0-flash',
    reasoning: 'سبب الاختيار'
  }
};

// ❌ سيء - استخدام أنواع خاطئة
const analysis = {
  contentType: 'invalid_type', // نوع غير صحيح
  complexityLevel: 'wrong_level', // مستوى غير صحيح
  // ... باقي الخصائص
};
```

### 2. التحقق من صحة البيانات

```typescript
// ✅ جيد - التحقق من صحة البيانات
function validateContextAnalysis(analysis: ContextAnalysisResult): boolean {
  if (!analysis.contentType || !['technical', 'business', 'academic', 'creative', 'mixed'].includes(analysis.contentType)) {
    return false;
  }

  if (!analysis.complexityLevel || !['basic', 'intermediate', 'advanced', 'expert'].includes(analysis.complexityLevel)) {
    return false;
  }

  if (!analysis.targetAudience || !['general', 'technical', 'executive', 'academic', 'student'].includes(analysis.targetAudience)) {
    return false;
  }

  return true;
}
```

### 3. استخدام الأنواع الاختيارية

```typescript
// ✅ جيد - استخدام الأنواع الاختيارية
const contextItem: ContextItem = {
  fileName: 'file.txt',
  content: 'محتوى الملف',
  type: 'context',
  relevance: 0.8, // اختياري
  knowledgeLevel: 'foundational', // اختياري
  priority: 'important', // اختياري
  metadata: { // اختياري
    wordCount: 100,
    complexity: 'medium',
    domain: 'software',
    language: 'ar'
  }
};
```

## التطوير المستقبلي

### 1. إضافة أنواع جديدة
- أنواع للمهام الجديدة
- أنواع للسياقات الإضافية
- أنواع للمقاييس الجديدة

### 2. تحسين الأنواع الموجودة
- إضافة خصائص جديدة
- تحسين التحقق من الصحة
- إضافة أنواع فرعية

---

**آخر تحديث**: 2024
**الإصدار**: 1.0
**المكون**: Types and Interfaces
