'use client';

import { AlignmentType, ShadingType } from 'docx';
import type { IStylesOptions, IParagraphOptions } from 'docx';

// New interface for custom, non-standard styles
export interface CustomStyles {
    codeBlock?: Omit<IParagraphOptions, 'children'>;
    imageParagraph?: Omit<IParagraphOptions, 'children'>;
}

export interface Template {
    id: string;
    name: string;
    description: string;
    styles: IStylesOptions;
    customStyles: CustomStyles; // Added
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
    {
        id: 'Caption',
        name: 'Caption',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 18, italics: true, color: '595959' }, // 9pt, Italic, Grey
        paragraph: {
            alignment: AlignmentType.CENTER,
            spacing: { before: 120, after: 240 }, // 6pt before, 12pt after
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

const modernCustomStyles: CustomStyles = {
    codeBlock: {
        shading: { type: ShadingType.CLEAR, fill: 'F2F2F2' },
        spacing: { before: 200, after: 200 },
        indent: { left: 400 },
        bidirectional: false,
        alignment: AlignmentType.LEFT,
    },
    imageParagraph: {
        alignment: AlignmentType.CENTER,
        border: {
            top: { style: 'single', size: 4, color: 'BFBFBF' },
            bottom: { style: 'single', size: 4, color: 'BFBFBF' },
            left: { style: 'single', size: 4, color: 'BFBFBF' },
            right: { style: 'single', size: 4, color: 'BFBFBF' },
        },
        spacing: { before: 100, after: 100 }
    }
};

const classicCustomStyles: CustomStyles = {
    codeBlock: {
        shading: { type: ShadingType.CLEAR, fill: 'EAEAEA' },
        spacing: { before: 100, after: 100 },
        indent: { left: 400 },
        bidirectional: false,
        alignment: AlignmentType.LEFT,
    },
    imageParagraph: {
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 100 }
    }
};

const academicCustomStyles: CustomStyles = {
    codeBlock: {
        shading: { type: ShadingType.CLEAR, fill: 'F7F7F7' },
        spacing: { before: 120, after: 120, line: 480 },
        indent: { left: 400 },
        bidirectional: false,
        alignment: AlignmentType.LEFT,
    },
    imageParagraph: {
        alignment: AlignmentType.CENTER,
        border: {
            top: { style: 'single', size: 2, color: '888888' },
            bottom: { style: 'single', size: 2, color: '888888' },
            left: { style: 'single', size: 2, color: '888888' },
            right: { style: 'single', size: 2, color: '888888' },
        },
        spacing: { before: 240, after: 240 }
    }
};

const modernStyles: IStylesOptions = {
    default: {
        document: { run: { font: { name: 'Calibri' }, size: 22, color: '333333' } },
        heading1: { run: { font: { name: 'Calibri Light' }, size: 32, bold: true, color: "2E74B5" }, paragraph: { spacing: { after: 240, before: 240 }, outlineLevel: 1 } },
        heading2: { run: { font: { name: 'Calibri Light' }, size: 26, bold: true, color: "2E74B5" }, paragraph: { spacing: { after: 220, before: 220 }, outlineLevel: 2 } },
        heading3: { run: { font: { name: 'Calibri Light' }, size: 24, bold: true, color: "5B9BD5" }, paragraph: { spacing: { after: 200, before: 200 }, outlineLevel: 3 } },
        heading4: { run: { font: { name: 'Calibri Light' }, size: 22, bold: true, color: "5B9BD5" }, paragraph: { spacing: { after: 180, before: 180 }, outlineLevel: 4 } },
        heading5: { run: { font: { name: 'Calibri' }, size: 22, color: "595959" }, paragraph: { spacing: { after: 160, before: 160 }, outlineLevel: 5 } },
        heading6: { run: { font: { name: 'Calibri' }, size: 22, italics: true, color: "595959" }, paragraph: { spacing: { after: 140, before: 140 }, outlineLevel: 6 } },
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
    tableStyles: [
        {
            id: 'CustomTableStyle',
            name: 'Custom Table',
            basedOn: 'TableNormal',
            run: {
                size: 20, // 10pt
                font: { name: 'Calibri' },
            },
            paragraph: {
                spacing: { before: 100, after: 100 },
            },
            table: {
                cellMargin: {
                    top: 100,
                    bottom: 100,
                    left: 100,
                    right: 100,
                },
                borders: {
                    insideHorizontal: { style: 'single', size: 1, color: 'D9D9D9' },
                    insideVertical: { style: 'single', size: 1, color: 'D9D9D9' },
                    top: { style: 'single', size: 2, color: 'BFBFBF' },
                    bottom: { style: 'single', size: 2, color: 'BFBFBF' },
                    left: { style: 'single', size: 2, color: 'BFBFBF' },
                    right: { style: 'single', size: 2, color: 'BFBFBF' },
                },
            },
            tableRow: {
                // These properties are applied to all rows
            },
            tableCell: {
                // These properties are applied to all cells
                verticalAlign: 'center',
            },
            conditionalFormatting: {
                firstRow: {
                    run: { bold: true },
                    tableCell: { shading: { type: 'clear', fill: 'F2F2F2' } },
                },
            }
        }
    ]
};

const classicStyles: IStylesOptions = {
    default: {
        document: { run: { font: { name: 'Times New Roman' }, size: 24, color: '000000' } },
        heading1: { run: { font: { name: 'Times New Roman' }, size: 32, bold: true, color: "000000" }, paragraph: { spacing: { after: 240, before: 240 }, outlineLevel: 1 } },
        heading2: { run: { font: { name: 'Times New Roman' }, size: 26, bold: true, color: "000000" }, paragraph: { spacing: { after: 220, before: 220 }, outlineLevel: 2 } },
        heading3: { run: { font: { name: 'Times New Roman' }, size: 24, bold: true, color: "000000" }, paragraph: { spacing: { after: 200, before: 200 }, outlineLevel: 3 } },
        heading4: { run: { font: { name: 'Times New Roman' }, size: 22, bold: true, color: "000000" }, paragraph: { spacing: { after: 180, before: 180 }, outlineLevel: 4 } },
        heading5: { run: { font: { name: 'Times New Roman' }, size: 22, color: "000000" }, paragraph: { spacing: { after: 160, before: 160 }, outlineLevel: 5 } },
        heading6: { run: { font: { name: 'Times New Roman' }, size: 22, italics: true, color: "000000" }, paragraph: { spacing: { after: 140, before: 140 }, outlineLevel: 6 } },
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
        heading4: { run: { font: { name: 'Garamond' }, size: 22, bold: true, color: "333333" }, paragraph: { spacing: { after: 180, before: 180, line: 480 }, outlineLevel: 4 } },
        heading5: { run: { font: { name: 'Garamond' }, size: 22, color: "333333" }, paragraph: { spacing: { after: 160, before: 160, line: 480 }, outlineLevel: 5 } },
        heading6: { run: { font: { name: 'Garamond' }, size: 22, italics: true, color: "333333" }, paragraph: { spacing: { after: 140, before: 140, line: 480 }, outlineLevel: 6 } },
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
        id: 'modern',
        styles: modernStyles,
        customStyles: modernCustomStyles,
        description: 'templates.modern.description',
        imageUrl: '',
        dataAiHint: 'document template',
    },
    classic: {
        name: 'templates.classic.name',
        id: 'classic',
        styles: classicStyles,
        customStyles: classicCustomStyles,
        description: 'templates.classic.description',
        imageUrl: '',
        dataAiHint: 'classic document',
    },
    academic: {
        name: 'templates.academic.name',
        id: 'academic',
        styles: academicStyles,
        customStyles: academicCustomStyles,
        description: 'templates.academic.description',
        imageUrl: '',
        dataAiHint: 'academic paper',
    },
};

export type TemplateKey = 'modern' | 'classic' | 'academic';