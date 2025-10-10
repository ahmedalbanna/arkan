# Contributing Guide - دليل المساهمة

## نظرة عامة

هذا الملف يحتوي على دليل شامل للمساهمة في تطوير نظام الذكاء الاصطناعي المحسن. يوفر إرشادات واضحة للمطورين الذين يريدون المساهمة في المشروع.

## كيفية المساهمة

### 1. إعداد البيئة

#### متطلبات النظام

```bash
# Node.js 18+
node --version

# npm 9+
npm --version

# Git
git --version

# Firebase CLI
firebase --version
```

#### إعداد المشروع

```bash
# استنساخ المشروع
git clone https://github.com/your-org/arkan.git
cd arkan

# تثبيت التبعيات
npm install

# إعداد متغيرات البيئة
cp .env.example .env.local

# تشغيل الخادم المحلي
npm run dev

# تشغيل Genkit
npm run genkit:dev
```

#### إعداد متغيرات البيئة

```bash
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Genkit
FIREBASE_PROJECT_ID=your_project_id
GOOGLE_APPLICATION_CREDENTIALS=path_to_credentials.json
```

### 2. هيكل المشروع

```
src/ai/core/
├── README.md                    # نظرة عامة على النظام
├── index.ts                     # الواجهة الموحدة
├── types.ts                     # الأنواع والواجهات
├── context-analyzer.ts          # محلل السياق
├── adaptive-model-selector.ts   # اختيار النماذج التكيفي
├── intelligent-prompt-builder.ts # بناء المحفزات الذكي
├── iterative-improvement-engine.ts # محرك التحسين التكراري
├── output-quality-validator.ts   # مدقق جودة المخرجات
├── performance-monitor.ts       # مراقب الأداء
├── ai-error-handler.ts          # معالج أخطاء الذكاء الاصطناعي
├── context-organizer.ts         # منظم السياقات
├── usage-examples.md            # أمثلة الاستخدام
├── best-practices.md            # أفضل الممارسات
├── troubleshooting.md           # دليل استكشاف الأخطاء
└── contributing.md              # دليل المساهمة
```

### 3. معايير الكود

#### معايير TypeScript

```typescript
// ✅ جيد - استخدام interfaces للكائنات المعقدة
interface UserData {
  id: string;
  name: string;
  email: string;
  preferences?: UserPreferences;
}

// ✅ جيد - استخدام JSDoc للدوال العامة
/**
 * إنشاء مستخدم جديد في النظام
 * @param userData - بيانات المستخدم
 * @param options - خيارات إضافية
 * @returns Promise<User> - المستخدم المنشأ
 * @throws {ValidationError} عند فشل التحقق من صحة البيانات
 * @example
 * ```typescript
 * const user = await createUser({
 *   name: 'أحمد',
 *   email: 'ahmed@example.com'
 * });
 * ```
 */
export async function createUser(
  userData: CreateUserData,
  options?: CreateUserOptions
): Promise<User> {
  // تنفيذ الدالة
}

// ❌ سيء - استخدام any
const data: any = { ... };

// ❌ سيء - بدون JSDoc
export function processData(data: any) {
  // تنفيذ الدالة
}
```

#### معايير React

```typescript
// ✅ جيد - مكون React مع TypeScript
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
  const handleClick = useCallback(() => {
    onAction();
  }, [onAction]);

  return (
    <div className="component-wrapper">
      <h2>{title}</h2>
      <button onClick={handleClick} className={`btn btn-${variant}`}>
        تنفيذ
      </button>
    </div>
  );
};

// ❌ سيء - مكون بدون TypeScript
export function Component(props) {
  return <div>{props.title}</div>;
}
```

#### معايير الاختبار

```typescript
// ✅ جيد - اختبار شامل
import { render, screen, fireEvent } from '@testing-library/react';
import { Component } from '../Component';

describe('Component', () => {
  test('renders correctly with required props', () => {
    render(<Component title="Test" onAction={() => {}} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  test('calls onAction when button is clicked', () => {
    const mockAction = jest.fn();
    render(<Component title="Test" onAction={mockAction} />);

    fireEvent.click(screen.getByRole('button'));
    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  test('applies correct variant class', () => {
    render(<Component title="Test" onAction={() => {}} variant="secondary" />);
    expect(screen.getByRole('button')).toHaveClass('btn-secondary');
  });
});

// ❌ سيء - اختبار غير شامل
test('component works', () => {
  render(<Component title="Test" onAction={() => {}} />);
  expect(screen.getByText('Test')).toBeInTheDocument();
});
```

### 4. إضافة مكونات جديدة

