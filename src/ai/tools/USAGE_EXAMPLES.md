# أمثلة عملية لاستخدام نظام الكتابة الاحترافية

## نظرة عامة على البنية

هذا المشروع يطبق فلسفة **Flow - Prompts - Tools** في Genkit بشكل احترافي:

```
Flow (المايسترو)
  ├── يستدعي Prompts (التواصل مع LLM)
  └── يستخدم Tools (المهارات التخصصية)
```

---

## 🎯 مثال 1: إنشاء مراجعة أدبية أكاديمية

### السيناريو
باحث يريد كتابة مراجعة أدبية حول "تأثير الذكاء الاصطناعي على التعليم" مع التأكد من صحة الاستشهادات.

### الكود

```typescript
import { academicLiteratureReview } from '@/ai/flows';

const result = await academicLiteratureReview({
  topic: 'تأثير الذكاء الاصطناعي على التعليم العالي',
  keywords: [
    'الذكاء الاصطناعي',
    'التعلم الآلي',
    'التعليم الرقمي',
    'التحول الرقمي في الجامعات'
  ],
  citationStyle: 'APA',
  focusAreas: [
    'التعلم التكيفي',
    'أنظمة التقييم الذكية',
    'التحديات الأخلاقية'
  ],
  minLength: 1200,
  includeGaps: true,
});

console.log('المراجعة الأدبية:', result.literatureReview);
console.log('عدد الاستشهادات:', result.metadata.citationCount);
console.log('قوة الحجة:', result.qualityMetrics.argumentStrength);
console.log('الفجوات البحثية:', result.structure.researchGaps);
```

### كيف يعمل Flow داخلياً؟

```
STEP 1: Generate Draft
  └─> Prompt: "اكتب مراجعة أدبية حول..."
  └─> Output: مسودة أولية

STEP 2: Validate Citations
  └─> Tool: validateCitationsTool
  └─> يتحقق من صحة الاستشهادات (APA)

STEP 3: Check Argument Structure
  └─> Tool: analyzeArgumentStructureTool
  └─> يحلل قوة الحجج والأدلة

STEP 4: Check Logical Flow
  └─> Tool: checkLogicalFlowTool
  └─> يتحقق من الترابط المنطقي

STEP 5: Refine Based on Feedback
  └─> إذا وُجدت مشاكل:
      Prompt: "حسّن المراجعة بناءً على التغذية الراجعة..."
  └─> يطبق التحسينات

STEP 6: Return Final Output
  └─> مراجعة أدبية محسّنة مع بيانات الجودة
```

### النتيجة

```typescript
{
  literatureReview: "... نص المراجعة الكامل ...",
  citations: {
    totalCitations: 15,
    validCitations: 14,
    citationIssues: ["Citation on line 45 missing page number"]
  },
  qualityMetrics: {
    argumentStrength: "strong",
    logicalFlowScore: 0.87,
    recommendations: [...]
  },
  metadata: {
    wordCount: 1250,
    citationCount: 15,
    keyThemes: ["AI", "Education", ...]
  }
}
```

---

## 🎯 مثال 2: فحص جودة ورقة بحثية

### السيناريو
طالب دكتوراه يريد فحص جودة ورقته البحثية قبل التسليم.

### الكود

```typescript
import { academicPaperQualityChecker } from '@/ai/flows';

const paperText = `
[نص الورقة البحثية الكامل...]
`;

const references = `
References:
Ahmed, A. (2023). AI in Education. Journal of Educational Technology, 15(2), 45-67.
Smith, J. (2022). Machine Learning Applications. Tech Press.
...
`;

const qualityReport = await academicPaperQualityChecker({
  documentText: paperText,
  references: references,
  citationStyle: 'APA',
  documentType: 'research_paper',
  checkGrammar: true,
  checkCitations: true,
  checkStructure: true,
  checkReadability: true,
});

console.log('الدرجة الكلية:', qualityReport.overallScore + '/100');
console.log('مستوى الجودة:', qualityReport.qualityLevel);
console.log('حالة الاستعداد:', qualityReport.summary.readinessLevel);
console.log('وقت المراجعة المتوقع:', qualityReport.summary.estimatedRevisionTime);
```

### كيف يعمل Flow داخلياً؟

