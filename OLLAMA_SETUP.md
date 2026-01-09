# 🚀 دليل البدء السريع - Ollama Integration

## ⚡ التثبيت السريع (5 دقائق)

### الخطوة 1: تثبيت Ollama

```bash
# Linux/macOS
curl -fsSL https://ollama.com/install.sh | sh

# Windows: تنزيل من https://ollama.com/download
```

### الخطوة 2: تشغيل Ollama وتنزيل النموذج

```bash
# تشغيل خادم Ollama (سيعمل في الخلفية)
ollama serve &

# تنزيل النموذج الموصى به لـ 8GB RAM
ollama pull gemma:2b

# اختبار النموذج
ollama run gemma:2b
```

### الخطوة 3: إعداد متغيرات البيئة

أنشئ ملف `.env.local` في جذر المشروع:

```bash
# استخدام Ollama كموفر افتراضي
GENKIT_MODEL_PROVIDER=ollama

# (اختياري) عنوان خادم Ollama
OLLAMA_SERVER_URL=http://localhost:11434

# (اختياري) النموذج الافتراضي
OLLAMA_DEFAULT_MODEL=gemma:2b
```

### الخطوة 4: تشغيل المشروع

```bash
# تثبيت الحزم (إذا لم تفعل ذلك)
npm install

# تشغيل Next.js
npm run dev

# في terminal آخر: تشغيل Genkit Developer UI
npm run genkit:dev
```

---

## 📖 أمثلة الاستخدام

### مثال 1: توليد نص بسيط

```typescript
import { ollamaAi, OLLAMA_CONFIG } from '@/ai/ollama.config';

const response = await ollamaAi.generate({
  model: OLLAMA_CONFIG.defaultModel,
  prompt: 'اكتب فقرة عن الذكاء الاصطناعي',
});

console.log(response.text);
```

### مثال 2: استخدام الـ Flow الجاهز

```typescript
import { academicParagraphFlow } from '@/ai/flows/ollama-example';

const result = await academicParagraphFlow({
  topic: 'Machine Learning',
  style: 'introduction',
  wordCount: 150,
  language: 'en',
  useLocal: true,
});

console.log(result.paragraph);
console.log(`Model: ${result.model}, Provider: ${result.provider}`);
```

### مثال 3: اختيار النموذج ديناميكياً

```typescript
import { getModelForTask } from '@/ai/genkit';

// للمهام السريعة
const fastModel = getModelForTask('fast', 'ollama');

// للاستخدام المتوازن (افتراضي)
const balancedModel = getModelForTask('balanced', 'ollama');

// لأفضل جودة
const qualityModel = getModelForTask('quality', 'ollama');
```

---

## 🔧 استكشاف الأخطاء

### ❌ خطأ: "Ollama server not available"

```bash
# تحقق من أن Ollama يعمل
curl http://localhost:11434/api/tags

# إعادة تشغيل إذا لزم الأمر
killall ollama
ollama serve &
```

### ❌ خطأ: "Model not found"

```bash
# عرض النماذج المثبتة
ollama list

# تنزيل النموذج
ollama pull gemma:2b
```

### ❌ النظام بطيء جداً

- استخدم نموذج أصغر: `ollama pull llama3.2:1b`
- أغلق التطبيقات الأخرى
- تحقق من استهلاك الذاكرة: `free -h` (Linux) أو Activity Monitor (macOS)

---

## 📊 مقارنة النماذج

| النموذج | RAM | السرعة | الجودة | متى تستخدمه |
|---------|-----|---------|---------|-------------|
| llama3.2:1b | 1-2GB | ⚡⚡⚡ | ⭐⭐ | مسودات سريعة |
| gemma:2b | 2-3GB | ⚡⚡ | ⭐⭐⭐ | الاستخدام العام ✅ |
| phi3:mini | 3-4GB | ⚡ | ⭐⭐⭐⭐ | جودة عالية |

**التوصية لـ 8GB RAM:** استخدم `gemma:2b`

---

## 📚 مزيد من المعلومات

للحصول على دليل شامل، راجع: [`src/ai/OLLAMA_INTEGRATION_GUIDE.md`](src/ai/OLLAMA_INTEGRATION_GUIDE.md)

**الملفات المهمة:**
- `src/ai/ollama.config.ts` - إعدادات Ollama
- `src/ai/genkit.ts` - التكامل الرئيسي
- `src/ai/flows/ollama-example.ts` - أمثلة جاهزة
- `.env.example` - مثال لمتغيرات البيئة

---

## ✅ اكتمل التكامل!

الآن يمكنك:
- ✅ تشغيل AI محلياً على 8GB RAM
- ✅ التبديل بين Google Gemini و Ollama
- ✅ توفير تكاليف API
- ✅ حماية خصوصية البيانات

**Happy Coding! 🎉**