#### إضافة مكون جديد

```typescript
// src/ai/core/new-component.ts
import { z } from 'zod';

// تعريف الأنواع
export interface NewComponentConfig {
  option1: string;
  option2?: number;
  option3?: boolean;
}

export interface NewComponentResult {
  output: string;
  metrics: {
    metric1: number;
    metric2: number;
  };
}

// مخطط التحقق
const NewComponentConfigSchema = z.object({
  option1: z.string().min(1),
  option2: z.number().optional(),
  option3: z.boolean().optional()
});

const NewComponentResultSchema = z.object({
  output: z.string().min(1),
  metrics: z.object({
    metric1: z.number().min(0).max(100),
    metric2: z.number().min(0).max(100)
  })
});

// المكون الرئيسي
export class NewComponent {
  /**
   * تنفيذ المكون الجديد
   * @param input - المدخلات
   * @param config - التكوين
   * @returns Promise<NewComponentResult> - النتيجة
   */
  static async execute(
    input: string,
    config: NewComponentConfig
  ): Promise<NewComponentResult> {
    try {
      // التحقق من صحة التكوين
      const validatedConfig = NewComponentConfigSchema.parse(config);

      // تنفيذ المنطق
      const result = await this.processInput(input, validatedConfig);

      // التحقق من صحة النتيجة
      const validatedResult = NewComponentResultSchema.parse(result);

      return validatedResult;
    } catch (error) {
      console.error('خطأ في NewComponent:', error);
      throw error;
    }
  }

  /**
   * معالجة المدخلات
   * @param input - المدخلات
   * @param config - التكوين
   * @returns Promise<NewComponentResult> - النتيجة
   */
  private static async processInput(
    input: string,
    config: NewComponentConfig
  ): Promise<NewComponentResult> {
    // تنفيذ المنطق المحدد
    const output = `معالجة: ${input}`;

    return {
      output,
      metrics: {
        metric1: 85,
        metric2: 90
      }
    };
  }
}
```

#### إضافة المكون إلى الواجهة الموحدة

```typescript
// src/ai/core/index.ts
import { NewComponent } from './new-component';

// تصدير المكون الجديد
export { NewComponent };

// إضافة إلى IntelligentAISystem
export class IntelligentAISystem {
  // ... الكود الموجود

  /**
   * استخدام المكون الجديد
   * @param input - المدخلات
   * @param config - التكوين
   * @returns Promise<NewComponentResult> - النتيجة
   */
  static async useNewComponent(
    input: string,
    config: NewComponentConfig
  ): Promise<NewComponentResult> {
    return await NewComponent.execute(input, config);
  }
}
```

#### إضافة اختبارات للمكون الجديد

```typescript
// src/ai/core/__tests__/new-component.test.ts
import { NewComponent } from '../new-component';

describe('NewComponent', () => {
  test('should execute successfully with valid input', async () => {
    const result = await NewComponent.execute('test input', {
      option1: 'value1'
    });

    expect(result.output).toBe('معالجة: test input');
    expect(result.metrics.metric1).toBe(85);
    expect(result.metrics.metric2).toBe(90);
  });

  test('should throw error with invalid config', async () => {
    await expect(
      NewComponent.execute('test input', {
        option1: '' // قيمة فارغة
      })
    ).rejects.toThrow();
  });

  test('should handle optional options', async () => {
    const result = await NewComponent.execute('test input', {
      option1: 'value1',
      option2: 42,
      option3: true
    });

    expect(result.output).toBe('معالجة: test input');
  });
});
```

### 5. تحسين المكونات الموجودة

#### تحسين الأداء