```
تشغيل موازي (Parallel Execution):

Thread 1: checkGrammarTool
  └─> يفحص الأخطاء النحوية والإملائية

Thread 2: checkReadabilityTool
  └─> يحسب معاملات القراءة (Flesch scores)

Thread 3: analyzeDocumentStructureTool
  └─> يحلل البنية والتماسك

Thread 4: analyzeArgumentStructureTool
  └─> يحلل قوة الحجج

Thread 5: checkLogicalFlowTool
  └─> يفحص الترابط المنطقي

Thread 6: validateCitationsTool
  └─> يتحقق من صحة الاستشهادات

Thread 7: checkReferencesTool
  └─> يفحص قائمة المراجع

Thread 8: matchCitationsToReferencesTool
  └─> يطابق الاستشهادات بالمراجع

بعد اكتمال الجميع:
  └─> حساب الدرجات
  └─> تصنيف التوصيات (حرج، مهم، اختياري)
  └─> إنشاء التقرير الشامل
```

### النتيجة

```typescript
{
  overallScore: 78,
  qualityLevel: "fair",
  scores: {
    grammar: 85,
    citations: 72,
    structure: 80,
    readability: 75,
    argument: 70
  },
  recommendations: {
    critical: [
      "Fix 3 invalid citations",
      "Add 2 missing references"
    ],
    important: [
      "Strengthen arguments with more evidence",
      "Improve transitions between sections"
    ],
    optional: [
      "Simplify sentence structure for better readability"
    ]
  },
  summary: {
    strengths: ["Well-organized structure", "Proper grammar"],
    weaknesses: ["Citation formatting issues", "Arguments need strengthening"],
    readinessLevel: "major_revisions",
    estimatedRevisionTime: "1-2 days"
  }
}
```

---

## 🎯 مثال 3: كتابة تقرير احترافي

### السيناريو
مدير مشروع يريد كتابة تقرير احترافي عن نتائج المشروع.

### الكود

```typescript
import { professionalDocumentWriter } from '@/ai/flows';

const report = await professionalDocumentWriter({
  documentType: 'business_report',
  topic: 'نتائج مشروع التحول الرقمي للربع الأول 2024',
  purpose: 'عرض إنجازات المشروع والتحديات والخطوات القادمة',
  targetAudience: 'الإدارة العليا وأصحاب المصلحة',
  keyPoints: [
    'تم إنجاز 85% من المخطط',
    'تحديات في دمج الأنظمة القديمة',
    'توفير 30% من التكاليف التشغيلية',
    'رضا المستخدمين بنسبة 92%',
    'خطة التوسع للربع الثاني'
  ],
  tone: 'professional',
  length: 'medium',
  includeExecutiveSummary: true,
  includeRecommendations: true,
  additionalContext: 'التقرير سيُقدّم في اجتماع مجلس الإدارة',
});

console.log('التقرير الكامل:', report.document);
console.log('عدد الكلمات:', report.qualityMetrics.wordCount);
console.log('درجة البنية:', report.qualityMetrics.structureScore);
console.log('محاذاة الأسلوب:', report.qualityMetrics.toneAlignment);
```

### كيف يعمل Flow داخلياً؟

```
STEP 1: Create Outline
  └─> Prompt: "أنشئ مخططاً للتقرير..."
  └─> Output: هيكل التقرير (مقدمة، أقسام، خاتمة)

STEP 2: Generate Content
  └─> Prompt: "اكتب تقريراً كاملاً بناءً على المخطط..."
  └─> Output: مسودة التقرير الكامل

STEP 3: Quality Checks (موازي)
  Thread 1: analyzeDocumentStructureTool
  Thread 2: checkLogicalFlowTool  
  Thread 3: analyzeToneTool (هل يطابق الأسلوب المطلوب؟)

STEP 4: Refinement (إذا لزم الأمر)
  └─> Prompt: "حسّن التقرير بناءً على..."
  └─> يطبق التحسينات على البنية والأسلوب

STEP 5: Extract Structure
  └─> Prompt: "استخرج الأقسام المختلفة..."
  └─> يفصل (ملخص تنفيذي، مقدمة، أقسام، توصيات، خاتمة)

STEP 6: Return
  └─> تقرير محسّن + بيانات الجودة + التحسينات المطبقة
```

### النتيجة

```typescript
{
  document: "... التقرير الكامل ...",
  structure: {
    executiveSummary: "...",
    introduction: "...",
    mainSections: [
      { title: "الإنجازات الرئيسية", content: "..." },
      { title: "التحديات والحلول", content: "..." },
      { title: "الأثر المالي", content: "..." },
      { title: "رضا المستخدمين", content: "..." }
    ],
    recommendations: "...",
    conclusion: "..."
  },
  qualityMetrics: {
    structureScore: 88,
    flowScore: 92,
    toneAlignment: 0.91,
    wordCount: 1450
  },
  improvements: {
    applied: [
      "Improved document structure and organization",
      "Enhanced logical flow and transitions",
      "Adjusted tone to match professional style"
    ],
    suggestions: [
      "Consider adding more specific metrics in recommendations",
      "Expand on the integration challenges section"
    ]
  }
}
```

---

