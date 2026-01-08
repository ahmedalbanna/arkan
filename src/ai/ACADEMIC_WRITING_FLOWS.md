# 📚 Academic Writing Flows - Complete Guide

## Overview

Arkan now includes **17 specialized AI flows** for academic and professional writing in Arabic. These flows cover everything from research papers to technical reports, providing comprehensive support for students, researchers, and professionals.

---

## 🎯 Available Flows

### 1. **Research Paper** (ورقة بحثية)
Complete academic research paper with full structure.

**Flow Name:** `researchPaper`

**Use Case:** Publishing scientific research, academic papers

**Input:**
```typescript
{
  topic: string;              // موضوع البحث
  researchQuestion: string;   // السؤال البحثي الرئيسي
  methodology: string;        // qualitative | quantitative | mixed-methods | etc.
  keywords: string[];         // 3-10 keywords
  citationStyle: string;      // apa | mla | chicago | harvard | ieee
  targetLength: number;       // 3000-15000 words
  includeAbstract?: boolean;
  includeLiteratureReview?: boolean;
  targetAudience?: string;
}
```

**Output:**
- Title
- Abstract (optional)
- Introduction
- Literature Review (optional)
- Methodology
- Results
- Discussion
- Conclusion
- References
- Full document in markdown

---

### 2. **Analytical Essay** (مقال تحليلي)
Deep analysis breaking down complex topics.

**Flow Name:** `analyticalEssay`

**Use Case:** Academic essays, critical thinking papers

**Input:**
```typescript
{
  topic: string;
  mainArgument: string;
  keyComponents: string[];    // 2-8 components to analyze
  targetLength: number;       // 800-5000 words
  citationStyle: string;
  analysisDepth: 'surface' | 'moderate' | 'deep';
}
```

---

### 3. **Argumentative Essay** (مقال جدلي)
Persuasive essay with evidence-based arguments.

**Flow Name:** `argumentativeEssay`

**Use Case:** Debate papers, persuasive writing

**Input:**
```typescript
{
  topic: string;
  position: string;           // Your stance
  mainArguments: string[];    // 3-6 arguments
  counterarguments: string[]; // 1-4 opposing views
  evidence?: string[];
  targetLength: number;       // 1000-5000 words
  citationStyle: string;
  includeRebuttal?: boolean;
}
```

---

### 4. **Comprehensive Literature Review** (مراجعة أدبيات شاملة)
Systematic review of existing research.

**Flow Name:** `comprehensiveLiteratureReview`

**Use Case:** Research proposals, dissertations, systematic reviews

**Input:**
```typescript
{
  topic: string;
  researchQuestions: string[]; // 1-5 questions
  keywords: string[];          // 3-15 keywords
  timeframe?: string;          // e.g., "2015-2024"
  minimumSources: number;      // 10-100 sources
  citationStyle: string;
  includeGapAnalysis?: boolean;
  includeThematicAnalysis?: boolean;
}
```

---

### 5. **Case Study** (دراسة حالة)
In-depth analysis of real-world examples.

**Flow Name:** `caseStudy`

**Use Case:** Business analysis, educational research

**Input:**
```typescript
{
  caseTitle: string;
  background: string;
  problem: string;
  methodology: string;
  dataCollectionMethods?: string[];
  targetLength: number;        // 1500-8000 words
  includeRecommendations?: boolean;
  citationStyle: string;
}
```

---

### 6. **Lab Report** (تقرير مختبر)
Scientific experiment documentation.

**Flow Name:** `labReport`

**Use Case:** Science labs, experiments, technical documentation

**Input:**
```typescript
{
  experimentTitle: string;
  objective: string;
  hypothesis: string;
  materials: string[];
  procedure: string[];
  observations: string;
  results: string;
  includeDiscussion?: boolean;
  citationStyle: string;
}
```

---

### 7. **Research Proposal** (مقترح بحثي)
Persuasive research plan.

