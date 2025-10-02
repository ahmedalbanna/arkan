/**
 * قوالب المقترحات الافتراضية
 */

export const PROPOSAL_TEMPLATES = [
    {
        id: 'business-proposal',
        name: 'مقترح تجاري',
        description: 'قالب احترافي للمقترحات التجارية',
        category: 'business',
        sections: [
            {
                id: 'executive-summary',
                title: 'الملخص التنفيذي',
                content: 'ملخص شامل للمقترح',
                required: true
            },
            {
                id: 'problem-statement',
                title: 'بيان المشكلة',
                content: 'وصف المشكلة التي يحلها المقترح',
                required: true
            },
            {
                id: 'solution',
                title: 'الحل المقترح',
                content: 'وصف الحل المقترح',
                required: true
            },
            {
                id: 'methodology',
                title: 'المنهجية',
                content: 'طريقة تنفيذ الحل',
                required: true
            },
            {
                id: 'timeline',
                title: 'الجدول الزمني',
                content: 'خطة زمنية للتنفيذ',
                required: true
            },
            {
                id: 'budget',
                title: 'الميزانية',
                content: 'التكلفة المتوقعة',
                required: true
            },
            {
                id: 'team',
                title: 'فريق العمل',
                content: 'وصف فريق العمل',
                required: false
            },
            {
                id: 'conclusion',
                title: 'الخلاصة',
                content: 'خلاصة المقترح',
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
        id: 'academic-proposal',
        name: 'مقترح أكاديمي',
        description: 'قالب للمقترحات الأكاديمية والبحثية',
        category: 'academic',
        sections: [
            {
                id: 'abstract',
                title: 'الملخص',
                content: 'ملخص البحث المقترح',
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
                content: 'طريقة البحث المقترحة',
                required: true
            },
            {
                id: 'expected-results',
                title: 'النتائج المتوقعة',
                content: 'النتائج المتوقعة من البحث',
                required: true
            },
            {
                id: 'timeline',
                title: 'الجدول الزمني',
                content: 'خطة زمنية للبحث',
                required: true
            },
            {
                id: 'budget',
                title: 'الميزانية',
                content: 'التكلفة المطلوبة للبحث',
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
    },
    {
        id: 'technical-proposal',
        name: 'مقترح تقني',
        description: 'قالب للمقترحات التقنية والمشاريع البرمجية',
        category: 'technical',
        sections: [
            {
                id: 'project-overview',
                title: 'نظرة عامة على المشروع',
                content: 'وصف المشروع التقني',
                required: true
            },
            {
                id: 'technical-requirements',
                title: 'المتطلبات التقنية',
                content: 'المتطلبات التقنية للمشروع',
                required: true
            },
            {
                id: 'architecture',
                title: 'الهيكل التقني',
                content: 'هيكل النظام المقترح',
                required: true
            },
            {
                id: 'implementation-plan',
                title: 'خطة التنفيذ',
                content: 'خطة تنفيذ المشروع',
                required: true
            },
            {
                id: 'testing-strategy',
                title: 'استراتيجية الاختبار',
                content: 'خطة اختبار النظام',
                required: true
            },
            {
                id: 'deployment',
                title: 'النشر',
                content: 'خطة نشر النظام',
                required: true
            },
            {
                id: 'maintenance',
                title: 'الصيانة',
                content: 'خطة صيانة النظام',
                required: false
            },
            {
                id: 'conclusion',
                title: 'الخلاصة',
                content: 'خلاصة المقترح التقني',
                required: true
            }
        ],
        styles: {
            primaryColor: '#dc2626',
            secondaryColor: '#f87171',
            fontFamily: 'Courier New',
            backgroundColor: '#fef2f2'
        }
    }
];

export default PROPOSAL_TEMPLATES;
