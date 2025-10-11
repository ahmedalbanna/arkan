# نظام التدفقات المصنف الجديد

## 🎯 نظرة عامة

تم إعادة تنظيم جميع تدفقات الذكاء الاصطناعي من **42 ملف منفصل** إلى **6 ملفات مصنفة** مع نظام تسجيل مركزي وواجهة موحدة.

## 📁 الهيكل الجديد

```
src/ai/flows/
├── registry.ts              # نظام التسجيل المركزي
├── unified.ts               # الواجهة الموحدة
├── index.ts                 # الفهرس الرئيسي
├── text-processing.ts       # معالجة النصوص (8 تدفقات)
├── content-generation.ts    # توليد المحتوى (9 تدفقات)
├── document-processing.ts   # معالجة المستندات (10 تدفقات)
├── analysis.ts              # التحليل (5 تدفقات)
├── academic.ts              # الأكاديمي (5 تدفقات)
└── visual.ts                # المرئي (2

```

## 🚀 الميزات الجديدة

### 1. نظام التسجيل المركزي (`FlowRegistry`)

```typescript
import { FlowRegistry } from '@/ai/flows';

// تسجيل تدفق جديد
FlowRegistry.register({
  name: 'my-flow',
  category: 'text-processing',
  description: 'وصف التدفق',
  inputSchema: MyInputSchema,
  outputSchema: MyOutputSchema,
  handler: async (input) => { /* منطق التدفق */ }
});

// تنفيذ تدفق
const result = await FlowRegistry.execute('my-flow', input);

// الحصول على التدفقات حسب الفئة
const textFlows = FlowRegistry.getByCategory('text-processing');
```

### 2. الواجهة الموحدة (`UnifiedFlows`)

```typescript
import { UnifiedFlows } from '@/ai/flows';

// تنفيذ تدفق
const result = await UnifiedFlows.execute({
  flowName: 'grammar-checker',
  input: { text: 'نص للفحص' }
});

// تنفيذ متعدد
const results = await UnifiedFlows.executeMultiple([
  { flowName: 'grammar-checker', input: { text: 'نص 1' } },
  { flowName: 'summarize-text', input: { text: 'نص 2' } }
]);

// تنفيذ مع إعادة المحاولة
const result = await UnifiedFlows.executeWithRetry(
  { flowName: 'generate-text', input: { prompt: 'مطالبة' } },
  3, // محاولات
  1000 // تأخير بالميلي ثانية
);
```

### 3. الاستيراد المبسط

```typescript
// بدلاً من استيراد كل ملف منفصل
import { grammarCheck } from '@/ai/flows/grammar-checker';
import { summarizeText } from '@/ai/flows/summarize-text';
import { generateText } from '@/ai/flows/generate-text';

// الآن يمكنك استيراد كل شيء من مكان واحد
import {
  grammarCheck,
  summarizeText,
  generateText,
  // ... جميع التدفقات الأخرى
} from '@/ai/flows';
```

## 📊 التدفقات المصنفة

### معالجة النصوص (`text-processing.ts`)
- `grammar-checker` - فحص القواعد النحوية
- `paraphrase-text` - إعادة صياغة النصوص
- `humanize-text` - جعل النص أكثر إنسانية
- `summarize-text` - تلخيص النصوص
- `manipulate-text` - معالجة النصوص
- `plagiarism-checker` - فحص الانتحال
- `detect-ai-content` - كشف المحتوى المولد بالذكاء الاصطناعي
- `ai-proofread-document` - مراجعة المستندات بالذكاء الاصطناعي

### توليد المحتوى (`content-generation.ts`)
- `generate-text` - توليد النصوص العامة
- `generate-ideas` - توليد الأفكار
- `generate-code` - توليد الكود
- `generate-codebase` - توليد قاعدة الكود
- `generate-citation` - توليد المراجع
- `generate-quiz` - توليد الاختبارات
- `generate-image` - توليد الصور
- `topic-explainer` - شرح المواضيع
- `generate-agent-config` - توليد تكوين الوكيل

### معالجة المستندات (`document-processing.ts`)
- `write-document` - كتابة المستندات
- `generate-presentation` - توليد العروض التقديمية
- `generate-presentation-outline` - توليد مخططات العروض
- `generate-project-plan` - توليد خطط المشاريع
- `summarize-document` - تلخيص المستندات
- `summarize-project` - تلخيص المشاريع
- `summarize-full-project` - تلخيص المشاريع الكاملة
- `rewrite-document-to-markdown` - إعادة كتابة المستندات إلى Markdown
- `rewrite-to-markdown` - إعادة كتابة إلى Markdown
- `improve-report-markdown` - تحسين تقارير Markdown