**Flow Name:** `researchProposal`

**Use Case:** Grant applications, thesis proposals

**Input:**
```typescript
{
  researchTitle: string;
  researchProblem: string;
  researchQuestions: string[]; // 1-5 questions
  objectives: string[];        // 2-6 objectives
  methodology: string;
  significance: string;
  expectedOutcomes: string[];
  timeline?: string;
  budget?: string;
  citationStyle: string;
}
```

---

### 8. **Thesis Statement** (أطروحة مركزية)
Refined central argument development.

**Flow Name:** `thesisStatement`

**Use Case:** Essay planning, research paper development

**Input:**
```typescript
{
  topic: string;
  position: string;
  mainPoints: string[];        // 2-4 points
  documentType: string;
  includeRationale?: boolean;
}
```

**Output:**
- Main thesis statement
- 3-4 refined alternative versions
- Rationale and explanation (optional)
- Strengths analysis
- Improvement suggestions

---

### 9. **Dissertation Chapter** (فصل أطروحة)
PhD/Masters level chapter writing.

**Flow Name:** `dissertationChapter`

**Use Case:** Masters/PhD dissertations

**Input:**
```typescript
{
  chapterType: string;         // abstract | introduction | methodology | etc.
  researchTopic: string;
  chapterTitle: string;
  mainPoints: string[];        // 3-10 points
  previousChaptersSummary?: string;
  targetLength: number;        // 3000-15000 words
  citationStyle: string;
  academicLevel: 'masters' | 'phd';
}
```

---

### 10. **Term Paper** (بحث فصلي)
Comprehensive end-of-semester research.

**Flow Name:** `termPaper`

**Use Case:** Course assignments, semester papers

**Input:**
```typescript
{
  courseName: string;
  topic: string;
  thesisStatement: string;
  mainArguments: string[];     // 3-6 arguments
  requiredSources: number;     // 5-30 sources
  targetLength: number;        // 2000-8000 words
  citationStyle: string;
  includeAnnotatedBibliography?: boolean;
}
```

---

### 11. **Critical Analysis** (تحليل نقدي)
Systematic evaluation of works.

**Flow Name:** `criticalAnalysis`

**Use Case:** Book reviews, research critique, theoretical analysis

**Input:**
```typescript
{
  workTitle: string;
  workType: 'book' | 'article' | 'research-paper' | 'theory' | 'artwork' | 'film';
  author: string;
  mainThesis: string;
  evaluationCriteria: string[]; // 3-8 criteria
  targetLength: number;         // 1000-5000 words
  citationStyle: string;
}
```

---

### 12. **Book Review** (مراجعة كتاب)
Academic book review.

**Flow Name:** `bookReview`

**Use Case:** Literature reviews, academic critique

**Input:**
```typescript
{
  bookTitle: string;
  author: string;
  publicationYear: number;
  genre: string;
  mainThemes: string[];        // 2-6 themes
  targetAudience: string;
  reviewLength: number;        // 500-3000 words
  includeRating?: boolean;
  citationStyle: string;
}
```

---

### 13. **Article Summary** (ملخص مقال)
Concise article summaries.

**Flow Name:** `articleSummary`

**Use Case:** Literature reviews, research notes

**Input:**
```typescript
{
  articleTitle: string;
  author: string;
  articleText?: string;
  articleUrl?: string;
  summaryLength: 'brief' | 'moderate' | 'detailed';
  includeKeyFindings?: boolean;
  includeMethodology?: boolean;
  citationStyle: string;
}
```

---

### 14. **Annotated Bibliography** (ببليوغرافيا مشروحة)
Source list with annotations.

**Flow Name:** `annotatedBibliography`

**Use Case:** Research preparation, literature organization

