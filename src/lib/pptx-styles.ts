
'use client';

export interface PptxStyleOptions {
    background: { color: string; };
    title: { color: string; fontFace: string; fontSize: number; bold?: boolean; align?: 'left' | 'center' | 'right'; };
    body: { color: string; fontFace: string; fontSize: number; align?: 'left' | 'center' | 'right'; };
    bullet: { type: 'bullet' | 'number'; style?: string;};
}

export interface PptxTemplate {
    name: string;
    description: string;
    styles: PptxStyleOptions;
    imageUrl: string;
    dataAiHint: string;
}

export type PptxTemplateKey = 'modern' | 'dark' | 'professional';

const modern: PptxStyleOptions = {
    background: { color: "FFFFFF" },
    title: { fontFace: "Calibri", fontSize: 28, bold: true, color: "363636" },
    body: { fontFace: "Calibri", fontSize: 18, color: "4f4f4f" },
    bullet: { type: 'bullet' },
};

const dark: PptxStyleOptions = {
    background: { color: "262626" },
    title: { fontFace: "Helvetica", fontSize: 32, bold: true, color: "FFFFFF" },
    body: { fontFace: "Helvetica", fontSize: 18, color: "F1F1F1" },
    bullet: { type: 'bullet' },
};

const professional: PptxStyleOptions = {
    background: { color: "F4F7F9" },
    title: { fontFace: "Garamond", fontSize: 30, bold: false, color: "003366" },
    body: { fontFace: "Garamond", fontSize: 16, color: "333333" },
    bullet: { type: 'bullet' },
};


export const templates: Record<PptxTemplateKey, PptxTemplate> = {
    modern: {
        name: 'pptxTemplates.modern.name',
        styles: modern,
        description: 'pptxTemplates.modern.description',
        imageUrl: 'https://placehold.co/400x225.png',
        dataAiHint: 'presentation modern',
    },
    dark: {
        name: 'pptxTemplates.dark.name',
        styles: dark,
        description: 'pptxTemplates.dark.description',
        imageUrl: 'https://placehold.co/400x225.png',
        dataAiHint: 'presentation dark',
    },
    professional: {
        name: 'pptxTemplates.professional.name',
        styles: professional,
        description: 'pptxTemplates.professional.description',
        imageUrl: 'https://placehold.co/400x225.png',
        dataAiHint: 'presentation professional',
    },
};
