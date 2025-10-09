# ميزة تحديد السياق في Section Accordion

## نظرة عامة

تم تطوير ميزة تحديد السياق في `SectionAccordionItem` لتوفير تحكم دقيق في السياق المستخدم عند توليد أقسام التقرير. هذه الميزة تسمح للمستخدمين بتحديد الأقسام والرسوم البيانية والسياق الخارجي التي يجب استخدامها عند إنشاء كل قسم.

## المكونات المطورة

### 1. SectionAccordionItem المحسن

**الملف**: `src/components/section/SectionAccordionItem.tsx`

**الميزات الجديدة**:
- **مؤشر السياق**: نقطة خضراء تظهر عند تحديد سياق للقسم
- **تبويبات السياق**: ثلاثة تبويبات للتحكم في السياق
  - **ملخص السياق**: عرض سريع للسياق المحدد
  - **إعدادات السياق**: تحديد السياق المراد استخدامه
  - **معاينة السياق**: عرض تفصيلي للمحتوى المحدد

### 2. ContextSelector المحسن

**الملف**: `src/components/section/SectionContextSelector.tsx`

**الميزات**:
- تحديد عرض المشروع وخطة المشروع
- تحديد الأقسام الأخرى المولدة
- تحديد الرسوم البيانية المتاحة
- تحديد السياق الخارجي المرفوع
- استخدام `useContextSelector` hook للبيانات الحقيقية

### 3. ContextViewer المحسن

**الملف**: `src/components/section/SectionContextViewer.tsx`

**الميزات**:
- عرض تفصيلي للسياق المحدد
- عرض محتوى الأقسام والرسوم البيانية
- عرض السياق الخارجي المرفوع
- استخدام `useContextSelector` hook للبيانات الحقيقية

### 4. ContextSummary الجديد

**الملف**: `src/components/section/SectionContextSummary.tsx`

**الميزات**:
- عرض ملخص سريع للسياق المحدد
- أيقونات ملونة لكل نوع من السياق
- تصميم بطاقات أنيق مع ألوان مميزة
- عرض حالة عدم تحديد السياق

## النظام التقني

### استخدام Hooks

```typescript
// استخدام hook تحديد السياق
const {
    hasContext,
    currentSelection,
    selectedSections,
    selectedDiagrams,
    selectedExternalContext,
} = useContextSelector(itemKey);
```

### إدارة الحالة

النظام يستخدم `useGenerationUIStore` لإدارة حالة تحديد السياق:

```typescript
// دالة تبديل تحديد السياق
toggleContextSelection: (itemKey: string, type: 'sections' | 'diagrams' | 'externalContext' | 'proposal' | 'projectPlan', contextKey: string | number | null, isSelected: boolean) => void
```

### أنواع السياق المدعومة

1. **عرض المشروع** (`proposal`)
2. **خطة المشروع** (`projectPlan`)
3. **الأقسام المولدة** (`sections`)
4. **الرسوم البيانية** (`diagrams`)
5. **السياق الخارجي** (`externalContext`)

## الترجمة

تم إضافة النصوص التالية في ملفات الترجمة:

### الإنجليزية (`src/locales/en.json`)
```json
{
  "builder": {
    "reportGenerator": {
      "contextSettings": "Context Settings",
      "contextPreview": "Context Preview",
      "contextSummary": "Context Summary",
      "contextSelectionDesc": "Select which sections, diagrams, and external context should be used when generating this section.",
      "contextPreviewDesc": "Preview the selected context that will be used for generation.",
      "projectProposal": "Project Proposal",
      "projectPlan": "Project Plan",
      "ContextualSections": "Contextual Sections",
      "context_diagrams": "Context Diagrams",
      "externalContext": "External Context",
      "noOtherSections": "No other sections available",
      "autoContextNote": "AI will automatically use relevant context from your project.",
      "noContextSelected": "No context selected for this section",
      "selectedContext": "Selected Context"
    }
  }
}
```