**Input:**
```typescript
{
  researchTopic: string;
  sources: Array<{
    title: string;
    author: string;
    year: number;
    type: 'book' | 'journal-article' | 'website' | 'conference-paper' | 'thesis';
    url?: string;
  }>;                          // 5-50 sources
  annotationLength: 'brief' | 'moderate' | 'detailed';
  citationStyle: string;
  includeEvaluation?: boolean;
}
```

---

### 15. **Position Paper** (ورقة موقف)
Official position statement.

**Flow Name:** `positionPaper`

**Use Case:** Policy papers, organizational statements

**Input:**
```typescript
{
  issue: string;
  organizationOrEntity: string;
  position: string;
  supportingArguments: string[];  // 3-8 arguments
  evidence: string[];             // 2+ evidence items
  counterpositions?: string[];
  targetAudience: string;
  targetLength: number;           // 1000-5000 words
  citationStyle: string;
}
```

---

### 16. **Reflection Paper** (ورقة تأملية)
Personal reflective writing.

**Flow Name:** `reflectionPaper`

**Use Case:** Course reflections, learning journals

**Input:**
```typescript
{
  experience: string;
  courseOrContext?: string;
  keyLearnings: string[];        // 2-8 learnings
  personalInsights: string[];    // 2-8 insights
  futureApplications?: string[];
  targetLength: number;          // 500-3000 words
  reflectionDepth: 'surface' | 'moderate' | 'deep';
}
```

---

### 17. **Technical Report** (تقرير فني)
Detailed technical documentation.

**Flow Name:** `technicalReport`

**Use Case:** Engineering reports, software documentation

**Input:**
```typescript
{
  projectTitle: string;
  projectType: 'software' | 'hardware' | 'engineering' | 'research' | 'analysis';
  objective: string;
  methodology: string;
  technicalDetails: string[];
  results: string;
  includeDiagrams?: boolean;
  includeCodeExamples?: boolean;
  targetAudience: 'technical' | 'non-technical' | 'mixed';
  targetLength: number;          // 2000-10000 words
  citationStyle: string;
}
```

---

## 🚀 Usage Examples

### Basic Usage with Universal Flow

```typescript
import { executeFlow } from '@/ai/flows';

// Example 1: Generate Research Paper
const researchPaper = await executeFlow('researchPaper', {
  topic: 'الذكاء الاصطناعي في التعليم',
  researchQuestion: 'كيف يمكن للذكاء الاصطناعي تحسين جودة التعليم؟',
  methodology: 'mixed-methods',
  keywords: ['AI', 'Education', 'Machine Learning', 'Personalized Learning'],
  citationStyle: 'apa',
  targetLength: 5000,
  includeAbstract: true,
  includeLiteratureReview: true,
});

console.log(researchPaper.fullDocument);

// Example 2: Generate Thesis Statement
const thesis = await executeFlow('thesisStatement', {
  topic: 'التغير المناخي',
  position: 'يجب على الحكومات اتخاذ إجراءات فورية',
  mainPoints: [
    'التأثير على الاقتصاد',
    'المخاطر الصحية',
    'المسؤولية الأخلاقية',
  ],
  documentType: 'argumentative-essay',
  includeRationale: true,
});

console.log(thesis.thesisStatement);
console.log(thesis.refinedVersions);

// Example 3: Generate Lab Report
const labReport = await executeFlow('labReport', {
  experimentTitle: 'تأثير درجة الحرارة على سرعة التفاعل الكيميائي',
  objective: 'قياس تأثير درجة الحرارة على معدل التفاعل',
  hypothesis: 'زيادة درجة الحرارة تزيد من سرعة التفاعل',
  materials: ['حمض الهيدروكلوريك', 'كربونات الكالسيوم', 'ميزان حرارة'],
  procedure: [
    'تحضير المحاليل',
    'قياس درجة الحرارة',
    'إضافة المواد المتفاعلة',
    'تسجيل الوقت',
  ],
  observations: 'تم ملاحظة زيادة في سرعة التفاعل مع زيادة الحرارة',
  results: 'معدل التفاعل تضاعف مع كل 10 درجات مئوية',
  includeDiscussion: true,
  citationStyle: 'ieee',
});
```

