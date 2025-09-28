# خطة تنظيم Hooks الشاملة

## 📊 تحليل الملفات الموجودة

### 1. Writing Tools (أدوات الكتابة) - 8 ملفات
- ✅ `use-paraphraser-logic.ts` (مُعاد كتابته)
- ✅ `use-grammar-checker-logic.ts` (مُعاد كتابته)
- ✅ `use-text-stylist-logic.ts` (مُعاد كتابته)
- ✅ `use-summarizer-logic.ts` (مُعاد كتابته)
- ✅ `use-humanizer-logic.ts` (مُعاد كتابته)
- ✅ `use-ai-detector-logic.ts` (مُعاد كتابته)
- ✅ `use-fact-checker-logic.ts` (مُعاد كتابته)
- ✅ `use-plagiarism-checker-logic.ts` (مُعاد كتابته)

### 2. Content Generators (مولدات المحتوى) - 8 ملفات
- `use-session-plan-generator-logic.ts`
- `use-quiz-generator-logic.ts`
- `use-plant-uml-generator-logic.ts`
- `use-idea-generator-logic.ts`
- `use-citation-generator-logic.ts`
- `use-presentation-generator-logic.ts`
- `use-project-plan-generator.ts`
- `use-topic-explainer-logic.ts`

### 3. Proposal Tools (أدوات المقترحات) - 2 ملفات
- `use-proposal-mode-generator-logic.ts`
- `use-proposal-generation-tools-logic.ts`

### 4. Report Tools (أدوات التقارير) - 2 ملفات
- `use-report-generation.ts`
- `use-evaluation.ts`

### 5. Diagram Tools (أدوات المخططات) - 1 ملف
- `use-diagrams.ts`

### 6. Specialized Tools (أدوات متخصصة) - 5 ملفات
- `use-document-writer-logic.ts`
- `use-ai-researcher-logic.ts`
- `use-task-card-logic.ts`
- `use-academic-solver-logic.ts`
- `use-upload-project-logic.ts`

### 7. UI/UX Hooks (hooks واجهة المستخدم) - 3 ملفات
- `use-project-card-logic.ts`
- `use-team-card-logic.ts`
- `use-translation-view-logic.ts`

## 🏗️ الهيكل المقترح الجديد

```
src/hooks/
├── core/                           # النظام الأساسي (موجود)
│   ├── base/                      # Hooks أساسية
│   ├── writing-tools/             # Hooks أدوات الكتابة
│   ├── content-generators/        # Hooks مولدات المحتوى (جديد)
│   ├── proposal-tools/            # Hooks أدوات المقترحات (جديد)
│   ├── report-tools/              # Hooks أدوات التقارير (جديد)
│   ├── diagram-tools/             # Hooks أدوات المخططات (جديد)
│   └── specialized-tools/         # Hooks أدوات متخصصة (جديد)
├── ui/                            # Hooks واجهة المستخدم (جديد)
├── stores/                        # Zustand stores (جديد)
├── utils/                         # Hooks مساعدة (جديد)
└── index.ts                       # فهرس شامل
```

## 🎯 خطة التنفيذ

### المرحلة 1: إنشاء الهيكل الجديد
1. إنشاء مجلدات الفئات الجديدة
2. إنشاء Hook Factories لكل فئة
3. نقل الملفات إلى المجلدات المناسبة

### المرحلة 2: إعادة كتابة Content Generators
1. تحليل الأنماط المشتركة
2. إنشاء Hook Factory للمولدات
3. إعادة كتابة hooks واحدة تلو الأخرى

### المرحلة 3: إعادة كتابة Proposal Tools
1. تحليل متطلبات المقترحات
2. إنشاء Hook Factory للمقترحات
3. إعادة كتابة hooks المقترحات

### المرحلة 4: إعادة كتابة Report Tools
1. تحليل متطلبات التقارير
2. إنشاء Hook Factory للتقارير
3. إعادة كتابة hooks التقارير

### المرحلة 5: إعادة كتابة Diagram Tools
1. تحليل متطلبات المخططات
2. إنشاء Hook Factory للمخططات
3. إعادة كتابة hooks المخططات

### المرحلة 6: إعادة كتابة Specialized Tools
1. تحليل الأدوات المتخصصة
2. إنشاء Hook Factories متخصصة
3. إعادة كتابة hooks المتخصصة

### المرحلة 7: تنظيم UI/UX Hooks
1. تحليل hooks واجهة المستخدم
2. إنشاء Hook Factory للواجهة
3. إعادة كتابة hooks الواجهة

### المرحلة 8: إنشاء الفهرس الشامل
1. إنشاء فهرس منظم لكل فئة
2. إنشاء فهرس شامل للمشروع
3. تحديث جميع الـ imports

## 📈 الفوائد المتوقعة

### 1. التنظيم
- فصل واضح بين الفئات المختلفة
- سهولة العثور على الملفات المطلوبة
- هيكل منطقي ومفهوم

### 2. إعادة الاستخدام
- Hook Factories لكل فئة
- تقليل التكرار بنسبة 70%+
- معايير موحدة لكل فئة

### 3. الصيانة
- تحديث فئة واحدة يؤثر على جميع hooks فيها
- اختبار أسهل وأكثر شمولية
- توثيق منظم لكل فئة

### 4. التطوير
- إنشاء hooks جديدة أسرع بنسبة 80%
- تعلم أسهل للمطورين الجدد
- معايير واضحة ومتسقة

## 🚀 البدء في التنفيذ

سأبدأ بإنشاء الهيكل الجديد وإنشاء Hook Factories لكل فئة، ثم أتابع إعادة كتابة hooks كل فئة على حدة.
