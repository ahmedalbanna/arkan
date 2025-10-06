/**
 * توثيق نظام تحويل السياق الذكي
 *
 * هذا الملف يوضح كيفية عمل النظام المحسن لتحويل جميع أنواع السياق إلى Markdown
 */

/**
 * نظرة عامة على النظام المحسن
 *
 * النظام الآن يحول تلقائياً جميع أنواع البيانات إلى Markdown منظم:
 *
 * 1. Proposal → Markdown منظم مع جداول ومُنسقات مخصصة
 * 2. ProjectPlan → Markdown منظم مع جداول المهام والموارد
 * 3. OtherSections → تحويل تلقائي من JSON إلى Markdown
 * 4. ContextFiles → تحويل تلقائي من JSON إلى Markdown
 * 5. ExampleFiles → تحويل تلقائي من JSON إلى Markdown
 * 6. OtherDiagrams → معالجة خاصة للرسوم البيانية
 */

/**
 * أنواع التحويل المختلفة
 */

// 1. تحويل Proposal
const proposalExample = {
    title: "مشروع تطوير النظام",
    projectInfo: {
        description: "تطوير نظام إدارة شامل",
        objectives: ["هدف 1", "هدف 2"]
    },
    technologies: [
        { name: "React", description: "واجهة المستخدم" },
        { name: "Node.js", description: "الخادم" }
    ]
};

// النتيجة: Markdown منظم مع جداول ومُنسقات مخصصة
/*
# مشروع تطوير النظام

## معلومات المشروع
**الوصف:** تطوير نظام إدارة شامل

**الأهداف:**
- هدف 1
- هدف 2

## التقنيات والأدوات
- **React:** واجهة المستخدم
- **Node.js:** الخادم
*/

// 2. تحويل OtherSections
const sectionExample = {
    "introduction": "{\"content\": \"هذا هو المحتوى\", \"metadata\": {\"wordCount\": 150}}"
};

// النتيجة: تحويل تلقائي إلى Markdown
/*
# قسم introduction

**content:** هذا هو المحتوى

## metadata
**wordCount:** 150
*/

// 3. تحويل ContextFiles
const contextFileExample = {
    fileName: "requirements.json",
    content: "{\"functional\": [\"تسجيل الدخول\", \"إدارة المستخدمين\"], \"nonFunctional\": [\"الأداء\", \"الأمان\"]}"
};

// النتيجة: تحويل تلقائي إلى Markdown
/*
# requirements

## functional
- تسجيل الدخول
- إدارة المستخدمين

## nonFunctional
- الأداء
- الأمان
*/

/**
 * خيارات التحويل المختلفة حسب نوع المحتوى
 */

const conversionOptions = {
    // أقسام التقرير الأخرى
    section: {
        maxDepth: 3,
        arrayLimit: 10,
        includeEmpty: false,
        description: "تحويل محافظ للسرعة"
    },

    // ملفات السياق
    file: {
        maxDepth: 4,
        arrayLimit: 15,
        includeEmpty: false,
        description: "تحويل شامل للملفات المعقدة"
    },

    // ملفات الأمثلة
    example: {
        maxDepth: 3,
        arrayLimit: 8,
        includeEmpty: false,
        description: "تحويل مركز على الأمثلة المهمة"
    },

    // الرسوم البيانية
    diagram: {
        maxDepth: 2,
        arrayLimit: 5,
        includeEmpty: false,
        description: "تحويل مبسط للرسوم البيانية"
    }
};

/**
 * الفوائد المحققة
 */

const benefits = {
    consistency: "اتساق في عرض جميع أنواع البيانات",
    readability: "قابلية قراءة أفضل للذكاء الاصطناعي",
    structure: "هيكلة منظمة للمعلومات",
    flexibility: "مرونة في التعامل مع أنواع مختلفة من البيانات",
    performance: "تحسين الأداء من خلال التحكم في العمق وعدد العناصر",
    maintainability: "سهولة الصيانة والتطوير"
};

/**
 * أمثلة على الاستخدام المتقدم
 */

// مثال 1: تحويل قسم معقد
const complexSection = {
    "methodology": JSON.stringify({
        approach: "Agile",
        phases: [
            { name: "Planning", duration: "2 weeks", deliverables: ["SRS", "Design"] },
            { name: "Development", duration: "8 weeks", deliverables: ["MVP", "Testing"] }
        ],
        tools: ["Jira", "Git", "Docker"],
        team: {
            developers: 3,
            designers: 1,
            testers: 1
        }
    })
};

// النتيجة المحولة:
/*
# قسم methodology

**approach:** Agile

## phases
### 1. Planning
**duration:** 2 weeks
**deliverables:** SRS, Design

### 2. Development
**duration:** 8 weeks
**deliverables:** MVP, Testing

## tools
- Jira
- Git
- Docker

## team
**developers:** 3
**designers:** 1
**testers:** 1
*/

// مثال 2: تحويل ملف سياق معقد
const complexContextFile = {
    fileName: "project-data.json",
    content: JSON.stringify({
        stakeholders: [
            { name: "أحمد", role: "Product Owner", contact: "ahmed@company.com" },
            { name: "فاطمة", role: "Developer", contact: "fatima@company.com" }
        ],
        timeline: {
            start: "2024-01-01",
            end: "2024-06-30",
            milestones: [
                { date: "2024-02-15", milestone: "MVP Ready" },
                { date: "2024-04-30", milestone: "Beta Release" }
            ]
        },
        budget: {
            total: 100000,
            allocated: 75000,
            remaining: 25000
        }
    })
};

// النتيجة المحولة:
/*
# project-data

## stakeholders
### 1. أحمد
**role:** Product Owner
**contact:** ahmed@company.com

### 2. فاطمة
**role:** Developer
**contact:** fatima@company.com

## timeline
**start:** 2024-01-01
**end:** 2024-06-30

### milestones
### 1. 2024-02-15
**milestone:** MVP Ready

### 2. 2024-04-30
**milestone:** Beta Release

## budget
**total:** 100000
**allocated:** 75000
**remaining:** 25000
*/

/**
 * معالجة الأخطاء والاستثناءات
 */

const errorHandling = {
    jsonParseError: "إذا فشل تحليل JSON، يتم استخدام المحتوى الأصلي",
    emptyContent: "المحتوى الفارغ يتم تجاهله أو عرضه حسب الخيارات",
    deepNesting: "التحكم في العمق الأقصى لمنع التعمق المفرط",
    largeArrays: "حد أقصى لعدد العناصر المعروضة في المصفوفات"
};

/**
 * نصائح للاستخدام الأمثل
 */

const bestPractices = {
    structure: "حافظ على هيكلة منطقية للبيانات",
    naming: "استخدم أسماء واضحة للحقول والمصفوفات",
    nesting: "تجنب التعمق المفرط في البيانات",
    arrays: "استخدم مصفوفات منطقية وليس متداخلة بشكل مفرط",
    metadata: "أضف metadata مفيدة للمحتوى",
    consistency: "حافظ على اتساق في تسمية الحقول"
};

export {
    benefits, bestPractices, complexContextFile, complexSection, contextFileExample,
    conversionOptions, errorHandling, proposalExample,
    sectionExample
};