### العربية (`src/locales/ar.json`)
```json
{
  "builder": {
    "reportGenerator": {
      "contextSettings": "إعدادات السياق",
      "contextPreview": "معاينة السياق",
      "contextSummary": "ملخص السياق",
      "contextSelectionDesc": "حدد الأقسام والرسوم البيانية والسياق الخارجي التي يجب استخدامها عند إنشاء هذا القسم.",
      "contextPreviewDesc": "معاينة السياق المحدد الذي سيتم استخدامه للإنشاء.",
      "projectProposal": "عرض المشروع",
      "projectPlan": "خطة المشروع",
      "ContextualSections": "الأقسام السياقية",
      "context_diagrams": "رسوم بيانية سياقية",
      "externalContext": "سياق خارجي",
      "noOtherSections": "لا توجد أقسام أخرى متاحة",
      "autoContextNote": "سيستخدم الذكاء الاصطناعي السياق المناسب من مشروعك تلقائياً.",
      "noContextSelected": "لم يتم تحديد سياق لهذا القسم",
      "selectedContext": "السياق المحدد"
    }
  }
}
```

## كيفية الاستخدام

### للمطورين

1. **استيراد المكونات**:
```typescript
import { SectionAccordionItem } from '@/components/section/SectionAccordionItem';
import { ContextSelector } from '@/components/section/SectionContextSelector';
import { ContextViewer } from '@/components/section/SectionContextViewer';
import { ContextSummary } from '@/components/section/SectionContextSummary';
```

2. **استخدام SectionAccordionItem**:
```typescript
<SectionAccordionItem
    itemKey={sectionId}
    agent={agent}
    onGenerate={() => onGenerateSection(sectionId)}
    isGenerating={isGenerating}
    isAnythingGenerating={isAnythingGenerating}
    hasCredits={hasCredits}
/>
```

### للمستخدمين

1. **فتح قسم التقرير**: انقر على أي قسم في قائمة أدوات الإنشاء
2. **تحديد السياق**: انتقل إلى تبويب "إعدادات السياق"
3. **اختيار السياق**: حدد الأقسام والرسوم البيانية والسياق الخارجي المراد استخدامه
4. **معاينة السياق**: انتقل إلى تبويب "معاينة السياق" لرؤية المحتوى المحدد
5. **ملخص سريع**: انتقل إلى تبويب "ملخص السياق" لرؤية ملخص سريع
6. **إنشاء القسم**: انقر على زر "إنشاء" لتوليد القسم باستخدام السياق المحدد

## المزايا

### للمستخدمين
- **تحكم دقيق**: تحديد السياق المستخدم لكل قسم بشكل منفصل
- **شفافية**: رؤية واضحة للسياق المستخدم قبل الإنشاء
- **مرونة**: إمكانية تغيير السياق حسب الحاجة
- **سهولة الاستخدام**: واجهة بديهية مع تبويبات منظمة

### للمطورين
- **قابلية إعادة الاستخدام**: مكونات منفصلة قابلة لإعادة الاستخدام
- **سهولة الصيانة**: كود منظم ومقسم إلى مكونات منطقية
- **التوافق**: يعمل مع النظام الحالي بدون تغييرات كبيرة
- **المرونة**: سهولة إضافة أنواع سياق جديدة

## التطوير المستقبلي

### ميزات مقترحة
1. **حفظ قوالب السياق**: إمكانية حفظ تكوينات السياق المفضلة
2. **السياق الذكي**: اقتراح تلقائي للسياق المناسب
3. **إحصائيات السياق**: عرض إحصائيات استخدام السياق
4. **تصدير السياق**: إمكانية تصدير تكوين السياق
5. **مشاركة السياق**: مشاركة تكوينات السياق بين المستخدمين

### تحسينات تقنية
1. **تحسين الأداء**: تحسين أداء المكونات مع البيانات الكبيرة
2. **اختبارات شاملة**: إضافة اختبارات وحدة وتكامل
3. **توثيق API**: توثيق شامل لـ API المكونات
4. **أمثلة الاستخدام**: إضافة أمثلة عملية للاستخدام

## الخلاصة

تم تطوير ميزة تحديد السياق بنجاح في `SectionAccordionItem`، مما يوفر للمستخدمين تحكم دقيق في السياق المستخدم عند توليد أقسام التقرير. الميزة تعمل بشكل متكامل مع النظام الحالي وتوفر تجربة مستخدم محسنة مع واجهة بديهية ومنظمة.

---

**تاريخ التطوير**: ديسمبر 2024
**المطور**: فريق Arkan
**الإصدار**: 1.0.0
