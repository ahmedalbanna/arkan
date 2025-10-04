# 🧪 Test Suite Documentation - Arkan/Docudec

## نظرة عامة على الاختبارات

تقوم مجموعة الاختبارات الشاملة بتغطية جميع مكونات المشروع الأساسية لضمان الأداء العالي والموثوقية والأمان في تطبيق Arkan/docudec.

## 📁 هيكل الاختبارات

```
__tests__/
├── models/                  # اختبارات النماذج الأساسية
│   ├── project.test.ts     # نموذج المشروع
│   └── template.test.ts    # النماذج والقوالب
├── hooks/                  # اختبارات Hooks الأساسية
│   └── core-hooks.test.ts  # Core & Enhanced Hooks
├── lib/                    # اختبارات المكتبات والأدوات
│   ├── ast-utils.test.ts   # معالجة AST
│   ├── pptx-renderer.test.ts # تصيير العروض التقديمية
│   ├── slide-layout-engine.test.ts # تخطيط الشرائح
│   ├── text-measurement.test.ts # قياس النصوص
│   └── utils.test.ts       # الأدوات المساعدة
├── ai/                     # اختبارات الذكاء الاصطناعي
│   └── flows.test.ts       # تدفقات AI الأساسية
├── components/             # اختبارات المكونات
│   └── ui.test.tsx        # مكونات الواجهة الأساسية
├── security/              # اختبارات الأمان
│   └── auth.test.ts       # المصادقة والأمان
├── integration/           # الاختبارات التكاملية
│   └── project-flow.test.ts # تدفقات المشاريع الأساسية
├── helpers/               # مساعدات الاختبار
│   └── test-helpers.ts    # أدوات ومساعدات عامة
└── README.md              # هذا الملف
```

## 🚀 تشغيل الاختبارات

### تشغيل جميع الاختبارات
```bash
npm test
```

### تشغيل اختبارات محددة
```bash
# اختبارات النماذج فقط
npm test models/

# اختبارات الذكاء الاصطناعي
npm test ai/

# اختبارات الأمان
npm test security/
```

### تشغيل الاختبارات مع التغطية
```bash
npm test -- --coverage
```

### وضع المراقبة (Watch Mode)
```bash
npm run test:watch
```

### اختبارات التكامل والـ E2E
```bash
npm run test:integration
npm run test:e2e
```

## 🔧 إعداد بيئة الاختبار

### المتطلبات الأساسية
- Node.js >= 18
- Jest >= 29
- React Testing Library
- TypeScript

### إعدادات Jest
يتم تكوين Jest في `jest.config.js` مع الإعدادات التالية:
- دعم TypeScript كامل
- بيئة jsdom للمكونات
- Mocking للمكتبات الخارجية
- تكوين التغطية الشاملة

### Mocking المتقدم
```typescript
// إعادة تعريف مكتبات خارجية
jest.mock('@firebase-admin/app');
jest.mock('@genkit-ai/core');

// Mocking للـ API Calls
global.fetch = jest.fn();
```

## 📋 أنواع الاختبارات

### 1. وحدة الاختبار (Unit Tests)
تختبر الوظائف والمكونات بشكل منفصل:

```typescript
describe('Project Model', () => {
  it('should create project with required properties', () => {
    const project = new Project({...});
    expect(project.title).toBe('Test Project');
  });
});
```

### 2. اختبارات المكونات (Component Tests)
تختبر تفاعل المكونات مع المستخدم:

```typescript
it('should handle form submission', async () => {
  render(<ContactForm />);
  await userEvent.type(screen.getByLabel('email'), 'test@example.com');
  await userEvent.click(screen.getByRole('button', { name: /submit/i }));
  expect(mockSubmit).toHaveBeenCalled();
});
```

### 3. اختبارات التكامل (Integration Tests)
تختبر التدفقات الكاملة للمستخدم:

```typescript
it('should create project with AI generation', async () => {
  // 1. إنشاء مشروع جديد
  // 2. إعداد المعايير
  // 3. تشغيل الذكاء الاصطناعي
  // 4. التحقق من النتائج
});
```

### 4. اختبارات الأمان (Security Tests)
تختبر جوانب الأمان والحماية:

```typescript
it('should prevent SQL injection', () => {
  const maliciousInput = "'; DROP TABLE users; --'";
  const sanitized = sanitizeInput(maliciousInput);
  expect(sanitized).not.toContain('DROP TABLE');
});
```

## 🎯 التغطية المستهدفة

| المكون | التغطية المستهدفة | التغطية الحالية |
|---------|-------------------|-----------------|
| النماذج (Models) | 90% | ✅ |
| الـ Hooks | 85% | ✅ |
| الأدوات المساعدة | 80% | ✅ |
| تدفقات الذكاء الاصطناعي | 75% | ✅ |
| المكونات الأساسية | 80% | ✅ |
| الاختبارات التكاملية | 70% | ✅ |
| اختبارات الأمان | 95% | ✅ |

## 🛠️ أدوات المساعدة

### Test Helpers
توفير `__tests__/helpers/test-helpers.ts` أدوات متقدمة:

```typescript
import { renderWithProviders, mockAIGeneration } from './helpers/test-helpers';

// Render مع Providers
const { store } = renderWithProviders(<MyComponent />);

// Mock AI Generation
mockAIGeneration('success', mockResponse);
```

### Data Factories
إنشاء بيانات وهمية قابلة للاستخدام:

```typescript
import { createMockProject, createMockUser } from './helpers/test-helpers';

const project = createMockProject({ title: 'Custom Project' });
const user = createMockUser({ role: 'admin' });
```

### API Mocking
محاكاة كامل للـ API calls:

```typescript
mockSuccessfulResponse(projectData);
mockErrorResponse('Network error');
mockDelayedResponse(mockData, 2000);
```

## 📊 تقارير الأداء

### معايير الأداء المقبولة

| نوع الاختبار | الحد الأعلى للمدة |
|---------------|-------------------|
| Unit Tests | 50ms |
| Component Tests | 500ms |
| Integration Tests | 5s |
| Security Tests | 100ms |

### مراقبة الذاكرة
```typescript
import { measurePerformance } from './helpers/test-helpers';

const { duration } = await measurePerformance(async () => {
  await expensiveOperation();
});

expect(duration).toBeLessThan(1000); // أقل من ثانية
```

## 🔒 اختبارات الأمان

### اختبارات المصادقة
- التحقق من التوكينات
- تشفير كلمات المرور
- جلسات المستخدمين
- تحد من المحاولات

### اختبارات الدخول (Authorization)
- أذونات المستخدمين
- حق الوصول للموارد
- حماية CSRF
- تصريح الأدوار

### اختبارات الإدخال (Input Validation)
- تنظيف HTML الخبيث
- منع SQL Injection
- حماية XSS
- التحقق من ملفات التحميل

## 🤖 اختبارات الذكاء الاصطناعي

### محاكاة تدفقات AI
```typescript
describe('AI Proposal Generation', () => {
  it('should generate proposal with correct structure', async () => {
    mockAIGeneration('success', {
      content: 'Generated content',
      sections: ['Introduction', 'Conclusion'],
    });

    const result = await generateProposal(inputData);
    expect(result.sections).toHaveLength(2);
  });
});
```

### اختبارات Schema Validation
```typescript
it('should validate AI input schemas', () => {
  const result = ProposalInputSchema.safeParse(input);
  expect(result.success).toBe(true);
});
```

## 🔧 استكشاف الأخطاء

### مشاكل شائعة وحلولها

#### 1. مشاكل TextEncoder في JSDOM
```javascript
// في jest.setup.js
global.TextEncoder = global.TextEncoder || TextEncoder;
```

#### 2. مشاكل ES Modules
```javascript
// في jest.config.js
extensionsToTreatAsEsm: ['.ts', '.tsx'],
transformIgnorePatterns: ['/node_modules/(?!(module)/)'],
```

#### 3. مشاكل Canvas في الاختبارات
```javascript
// Mock Canvas API
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: jest.fn()
});
```

### متطلبات التصحيح
```bash
# اختبارات مع تفصيل
npm test -- --verbose

# اختبارات مع معلومات التصحيح
npm test -- --detectOpenHandles --forceExit
```

## 📈 تطوير الاختبارات

### إضافة اختبار جديد
1. إنشاء ملف `.test.ts` أو `.test.tsx` في المجلد المناسب
2. استخدام الهيكل الأساسي:

```typescript
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

describe('Component/Utility Name', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should behave as expected', () => {
    // اختبار المنطق هنا
    expect(result).toBe(expected);
  });
});
```

### أفضل الممارسات
- استخدم أسماء وصفية للاختبارات
- قم بتجميع الاختبارات المنطقية المتشابهة
- استخدم mock data instead of real data
- تأكد من تنظيف الحالة بعد كل اختبار
- استخدم TypeScript لكتابة اختبارات آمنة

### اختبارات الأداء
```typescript
it('should perform under time limit', async () => {
  const start = performance.now();
  await operation();
  const duration = performance.now() - start;
  expect(duration).toBeLessThan(100); // 100ms max
});
```

## 🚀 النشر والتكامل المستمر

### GitHub Actions للاختبارات
```yaml
- name: Run Tests
  run: |
    npm ci
    npm run test:coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

### متطلبات المرور للـ CI/CD
- جميع الاختبارات يجب أن تمر ✅
- تغطية لا تقل عن 85% ✅
- لا توجد أخطاء تيبة في TypeScript ✅
- جميع اختبارات الأمان يجب أن تمر ✓

## 📚 المصادر وروابط مفيدة

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)

## 🎉 الملخص

نظام الاختبارات في Arkan/docudec يضمن:

✅ **موثوقية عالية** - اختبر جميع المكونات الأساسية
✅ **أمان قوي** - اختبارات شاملة للأمان والخصوصية
✅ **أداء ممتاز** - مراقبة الأداء وتحسين التحصين
✅ **جودة الكود** - معايير عالية للتغطية والتنظيم
✅ **سهولة الصيانة** - اختبارات منظمة وقابلة للتطوير

هذا النظام يضمن أن Arkan/docudec يبقى منصة موثوقة وآمنة ومؤدية، مع سهولة في الصيانة والتطوير المستمر! 🎯