```typescript
// تحسين الأداء
export class ImprovedComponent {
  // استخدام التخزين المؤقت
  private static cache = new Map<string, any>();

  static async execute(input: string, config: any): Promise<any> {
    // التحقق من التخزين المؤقت
    const cacheKey = `${input}-${JSON.stringify(config)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // تنفيذ المنطق
    const result = await this.processInput(input, config);

    // حفظ في التخزين المؤقت
    this.cache.set(cacheKey, result);

    return result;
  }

  // مسح التخزين المؤقت
  static clearCache(): void {
    this.cache.clear();
  }
}
```

#### تحسين معالجة الأخطاء

```typescript
// تحسين معالجة الأخطاء
export class ImprovedComponent {
  static async execute(input: string, config: any): Promise<any> {
    try {
      return await this.processInput(input, config);
    } catch (error) {
      // تسجيل الخطأ
      console.error('خطأ في ImprovedComponent:', error);

      // معالجة الخطأ حسب النوع
      if (error instanceof ValidationError) {
        throw new Error('خطأ في التحقق من صحة البيانات');
      } else if (error instanceof NetworkError) {
        throw new Error('خطأ في الشبكة');
      } else {
        throw new Error('خطأ غير معروف');
      }
    }
  }
}
```

#### تحسين التوثيق

```typescript
// تحسين التوثيق
export class ImprovedComponent {
  /**
   * تنفيذ المكون المحسن
   *
   * هذا المكون يقوم بمعالجة المدخلات وتحسينها باستخدام خوارزميات متقدمة.
   * يدعم التخزين المؤقت ومعالجة الأخطاء الشاملة.
   *
   * @param input - المدخلات المراد معالجتها
   * @param config - تكوين المكون
   * @param options - خيارات إضافية
   * @returns Promise<ImprovedResult> - النتيجة المحسنة
   *
   * @throws {ValidationError} عند فشل التحقق من صحة المدخلات
   * @throws {ProcessingError} عند فشل معالجة المدخلات
   *
   * @example
   * ```typescript
   * const result = await ImprovedComponent.execute(
   *   'نص المراد معالجته',
   *   { option1: 'value1' },
   *   { enableCache: true }
   * );
   * console.log(result.output);
   * ```
   *
   * @since 1.0.0
   * @version 1.1.0
   */
  static async execute(
    input: string,
    config: any,
    options?: any
  ): Promise<ImprovedResult> {
    // تنفيذ المنطق
  }
}
```

### 6. إضافة أنواع جديدة

#### إضافة أنواع جديدة

```typescript
// src/ai/core/types.ts
import { z } from 'zod';

// أنواع جديدة
export interface NewType {
  property1: string;
  property2: number;
  property3?: boolean;
  property4?: string[];
}

export interface NewConfig {
  option1: string;
  option2?: number;
  option3?: boolean;
  metadata?: {
    version: string;
    author: string;
    createdAt: Date;
  };
}

// مخططات التحقق
export const NewTypeSchema = z.object({
  property1: z.string().min(1),
  property2: z.number().min(0),
  property3: z.boolean().optional(),
  property4: z.array(z.string()).optional()
});

export const NewConfigSchema = z.object({
  option1: z.string().min(1),
  option2: z.number().optional(),
  option3: z.boolean().optional(),
  metadata: z.object({
    version: z.string(),
    author: z.string(),
    createdAt: z.date()
  }).optional()
});

// أنواع مساعدة
export type NewTypeInput = z.infer<typeof NewTypeSchema>;
export type NewConfigInput = z.infer<typeof NewConfigSchema>;
```

### 7. إضافة اختبارات جديدة

#### إضافة اختبارات شاملة

```typescript
// src/ai/core/__tests__/comprehensive.test.ts
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Component } from '../Component';

