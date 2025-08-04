
'use client';

import type { PptxTemplate, PptxTemplateKey } from '@/lib/types';
export type { PptxTemplateKey } from '@/lib/types';

const modern: PptxTemplate['styles'] = {
    background: { color: "FFFFFF" },
    title: { fontFace: "Calibri", fontSize: 28, bold: true, color: "363636", align: 'left' },
    body: { fontFace: "Calibri", fontSize: 18, color: "4f4f4f", align: 'left' },
    bullet: { type: 'bullet' },
};

const dark: PptxTemplate['styles'] = {
    background: { color: "262626" },
    title: { fontFace: "Helvetica", fontSize: 32, bold: true, color: "FFFFFF", align: 'center' },
    body: { fontFace: "Helvetica", fontSize: 18, color: "F1F1F1", align: 'left' },
    bullet: { type: 'bullet' },
};

const professional: PptxTemplate['styles'] = {
    background: { color: "F4F7F9" },
    title: { fontFace: "Garamond", fontSize: 30, bold: false, color: "003366", align: 'left' },
    body: { fontFace: "Garamond", fontSize: 16, color: "333333", align: 'left' },
    bullet: { type: 'bullet' },
};


export const templates: Record<PptxTemplateKey, PptxTemplate> = {
    modern: {
        id: 'modern',
        name: 'pptxTemplates.modern.name',
        styles: modern,
        description: 'pptxTemplates.modern.description',
        imageUrl: '',
        dataAiHint: 'presentation modern',
    },
    dark: {
        id: 'dark',
        name: 'pptxTemplates.dark.name',
        styles: dark,
        description: 'pptxTemplates.dark.description',
        imageUrl: '',
        dataAiHint: 'presentation dark',
    },
    professional: {
        id: 'professional',
        name: 'pptxTemplates.professional.name',
        styles: professional,
        description: 'pptxTemplates.professional.description',
        imageUrl: '',
        dataAiHint: 'presentation professional',
    },
};
