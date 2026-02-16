# 🚀 مرجع سريع: إجبار Ollama Gemma:2b على إخراج JSON صحيح

## 📦 الأدوات الجاهزة

### 1️⃣ التحقق من المخرجات
```typescript
import { validateJsonOutput } from '@/ai/utils/json-output-validator';

const result = validateJsonOutput({
  schema: MySchema,
  output: modelOutput,
  flowName: 'اسم الـ flow',
  attemptRecovery: true,
  enableLogging: true,
});

if (result.success) {
  return result.data!;
}
```

### 2️⃣ تعليمات JSON للـ Prompts
```typescript
import { getJsonPromptInstructions } from '@/ai/utils/json-output-validator';

const prompt = `أنت مساعد خبير...

${getJsonPromptInstructions(`{
  "الحقل1": "القيمة",
  "الحقل2": 123
}`)}

المهمة: ...
`;
```

### 3️⃣ درجات الحرارة الموصى بها
```typescript
import { RECOMMENDED_TEMPERATURES } from '@/ai/utils/json-output-validator';

config: {
  temperature: RECOMMENDED_TEMPERATURES.PRECISE,    // 0.2 - دقة عالية
  temperature: RECOMMENDED_TEMPERATURES.BALANCED,   // 0.5 - متوازن
  temperature: RECOMMENDED_TEMPERATURES.CREATIVE,   // 0.8 - إبداعي
}
```

---

## ✨ النمط الكامل

```typescript
'use server';

import { ai } from '@/ai/genkit';
import { InputSchema, OutputSchema } from '@/ai/schemas';
import { 
  validateJsonOutput, 
  getJsonPromptInstructions, 
  RECOMMENDED_TEMPERATURES 
} from '@/ai/utils/json-output-validator';

// 1. الـ Prompt
const myPrompt = ai.definePrompt({
  name: 'myPrompt',
  input: { schema: InputSchema },
  output: { schema: OutputSchema },
  model: 'ollama/gemma:2b',
  
  prompt: `أنت خبير في...

${getJsonPromptInstructions(`{
  "النتيجة": "النص هنا"
}`)}

**المهمة:**
{{{المدخل}}}

**إخراج JSON:**`,
  
  config: {
    responseSchema: OutputSchema,
    temperature: RECOMMENDED_TEMPERATURES.BALANCED,
  },
});

// 2. الـ Flow
const myFlow = ai.defineFlow({
  name: 'myFlow',
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
}, async (input) => {
  try {
    const { output } = await myPrompt(input);
    
    if (!output) {
      throw new Error('لم يتم استلام مخرجات');
    }

    const validation = validateJsonOutput({
      schema: OutputSchema,
      output,
      flowName: 'myFlow',
      attemptRecovery: true,
      enableLogging: true,
      fallbackFn: (rawOutput) => {
        if (typeof rawOutput === 'string') {
          return { النتيجة: rawOutput };
        }
        return null;
      },
    });

    if (!validation.success) {
      throw new Error(validation.error || 'فشل التحقق');
    }

    return validation.data!;
  } catch (error) {
    console.error('خطأ في myFlow:', error);
    throw new Error(`فشل: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
  }
});

// 3. الدالة المُصدّرة
export async function myFunction(input: InputType): Promise<OutputType> {
  const validation = InputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`مدخلات غير صحيحة: ${validation.error.message}`);
  }
  return myFlow(validation.data);
}
```

---

## 📋 قائمة التحقق السريعة

عند إنشاء أو تحسين Flow:

- [ ] أضف `model: 'ollama/gemma:2b'`
- [ ] استخدم `getJsonPromptInstructions()` في الـ prompt
- [ ] أضف `responseSchema` في config
- [ ] اختر درجة حرارة مناسبة من `RECOMMENDED_TEMPERATURES`
- [ ] استخدم `validateJsonOutput()` للتحقق
- [ ] أضف `fallbackFn` للحالات الطارئة
- [ ] أضف معالجة أخطاء شاملة (try/catch)
- [ ] أضف logging مفيد

---

## 🎯 أمثلة حسب نوع المهمة

### مهمة دقيقة (استخراج بيانات، تلخيص)
```typescript
config: {
  responseSchema: OutputSchema,
  temperature: RECOMMENDED_TEMPERATURES.PRECISE, // 0.2
}
```

### مهمة متوازنة (بحث، كتابة أكاديمية)
```typescript
config: {
  responseSchema: OutputSchema,
  temperature: RECOMMENDED_TEMPERATURES.BALANCED, // 0.5
}
```

### مهمة إبداعية (توليد أفكار، محتوى إبداعي)
```typescript
config: {
  responseSchema: OutputSchema,
  temperature: RECOMMENDED_TEMPERATURES.CREATIVE, // 0.8
}
```

---

## 🔧 حل المشاكل الشائعة

### المشكلة: النموذج يُخرج نص عادي بدلاً من JSON
**الحل:**
```typescript
fallbackFn: (rawOutput) => {
  if (typeof rawOutput === 'string') {
    return { الحقل_الرئيسي: rawOutput };
  }
  return null;
}
```

### المشكلة: JSON محاط بـ markdown blocks
**الحل:** `validateJsonOutput()` ينظفها تلقائياً!

### المشكلة: حقول ناقصة في JSON
**الحل:** اجعل الحقول optional في Schema أو حدد قيم افتراضية

### المشكلة: النموذج لا يلتزم بالبنية
**الحل:**
1. اخفض درجة الحرارة إلى 0.2
2. وضّح التعليمات أكثر في الـ prompt
3. أضف مثالاً دقيقاً للـ JSON المطلوب

---

## 📚 Flows المحسّنة (جاهزة للاستخدام)

✅ **summarize-text.ts** - تلخيص النصوص
✅ **ai-researcher.ts** - البحث بالذكاء الاصطناعي
✅ **literature-review-generator.ts** - توليد مراجعات أدبية
✅ **generate-theoretical-lecture.ts** - توليد محاضرات نظرية

---

## 🎓 للمزيد من المعلومات

- **التوثيق الشامل:** `tmp_rovodev_flows_improvements_summary.md`
- **التوثيق التفصيلي:** `tmp_rovodev_summarize_improvements.md`
- **ملف الاختبار:** `tmp_rovodev_test_summarize.ts`
- **الأدوات المساعدة:** `src/ai/utils/json-output-validator.ts`

---

## 💡 نصيحة ذهبية

> **"الوضوح هو المفتاح"**
> 
> النماذج الصغيرة مثل gemma:2b تحتاج تعليمات واضحة جداً.
> استخدم كلمات مثل "MUST"، "ONLY"، "CRITICAL" في prompts
> واعرض أمثلة دقيقة للبنية المطلوبة.

---

## 🚀 البدء السريع

1. **انسخ النمط الكامل من أعلى**
2. **عدّل الـ schemas والـ prompts حسب حاجتك**
3. **اختبر مع نصوص مختلفة**
4. **راقب الـ logs للتأكد من نجاح التحقق**

✨ **بالتوفيق!** ✨
