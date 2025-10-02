/**
 * أمثلة لاستخدام API التقارير الذكي الجديد
 * يوضح كيفية استخدام النظام من خلال HTTP requests
 */

/**
 * مثال 1: توليد قسم فردي بالنظام الذكي
 */
export const singleSectionExample = {
    method: 'POST',
    url: '/api/generate/report',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
    },
    body: {
        operationType: 'single-section',
        sectionToGenerate: 'introduction',
        proposal: {
            projectTitle: "نظام إدارة المكتبة الذكي",
            projectDescription: "نظام شامل لإدارة المكتبة باستخدام الذكاء الاصطناعي",
            objectives: [
                "رقمنة جميع عمليات المكتبة",
                "تطوير نظام بحث ذكي",
                "تحسين تجربة المستخدمين"
            ],
            targetAudience: "الطلاب وأعضاء هيئة التدريس",
            budget: {
                total: 250000,
                currency: "USD"
            }
        },
        guidelines: [
            "استخدم لغة أكاديمية مهنية",
            "ركز على الفوائد التعليمية",
            "اربط المشروع بالاحتياجات الفعلية"
        ],
        qualityThreshold: 85,
        enableIterativeImprovement: true,
        enablePerformanceMonitoring: true
    }
};

/**
 * مثال 2: توليد تقرير كامل بالتدفق الذكي
 */
export const completeReportExample = {
    method: 'POST',
    url: '/api/generate/report',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
    },
    body: {
        operationType: 'complete-report',
        sectionsToGenerate: [
            'abstract',
            'introduction',
            'systemAnalysis',
            'systemDesign',
            'systemTesting',
            'conclusion',
            'references'
        ],
        proposal: {
            projectTitle: "منصة التعلم الإلكتروني التفاعلية",
            projectDescription: "منصة شاملة للتعلم عن بُعد مع تقنيات الواقع الافتراضي",
            objectives: [
                "تحسين تجربة التعلم عن بُعد",
                "زيادة التفاعل بين الطلاب والمعلمين",
                "تطوير مهارات جديدة باستخدام التقنيات الحديثة"
            ],
            budget: {
                total: 500000,
                currency: "USD",
                breakdown: {
                    development: 300000,
                    design: 100000,
                    testing: 50000,
                    deployment: 50000
                }
            },
            timeline: {
                totalDuration: "12 months",
                phases: [
                    { name: "التحليل والتصميم", duration: "3 months" },
                    { name: "التطوير الأساسي", duration: "6 months" },
                    { name: "الاختبار والتحسين", duration: "2 months" },
                    { name: "النشر والتدريب", duration: "1 month" }
                ]
            }
        },
        projectPlan: {
            phases: [
                {
                    phaseName: "مرحلة التحليل",
                    tasks: [
                        {
                            status: "Done",
                            title: "تحليل المتطلبات",
                            description: "تحليل شامل لاحتياجات المستخدمين",
                            acceptanceCriteria: ["وثيقة المتطلبات مكتملة"]
                        }
                    ]
                }
            ]
        },
        contextFiles: [
            {
                fileName: "market-research.md",
                content: "تحليل السوق يشير إلى نمو كبير في قطاع التعلم الإلكتروني...",
                type: "context"
            }
        ],
        guidelines: [
            "استخدم لغة تعليمية واضحة",
            "ركز على الابتكار في التعليم",
            "اربط التقنيات بالفوائد التعليمية",
            "قدم أمثلة عملية من البيئة التعليمية"
        ],
        qualityThreshold: 88,
        enableIterativeImprovement: true,
        enablePerformanceMonitoring: true,
        generateInOrder: true,
        useIntelligentDependencies: true,
        maxRetries: 3
    }
};

/**
 * مثال 3: توليد أقسام محددة مع سياق إضافي
 */
export const selectiveSectionsExample = {
    method: 'POST',
    url: '/api/generate/report',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
    },
    body: {
        operationType: 'complete-report',
        sectionsToGenerate: [
            'systemAnalysis',
            'systemDesign',
            'systemProgramming'
        ],
        proposal: {
            projectTitle: "نظام إدارة المستشفى الذكي",
            projectDescription: "نظام متكامل لإدارة جميع عمليات المستشفى",
            objectives: [
                "تحسين كفاءة العمليات الطبية",
                "تقليل أوقات الانتظار",
                "تحسين جودة الرعاية الصحية"
            ]
        },
        contextFiles: [
            {
                fileName: "current-system-analysis.md",
                content: "النظام الحالي يعاني من مشاكل في التكامل بين الأقسام المختلفة...",
                type: "context"
            },
            {
                fileName: "stakeholder-requirements.md",
                content: "الأطباء يحتاجون إلى وصول سريع لسجلات المرضى...",
                type: "context"
            }
        ],
        guidelines: [
            "استخدم مصطلحات طبية دقيقة",
            "ركز على تحسين الرعاية الصحية",
            "اربط التقنية بالفوائد الطبية",
            "راعي خصوصية بيانات المرضى"
        ],
        qualityThreshold: 90,
        enableIterativeImprovement: true,
        enablePerformanceMonitoring: true
    }
};

