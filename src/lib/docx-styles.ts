import type { IStylesOptions } from 'docx';

const modernStyles: IStylesOptions = {
    default: {
        heading1: { run: { fontFamily: 'Calibri', size: 32, bold: true, color: "2E74B5" } },
        heading2: { run: { fontFamily: 'Calibri', size: 26, bold: true, color: "2E74B5" } },
        heading3: { run: { fontFamily: 'Calibri', size: 24, bold: true, color: "5B9BD5" } },
        paragraph: { run: { fontFamily: 'Calibri', size: 22 }, spacing: { after: 120 } },
    },
    paragraphStyles: [
        {
            id: 'normal',
            name: 'Normal',
            basedOn: 'Normal',
            next: 'Normal',
            quickFormat: true,
            run: { fontFamily: 'Calibri', size: 22 },
        },
    ],
};

const classicStyles: IStylesOptions = {
    default: {
        heading1: { run: { fontFamily: 'Times New Roman', size: 32, bold: true, color: "000000" } },
        heading2: { run: { fontFamily: 'Times New Roman', size: 26, bold: true, color: "000000" } },
        heading3: { run: { fontFamily: 'Times New Roman', size: 24, bold: true, color: "000000" } },
        paragraph: { run: { fontFamily: 'Times New Roman', size: 24 }, spacing: { after: 140 } },
    },
    paragraphStyles: [
        {
            id: 'normal',
            name: 'Normal',
            basedOn: 'Normal',
            next: 'Normal',
            quickFormat: true,
            run: { fontFamily: 'Times New Roman', size: 24 },
        },
    ],
};

const academicStyles: IStylesOptions = {
    default: {
        heading1: { run: { fontFamily: 'Garamond', size: 28, bold: true, color: "000000" } },
        heading2: { run: { fontFamily: 'Garamond', size: 24, bold: true, color: "333333" } },
        heading3: { run: { fontFamily: 'Garamond', size: 22, bold: true, color: "333333" } },
        paragraph: { run: { fontFamily: 'Garamond', size: 24 }, spacing: { after: 240, line: 360 } },
    },
    paragraphStyles: [
        {
            id: 'normal',
            name: 'Normal',
            basedOn: 'Normal',
            next: 'Normal',
            quickFormat: true,
            run: { fontFamily: 'Garamond', size: 24 },
        },
    ],
};


export const templates = {
    modern: {
        name: 'حديث (Modern)',
        styles: modernStyles,
        description: 'تصميم نظيف وعصري يستخدم خطوط sans-serif وألوان زرقاء للعناوين.',
        imageUrl: 'https://placehold.co/400x565.png',
        dataAiHint: 'document template',
    },
    classic: {
        name: 'كلاسيكي (Classic)',
        styles: classicStyles,
        description: 'تصميم رسمي وتقليدي يستخدم خط Times New Roman للعناوين والنصوص.',
        imageUrl: 'https://placehold.co/400x565.png',
        dataAiHint: 'classic document',
    },
    academic: {
        name: 'أكاديمي (Academic)',
        styles: academicStyles,
        description: 'تصميم مناسب للتقارير والأبحاث الأكاديمية، مع تباعد أسطر مزدوج وخط Garamond.',
        imageUrl: 'https://placehold.co/400x565.png',
        dataAiHint: 'academic paper',
    },
};

export type TemplateKey = keyof typeof templates;
