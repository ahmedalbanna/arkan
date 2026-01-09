# 🚀 Ollama Quick Start Guide

## ✅ التحقق من التكامل

تم تكامل Ollama بنجاح في مشروع Arkan! تم اختباره والتأكد من عمله.

## 🎯 ما تم إنجازه

✅ تثبيت حزمة `genkitx-ollama`  
✅ إنشاء ملف إعداد Ollama (`src/ai/ollama.config.ts`)  
✅ تحديث Genkit لدعم التبديل بين Google و Ollama  
✅ إنشاء utility functions لاختيار النموذج ديناميكياً  
✅ إنشاء flows مثالية جاهزة للاستخدام  
✅ توثيق شامل بالعربية  
✅ اختبار التكامل - يعمل بنجاح ✨  

## 🏃 البدء السريع

### 1. إعداد متغيرات البيئة

أنشئ ملف `.env.local`:

```bash
GENKIT_MODEL_PROVIDER=ollama
OLLAMA_SERVER_URL=http://localhost:11434
OLLAMA_DEFAULT_MODEL=gemma:2b
```

### 2. تشغيل المشروع

```bash
# Terminal 1: Next.js
npm run dev

# Terminal 2: Genkit Developer UI
npm run genkit:dev
```

### 3. استخدم في الكود

```typescript
import { ollamaAi, OLLAMA_CONFIG } from '@/ai/ollama.config';

const response = await ollamaAi.generate({
  model: OLLAMA_CONFIG.defaultModel,
  prompt: 'اكتب فقرة عن الذكاء الاصطناعي',
});
```

## 📚 الملفات الرئيسية

| الملف | الوصف |
|-------|-------|
| `src/ai/ollama.config.ts` | إعدادات Ollama والنماذج |
| `src/ai/genkit.ts` | التكامل مع Genkit |
| `src/ai/flows/ollama-example.ts` | أمثلة جاهزة للاستخدام |
| `src/ai/OLLAMA_INTEGRATION_GUIDE.md` | دليل شامل بالعربية |
| `OLLAMA_SETUP.md` | دليل الإعداد السريع |
| `.env.example` | مثال لمتغيرات البيئة |

## 🎓 أمثلة الاستخدام

### مثال 1: توليد فقرة أكاديمية

```typescript
import { academicParagraphFlow } from '@/ai/flows/ollama-example';

const result = await academicParagraphFlow({
  topic: 'Machine Learning Applications',
  style: 'introduction',
  wordCount: 150,
  language: 'en',
  useLocal: true,
});

console.log(result.paragraph);
// Output: Model: gemma:2b, Provider: ollama
```

### مثال 2: إعادة صياغة نص

```typescript
import { paraphraseFlow } from '@/ai/flows/ollama-example';

const result = await paraphraseFlow({
  text: 'AI is transforming industries.',
  style: 'academic',
  useLocal: true,
});

console.log(result.paraphrased);
```

### مثال 3: التبديل الديناميكي

```typescript
import { configureHybridAi } from '@/ai/genkit';

// سيستخدم Ollama إذا كان متاحاً، وإلا Google Gemini
const ai = await configureHybridAi(userApiKeys, true);

const response = await ai.generate({
  model: 'gemma:2b',
  prompt: 'Your prompt here',
});
```

## 🔧 النماذج المتاحة

### على جهازك حالياً:
```bash
$ ollama list
NAME            SIZE    MODIFIED
gemma:2b        1.7GB   2 minutes ago
```

### نماذج موصى بها للأجهزة بـ 8GB RAM:

| النموذج | حجم الذاكرة | السرعة | الجودة | التحميل |
|---------|-------------|---------|---------|---------|
| **llama3.2:1b** | 1-2GB | ⚡⚡⚡ | ⭐⭐ | `ollama pull llama3.2:1b` |
| **gemma:2b** ✅ | 2-3GB | ⚡⚡ | ⭐⭐⭐ | `ollama pull gemma:2b` |
| **phi3:mini** | 3-4GB | ⚡ | ⭐⭐⭐⭐ | `ollama pull phi3:mini` |

## 🎯 حالات الاستخدام

### ✅ متى تستخدم Ollama (المحلي):
- عند الحاجة للخصوصية الكاملة
- لتوفير تكاليف API
- للعمل بدون اتصال بالإنترنت
- للتطوير والاختبار المحلي

### ✅ متى تستخدم Google Gemini (السحابة):
- للنماذج الأكبر والأقوى
- عند الحاجة لأداء أسرع (مع GPU سحابي)
- للمهام المعقدة جداً
- عندما لا تكفي موارد الجهاز المحلي

## 📊 نتائج الاختبار

```
🔍 Testing Ollama Integration...

✅ Ollama Server: Available
📦 Installed Models: gemma:2b

📝 Testing text generation with gemma:2b ...
✅ Generation Successful!
Response: Sure, here's a one-sentence definition of AI:

Artificial Intelligence (AI) is the simulation of human 
intelligence processes by machines through computer algorithms 
and data-driven learning.
```

**زمن الاستجابة:** ~3-5 ثواني لجملة واحدة (CPU فقط)

## 🆘 الدعم والمساعدة

### مشكلة شائعة: "Ollama not available"

```bash
# تحقق من حالة Ollama
curl http://localhost:11434/api/tags

# إعادة تشغيل
ollama serve &
```

### الحصول على المساعدة

1. راجع الدليل الشامل: `src/ai/OLLAMA_INTEGRATION_GUIDE.md`
2. تحقق من الأمثلة: `src/ai/flows/ollama-example.ts`
3. [Ollama Documentation](https://github.com/ollama/ollama)
4. [Genkit Documentation](https://firebase.google.com/docs/genkit)

## 🎉 مبروك!

لقد تم تكامل Ollama بنجاح! يمكنك الآن:
- ✅ تشغيل AI محلياً على 8GB RAM
- ✅ توفير تكاليف API
- ✅ حماية خصوصية البيانات
- ✅ العمل دون اتصال بالإنترنت

**Happy Coding! 🚀**
