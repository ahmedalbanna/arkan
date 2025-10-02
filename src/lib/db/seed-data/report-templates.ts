/**
 * قوالب التقارير الافتراضية
 */

export const REPORT_GENERATION_TEMPLATES = [
    {
        id: 'analytical-report',
        name: 'تقرير تحليلي',
        description: 'قالب للتقارير التحليلية والتقييمية',
        category: 'analytical',
        sections: [
            {
                id: 'executive-summary',
                title: 'الملخص التنفيذي',
                content: 'ملخص شامل للتقرير',
                required: true
            },
            {
                id: 'introduction',
                title: 'المقدمة',
                content: 'خلفية التقرير وأهدافه',
                required: true
            },
            {
                id: 'methodology',
                title: 'المنهجية',
                content: 'طريقة جمع البيانات والتحليل',
                required: true
            },
            {
                id: 'findings',
                title: 'النتائج',
                content: 'النتائج الرئيسية للتحليل',
                required: true
            },
            {
                id: 'analysis',
                title: 'التحليل',
                content: 'تحليل النتائج وتفسيرها',
                required: true
            },
            {
                id: 'recommendations',
                title: 'التوصيات',
                content: 'التوصيات المقترحة',
                required: true
            },
            {
                id: 'conclusion',
                title: 'الخلاصة',
                content: 'خلاصة التقرير',
                required: true
            }
        ],
        styles: {
            primaryColor: '#2563eb',
            secondaryColor: '#64748b',
            fontFamily: 'Arial',
            backgroundColor: '#ffffff'
        }
    },
    {
        id: 'technical-report',
        name: 'تقرير تقني',
        description: 'قالب للتقارير التقنية والهندسية',
        category: 'technical',
        sections: [
            {
                id: 'abstract',
                title: 'الملخص',
                content: 'ملخص التقرير التقني',
                required: true
            },
            {
                id: 'introduction',
                title: 'المقدمة',
                content: 'خلفية المشروع التقني',
                required: true
            },
            {
                id: 'technical-specifications',
                title: 'المواصفات التقنية',
                content: 'المواصفات التقنية للمشروع',
                required: true
            },
            {
                id: 'implementation',
                title: 'التنفيذ',
                content: 'خطة التنفيذ والمراحل',
                required: true
            },
            {
                id: 'testing-results',
                title: 'نتائج الاختبار',
                content: 'نتائج اختبار النظام',
                required: true
            },
            {
                id: 'performance-analysis',
                title: 'تحليل الأداء',
                content: 'تحليل أداء النظام',
                required: true
            },
            {
                id: 'conclusion',
                title: 'الخلاصة',
                content: 'خلاصة التقرير التقني',
                required: true
            }
        ],
        styles: {
            primaryColor: '#dc2626',
            secondaryColor: '#f87171',
            fontFamily: 'Courier New',
            backgroundColor: '#fef2f2'
        }
    },
    {
        id: 'research-report',
        name: 'تقرير بحثي',
        description: 'قالب للتقارير البحثية والأكاديمية',
        category: 'research',
        sections: [
            {
                id: 'abstract',
                title: 'الملخص',
                content: 'ملخص البحث',
                required: true
            },
            {
                id: 'introduction',
                title: 'المقدمة',
                content: 'خلفية البحث وأهميته',
                required: true
            },
            {
                id: 'literature-review',
                title: 'مراجعة الأدبيات',
                content: 'مراجعة الدراسات السابقة',
                required: true
            },
            {
                id: 'methodology',
                title: 'المنهجية',
                content: 'طريقة البحث المستخدمة',
                required: true
            },
            {
                id: 'results',
                title: 'النتائج',
                content: 'نتائج البحث',
                required: true
            },
            {
                id: 'discussion',
                title: 'المناقشة',
                content: 'مناقشة النتائج',
                required: true
            },
            {
                id: 'conclusion',
                title: 'الخلاصة',
                content: 'خلاصة البحث والتوصيات',
                required: true
            },
            {
                id: 'references',
                title: 'المراجع',
                content: 'قائمة المراجع',
                required: true
            }
        ],
        styles: {
            primaryColor: '#059669',
            secondaryColor: '#6b7280',
            fontFamily: 'Times New Roman',
            backgroundColor: '#f9fafb'
        }
    }
];

export default REPORT_GENERATION_TEMPLATES;
