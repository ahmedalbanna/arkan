# نظام تنظيم السياق المحسن - Arkan

## نظرة عامة

تم تطوير نظام تنظيم السياق المحسن لحل مشكلة عدم تضمين جميع أنواع السياقات في تدفق الذكاء الاصطناعي. النظام الجديد يقوم بتنظيم السياقات حسب نوع المعرفة والأهمية قبل إرسالها إلى الذكاء الاصطناعي.

## المشكلة التي تم حلها

**المشكلة الأصلية**: كان فقط السياقات من نوع `context` يتم تضمينها في التدفق، بينما السياقات من أنواع أخرى مثل `example`, `question`, `textbook`, `guidelines` لم تكن تُضمن.

**الحل**: تم تطوير نظام شامل يجمع جميع السياقات المحددة (بغض النظر عن النوع) وينظمها حسب المعرفة والأهمية.

## المكونات الجديدة

### 1. ContextOrganizer (`src/ai/core/context-organizer.ts`)

```typescript
export class ContextOrganizer {
    static organizeContexts(
        contexts: ContextItem[],
        targetSection?: string,
        userRequirements?: string[]
    ): OrganizedContext
}
```

**الوظائف**:
- تحليل السياقات وتحديد نوع المعرفة (أساسية، مفاهيمية، إجرائية، مرجعية)
- حساب درجة الصلة والأهمية لكل سياق
- تنظيم السياقات حسب الأولوية والمعرفة
- إنتاج إحصائيات شاملة

### 2. OrganizedContextDisplay (`src/components/section/OrganizedContextDisplay.tsx`)

مكون واجهة المستخدم لعرض السياقات المنظمة:

```typescript
interface OrganizedContextDisplayProps {
    organizedContext: any;
    itemKey: string;
}
```

**الميزات**:
- عرض السياقات مقسمة حسب نوع المعرفة
- إحصائيات مفصلة عن السياقات
- ألوان مميزة لكل نوع معرفة
- دعم الترجمة العربية والإنجليزية

### 3. useSectionGenerationData (`src/hooks/use-section-generation-data.ts`)

Hook محسن يجمع جميع البيانات المطلوبة:

```typescript
export function useSectionGenerationData(itemKey: string) {
    // يجمع السياقات المحددة
    // ينظمها باستخدام ContextOrganizer
    // يعد البيانات للإرسال إلى API
}
```

## التحديثات في المكونات الموجودة

### 1. SectionAccordionItem

**التحديثات**:
- إضافة تبويب جديد "السياق المنظم" (`organized`)
- استخدام `useSectionGenerationData` للحصول على السياق المنظم
- عرض إحصائيات السياق في مؤشر السياق
- دمج `OrganizedContextDisplay` في الواجهة

### 2. ContextAnalyzer

**التحديثات**:
- دمج `ContextOrganizer` في عملية التحليل
- إضافة `organizedContext` إلى نتيجة التحليل
- تمرير `targetSection` لتحسين التنظيم

### 3. generate-report-section.ts

**التحديثات**:
- استخدام `createOrganizedPrompt` لإنشاء مطالبة منظمة
- إضافة قسم "ORGANIZED CONTEXT BY KNOWLEDGE TYPE" في المطالبة
- تحسين جودة المخرجات من خلال السياق المنظم

## أنواع السياقات المدعومة

### أنواع السياق الخارجي
- `context`: السياق العام
- `example`: الأمثلة التوضيحية
- `question`: الأسئلة والاستفسارات
- `textbook`: المحتوى التعليمي
- `guidelines`: الإرشادات والتوجيهات

### مستويات المعرفة
- `foundational`: المعرفة الأساسية (أعلى أولوية)
- `conceptual`: المعرفة المفاهيمية
- `procedural`: المعرفة الإجرائية
- `metacognitive`: المعرفة ما وراء المعرفية
- `reference`: المراجع الإضافية

## كيفية العمل

