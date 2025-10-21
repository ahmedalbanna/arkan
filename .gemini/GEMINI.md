# قواعد المستخدم - وكيل Cursor لمشروع Arkan

## نظرة عامة
هذا الملف يحدد قواعد المستخدم العامة و التفضيلات لوكيل الذكاء الاصطناعي في Cursor. هذه القواعد تُطبق على جميع التفاعلات مع المشروع وتحدد أسلوب التواصل المفضل وقواعد الترميز والمعايير.

## أسلوب التواصل

### اللغة والثقافة
- **اللغة الأساسية**: العربية (العربية الفصحى)
- **اللغة الثانوية**: الإنجليزية (للمصطلحات التقنية)
- **أسلوب التواصل**: مهني، ودود، ومفصل
- **مستوى التفصيل**: مفصل مع أمثلة عملية
- **التركيز**: على الحلول العملية والقابلة للتطبيق

### هيكل الردود
1. **الخلاصة السريعة**: ملخص مختصر للحل أو التوصية
2. **التفاصيل التقنية**: شرح مفصل مع أمثلة الكود
3. **البدائل**: خيارات أخرى إذا كانت متاحة
4. **الخطوات التالية**: ما يجب فعله بعد ذلك
5. **المراجع**: روابط مفيدة ومصادر إضافية

## قواعد الترميز

### معايير الكود العامة
- **اللغة**: TypeScript الصارم (strict mode)
- **التنسيق**: ESLint + Prettier
- **التعليقات**: JSDoc للدوال العامة
- **الأسماء**: meaningful names باللغة الإنجليزية
- **الهيكل**: modular و component-based

### أنماط التطوير المفضلة
```typescript
// ✅ نمط مفضل - مكون React
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
  // منطق المكون
  return (
    <div className="component-wrapper">
      {/* محتوى المكون */}
    </div>
  );
};
```

### قواعد TypeScript
- استخدم interfaces بدلاً من types للكائنات المعقدة
- تجنب `any` إلا في الحالات الضرورية
- استخدم generic types عند الحاجة
- أضف JSDoc للدوال العامة
- استخدم strict null checks

### قواعد React
- استخدم functional components مع hooks
- استخدم React.memo للتحسين عند الحاجة
- استخدم useCallback و useMemo بحذر
- أضف error boundaries للمكونات المهمة
- استخدم custom hooks للمنطق المعقد

### قواعد Next.js
- استخدم App Router (Next.js 15+)
- ضع الصفحات في `src/app/`
- استخدم `page.tsx` للصفحات الرئيسية
- استخدم `layout.tsx` للتخطيطات المشتركة
- استخدم Server Components عند الحاجة

## تفضيلات المشروع

### هيكل المجلدات المفضل
```
src/
├── app/                 # صفحات Next.js
├── components/          # مكونات UI قابلة لإعادة الاستخدام
├── core/               # وظائف أساسية قابلة لإعادة الاستخدام
├── hooks/              # React hooks مخصصة
├── lib/                # مكتبات مساعدة ونماذج
├── ai/                 # تدفقات الذكاء الاصطناعي
├── services/           # تكاملات الخدمات الخارجية
└── context/            # موفرو React Context
```

### أنماط التسمية
- **المكونات**: PascalCase (مثال: `UserProfile`)
- **الدوال**: camelCase (مثال: `handleSubmit`)
- **المتغيرات**: camelCase (مثال: `userData`)
- **الثوابت**: UPPER_SNAKE_CASE (مثال: `API_BASE_URL`)
- **الملفات**: kebab-case (مثال: `user-profile.tsx`)

### معايير الجودة
- **الاختبارات**: اكتب اختبارات للوظائف الجديدة
- **الأداء**: استخدم code splitting و lazy loading
- **الأمان**: تحقق من صحة جميع المدخلات
- **الوصولية**: استخدم ARIA labels و keyboard navigation
- **الاستجابة**: تصميم mobile-first

## قواعد الذكاء الاصطناعي

### استخدام نظام الذكاء الاصطناعي المحسن
- استخدم تدفقات Genkit الموجودة في `src/ai/flows/`
- استخدم المحفزات المحددة في `src/ai/prompts/`
- استخدم مخططات التحقق في `src/ai/schemas/`
- استخدم النظام الذكي في `src/ai/core/`

### أنماط تدفق الذكاء الاصطناعي
```typescript
// مثال على استخدام تدفق الذكاء الاصطناعي
const result = await aiFlow.execute({
  input: userInput,
  context: projectContext,
  options: {
    model: 'gemini-pro',
    temperature: 0.7,
    maxTokens: 2000
  }
});
```

### معايير جودة الذكاء الاصطناعي
- تحقق من جودة المخرجات باستخدام معايير متعددة
- استخدم نظام التحسين التكراري عند الحاجة
- راقب الأداء والتكلفة
- وفر fallback strategies للأخطاء