### التحليل (`analysis.ts`)
- `analyze-context` - تحليل السياق
- `fact-checker` - فحص الحقائق
- `ai-researcher` - الباحث الذكي
- `evaluate-report` - تقييم التقارير
- `image-to-text` - استخراج النصوص من الصور

### الأكاديمي (`academic.ts`)
- `analyze-academic-document` - تحليل المستندات الأكاديمية
- `solve-academic-document` - حل المستندات الأكاديمية
- `generate-theoretical-lecture` - توليد المحاضرات النظرية
- `generate-session-plan` - توليد خطط الجلسات
- `create-lecture-unit` - إنشاء وحدة محاضرة كاملة

### المرئي (`visual.ts`)
- `generate-diagram` - توليد المخططات
- `generate-plantuml` - توليد PlantUML

## 🔧 التكامل مع النظام الحالي

### تحديث الاستيرادات

```typescript
// النظام القديم
import { grammarCheck } from '@/ai/flows/grammar-checker';
import { summarizeText } from '@/ai/flows/summarize-text';

// النظام الجديد
import { grammarCheck, summarizeText } from '@/ai/flows';
```

### استخدام النظام الموحد

```typescript
import { UnifiedFlows } from '@/ai/flows';

// بدلاً من استدعاء كل دالة منفصلة
const grammarResult = await grammarCheck({ text: 'نص للفحص' });
const summaryResult = await summarizeText({ text: 'نص للتلخيص' });

// يمكنك استخدام الواجهة الموحدة
const results = await UnifiedFlows.executeMultiple([
  { flowName: 'grammar-checker', input: { text: 'نص للفحص' } },
  { flowName: 'summarize-text', input: { text: 'نص للتلخيص' } }
]);
```

## 📈 الفوائد

### 1. تقليل التعقيد
- من 42 ملف إلى 6 ملفات مصنفة
- تنظيم أفضل للكود
- سهولة التنقل

### 2. تحسين الأداء
- تقليل عدد الملفات المحملة
- تحسين tree shaking
- تحميل أسرع

### 3. سهولة الصيانة
- تحديث نمط واحد يؤثر على جميع التدفقات
- إدارة مركزية للأخطاء
- تسجيل موحد

### 4. تجربة مطور أفضل
- استيراد مبسط
- واجهة موحدة
- فهم أسرع للبنية

## 🧪 الاختبار

```typescript
import { UnifiedFlows } from '@/ai/flows';

// اختبار التدفقات المتاحة
const availableFlows = UnifiedFlows.getAvailableFlows();
console.log('التدفقات المتاحة:', availableFlows);

// اختبار تنفيذ تدفق
const result = await UnifiedFlows.execute({
  flowName: 'grammar-checker',
  input: { text: 'هذا نص للاختبار' }
});

console.log('النتيجة:', result);
```

## 🔄 الهجرة من النظام القديم

### الخطوة 1: تحديث الاستيرادات
```typescript
// قبل
import { grammarCheck } from '@/ai/flows/grammar-checker';

// بعد
import { grammarCheck } from '@/ai/flows';
```

### الخطوة 2: استخدام الواجهة الموحدة (اختياري)
```typescript
// قبل
const result = await grammarCheck({ text: 'نص للفحص' });

// بعد (نفس النتيجة)
const result = await UnifiedFlows.execute({
  flowName: 'grammar-checker',
  input: { text: 'نص للفحص' }
});
```

### الخطوة 3: الاستفادة من الميزات الجديدة
```typescript
// تنفيذ متعدد التدفقات
const results = await UnifiedFlows.executeMultiple([
  { flowName: 'grammar-checker', input: { text: 'نص 1' } },
  { flowName: 'summarize-text', input: { text: 'نص 2' } }
]);

// تنفيذ مع إعادة المحاولة
const result = await UnifiedFlows.executeWithRetry(
  { flowName: 'generate-text', input: { prompt: 'مطالبة' } },
  3
);
```

## 🎉 الخلاصة

تم بنجاح إعادة تنظيم نظام التدفقات من 42 ملف منفصل إلى 6 ملفات مصنفة مع:

- ✅ نظام تسجيل مركزي
- ✅ واجهة موحدة
- ✅ تصنيف منطقي
- ✅ تحسين الأداء
- ✅ سهولة الصيانة
- ✅ تجربة مطور محسنة

النظام الجديد يحافظ على جميع الوظائف الموجودة مع إضافة ميزات جديدة وقدرات متقدمة للتعامل مع التدفقات.
