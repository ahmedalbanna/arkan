
# دليل تكامل Ollama - تشغيل نماذج LLM محلياً

## 📋 نظرة عامة

تم تكامل **Ollama** في مشروع Arkan لتمكين تشغيل نماذج الذكاء الاصطناعي محلياً على أجهزة بموارد محدودة (8GB RAM). يتيح هذا التكامل:

✅ **خصوصية كاملة** - البيانات لا تغادر جهازك  
✅ **لا تكاليف API** - استخدام غير محدود بدون رسوم  
✅ **عمل دون اتصال** - لا يتطلب اتصال بالإنترنت  
✅ **استجابة سريعة** - لا توجد تأخيرات شبكة  

---

## 🖥️ متطلبات النظام

### الحد الأدنى (نموذج gemma:2b)
- **RAM**: 8 GB
- **Storage**: 140 GB (تحتاج ~2-3 GB لكل نموذج)
- **CPU**: معالج حديث (يفضل 4 نواة+)
- **نظام التشغيل**: Linux, macOS, أو Windows

### موصى به
- **RAM**: 16 GB+ (لنماذج أكبر)
- **GPU**: NVIDIA GPU مع CUDA (للأداء الأفضل)
- **Storage**: SSD سريع

---

## 📦 التثبيت والإعداد

### الخطوة 1: تثبيت Ollama

#### Linux / macOS:
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

