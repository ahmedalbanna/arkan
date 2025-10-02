/**
 * قوالب العروض التقديمية الافتراضية
 */

export const PRESENTATION_GENERATION_TEMPLATES = [
    {
        id: 'business-presentation',
        name: 'عرض تقديمي تجاري',
        description: 'قالب احترافي للعروض التقديمية التجارية',
        category: 'business',
        slides: [
            {
                type: 'title',
                title: 'عنوان العرض التقديمي',
                subtitle: 'وصف مختصر'
            },
            {
                type: 'content',
                title: 'المقدمة',
                content: 'نص المحتوى هنا'
            },
            {
                type: 'content',
                title: 'المشكلة',
                content: 'وصف المشكلة'
            },
            {
                type: 'content',
                title: 'الحل',
                content: 'وصف الحل المقترح'
            },
            {
                type: 'content',
                title: 'النتائج',
                content: 'النتائج المتوقعة'
            },
            {
                type: 'conclusion',
                title: 'الخلاصة',
                content: 'ملخص النقاط الرئيسية'
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
        id: 'academic-presentation',
        name: 'عرض تقديمي أكاديمي',
        description: 'قالب للعروض التقديمية الأكاديمية والبحثية',
        category: 'academic',
        slides: [
            {
                type: 'title',
                title: 'عنوان البحث',
                subtitle: 'اسم الباحث والمؤسسة'
            },
            {
                type: 'content',
                title: 'مقدمة البحث',
                content: 'خلفية البحث وأهميته'
            },
            {
                type: 'content',
                title: 'المنهجية',
                content: 'طريقة البحث المستخدمة'
            },
            {
                type: 'content',
                title: 'النتائج',
                content: 'نتائج البحث'
            },
            {
                type: 'content',
                title: 'المناقشة',
                content: 'تحليل النتائج'
            },
            {
                type: 'conclusion',
                title: 'الخلاصة والتوصيات',
                content: 'الخلاصة والتوصيات المستقبلية'
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
        id: 'creative-presentation',
        name: 'عرض تقديمي إبداعي',
        description: 'قالب للعروض التقديمية الإبداعية والتصميمية',
        category: 'creative',
        slides: [
            {
                type: 'title',
                title: 'العنوان الإبداعي',
                subtitle: 'وصف إبداعي'
            },
            {
                type: 'content',
                title: 'الفكرة',
                content: 'وصف الفكرة الإبداعية'
            },
            {
                type: 'content',
                title: 'الرؤية',
                content: 'رؤية المشروع'
            },
            {
                type: 'content',
                title: 'التنفيذ',
                content: 'خطة التنفيذ'
            },
            {
                type: 'conclusion',
                title: 'النتيجة',
                content: 'النتيجة النهائية'
            }
        ],
        styles: {
            primaryColor: '#7c3aed',
            secondaryColor: '#a78bfa',
            fontFamily: 'Helvetica',
            backgroundColor: '#faf5ff'
        }
    }
];

export default PRESENTATION_GENERATION_TEMPLATES;