/**
 * مثال 4: الحصول على إحصائيات الأداء
 */
export const performanceStatsExample = {
    method: 'GET',
    url: '/api/generate/report',
    headers: {
        'Content-Type': 'application/json'
    }
};

/**
 * أمثلة الاستجابات المتوقعة
 */
export const expectedResponses = {

    // استجابة توليد قسم فردي
    singleSectionResponse: {
        sectionName: "introduction",
        content: "# المقدمة\n\nيشهد العالم اليوم تطوراً سريعاً في مجال التكنولوجيا...",
        singleSection: true,
        metadata: {
            operationType: "single-section",
            executionTime: 8500,
            creditCost: 1,
            timestamp: "2024-01-15T10:30:00.000Z"
        }
    },

    // استجابة توليد تقرير كامل
    completeReportResponse: {
        generatedSections: {
            "abstract": "الملخص التنفيذي للمشروع...",
            "introduction": "# المقدمة\n\nيهدف هذا المشروع إلى...",
            "systemAnalysis": "# تحليل النظام\n\nبناءً على التحليل الشامل...",
            "systemDesign": "# تصميم النظام\n\nيتكون النظام المقترح من...",
            "conclusion": "# الخاتمة\n\nفي ختام هذا التقرير..."
        },
        sectionMetadata: {
            "abstract": {
                qualityScore: 92,
                generationTime: 5200,
                iterations: 1,
                modelUsed: "googleai/gemini-2.0-flash"
            },
            "introduction": {
                qualityScore: 88,
                generationTime: 7800,
                iterations: 2,
                modelUsed: "googleai/gemini-2.0-flash"
            }
        },
        overallMetrics: {
            totalSections: 7,
            successfulSections: 7,
            averageQuality: 89.2,
            totalTime: 45000,
            averageTime: 6428
        },
        completeReport: true,
        metadata: {
            operationType: "complete-report",
            executionTime: 45000,
            creditCost: 6,
            timestamp: "2024-01-15T10:45:00.000Z"
        }
    },

    // استجابة إحصائيات الأداء
    performanceStatsResponse: {
        success: true,
        data: {
            quickStats: {
                completedSessions: 156,
                avgQualityToday: 87.5,
                avgExecutionTimeToday: 8200
            },
            performanceReport: {
                totalSessions: 1250,
                averageExecutionTime: 7800,
                successRate: 96.8,
                recommendations: [
                    "تحسين سرعة تحليل السياق",
                    "زيادة دقة اختيار النماذج",
                    "تحسين كفاءة التحسين التكراري"
                ]
            },
            systemInfo: {
                supportedSections: [
                    "abstract", "acknowledgment", "introduction", "literatureReview",
                    "systemAnalysis", "designStrategy", "systemDesign", "systemProgramming",
                    "systemTesting", "recommendations", "conclusion", "references", "appendices"
                ],
                features: {
                    intelligentContextAnalysis: true,
                    adaptiveModelSelection: true,
                    qualityValidation: true,
                    iterativeImprovement: true,
                    performanceMonitoring: true,
                    completeReportGeneration: true
                }
            }
        }
    }
};

/**
 * دوال مساعدة لاستخدام API
 */
export class IntelligentReportAPI {

    constructor(private baseUrl: string, private authToken: string) { }