#### Windows:
قم بتنزيل المثبت من [ollama.com/download](https://ollama.com/download)

### الخطوة 2: تحقق من التثبيت

```bash
ollama --version
```

يجب أن ترى رقم الإصدار مثل: `ollama version is 0.1.x`

### الخطوة 3: تشغيل خادم Ollama

```bash
# تشغيل في الخلفية (Linux/macOS)
ollama serve &

# على Windows، سيبدأ تلقائياً كخدمة
```

تحقق من أن الخادم يعمل:
```bash
curl http://localhost:11434/api/tags
```

### الخطوة 4: تنزيل النماذج الموصى بها

#### للأجهزة بـ 8GB RAM (موصى به):
```bash
# النموذج الأساسي - الأفضل للأجهزة المحدودة
ollama pull gemma:2b
```

#### خيارات إضافية:
```bash
# نموذج خفيف جداً (1-2GB RAM)
ollama pull llama3.2:1b

# نموذج متوسط (يحتاج 3-4GB RAM)
ollama pull phi3:mini
```

### الخطوة 5: اختبار النموذج

```bash
ollama run gemma:2b
```

جرب كتابة نص واضغط Enter. إذا حصلت على رد، فالنموذج يعمل! اكتب `/bye` للخروج.

---

## 🔧 إعداد المشروع

### 1. متغيرات البيئة

أضف إلى ملف `.env.local`:

```bash
# اختيار موفر النموذج (google أو ollama)
GENKIT_MODEL_PROVIDER=ollama

# عنوان خادم Ollama (اختياري، الافتراضي: http://localhost:11434)
OLLAMA_SERVER_URL=http://localhost:11434

# النموذج الافتراضي (اختياري، الافتراضي: gemma:2b)
OLLAMA_DEFAULT_MODEL=gemma:2b
```

### 2. بدء خوادم التطوير

```bash
# Terminal 1: تشغيل Next.js
npm run dev

# Terminal 2: تشغيل Genkit Developer UI
npm run genkit:dev
```

---

## 💻 استخدام Ollama في الكود

### مثال 1: استخدام مباشر

```typescript
import { ollamaAi, OLLAMA_CONFIG } from '@/ai/ollama.config';

// توليد نص باستخدام النموذج المحلي
const response = await ollamaAi.generate({
  model: OLLAMA_CONFIG.defaultModel, // gemma:2b
  prompt: 'اكتب فقرة أكاديمية عن الذكاء الاصطناعي',
});

console.log(response.text);
```

### مثال 2: اختيار النموذج حسب المهمة

```typescript
import { getModel } from '@/ai/genkit';

// للمهام السريعة (نموذج خفيف)
const fastModel = await getModel('fast', 'ollama'); // llama3.2:1b

// للاستخدام المتوازن (افتراضي)
const balancedModel = await getModel('balanced', 'ollama'); // gemma:2b

// لأفضل جودة (أبطأ)
const qualityModel = await getModel('quality', 'ollama'); // phi3:mini
```

### مثال 3: التبديل الديناميكي (Hybrid Mode)

```typescript
import { configureHybridAi } from '@/ai/genkit';

// محاولة استخدام Ollama، والعودة إلى Google Gemini إذا فشل
const aiInstance = await configureHybridAi(userApiKeys, true);

const response = await aiInstance.generate({
  model: 'gemma:2b', // سيستخدم Ollama إذا كان متاحاً
  prompt: 'Your prompt here',
});
```

### مثال 4: استخدام الـ Flows الجاهزة

```typescript
import { academicParagraphFlow } from '@/ai/flows/ollama-example';

const result = await academicParagraphFlow({
  topic: 'Artificial Intelligence in Education',
  style: 'introduction',
  wordCount: 150,
  language: 'en',
  useLocal: true, // استخدام Ollama
});

console.log(result.paragraph);
console.log(`Generated with: ${result.model} (${result.provider})`);
```

---

## 📊 مقارنة النماذج

| النموذج | حجم الذاكرة | السرعة | الجودة | الاستخدام الموصى به |
|---------|-------------|---------|---------|---------------------|
| **llama3.2:1b** | 1-2 GB | ⚡⚡⚡ سريع جداً | ⭐⭐ مقبول | مسودات سريعة، إعادة صياغة بسيطة |
| **gemma:2b** | 2-3 GB | ⚡⚡ سريع | ⭐⭐⭐ جيد | الكتابة العامة، الملخصات، التحليل |
| **phi3:mini** | 3-4 GB | ⚡ متوسط | ⭐⭐⭐⭐ ممتاز | الكتابة الأكاديمية، المهام المعقدة |

### توصيات حسب الذاكرة المتوفرة

**إذا كان لديك 8GB RAM:**
- استخدم **gemma:2b** كنموذج أساسي
- تجنب تشغيل تطبيقات ثقيلة أخرى في نفس الوقت
- أغلق متصفحات غير ضرورية

**إذا كان لديك 4-6GB RAM:**
- استخدم **llama3.2:1b** فقط
- تجنب النماذج الأكبر

**إذا كان لديك 16GB+ RAM:**
- يمكنك استخدام أي نموذج
- جرب **phi3:mini** أو حتى نماذج أكبر

---

## 🚀 الأداء والتحسين

### نصائح لتحسين الأداء

1. **استخدم SSD بدلاً من HDD**
   ```bash
   # تحقق من نوع التخزين
   lsblk -d -o name,rota
   # 0 = SSD, 1 = HDD
   ```

2. **راقب استهلاك الذاكرة**
   ```bash
   # Linux
   watch -n 1 free -h
   
   # macOS
   top -l 1 | grep PhysMem
   ```

3. **تفعيل GPU acceleration (إذا كان متاحاً)**
   ```bash
   # تحقق من دعم GPU
   nvidia-smi
   
   # Ollama سيستخدم GPU تلقائياً إذا كان متاحاً
   ```

### زمن الاستجابة المتوقع (CPU فقط)

| المهمة | gemma:2b | llama3.2:1b | phi3:mini |
|--------|----------|-------------|-----------|
| فقرة قصيرة (100 كلمة) | 5-10 ثواني | 3-5 ثواني | 10-15 ثانية |
| فقرة متوسطة (250 كلمة) | 15-25 ثانية | 8-12 ثانية | 25-40 ثانية |
| نص طويل (500 كلمة) | 30-50 ثانية | 15-25 ثانية | 50-80 ثانية |

---

## 🔍 استكشاف الأخطاء

### المشكلة: "Ollama server not available"

**الحل:**
```bash
# تحقق من أن Ollama يعمل
ps aux | grep ollama

# إعادة تشغيل الخادم
killall ollama
ollama serve &
```

### المشكلة: "Model not found"

**الحل:**
```bash
# عرض النماذج المثبتة
ollama list

# تنزيل النموذج المطلوب
ollama pull gemma:2b
```

### المشكلة: النظام بطيء جداً / يتجمد

**الأسباب المحتملة:**
1. النموذج كبير جداً للذاكرة المتوفرة
2. تطبيقات أخرى تستهلك الذاكرة

**الحل:**
```bash
# استخدم نموذج أصغر
ollama pull llama3.2:1b

# أغلق التطبيقات غير الضرورية
# تحقق من استهلاك الذاكرة
free -h  # Linux
top      # macOS/Linux
```

### المشكلة: خطأ في الاتصال بـ localhost:11434

**الحل:**
```bash
# تحقق من المنفذ
netstat -an | grep 11434  # Linux
lsof -i :11434            # macOS

# تغيير المنفذ إذا كان محجوزاً
OLLAMA_HOST=0.0.0.0:11435 ollama serve &

# تحديث متغير البيئة
export OLLAMA_SERVER_URL=http://localhost:11435
```

---

## 📈 الاستخدام المتقدم

### 1. تشغيل عدة نماذج

```bash
# تنزيل نماذج متعددة
ollama pull gemma:2b
ollama pull llama3.2:1b
ollama pull phi3:mini

# عرض النماذج المثبتة
ollama list
```

### 2. تخصيص إعدادات النموذج

```typescript
const response = await ollamaAi.generate({
  model: 'gemma:2b',
  prompt: 'Your prompt',
  config: {
    temperature: 0.7,      // التحكم في الإبداع (0-1)
    maxOutputTokens: 500,  // الحد الأقصى للإخراج
    topK: 40,              // Top-K sampling
    topP: 0.9,             // Nucleus sampling
  },
});
```

### 3. Streaming للاستجابات الطويلة

```typescript
import { ollamaAi } from '@/ai/ollama.config';

const stream = await ollamaAi.generateStream({
  model: 'gemma:2b',
  prompt: 'Write a long essay about AI',
});

for await (const chunk of stream) {
  process.stdout.write(chunk.text);
}
```

---

## 🔐 الأمان والخصوصية

### مزايا الاستخدام المحلي

✅ **لا مشاركة للبيانات**: جميع البيانات تبقى على جهازك  
✅ **لا تتبع**: لا توجد سجلات خارجية  
✅ **GDPR compliant**: مطابق للوائح حماية البيانات  
✅ **لا اتصال بالإنترنت**: يعمل دون اتصال بعد التنزيل  

### نصائح الأمان

- لا تشارك النماذج المحلية على شبكة عامة
- استخدم جدار حماية لحماية المنفذ 11434
- احتفظ بنسخ احتياطية من النماذج المخصصة

---

## 📚 موارد إضافية

- [Ollama Official Documentation](https://github.com/ollama/ollama)
- [Genkit Documentation](https://firebase.google.com/docs/genkit)
- [Model Library](https://ollama.com/library)
- [Community Models](https://ollama.com/models)

---

## 🆘 الدعم

إذا واجهت أي مشاكل:

1. تحقق من [استكشاف الأخطاء](#-استكشاف-الأخطاء) أعلاه
2. راجع [Ollama Issues](https://github.com/ollama/ollama/issues)
3. تحقق من سجلات Genkit: `npm run genkit:dev`

---

## 📝 الخلاصة

تم دمج Ollama بنجاح في مشروع Arkan! يمكنك الآن:

✅ تشغيل نماذج AI محلياً على 8GB RAM  
✅ التبديل بين Google Gemini و Ollama  
✅ توفير تكاليف API  
✅ حماية خصوصية المستخدمين  

**الخطوات التالية:**
1. ثبت Ollama على جهازك
2. نزل نموذج `gemma:2b`
3. جرب الأمثلة في `src/ai/flows/ollama-example.ts`
4. استمتع بالذكاء الاصطناعي المحلي! 🎉