### 1. جمع السياقات
```typescript
const allContexts: ContextItem[] = [];

// إضافة السياقات الخارجية
selectedExternalContext.forEach(item => {
    allContexts.push({
        fileName: item.fileName,
        content: item.content,
        type: item.type as any, // جميع الأنواع مدعومة
        metadata: { /* ... */ }
    });
});

// إضافة الأقسام المحددة
selectedSections.forEach(({ key, content }) => {
    allContexts.push({
        fileName: `section-${key}`,
        content: content,
        type: 'context',
        metadata: { /* ... */ }
    });
});
```

### 2. تنظيم السياقات
```typescript
const organizedContext = ContextOrganizer.organizeContexts(
    allContexts,
    itemKey, // القسم المستهدف
    userRequirements // متطلبات المستخدم
);
```

### 3. إنشاء المطالبة المنظمة
```typescript
const organizedPrompt = createOrganizedPrompt(organizedContext);
```

### 4. إرسال البيانات إلى API
```typescript
const apiData = {
    // البيانات التقليدية
    externalContext: selectedExternalContext,

    // البيانات الجديدة المنظمة
    organizedContext: organizedContext,
    organizedPrompt: organizedPrompt,

    // إحصائيات إضافية
    generationMetadata: {
        organizedContextCount: organizedContext.statistics.totalItems
    }
};
```

## المزايا الجديدة

### 1. شمولية السياق
- جميع أنواع السياقات تُضمن في التوليد
- لا توجد سياقات مفقودة أو مهملة

### 2. تنظيم ذكي
- ترتيب السياقات حسب الأهمية والمعرفة
- تحسين جودة المخرجات من الذكاء الاصطناعي

### 3. واجهة محسنة
- عرض مرئي للسياقات المنظمة
- إحصائيات مفصلة عن السياقات
- مؤشرات واضحة لحالة السياق

### 4. مرونة في التكوين
- دعم متطلبات المستخدم المخصصة
- تكيف مع نوع القسم المستهدف
- تحليل السياق الديناميكي

## الاختبار والتحقق

### 1. اختبار أنواع السياقات
```typescript
// تأكد من أن جميع الأنواع تُجمع
const testContexts = [
    { type: 'context', content: '...' },
    { type: 'example', content: '...' },
    { type: 'question', content: '...' },
    { type: 'textbook', content: '...' },
    { type: 'guidelines', content: '...' }
];

const organized = ContextOrganizer.organizeContexts(testContexts);
// يجب أن تحتوي على جميع الأنواع
```

### 2. اختبار التنظيم
```typescript
// تأكد من التنظيم الصحيح
assert(organized.guidelines.length > 0); // الإرشادات في المقدمة
assert(organized.foundational.length > 0); // المعرفة الأساسية
assert(organized.statistics.totalItems === testContexts.length);
```

### 3. اختبار الواجهة
- تحقق من عرض التبويب الجديد
- تأكد من عرض الإحصائيات
- اختبر الترجمة العربية والإنجليزية

## التحديثات المستقبلية

### 1. تحسينات الأداء
- تخزين مؤقت للسياقات المنظمة
- تحسين سرعة التحليل

### 2. ميزات إضافية
- تصفية السياقات حسب المعرفة
- تحرير أولوية السياقات يدوياً
- تصدير السياقات المنظمة

### 3. تحليلات متقدمة
- تحليل جودة السياقات
- اقتراحات لتحسين السياق
- تقارير مفصلة عن الاستخدام

## الخلاصة

تم حل مشكلة عدم تضمين جميع أنواع السياقات من خلال تطوير نظام شامل لتنظيم السياقات. النظام الجديد يضمن:

1. **شمولية**: جميع أنواع السياقات تُضمن
2. **تنظيم**: ترتيب ذكي حسب المعرفة والأهمية
3. **وضوح**: واجهة مرئية واضحة للسياقات
4. **مرونة**: تكيف مع متطلبات مختلفة
5. **جودة**: تحسين مخرجات الذكاء الاصطناعي

هذا النظام يضع أساساً قوياً لتطويرات مستقبلية أكثر تقدماً في مجال تنظيم السياق وتحسين جودة التوليد.