    /**
     * توليد قسم فردي
     */
    async generateSingleSection(config: {
        sectionToGenerate: string;
        proposal?: any;
        projectPlan?: any;
        guidelines?: string[];
        contextFiles?: Array<{ fileName: string; content: string; type: string }>;
        qualityThreshold?: number;
        enableIterativeImprovement?: boolean;
    }) {
        const response = await fetch(`${this.baseUrl}/api/generate/report`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.authToken}`
            },
            body: JSON.stringify({
                operationType: 'single-section',
                ...config
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    /**
     * توليد تقرير كامل
     */
    async generateCompleteReport(config: {
        sectionsToGenerate?: string[];
        proposal?: any;
        projectPlan?: any;
        guidelines?: string[];
        contextFiles?: Array<{ fileName: string; content: string; type: string }>;
        qualityThreshold?: number;
        enableIterativeImprovement?: boolean;
        generateInOrder?: boolean;
        useIntelligentDependencies?: boolean;
    }) {
        const response = await fetch(`${this.baseUrl}/api/generate/report`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.authToken}`
            },
            body: JSON.stringify({
                operationType: 'complete-report',
                sectionsToGenerate: config.sectionsToGenerate || [
                    'abstract', 'introduction', 'systemAnalysis',
                    'systemDesign', 'conclusion', 'references'
                ],
                ...config
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    /**
     * الحصول على إحصائيات الأداء
     */
    async getPerformanceStats() {
        const response = await fetch(`${this.baseUrl}/api/generate/report`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }
}

/**
 * مثال على الاستخدام العملي
 */
export async function demonstrateAPIUsage() {
    const api = new IntelligentReportAPI('https://your-domain.com', 'your-auth-token');

    try {
        console.log('🚀 بدء استخدام API التقارير الذكي...\n');

        // مثال 1: توليد قسم فردي
        console.log('📝 توليد قسم المقدمة...');
        const sectionResult = await api.generateSingleSection({
            sectionToGenerate: 'introduction',
            proposal: {
                projectTitle: "نظام إدارة المكتبة الذكي",
                projectDescription: "نظام شامل لإدارة المكتبة",
                objectives: ["رقمنة العمليات", "تحسين البحث"]
            },
            guidelines: ["استخدم لغة أكاديمية", "ركز على الفوائد"],
            qualityThreshold: 85
        });

        console.log(`✅ تم توليد ${sectionResult.sectionName}`);
        console.log(`📊 وقت التنفيذ: ${sectionResult.metadata.executionTime}ms`);
        console.log(`💰 التكلفة: ${sectionResult.metadata.creditCost} رصيد\n`);

        // مثال 2: توليد تقرير كامل
        console.log('📊 توليد تقرير كامل...');
        const reportResult = await api.generateCompleteReport({
            sectionsToGenerate: ['introduction', 'systemAnalysis', 'conclusion'],
            proposal: {
                projectTitle: "منصة التعلم الإلكتروني",
                projectDescription: "منصة تفاعلية للتعلم عن بُعد"
            },
            qualityThreshold: 88,
            enableIterativeImprovement: true
        });

        console.log(`✅ تم توليد ${reportResult.overallMetrics.successfulSections} أقسام`);
        console.log(`⭐ متوسط الجودة: ${reportResult.overallMetrics.averageQuality}/100`);
        console.log(`⏱️ إجمالي الوقت: ${reportResult.overallMetrics.totalTime}ms`);
        console.log(`💰 التكلفة: ${reportResult.metadata.creditCost} رصيد\n`);

        // مثال 3: إحصائيات الأداء
        console.log('📈 الحصول على إحصائيات الأداء...');
        const stats = await api.getPerformanceStats();

        console.log(`📊 الجلسات المكتملة: ${stats.data.quickStats.completedSessions}`);
        console.log(`⭐ متوسط الجودة اليوم: ${stats.data.quickStats.avgQualityToday}/100`);
        console.log(`⏱️ متوسط وقت التنفيذ: ${stats.data.quickStats.avgExecutionTimeToday}ms`);

        console.log('\n🎉 انتهى المثال بنجاح!');

    } catch (error) {
        console.error('❌ خطأ في استخدام API:', error);
    }
}

/**
 * نصائح لاستخدام API بكفاءة
 */
export const apiUsageTips = {
    performance: [
        "استخدم qualityThreshold مناسب (85-90 للمشاريع المهمة)",
        "فعّل enableIterativeImprovement للجودة العالية",
        "استخدم contextFiles لتحسين دقة النتائج",
        "راقب creditCost لإدارة التكاليف"
    ],

    quality: [
        "قدم guidelines واضحة ومحددة",
        "استخدم proposal مفصل مع أهداف واضحة",
        "أضف contextFiles ذات صلة بالمشروع",
        "اختر sectionsToGenerate المناسبة لنوع التقرير"
    ],

    troubleshooting: [
        "تحقق من صحة authToken",
        "تأكد من صحة تنسيق JSON",
        "راجع رسائل الخطأ للتفاصيل",
        "استخدم GET /api/generate/report لمراقبة حالة النظام"
    ]
};
