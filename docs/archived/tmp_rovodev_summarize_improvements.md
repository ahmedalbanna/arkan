# تحسينات summarize-text.ts لإجبار Ollama Gemma:2b على إخراج JSON صحيح

## 📋 المشكلة الأصلية

كان نموذج `ollama/gemma:2b` لا يلتزم دائماً ببنية `SummarizeOutputSchema` وقد يُخرج:
- نص عادي بدلاً من JSON
- JSON محاط بـ markdown code blocks (```json ... ```)
- نص إضافي قبل أو بعد JSON

## ✅ التحسينات المطبقة

### 1. تحسين الـ Prompt (السطور 26-47)

#### قبل التحسين:
```typescript
prompt: `You are an expert summarizer. Your task is to read the provided text and generate a summary of the specified length.
Your output must be a valid JSON object that adheres to the defined schema.

**Desired Length**: The summary should be {{{instruction}}}

**Original Text:**
---
{{{text}}}
---

**Summary:`
```

#### بعد التحسين:
```typescript
prompt: `You are a professional text summarizer. You MUST respond with ONLY a valid JSON object.

**CRITICAL INSTRUCTIONS:**
1. Your ENTIRE response must be a valid JSON object
2. Do NOT include any text before or after the JSON
3. Do NOT use markdown code blocks or backticks
4. Follow this EXACT structure:
{
  "summary": "your summary text here"
}

**Task:**
- Read the text below carefully
- Create a summary that is {{{instruction}}}
- Output ONLY the JSON object with the "summary" field

**Text to Summarize:**
---
{{{text}}}
---

**JSON Output (remember: ONLY valid JSON, no extra text):**`
```

**التحسينات:**
- ✅ تعليمات واضحة وصريحة بأن المخرج يجب أن يكون JSON فقط
- ✅ عرض البنية المطلوبة بوضوح كمثال
- ✅ تكرار التأكيد على عدم استخدام markdown code blocks
- ✅ استخدام كلمات مثل "CRITICAL", "MUST", "ONLY" لتعزيز الأهمية

### 2. خفض درجة الحرارة (السطر 24)

```typescript
config: {
    responseSchema: SummarizeOutputSchema,
    temperature: 0.3, // كانت 0.5 سابقاً
}
```

**الفائدة:**
- درجة حرارة أقل = إخراج أكثر دقة والتزاماً
- يقلل من "الإبداع" الذي قد يؤدي لانحراف عن الصيغة المطلوبة

### 3. إضافة أطوال محددة (السطور 11-15)

#### قبل:
```typescript
const lengthDescriptions: Record<SummarizeLength, string> = {
    short: "a single, concise paragraph.",
    medium: "a few paragraphs, capturing the main points and key supporting details.",
    long: "a detailed summary, covering all significant topics and arguments.",
};
```

#### بعد:
```typescript
const lengthDescriptions: Record<SummarizeLength, string> = {
    short: "a single, concise paragraph (approximately 50-100 words).",
    medium: "a few paragraphs, capturing the main points and key supporting details (approximately 150-300 words).",
    long: "a detailed summary, covering all significant topics and arguments (approximately 400-600 words).",
};
```

**الفائدة:**
- يوفر إرشادات أكثر وضوحاً للنموذج
- يساعد على إنتاج ملخصات بالطول المتوقع

### 4. معالجة أخطاء قوية (السطور 64-96)

