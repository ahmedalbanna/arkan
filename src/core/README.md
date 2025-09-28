# Core Module - دليل الاستخدام

## نظرة عامة

مجلد `core` يحتوي على جميع العناصر الأساسية القابلة لإعادة الاستخدام في التطبيق. تم تصميمه لتقليل التكرار وتحسين قابلية الصيانة والتطوير.

## الهيكل

```
src/core/
├── hooks/                    # Hooks قابلة لإعادة الاستخدام
│   ├── base/                # Hooks أساسية
│   ├── writing-tools/       # Hooks خاصة بأدوات الكتابة
│   └── index.ts             # تصدير موحد
├── types/                   # الأنواع المشتركة
│   ├── common.ts            # أنواع أساسية
│   └── writing-tools.ts    # أنواع أدوات الكتابة
├── utils/                   # الأدوات المساعدة
│   └── error-handling.ts   # معالجة الأخطاء
├── constants/               # الثوابت المشتركة
│   ├── validation-rules.ts # قواعد التحقق
│   └── file-types.ts       # أنواع الملفات
├── examples/               # أمثلة على الاستخدام
└── index.ts               # نقطة الدخول الرئيسية
```

## Hooks الأساسية

### 1. useFormHandler

Hook أساسي لمعالجة النماذج مع التحقق من البيانات.

```typescript
import { useFormHandler } from '@/core';

const schema = z.object({
  text: z.string().min(10),
  mode: z.enum(['standard', 'creative']),
});

const { form, handleSubmit, isSubmitting, reset } = useFormHandler(
  schema,
  { text: '', mode: 'standard' },
  {
    onSubmitSuccess: (data) => console.log('تم الحفظ:', data),
    successMessage: 'تم الحفظ بنجاح!',
  }
);
```

### 2. useFileUpload

Hook أساسي لرفع الملفات مع معالجة الأخطاء.

```typescript
import { useFileUpload } from '@/core';

const {
  isUploading,
  getRootProps,
  getInputProps,
  isDragActive,
  uploadFile,
} = useFileUpload({
  acceptedTypes: ['application/pdf', 'text/plain'],
  maxSize: 10 * 1024 * 1024, // 10MB
  onSuccess: (content, fileName) => {
    console.log('تم رفع الملف:', fileName);
    setText(content);
  },
});
```

### 3. useCopyToast

Hook أساسي للنسخ مع الإشعارات.

```typescript
import { useCopyToast } from '@/core';

const { isCopied, copyToClipboard } = useCopyToast({
  successMessage: 'تم النسخ!',
  resetDelay: 2000,
});

// الاستخدام
await copyToClipboard('النص المراد نسخه');
```

### 4. useProcessingState

Hook أساسي لإدارة حالة المعالجة.

```typescript
import { useProcessingState } from '@/core';

const {
  isProcessing,
  startProcessing,
  stopProcessing,
  withProcessing,
} = useProcessingState();

// الاستخدام
const result = await withProcessing(async () => {
  return await processData();
});
```

### 5. useTextProcessor

Hook شامل لمعالجة النصوص في أدوات الكتابة.

```typescript
import { useTextProcessor } from '@/core';

const schema = z.object({
  text: z.string().min(10),
  mode: z.enum(['standard', 'creative']),
});

const {
  form,
  isProcessing,
  originalText,
  processedText,
  isCopied,
  copyToClipboard,
  isUploading,
  getRootProps,
  getInputProps,
  isDragActive,
  handleSubmit,
  reset,
  mutation,
} = useTextProcessor({
  toolName: 'paraphraser',
  apiEndpoint: '/api/writing-tools/paraphrase',
  schema,
  defaultValues: { text: '', mode: 'standard' },
  successMessage: 'تمت المعالجة بنجاح!',
  enableFileUpload: true,
});
```

### 6. Hook Factory

طريقة مبسطة لإنشاء hooks جديدة.

```typescript
import { createWritingToolHook } from '@/core';

// إنشاء Hook بسيط
const useSimpleTool = createWritingToolHook({
  toolName: 'simple-tool',
  apiEndpoint: '/api/simple-tool',
  schema: z.object({ text: z.string().min(10) }),
  defaultValues: { text: '' },
  successMessage: 'تمت المعالجة بنجاح!',
});

// استخدام Hook
const { form, onSubmit, isProcessing } = useSimpleTool();
```

### 7. Hook Factory المتقدم

للميزات المعقدة مع وظائف مخصصة.