describe('Component Comprehensive Tests', () => {
  // اختبارات الوظائف الأساسية
  describe('Basic Functionality', () => {
    test('renders with required props', () => {
      render(<Component title="Test" onAction={() => {}} />);
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    test('calls onAction when clicked', () => {
      const mockAction = jest.fn();
      render(<Component title="Test" onAction={mockAction} />);

      fireEvent.click(screen.getByRole('button'));
      expect(mockAction).toHaveBeenCalledTimes(1);
    });
  });

  // اختبارات الحالات الحدية
  describe('Edge Cases', () => {
    test('handles empty title', () => {
      render(<Component title="" onAction={() => {}} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('handles very long title', () => {
      const longTitle = 'A'.repeat(1000);
      render(<Component title={longTitle} onAction={() => {}} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });
  });

  // اختبارات الأخطاء
  describe('Error Handling', () => {
    test('handles onAction errors', () => {
      const errorAction = () => {
        throw new Error('Test error');
      };

      render(<Component title="Test" onAction={errorAction} />);

      expect(() => {
        fireEvent.click(screen.getByRole('button'));
      }).toThrow('Test error');
    });
  });

  // اختبارات الأداء
  describe('Performance', () => {
    test('renders quickly', () => {
      const start = performance.now();
      render(<Component title="Test" onAction={() => {}} />);
      const end = performance.now();

      expect(end - start).toBeLessThan(100); // أقل من 100ms
    });
  });
});
```

### 8. إضافة توثيق جديد

#### إضافة توثيق للمكون الجديد

```markdown
# New Component - المكون الجديد

## نظرة عامة

المكون الجديد يوفر وظائف متقدمة لمعالجة البيانات وتحسينها.

## الميزات

- معالجة البيانات المتقدمة
- دعم التخزين المؤقت
- معالجة شاملة للأخطاء
- واجهة سهلة الاستخدام

## الاستخدام

### الاستخدام الأساسي

```typescript
import { NewComponent } from '@/ai/core';

const result = await NewComponent.execute('input data', {
  option1: 'value1',
  option2: 42
});

console.log(result.output);
```

### الاستخدام المتقدم

```typescript
const result = await NewComponent.execute('input data', {
  option1: 'value1',
  option2: 42,
  option3: true
}, {
  enableCache: true,
  timeout: 5000
});
```

## API Reference

### NewComponent.execute()

تنفيذ المكون الجديد.

**المعاملات:**
- `input: string` - المدخلات المراد معالجتها
- `config: NewComponentConfig` - تكوين المكون
- `options?: NewComponentOptions` - خيارات إضافية

**الإرجاع:**
- `Promise<NewComponentResult>` - النتيجة

**الأخطاء:**
- `ValidationError` - عند فشل التحقق من صحة البيانات
- `ProcessingError` - عند فشل معالجة البيانات

## أمثلة

### مثال 1: معالجة نص

```typescript
const result = await NewComponent.execute('Hello World', {
  option1: 'text_processing'
});

console.log(result.output); // "Processed: Hello World"
```

### مثال 2: معالجة بيانات

```typescript
const result = await NewComponent.execute('{"name": "John"}', {
  option1: 'json_processing',
  option2: 100
});

console.log(result.metrics.metric1); // 85
```

## أفضل الممارسات

1. استخدم التكوين المناسب للمهمة
2. تعامل مع الأخطاء بشكل صحيح
3. استخدم التخزين المؤقت للأداء
4. راقب الأداء بانتظام

## استكشاف الأخطاء

### مشكلة: بطء في التنفيذ

**الحل:**
```typescript
const result = await NewComponent.execute(input, config, {
  enableCache: true,
  timeout: 10000
});
```

### مشكلة: أخطاء في التحقق

**الحل:**
```typescript
try {
  const result = await NewComponent.execute(input, config);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('خطأ في التحقق:', error.message);
  }
}
```
```

### 9. إضافة أمثلة جديدة

#### إضافة أمثلة شاملة

```typescript
// src/ai/core/examples/new-component-examples.ts
import { NewComponent } from '../new-component';

/**
 * أمثلة شاملة لاستخدام المكون الجديد
 */
export class NewComponentExamples {
  /**
   * مثال أساسي لاستخدام المكون
   */
  static async basicExample(): Promise<void> {
    console.log('=== مثال أساسي ===');

    const result = await NewComponent.execute('Hello World', {
      option1: 'basic_processing'
    });

    console.log('النتيجة:', result.output);
    console.log('المقاييس:', result.metrics);
  }

  /**
   * مثال متقدم لاستخدام المكون
   */
  static async advancedExample(): Promise<void> {
    console.log('=== مثال متقدم ===');

    const result = await NewComponent.execute('Advanced Data', {
      option1: 'advanced_processing',
      option2: 100,
      option3: true
    });

    console.log('النتيجة:', result.output);
    console.log('المقاييس:', result.metrics);
  }

  /**
   * مثال معالجة الأخطاء
   */
  static async errorHandlingExample(): Promise<void> {
    console.log('=== مثال معالجة الأخطاء ===');

    try {
      const result = await NewComponent.execute('', {
        option1: '' // قيمة فارغة
      });
    } catch (error) {
      console.error('خطأ:', error.message);
    }
  }

  /**
   * مثال الأداء
   */
  static async performanceExample(): Promise<void> {
    console.log('=== مثال الأداء ===');

    const start = performance.now();

    const result = await NewComponent.execute('Performance Test', {
      option1: 'performance_processing'
    });

    const end = performance.now();

    console.log('النتيجة:', result.output);
    console.log('وقت التنفيذ:', end - start, 'ms');
  }

  /**
   * تشغيل جميع الأمثلة
   */
  static async runAllExamples(): Promise<void> {
    console.log('تشغيل جميع أمثلة المكون الجديد...\n');

    await this.basicExample();
    console.log('\n');

    await this.advancedExample();
    console.log('\n');

    await this.errorHandlingExample();
    console.log('\n');

    await this.performanceExample();

    console.log('\nتم تشغيل جميع الأمثلة بنجاح!');
  }
}
```

### 10. إضافة اختبارات الأداء

#### إضافة اختبارات الأداء

```typescript
// src/ai/core/__tests__/performance.test.ts
import { NewComponent } from '../new-component';

describe('NewComponent Performance Tests', () => {
  test('should execute within acceptable time', async () => {
    const start = performance.now();

    await NewComponent.execute('Performance Test', {
      option1: 'performance_processing'
    });

    const end = performance.now();
    const executionTime = end - start;

    expect(executionTime).toBeLessThan(1000); // أقل من ثانية
  });

  test('should handle large inputs efficiently', async () => {
    const largeInput = 'A'.repeat(10000);

    const start = performance.now();

    const result = await NewComponent.execute(largeInput, {
      option1: 'large_input_processing'
    });

    const end = performance.now();
    const executionTime = end - start;

    expect(executionTime).toBeLessThan(2000); // أقل من ثانيتين
    expect(result.output).toBeDefined();
  });

  test('should maintain performance under load', async () => {
    const promises = [];

    for (let i = 0; i < 10; i++) {
      promises.push(
        NewComponent.execute(`Load Test ${i}`, {
          option1: 'load_test_processing'
        })
      );
    }

    const start = performance.now();

    const results = await Promise.all(promises);

    const end = performance.now();
    const executionTime = end - start;

    expect(executionTime).toBeLessThan(5000); // أقل من 5 ثوان
    expect(results).toHaveLength(10);
  });
});
```

## عملية المراجعة

### 1. إنشاء Pull Request

```bash
# إنشاء فرع جديد
git checkout -b feature/new-component

# إضافة التغييرات
git add .

# عمل commit
git commit -m "feat: add new component with comprehensive functionality"

# دفع الفرع
git push origin feature/new-component

# إنشاء Pull Request
```

### 2. معايير المراجعة

#### معايير الكود

- [ ] الكود يتبع معايير TypeScript
- [ ] الكود يتبع معايير React
- [ ] الكود يحتوي على JSDoc مناسب
- [ ] الكود يتبع معايير المشروع
- [ ] الكود قابل للقراءة والفهم

#### معايير الاختبار

- [ ] الاختبارات تغطي الوظائف الأساسية
- [ ] الاختبارات تغطي الحالات الحدية
- [ ] الاختبارات تغطي معالجة الأخطاء
- [ ] الاختبارات تغطي الأداء
- [ ] معدل التغطية > 80%

#### معايير التوثيق

- [ ] التوثيق شامل وواضح
- [ ] أمثلة الاستخدام صحيحة
- [ ] API Reference مكتمل
- [ ] أفضل الممارسات موثقة
- [ ] استكشاف الأخطاء موثق

#### معايير الأداء

- [ ] الأداء مقبول للمهام العادية
- [ ] الأداء مقبول للمهام الكبيرة
- [ ] الأداء مقبول تحت الحمل
- [ ] لا توجد تسريبات في الذاكرة
- [ ] الاستجابة سريعة

### 3. عملية الدمج

```bash
# مراجعة الكود
npm run lint
npm run typecheck
npm test

# اختبار الأداء
npm run test:performance

# اختبار التكامل
npm run test:integration

# دمج التغييرات
git checkout main
git merge feature/new-component
git push origin main
```

## المساهمة في التوثيق

### 1. تحديث README

```markdown
# تحديث README.md

## إضافة مكون جديد

تم إضافة مكون جديد يوفر وظائف متقدمة:

- معالجة البيانات المتقدمة
- دعم التخزين المؤقت
- معالجة شاملة للأخطاء

## الاستخدام

```typescript
import { NewComponent } from '@/ai/core';

const result = await NewComponent.execute('input', {
  option1: 'value1'
});
```
```

### 2. تحديث التوثيق التقني

```markdown
# تحديث التوثيق التقني

## المكونات الجديدة

### NewComponent

مكون جديد يوفر وظائف متقدمة لمعالجة البيانات.

**الميزات:**
- معالجة البيانات المتقدمة
- دعم التخزين المؤقت
- معالجة شاملة للأخطاء

**الاستخدام:**
```typescript
const result = await NewComponent.execute(input, config);
```
```

### 3. تحديث أمثلة الاستخدام

```typescript
// إضافة مثال جديد
export const newComponentExample = async () => {
  const result = await NewComponent.execute('example input', {
    option1: 'example_value'
  });

  console.log('النتيجة:', result.output);
};
```

## الخلاصة

هذا الدليل يوفر إرشادات شاملة للمساهمة في تطوير نظام الذكاء الاصطناعي المحسن. يجب اتباعه لضمان جودة الكود والمساهمة الفعالة.

**نصائح مهمة:**
1. اتبع معايير الكود
2. اكتب اختبارات شاملة
3. وثق الكود بشكل صحيح
4. اختبر الأداء
5. راجع الكود قبل الدمج

---

**آخر تحديث**: 2024
**الإصدار**: 1.0
**المكون**: Contributing Guide