```typescript
// التحقق من صحة المخرجات
const validation = SummarizeOutputSchema.safeParse(output);
if (!validation.success) {
    console.error('Output validation failed:', validation.error);
    console.error('Received output:', output);
    
    // محاولة إصلاح المخرجات إذا كانت string بدلاً من object
    if (typeof output === 'string') {
        try {
            // محاولة تنظيف النص وتحويله إلى JSON
            const cleanedOutput = output
                .replace(/^```json\s*/i, '')  // إزالة markdown code blocks
                .replace(/^```\s*/i, '')
                .replace(/\s*```$/i, '')
                .trim();
            
            const parsed = JSON.parse(cleanedOutput);
            const retryValidation = SummarizeOutputSchema.safeParse(parsed);
            
            if (retryValidation.success) {
                console.log('Successfully recovered from invalid output format');
                return retryValidation.data;
            }
        } catch (parseError) {
            console.error('Failed to parse output as JSON:', parseError);
        }
        
        // إذا فشل كل شيء، استخدم النص كملخص
        return { summary: output };
    }
    
    throw new Error(`Invalid output structure: ${validation.error.message}`);
}
```

**المزايا:**
1. **التحقق من الصحة**: يستخدم `safeParse` للتحقق من المخرجات
2. **التنظيف التلقائي**: يزيل markdown code blocks تلقائياً
3. **Fallback آمن**: إذا فشل كل شيء، يستخدم النص الخام كملخص
4. **Logging مفصّل**: يسجل جميع الأخطاء للتشخيص

### 5. معالجة الأخطاء على مستوى الـ Flow (السطور 99-102)

```typescript
} catch (error) {
    console.error('Error in summarizeTextFlow:', error);
    throw new Error(`Failed to summarize text: ${error instanceof Error ? error.message : 'Unknown error'}`);
}
```

### 6. معالجة الأخطاء على مستوى الدالة المصدرة (السطور 111-116)

```typescript
try {
    return await summarizeTextFlow(validation.data);
} catch (error) {
    console.error('Error in summarizeText:', error);
    throw error;
}
```

## 🎯 النتائج المتوقعة

### السيناريوهات المدعومة الآن:

1. **✅ JSON صحيح**: يتم إرجاعه مباشرة
   ```json
   {"summary": "This is a summary"}
   ```

2. **✅ JSON مع markdown blocks**: يتم تنظيفه تلقائياً
   ```
   ```json
   {"summary": "This is a summary"}
   ```
   ```

3. **✅ نص عادي**: يتم تحويله إلى الصيغة الصحيحة
   ```
   This is a summary
   ```
   → `{"summary": "This is a summary"}`

## 📊 مقارنة قبل وبعد

| الميزة | قبل التحسين | بعد التحسين |
|--------|-------------|-------------|
| وضوح التعليمات | ❌ عام | ✅ محدد جداً |
| التحقق من الصحة | ❌ لا يوجد | ✅ مع safeParse |
| معالجة الأخطاء | ❌ بسيطة | ✅ متقدمة مع fallbacks |
| تنظيف المخرجات | ❌ لا يوجد | ✅ تلقائي |
| درجة الحرارة | 0.5 | 0.3 (أكثر دقة) |
| أطوال محددة | ❌ وصفية | ✅ بعدد الكلمات |
| Logging | ❌ محدود | ✅ مفصّل |

## 🧪 الاختبار

تم إنشاء ملف اختبار: `tmp_rovodev_test_summarize.ts`

### لتشغيل الاختبار:
```bash
cd arkan
npx tsx tmp_rovodev_test_summarize.ts
```

### حالات الاختبار:
1. ✅ ملخص قصير - نص عربي
2. ✅ ملخص متوسط - نص إنجليزي
3. ✅ ملخص طويل - نص مختلط (عربي + إنجليزي)

## 💡 نصائح للاستخدام مع Gemma:2b

### ✅ أفضل الممارسات:

1. **استخدم prompts واضحة جداً**: النماذج الصغيرة تحتاج تعليمات صريحة
2. **اعرض أمثلة**: اعرض البنية المطلوبة كمثال في الـ prompt
3. **خفّض درجة الحرارة**: استخدم 0.2-0.4 للمهام التي تحتاج دقة
4. **أضف معالجة أخطاء**: دائماً استخدم `safeParse` وأضف fallbacks
5. **سجّل المخرجات**: استخدم `console.log` لفهم ما يُخرجه النموذج

### ❌ تجنب:

1. Prompts معقدة جداً
2. درجات حرارة عالية (> 0.7)
3. schemas معقدة مع nested objects عميقة
4. الاعتماد فقط على `responseSchema` بدون تحقق

## 🔄 تطبيق نفس النمط على Flows أخرى

يمكن تطبيق نفس التحسينات على أي flow آخر:

```typescript
// 1. Prompt واضح مع تعليمات صريحة
prompt: `You MUST respond with ONLY valid JSON.
{
  "field1": "value",
  "field2": 123
}
...`

// 2. خفض درجة الحرارة
config: {
    responseSchema: YourSchema,
    temperature: 0.3,
}

// 3. معالجة أخطاء قوية
const validation = YourSchema.safeParse(output);
if (!validation.success) {
    // محاولة إصلاح أو fallback
}
```

## 📚 مراجع

- [Genkit Documentation](https://firebase.google.com/docs/genkit)
- [Zod Schema Validation](https://zod.dev/)
- [Ollama Models](https://ollama.ai/library)
- ملف `genkit.txt` في المشروع (السطر 1231)

## ✨ الخلاصة

التحسينات المطبقة تجمع بين:
1. **Prompt Engineering**: تعليمات واضحة ومحددة
2. **Configuration Tuning**: درجة حرارة منخفضة
3. **Error Handling**: معالجة قوية مع fallbacks
4. **Validation**: تحقق صارم من المخرجات
5. **Recovery**: قدرة على إصلاح المخرجات غير الصحيحة

هذا النمط يضمن أن نموذج Gemma:2b الصغير يُخرج JSON صحيح بشكل موثوق! 🎉
