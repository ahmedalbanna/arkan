
import { AlignmentType } from 'docx';
import type { IStylesOptions } from 'docx';

export interface Template {
    name: string;
    description: string;
    styles: IStylesOptions;
    imageUrl: string;
    dataAiHint: string;
}

const commonParagraphStyles = [
    {
        id: 'Normal',
        name: 'Normal',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 22 }, // 11pt
        paragraph: { spacing: { after: 120 } },
    },
    {
        id: 'Title',
        name: 'Title',
        basedOn: 'Normal',
        next: 'Normal',
        run: { size: 52, bold: true }, // 26pt
        paragraph: { alignment: AlignmentType.CENTER, spacing: { after: 300 } },
    },
    {
        id: 'SubTitle',
        name: 'Sub-Title',
        basedOn: 'Normal',
        next: 'Normal',
        run: { size: 32, italics: true }, // 16pt
        paragraph: { alignment: AlignmentType.CENTER, spacing: { after: 800 } },
    },
    {
        id: 'ListParagraph',
        name: 'List Paragraph',
        basedOn: 'Normal',
        quickFormat: true,
        paragraph: {
            indent: { left: 720, hanging: 360 },
        },
    },
    {
        id: 'Quote',
        name: 'Quote',
        basedOn: 'Normal',
        next: 'Normal',
        run: { italics: true, color: '555555' },
        paragraph: {
            indent: { left: 720 },
            spacing: { before: 120, after: 120 },
            border: {
                left: {
                    color: "auto",
                    space: 1,
                    style: "single",
                    size: 6,
                },
            },
        },
    },
];

const commonCharacterStyles = [
    {
        id: 'Hyperlink',
        name: 'Hyperlink',
        basedOn: 'Default Paragraph Font',
        run: {
            color: '0563C1',
            underline: {},
        },
    },
]

const modernStyles: IStylesOptions = {
    default: {
        document: { run: { font: { name: 'Calibri' }, size: 22, color: '333333' } },
        heading1: { run: { font: { name: 'Calibri Light' }, size: 32, bold: true, color: "2E74B5" }, paragraph: { spacing: { after: 240, before: 240 }, outlineLevel: 1 } },
        heading2: { run: { font: { name: 'Calibri Light' }, size: 26, bold: true, color: "2E74B5" }, paragraph: { spacing: { after: 220, before: 220 }, outlineLevel: 2 } },
        heading3: { run: { font: { name: 'Calibri Light' }, size: 24, bold: true, color: "5B9BD5" }, paragraph: { spacing: { after: 200, before: 200 }, outlineLevel: 3 } },
    },
    paragraphStyles: [
        ...commonParagraphStyles,
        {
            id: 'ModernSpecific',
            name: 'Modern Specific',
            basedOn: 'Normal',
            run: { font: { name: 'Calibri' } }
        }
    ],
    characterStyles: commonCharacterStyles,
};

const classicStyles: IStylesOptions = {
    default: {
        document: { run: { font: { name: 'Times New Roman' }, size: 24, color: '000000' } },
        heading1: { run: { font: { name: 'Times New Roman' }, size: 32, bold: true, color: "000000" }, paragraph: { spacing: { after: 240, before: 240 }, outlineLevel: 1 } },
        heading2: { run: { font: { name: 'Times New Roman' }, size: 26, bold: true, color: "000000" }, paragraph: { spacing: { after: 220, before: 220 }, outlineLevel: 2 } },
        heading3: { run: { font: { name: 'Times New Roman' }, size: 24, bold: true, color: "000000" }, paragraph: { spacing: { after: 200, before: 200 }, outlineLevel: 3 } },
    },
    paragraphStyles: commonParagraphStyles.map(p => ({
        ...p,
        run: { ...p.run, font: { name: 'Times New Roman' } }
    })),
    characterStyles: commonCharacterStyles,
};

const academicStyles: IStylesOptions = {
    default: {
        document: { run: { font: { name: 'Garamond' }, size: 24, color: '000000' } },
        heading1: { run: { font: { name: 'Garamond' }, size: 28, bold: true, color: "000000" }, paragraph: { spacing: { after: 240, before: 240, line: 480 }, outlineLevel: 1 } },
        heading2: { run: { font: { name: 'Garamond' }, size: 24, bold: true, color: "333333" }, paragraph: { spacing: { after: 220, before: 220, line: 480 }, outlineLevel: 2 } },
        heading3: { run: { font: { name: 'Garamond' }, size: 22, bold: true, color: "333333" }, paragraph: { spacing: { after: 200, before: 200, line: 480 }, outlineLevel: 3 } },
    },
    paragraphStyles: commonParagraphStyles.map(p => ({
        ...p,
        run: { ...p.run, font: { name: 'Garamond' }, size: 24 },
        paragraph: { ...p.paragraph, spacing: { ...p.paragraph?.spacing, line: 480 } }
    })),
    characterStyles: commonCharacterStyles,
};


export const templates: Record<TemplateKey, Template> = {
    modern: {
        name: 'templates.modern.name',
        styles: modernStyles,
        description: 'templates.modern.description',
        imageUrl: 'https://placehold.co/400x565.png',
        dataAiHint: 'document template',
    },
    classic: {
        name: 'templates.classic.name',
        styles: classicStyles,
        description: 'templates.classic.description',
        imageUrl: 'https://placehold.co/400x565.png',
        dataAiHint: 'classic document',
    },
    academic: {
        name: 'templates.academic.name',
        styles: academicStyles,
        description: 'templates.academic.description',
        imageUrl: 'https://placehold.co/400x565.png',
        dataAiHint: 'academic paper',
    },
};

export type TemplateKey = 'modern' | 'classic' | 'academic';
