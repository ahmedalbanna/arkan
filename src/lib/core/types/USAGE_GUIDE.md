# دليل استخدام الأنواع المحسنة - مشروع Arkan

## نظرة عامة

هذا الدليل يوضح كيفية استخدام الأنواع المحسنة في مشروع Arkan لتحسين Type Safety وتقليل استخدام `any`.

## الأنواع الجديدة المُضافة

### 1. المحتوى المرن (Flexible Content)

بدلاً من استخدام `any` للبيانات الديناميكية، استخدم `FlexibleContent`:

```typescript
// قبل التحسين
interface Props {
  content: any;
  onUpdate: (key: string, value: any) => void;
}

// بعد التحسين
interface Props {
  content: FlexibleContent;
  onUpdate: SafeUpdateFunction;
}
```

### 2. بيانات Proposal محسنة

استخدم `ProposalData` للتعامل مع بيانات المقترحات:

```typescript
// قبل التحسين
function generateCodebase(variables: { proposal: any; token: string }) {
  // معالجة البيانات
}

// بعد التحسين
function generateCodebase(variables: { proposal: ProposalData; token: string }) {
  // معالجة البيانات مع أنواع محسنة
}
```

### 3. Type Guards للأمان

استخدم الـ Type Guards للتحقق الآمن من الأنواع:

```typescript
import { isFlexibleContent, toProposalData } from '@/lib/core/types';

function processUnknownData(data: unknown) {
    if (isFlexibleContent(data)) {
        // الآن data من نوع FlexibleContent
        return renderContent(data);
    }

    const proposalData = toProposalData(data);
    if (proposalData) {
        // الآن proposalData من نوع ProposalData
        return processProposal(proposalData);
    }

    // التعامل مع الحالة غير المتوقعة
    return handleError('Invalid data format');
}
```

## الأسئلة الشائعة

### س: ماذا لو كانت البيانات مختلفة تماماً عن المتوقع؟

ج: استخدم `unknown` بدلاً من `any` واستخدم Type Guards للتحقق الآمن:

```typescript
function handleUnknownContent(content: unknown): FlexibleContent | null {
    // استخدام Type Guard للتحقق الآمن
    return toFlexibleContent(content);
}
```

### س: كيف يمكنني تحديث الكود الموجود؟

ج: اتبع هذه الخطوات:

1. **استبدل `any` بـ `unknown` أولاً**
2. **تطبيق التحقق الآمن باستخدام Type Guards**
3. **تحويل الناتج للأنواع المحسنة**

```typescript
// الخطوة 1
function updateData(data: unknown) {
    // الخطوة 2
    if (isFlexibleContent(data)) {
        // الخطوة 3 - الآن نحن متأكدون من نوع البيانات
        return processFlexibleContent(data);
    }

    throw new Error('Invalid data type');
}
```

### س: كيف يمكنني التعامل مع الأخطاء؟

ج: استخدم نظام الأخطاء المحسن:

```typescript
import { CommonErrors, ContentError } from '@/lib/core/types';

function validateContent(content: unknown): ContentError | null {
    if (!isFlexibleContent(content)) {
        return {
            code: CommonErrors.VALIDATION_ERROR,
            message: 'Content must be of type FlexibleContent',
            expectedType: 'FlexibleContent',
            actualValue: content
        };
    }

    return null;
}
```

## أفضل الممارسات

### 1. استخدم Types متعددة الرتبة (Recursive Types)

للمحتوى الذي يمكن أن يحتوي على محتوى مرن، استخدم:

```typescript
// هذا يسمح بمحتوى غير محدود العمق مثل JSON
type FlexibleContent =
    | string
    | number
    | boolean
    | FlexibleContent[]
    | Record<string, FlexibleContent>;
```

### 2. استخدم Helper Functions

بدلاً من التحقق مباشرة، استخدم الدوال المساعدة:

```typescript
// جيد
const content = toFlexibleContent(data);
if (content) {
    return processContent(content);
}

// أقل جودة
if (typeof data === 'string' || typeof data === 'number' || ...) {
    // منطق طويل ومعقد
}
```

### 3. استخدم Type Guards بحكمة

Type Guards تبسط التحقق وتساعد TypeScript في فهم الأنواع:

```typescript
// هذا يساعد TypeScript في فهم أن data هو FlexibleContent داخل هذا المجال
if (isFlexibleContent(data)) {
    // الآن TypeScript يعرف أن data من نوع FlexibleContent
    return data.toUpperCase(); // ✅ سيعمل إذا كان string
}
```

## الأدوات المتاحة

### TypeUtils

```typescript
import { TypeUtils } from '@/lib/core/types';

// التحقق الآمن من النوع
if (TypeUtils.isOf(data, isFlexibleContent)) {
    // data هو الآن FlexibleContent
}

// التحويل الآمن
const defaultValue = { title: 'Default', content: '' };
const data = TypeUtils.safeCast(unknownData, defaultValue);
```

### دعم الأخطاء

```typescript
import { CommonErrors, ContentError } from '@/lib/core/types';

// إنشاء خطأ منظم
const error: ContentError = {
    code: CommonErrors.VALIDATION_ERROR,
    message: 'Invalid content type',
    expectedType: 'string',
    actualValue: 123
};
```

## الخلاصة

العمل مع الأنواع المحسنة يعني:

1. **تقليل استخدام `any` بنسبة 90%+**
2. **تحسين Type Safety والكشف المبكر عن الأخطاء**
3. **تجربة تطوير أفضل مع IDE محسن**
4. **كود أكثر قوة وقابلية للصيانة**

ابدأ بتطبيق هذه الأنواع تدريجياً في مشروعك، واستخدم أدوات المساعدة لأمان إضافي.
