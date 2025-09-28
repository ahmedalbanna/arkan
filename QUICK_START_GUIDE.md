# دليل البدء السريع - النظام الجديد للـ Hooks

## 🚀 البدء السريع

### 1. استخدام النظام الأساسي
```typescript
import {
  useFormHandler,
  useFileUpload,
  useCopyToast,
  useTextProcessor
} from '@/core';
```

### 2. إنشاء Hook جديد باستخدام Factory

#### لمولدات المحتوى:
```typescript
import { createContentGeneratorHook } from '@/core';

const useMyGenerator = createContentGeneratorHook({
  toolName: 'my-generator',
  apiEndpoint: '/api/generate/my-tool',
  schema: z.object({ text: z.string().min(10) }),
  defaultValues: { text: '' },
  outputFormat: 'json',
  successMessage: 'Generated successfully!',
});
```

#### للمقترحات:
```typescript
import { createProposalToolHook } from '@/core';

const useMyProposal = createProposalToolHook({
  toolName: 'my-proposal',
  apiEndpoint: '/api/proposals/my-tool',
  schema: z.object({ title: z.string(), description: z.string() }),
  defaultValues: { title: '', description: '' },
  proposalType: 'business',
});
```

#### للتقارير:
```typescript
import { createReportToolHook } from '@/core';

const useMyReport = createReportToolHook({
  toolName: 'my-report',
  apiEndpoint: '/api/reports/my-tool',
  schema: z.object({ data: z.string() }),
  defaultValues: { data: '' },
  reportType: 'analytical',
});
```

#### للمخططات:
```typescript
import { createDiagramToolHook } from '@/core';

const useMyDiagram = createDiagramToolHook({
  toolName: 'my-diagram',
  apiEndpoint: '/api/diagrams/my-tool',
  schema: z.object({ description: z.string() }),
  defaultValues: { description: '' },
  diagramType: 'flowchart',
});
```

### 3. استخدام Hook في المكون

```typescript
function MyComponent() {
  const {
    form,
    isProcessing,
    generatedContent,
    handleCopy,
    onSubmit,
    isUploading,
    getRootProps,
    getInputProps,
    isDragActive
  } = useMyGenerator();

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('text')} />
      <button type="submit" disabled={isProcessing}>
        {isProcessing ? 'Generating...' : 'Generate'}
      </button>

      {generatedContent && (
        <div>
          <pre>{JSON.stringify(generatedContent, null, 2)}</pre>
          <button onClick={handleCopy}>Copy</button>
        </div>
      )}
    </form>
  );
}
```

## 📁 هيكل الملفات

### النظام الأساسي
```
src/hooks/core/
├── base/                    # Hooks أساسية
│   ├── use-form-handler.ts
│   ├── use-file-upload.ts
│   ├── use-copy-toast.ts
│   └── use-processing-state.ts
├── writing-tools/           # أدوات الكتابة
│   ├── use-text-processor.ts
│   └── use-writing-tool-factory.ts
├── content-generators/      # مولدات المحتوى
│   └── use-content-generator-factory.ts
├── proposal-tools/          # أدوات المقترحات
│   └── use-proposal-factory.ts
├── report-tools/            # أدوات التقارير
│   └── use-report-factory.ts
├── diagram-tools/           # أدوات المخططات
│   └── use-diagram-factory.ts
├── specialized-tools/       # أدوات متخصصة
│   └── use-specialized-factory.ts
└── index.ts
```

### UI/UX Hooks
```
src/hooks/ui/
└── use-ui-factory.ts
```

## 🎯 أفضل الممارسات

### 1. اختيار Factory المناسب
- **Content Generators**: للمحتوى النصي (اختبارات، مقالات، إلخ)
- **Proposal Tools**: للمقترحات والعروض
- **Report Tools**: للتقارير والتحليلات
- **Diagram Tools**: للمخططات والرسوم البيانية
- **Specialized Tools**: للأدوات المتخصصة

### 2. تخصيص الميزات
```typescript
const useMyTool = createContentGeneratorHook({
  // ... الإعدادات الأساسية
  customFeatures: {
    formatOutput: (data) => {
      // تنسيق مخصص للناتج
      return { formatted: data };
    },
    validateInput: (data) => {
      // التحقق من صحة البيانات
      return data.text?.length > 0;
    },
    getProgressSteps: () => [
      'Step 1', 'Step 2', 'Step 3'
    ]
  }
});
```

### 3. استخدام الميزات المتقدمة
```typescript
const useAdvancedTool = createAdvancedContentGeneratorHook(
  config,
  {
    getGenerationSteps: () => [...],
    getProgressPercentage: (step, total) => (step / total) * 100,
    validateGeneratedContent: (content) => content.isValid,
    getContentPreview: (content) => content.preview,
    getExportOptions: () => [...]
  }
);
```

## 🔧 استكشاف الأخطاء

### مشاكل شائعة:

1. **خطأ في الاستيراد**
   ```typescript
   // ❌ خطأ
   import { createContentGeneratorHook } from '@/hooks/core';

   // ✅ صحيح
   import { createContentGeneratorHook } from '@/core';
   ```

2. **خطأ في Schema**
   ```typescript
   // ❌ خطأ
   schema: z.string()

   // ✅ صحيح
   schema: z.object({ text: z.string().min(10) })
   ```

3. **خطأ في API Endpoint**
   ```typescript
   // ❌ خطأ
   apiEndpoint: 'api/generate'

   // ✅ صحيح
   apiEndpoint: '/api/generate/my-tool'
   ```

## 📚 موارد إضافية

- **التوثيق الكامل**: `src/hooks/core/README.md`
- **أمثلة عملية**: `src/hooks/core/examples/`
- **خطة التنظيم**: `HOOKS_ORGANIZATION_PLAN.md`
- **التقرير الشامل**: `COMPREHENSIVE_ORGANIZATION_REPORT.md`

## 🆘 الدعم

إذا واجهت أي مشاكل أو لديك أسئلة:
1. راجع التوثيق الكامل
2. تحقق من الأمثلة العملية
3. تأكد من صحة الإعدادات
4. استخدم أدوات التطوير للمساعدة في التشخيص