---

## 📊 Citation Styles Supported

All flows support the following citation styles:
- **APA** (American Psychological Association)
- **MLA** (Modern Language Association)
- **Chicago** (Chicago Manual of Style)
- **Harvard** (Harvard Referencing)
- **IEEE** (Institute of Electrical and Electronics Engineers)

---

## ✨ Key Features

### 🎯 **Specialized for Each Type**
Each flow has custom prompts tailored to its specific requirements and academic standards.

### 📝 **Arabic-First Design**
All prompts are written in Arabic, making them perfect for Arabic academic writing.

### 🔄 **Consistent Structure**
All flows follow the same execution pattern through the universal flow system.

### ✅ **Type-Safe**
Full TypeScript support with Zod validation for all inputs and outputs.

### 🎨 **Flexible Output**
Outputs are structured objects with both sectioned content and full markdown documents.

### 🧠 **AI-Powered**
Uses Google Gemini 2.0 Flash Exp model for high-quality, coherent output.

---

## 🏗️ Architecture

All academic writing flows follow this pattern:

```
User Input
    ↓
Flow Registry (validates flow name)
    ↓
Input Schema Validation (Zod)
    ↓
Prompt Selection (from prompts/academic-writing.ts)
    ↓
AI Model Execution (Gemini 2.0 Flash Exp)
    ↓
Output Schema Validation (Zod)
    ↓
Structured Result
```

---

## 📁 File Structure

```
src/ai/
├── schemas/
│   ├── flows.ts                      # All 17 input/output schemas
│   └── enums.ts                      # Academic enums (document types, methodologies, etc.)
│
├── prompts/
│   ├── academic-writing.ts           # All 17 specialized prompts
│   └── index.ts                      # Exports all prompts
│
├── flows/
│   ├── flow-registry.ts              # Flow metadata (17 entries added)
│   ├── universal-flow.ts             # Execution engine
│   └── index.ts                      # Type exports
│
└── genkit.ts                         # Genkit configuration
```

---

## 🎓 Best Practices

### 1. **Provide Detailed Input**
More detailed inputs lead to better outputs. Don't skip optional fields if you have the information.

### 2. **Choose Appropriate Length**
Set realistic target lengths. Too short may lack depth, too long may be repetitive.

### 3. **Use Consistent Citation Style**
Stick to one citation style throughout your project.

### 4. **Review and Edit**
AI-generated content should be reviewed and edited by humans. Use it as a strong draft, not final output.

### 5. **Combine Flows**
Use multiple flows together. For example:
- Generate thesis statement first
- Use it in an argumentative essay
- Create an annotated bibliography for sources

---

## 🧪 Testing

Run the test script to verify all flows are registered:

```bash
npx tsx tmp_rovodev_test_academic_flows.ts
```

---

## 📚 Additional Resources

- **Genkit Documentation**: [firebase.google.com/docs/genkit](https://firebase.google.com/docs/genkit)
- **Flow Architecture**: See `flows/universal-flow.ts` for implementation details
- **Prompt Engineering**: See `prompts/academic-writing.ts` for prompt examples

---

## 🎉 Summary

You now have **17 powerful academic writing flows** at your disposal:

✅ Research Paper
✅ Analytical Essay
✅ Argumentative Essay
✅ Comprehensive Literature Review
✅ Case Study
✅ Lab Report
✅ Research Proposal
✅ Thesis Statement
✅ Dissertation Chapter
✅ Term Paper
✅ Critical Analysis
✅ Book Review
✅ Article Summary
✅ Annotated Bibliography
✅ Position Paper
✅ Reflection Paper
✅ Technical Report

All integrated into Arkan's universal flow system, ready to use! 🚀