```typescript
import { createAdvancedWritingToolHook } from '@/core';

const useAdvancedTool = createAdvancedWritingToolHook(
  {
    toolName: 'advanced-tool',
    apiEndpoint: '/api/advanced-tool',
    schema: z.object({ text: z.string().min(10) }),
    defaultValues: { text: '' },
  },
  {
    getScoreColor: (score) => score > 50 ? 'text-green-500' : 'text-red-500',
    formatResults: (data) => ({ ...data, formatted: true }),
    validateInput: (data) => data.text.length > 0,
  }
);
```

## معالجة الأخطاء

### ErrorHandler

نظام معالجة الأخطاء المركزي.

```typescript
import { ErrorHandler, createError } from '@/core';

// معالجة خطأ
try {
  await riskyOperation();
} catch (error) {
  ErrorHandler.handle(error, 'riskyOperation');
}

// إنشاء خطأ مخصص
const customError = createError(
  'VALIDATION_ERROR',
  'البيانات المدخلة غير صحيحة',
  { field: 'email', value: 'invalid-email' }
);
```

## الثوابت

### قواعد التحقق

```typescript
import { TEXT_VALIDATION_RULES, VALIDATION_MESSAGES } from '@/core';

const schema = z.object({
  text: z.string()
    .min(TEXT_VALIDATION_RULES.MIN_LENGTH, VALIDATION_MESSAGES.MIN_LENGTH(5))
    .max(TEXT_VALIDATION_RULES.MAX_LENGTH, VALIDATION_MESSAGES.MAX_LENGTH(10000)),
});
```

### أنواع الملفات

```typescript
import { SUPPORTED_FILE_TYPES, UPLOAD_ACCEPTED_TYPES } from '@/core';

// الحصول على معلومات نوع ملف
const pdfConfig = SUPPORTED_FILE_TYPES.pdf;
console.log(pdfConfig.maxSize); // 10485760

// أنواع الملفات المقبولة للرفع
const acceptedTypes = UPLOAD_ACCEPTED_TYPES.documents;
```

## أمثلة عملية

### إعادة كتابة Hook موجود

**قبل (الكود القديم):**
```typescript
// 111 سطر من الكود المكرر
export function useParaphraserLogic() {
  const [originalText, setOriginalText] = useState('');
  const [paraphrasedText, setParaphrasedText] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // ... الكثير من الكود المكرر
}
```

**بعد (الكود الجديد):**
```typescript
// 50 سطر فقط
export function useParaphraserLogic() {
  const textProcessor = useTextProcessor({
    toolName: 'paraphraser',
    apiEndpoint: '/api/writing-tools/paraphrase',
    schema: paraphraserSchema,
    defaultValues: { text: '', mode: 'standard' },
  });

  return {
    form: textProcessor.form,
    isProcessing: textProcessor.isProcessing,
    originalText: textProcessor.originalText,
    paraphrasedText: textProcessor.processedText,
    // ... باقي الخصائص
  };
}
```

## الفوائد

### 1. تقليل التكرار
- **قبل**: 111 سطر لكل hook
- **بعد**: 50 سطر لكل hook
- **تحسين**: 55% تقليل في الكود

### 2. تحسين قابلية القراءة
- منطق واضح ومنظم
- فصل الاهتمامات
- أسماء وصفية

### 3. سهولة الصيانة
- تغيير واحد يؤثر على جميع الاستخدامات
- اختبار أسهل
- توثيق شامل

### 4. تحسين الأداء
- إعادة استخدام الكود
- تحسين إدارة الذاكرة
- تحسين تجربة المستخدم

## أفضل الممارسات

### 1. استخدام الـ Hooks الأساسية
```typescript
// ✅ جيد
const { form, handleSubmit } = useFormHandler(schema, defaults);

// ❌ سيء
const form = useForm({ resolver: zodResolver(schema) });
```

### 2. معالجة الأخطاء
```typescript
// ✅ جيد
try {
  await operation();
} catch (error) {
  ErrorHandler.handle(error, 'operationName');
}

// ❌ سيء
try {
  await operation();
} catch (error) {
  console.error(error);
}
```

### 3. استخدام الثوابت
```typescript
// ✅ جيد
const maxSize = FILE_VALIDATION_RULES.MAX_SIZE_PDF;

// ❌ سيء
const maxSize = 10 * 1024 * 1024;
```

## التطوير المستقبلي

### الميزات المخططة
1. **Hooks إضافية**: للمكونات المعقدة
2. **أدوات تطوير**: لتحسين تجربة التطوير
3. **اختبارات شاملة**: لضمان الجودة
4. **توثيق تفاعلي**: مع أمثلة حية

### كيفية المساهمة
1. اتبع المعايير الموجودة
2. أضف اختبارات للكود الجديد
3. حدث التوثيق
4. تأكد من التوافق مع الكود الموجود