## 🔧 استخدام الأدوات مباشرة (بدون Flow)

يمكنك أيضاً استخدام الأدوات مباشرة:

### فحص القواعد اللغوية

```typescript
import { checkGrammarTool } from '@/ai/tools';

const result = await checkGrammarTool({
  text: 'This are a sentence with some erors in grammer.',
  language: 'en',
});

console.log(`وُجد ${result.totalIssues} خطأ`);
result.issues.forEach(issue => {
  console.log(`- ${issue.type}: ${issue.message}`);
  console.log(`  السياق: ${issue.context}`);
  console.log(`  الاقتراح: ${issue.suggestions.join(', ')}`);
});
```

### تحليل الأسلوب

```typescript
import { analyzeToneTool } from '@/ai/tools';

const result = await analyzeToneTool({
  text: 'We believe this approach will revolutionize the industry!',
  targetTone: 'professional',
});

console.log('الأسلوب المكتشف:', result.detectedTone);
console.log('الثقة:', result.confidence);
console.log('يطابق الهدف؟', result.matchesTarget);
if (result.suggestions) {
  console.log('اقتراحات:', result.suggestions);
}
```

---

## 📊 مقارنة الطرق الثلاثة

| الطريقة | متى تستخدمها | مثال |
|---------|--------------|------|
| **Advanced Flows** | عمليات معقدة تحتاج تنسيق عدة أدوات | `academicLiteratureReview()` |
| **Universal Flow** | عمليات بسيطة بـ prompt واحد | `summarizeText()` |
| **Tools مباشرة** | فحص سريع لجانب واحد | `checkGrammarTool()` |

---

## 💡 نصائح للاستخدام الأمثل

### 1. استخدم Flows للعمليات المعقدة

```typescript
// ✅ جيد: استخدام Flow كامل
const review = await academicLiteratureReview({...});

// ❌ سيء: محاولة تكرار Flow يدوياً
const draft = await generateText({...});
const citations = await validateCitationsTool({...});
const structure = await analyzeArgumentStructureTool({...});
// ... الخ (كثير من الكود المتكرر)
```

### 2. استخدم Tools للفحوصات السريعة

```typescript
// ✅ جيد: فحص سريع للقواعد
const grammar = await checkGrammarTool({ text, language: 'en' });

// ❌ مبالغة: استخدام flow كامل لفحص بسيط
const report = await academicPaperQualityChecker({
  documentText: text,
  checkGrammar: true,
  checkCitations: false,
  checkStructure: false,
  // ... الخ
});
```

### 3. حدد الفحوصات المطلوبة فقط

```typescript
// ✅ كفؤ: تحديد الفحوصات المطلوبة
const report = await academicPaperQualityChecker({
  documentText: paper,
  checkGrammar: true,      // نعم
  checkCitations: true,    // نعم
  checkStructure: false,   // لا حاجة
  checkReadability: false, // لا حاجة
});
```

---

## 🚀 أمثلة متقدمة

### تكامل مع UI

```typescript
// في React Component
import { useState } from 'react';
import { academicPaperQualityChecker } from '@/ai/flows';

function PaperQualityChecker() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const checkPaper = async (paperText: string) => {
    setLoading(true);
    try {
      const result = await academicPaperQualityChecker({
        documentText: paperText,
        citationStyle: 'APA',
        documentType: 'research_paper',
        checkGrammar: true,
        checkCitations: true,
        checkStructure: true,
        checkReadability: true,
      });
      setReport(result);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading && <Spinner />}
      {report && (
        <div>
          <h2>Overall Score: {report.overallScore}/100</h2>
          <QualityBadge level={report.qualityLevel} />
          <RecommendationsList recommendations={report.recommendations} />
        </div>
      )}
    </div>
  );
}
```

### معالجة دفعات من المستندات

```typescript
async function checkMultiplePapers(papers: string[]) {
  const results = await Promise.all(
    papers.map(paper => 
      academicPaperQualityChecker({
        documentText: paper,
        citationStyle: 'APA',
        documentType: 'research_paper',
      })
    )
  );

  const summary = {
    totalPapers: results.length,
    averageScore: results.reduce((sum, r) => sum + r.overallScore, 0) / results.length,
    readyToSubmit: results.filter(r => r.summary.readinessLevel === 'ready_to_submit').length,
    needsRevision: results.filter(r => r.summary.readinessLevel !== 'ready_to_submit').length,
  };

  return { results, summary };
}
```

---

## 📚 المراجع

- [Genkit Documentation](https://firebase.google.com/docs/genkit)
- [Flow-Prompt-Tools Pattern](./README.md)
- [Tool Schemas](./tools/schemas.ts)

---

هل تحتاج إلى مزيد من الأمثلة أو توضيحات؟ 🚀