## قواعد الأمان

### التحقق من صحة البيانات
- استخدم Zod schemas لجميع المدخلات
- تحقق من صحة الملفات المرفوعة
- استخدم sanitization للمحتوى المستخدم
- طبق مبادئ الأمان من OWASP

### المصادقة والتفويض
- تحقق من المصادقة على مستوى الخادم
- استخدم Firebase Auth للجلسات
- تطبيق التحكم في الوصول المستند إلى الأدوار
- استخدم HTTPS في جميع الاتصالات

## قواعد الأداء

### تحسين الأداء
- استخدم `React.memo` للمكونات الثقيلة
- استخدم `useMemo` للحسابات المعقدة
- استخدم `useCallback` للدوال الممررة كـ props
- استخدم lazy loading للصفحات والمكونات الثقيلة

### تحسين الحزمة
- استخدم dynamic imports للكود غير الضروري
- استخدم code splitting على مستوى الصفحة
- استخدم tree shaking لإزالة الكود غير المستخدم
- راقب حجم الحزمة بانتظام

## قواعد الاختبار

### كتابة الاختبارات
```typescript
// مثال على اختبار المكون
import { render, screen, fireEvent } from '@testing-library/react';
import { Component } from '../Component';

describe('Component', () => {
  test('renders correctly', () => {
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
```

### معايير الاختبار
- اكتب اختبارات للسلوك وليس التنفيذ
- استخدم data-testid للعناصر المحددة
- اجعل الاختبارات مستقلة
- أضف error cases
- اختبر الحالات الحدية

## قواعد التوثيق

### JSDoc للدوال
```typescript
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
```

### README الملفات
- اكتب README لكل مجلد مهم
- اشرح الغرض من كل ملف
- أضف أمثلة على الاستخدام
- اذكر المتطلبات والتبعيات

## قواعد إدارة الأخطاء

### معالجة الأخطاء
```typescript
// استخدام نظام معالجة الأخطاء المركزي
import { ErrorHandler } from '@/core';

try {
  await riskyOperation();
} catch (error) {
  ErrorHandler.handle(error, 'operationName');
}
```

### أنواع الأخطاء
- **ValidationError**: أخطاء التحقق من صحة البيانات
- **NetworkError**: أخطاء الشبكة
- **AuthError**: أخطاء المصادقة
- **AIError**: أخطاء الذكاء الاصطناعي
- **SystemError**: أخطاء النظام

## قواعد التطوير المستمر

### Git Workflow
- استخدم feature branches للتطوير
- اكتب commit messages واضحة
- استخدم pull requests للمراجعة
- ادمج التغييرات بعد المراجعة

### Code Review
- راجع الكود قبل الدمج
- تحقق من معايير الجودة
- اختبر الوظائف الجديدة
- تأكد من التوثيق

## قواعد خاصة بمشروع Arkan

### الذكاء الاصطناعي
- استخدم النظام الذكي المحسن في `src/ai/core/`
- طبق تحليل السياق الذكي
- استخدم اختيار النموذج التكيفي
- طبق نظام التحقق من الجودة

### معالجة المستندات
- استخدم المكتبات المحددة في `techContext.md`
- طبق معايير الأمان للملفات
- استخدم معالجة آمنة للمحتوى
- وفر معالجة أخطاء شاملة

### واجهة المستخدم
- استخدم Radix UI primitives
- طبق Tailwind CSS للتصميم
- استخدم Lucide Icons
- طبق نظام الثيمات المحدد

## قواعد التواصل مع المستخدم

### عند تقديم حلول
1. اشرح المشكلة بوضوح
2. قدم الحل مع أمثلة الكود
3. اشرح سبب اختيار هذا الحل
4. قدم بدائل إذا كانت متاحة
5. اذكر الخطوات التالية

### عند إصلاح الأخطاء
1. حدد سبب الخطأ
2. اشرح كيفية إصلاحه
3. قدم كود الإصلاح
4. اشرح كيفية منع تكراره
5. اختبر الإصلاح

### عند تطوير ميزات جديدة
1. فهم المتطلبات
2. تصميم الحل
3. تطوير الكود
4. كتابة الاختبارات
5. توثيق الميزة

## الخلاصة

هذه القواعد تضمن العمل بكفاءة مع مشروع Arkan مع الحفاظ على جودة الكود والأداء. يجب اتباعها في كل مهمة تطويرية ومراجعتها بانتظام للتأكد من ملاءمتها للمشروع.

---

**آخر تحديث**: 2025
**الإصدار**: 1.0
**المشروع**: Arkan - منصة إنشاء المستندات المدعومة بالذكاء الاصطناعي
