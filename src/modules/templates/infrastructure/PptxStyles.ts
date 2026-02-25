
'use client';

import type { PptxTemplateProperties } from '@/lib/models';
import type { PptxStyleOptions } from '@/ai/schemas/template-schemas';

export type PptxTemplateKey = 'modern' | 'dark' | 'professional';

const modern: PptxStyleOptions = {
    background: { color: 'FFFFFF' },
    title: { fontFace: 'Calibri', fontSize: 28, bold: true, color: '363636', align: 'left', valign: 'middle' },
    body: { fontFace: 'Calibri', fontSize: 18, color: '4f4f4f', align: 'left', lineSpacing: 25, valign: 'top' },
    subtitle: { fontFace: 'Calibri', fontSize: 16, italic: true, color: '6c757d' },
    blockquote: { fontFace: 'Calibri', fontSize: 16, color: '6c757d', italic: true, indent: 0.5, lineSpacing: 20, valign: 'top' },
    code: { fontFace: 'Courier New', fontSize: 12, fill: { color: 'F5F5F5' }, margin: 10, valign: 'top' },
    link: { color: '0052CC', underline: true },
    inlineCode: { fontFace: 'Courier New', color: 'E74C3C', highlight: 'F2F2F2', fontSize: 14 },
    bullet: { type: 'bullet' }, // A standard solid circle bullet
    border: { type: 'solid', pt: 1, color: 'D9D9D9' },
    table: {
        // Table-wide properties, including default cell styles
        border: { type: 'solid', pt: 1, color: 'D9D9D9' },
        fontFace: 'Calibri',
        fontSize: 14,
        color: '4f4f4f',
        valign: 'middle',
        align: 'center',
    },
    tableHeaderStyle: {
        bold: true,
        fill: { color: 'F1F1F1' },
        color: '000000',
        align: 'center',
        valign: 'middle',
        fontFace: 'Calibri',
        fontSize: 14,
    },
    tableCellStyle: {
        // Specific styles for non-header cells can go here if needed
        fontFace: 'Calibri',
        fontSize: 14,
        color: '4f4f4f',
        valign: 'middle',
        align: 'center',
    },
    footnote: {
        fontFace: 'Calibri',
        fontSize: 10,
        color: '6c757d',
        lineColor: 'C0C0C0',
    },

};

const dark: PptxStyleOptions = {
    background: { color: '262626' },
    title: { fontFace: 'Helvetica', fontSize: 32, bold: true, color: 'FFFFFF', align: 'center' },
    body: { fontFace: 'Helvetica', fontSize: 18, color: 'F1F1F1', align: 'left', lineSpacing: 36, valign: 'top' },
    subtitle: { fontSize: 16, italic: true, color: 'A9A9A9' },
    blockquote: { fontFace: 'Calibri', fontSize: 16, color: 'A9A9A9', italic: true, indent: 0.5, lineSpacing: 20, valign: 'top' },
    code: { fontFace: 'Courier New', fontSize: 12, color: 'E0E0E0', fill: { color: '333333' }, margin: 10, valign: 'top' },
    link: { color: '80BFFF', underline: true },
    inlineCode: { fontFace: 'Courier New', color: 'D4D4D4', highlight: '3A3A3A' },
    bullet: { type: 'bullet', code: '25CF' }, // Black circle, will be rendered in body color
    table: {
        border: { type: 'solid', pt: 1, color: '666666' },
        fontFace: 'Helvetica',
        fontSize: 14,
        color: 'F1F1F1',
        valign: 'middle',
        align: 'center',
    },
    tableHeaderStyle: {
        bold: true,
        fill: { color: '444444' },
    },
    tableCellStyle: {},
    footnote: {
        fontFace: 'Helvetica',
        fontSize: 10,
        color: 'A9A9A9',
        lineColor: '666666',
    },
    border: { type: 'solid', pt: 1, color: '666666' },
};

const professional: PptxStyleOptions = {
    background: { color: 'F4F7F9' },
    title: { fontFace: 'Garamond', fontSize: 30, bold: false, color: '003366', align: 'left' },
    body: { fontFace: 'Garamond', fontSize: 16, color: '333333', align: 'left', lineSpacing: 32, valign: 'top' },
    subtitle: { fontSize: 18, italic: true, color: '5A7D9A' },
    blockquote: { fontFace: 'Calibri', fontSize: 16, color: '5A7D9A', italic: true, indent: 0.5, lineSpacing: 20, valign: 'top' },
    code: { fontFace: 'Consolas', fontSize: 12, color: '333333', fill: { color: 'EAF2F8' }, margin: 10, valign: 'top' },
    link: { color: '005A9C', underline: true },
    inlineCode: { fontFace: 'Consolas', color: 'C7254E', highlight: 'F9F2F4' },
    bullet: { type: 'bullet' }, // default
    table: {
        border: { type: 'solid', pt: 1, color: 'B0C4DE' }, // Fix: Changed type to 'solid'
        fontFace: 'Garamond',
        fontSize: 12,
        color: '333333',
        valign: 'middle',
        align: 'left',
    },
    tableHeaderStyle: {
        bold: true,
        fill: { color: 'E6F0F7' }, // A very light blue
        color: '003366',
        align: 'center',
    },
    tableCellStyle: {},
    footnote: {
        fontFace: 'Garamond',
        fontSize: 10,
        color: '5A7D9A',
        lineColor: 'B0C4DE',
    },
    border: { type: 'solid', pt: 1, color: 'B0C4DE' }
};


export const templates: Record<PptxTemplateKey, Omit<PptxTemplateProperties, 'id'>> = {
    modern: {
        name: 'pptxTemplates.modern.name',
        styles: modern, // Use the PptxStyleOptions object directly
        description: 'pptxTemplates.modern.description',
        imageUrl: '',
        dataAiHint: 'presentation modern',
    },
    dark: {
        name: 'pptxTemplates.dark.name',
        styles: dark, // Use the PptxStyleOptions object directly
        description: 'pptxTemplates.dark.description',
        imageUrl: '',
        dataAiHint: 'presentation dark',
    },
    professional: {
        name: 'pptxTemplates.professional.name',
        styles: professional, // Use the PptxStyleOptions object directly
        description: 'pptxTemplates.professional.description',
        imageUrl: '',
        dataAiHint: 'presentation professional',
    },
};
