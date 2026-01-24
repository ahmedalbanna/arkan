
'use client';

import { DocxTemplateProperties } from '@/lib/models/docxTemplate';
import { CustomStyles } from '@/lib/word-converter/types';
import type { IStylesOptions } from 'docx';
import { AlignmentType, ShadingType } from 'docx';


const commonParagraphStyles = [
    {
        id: 'Normal',
        name: 'Normal',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 24 }, // 12pt - standard professional size
        paragraph: {
            spacing: {
                after: 200, // 10pt after for better paragraph separation
                before: 0,
                line: 360 // 1.5 line spacing for better readability
            },
            alignment: AlignmentType.JUSTIFIED // Better for professional documents
        },
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
        run: {
            italics: true,
            color: '4A4A4A',
            size: 24
        },
        paragraph: {
            indent: { left: 1440, right: 720 }, // Larger left indent for quotes
            spacing: { before: 240, after: 240, line: 360 },
            border: {
                left: {
                    color: "4A90E2", // Blue accent
                    space: 4,
                    style: "single",
                    size: 12, // Thicker border
                },
            },
            shading: { type: ShadingType.CLEAR, fill: 'FAFAFA' }, // Subtle background
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
    {
        id: 'HorizontalRule',
        name: 'Horizontal Rule',
        basedOn: 'Normal',
        paragraph: {
            spacing: { before: 240, after: 240 },
            border: { bottom: { color: 'auto', space: 1, style: 'single', size: 6 } },
        },
    },
    {
        id: 'PageBreak',
        name: 'Page Break',
        basedOn: 'Normal',
        paragraph: {
            spacing: { before: 0, after: 0 },
        },
    },
    {
        id: 'TaskList',
        name: 'Task List',
        basedOn: 'ListParagraph',
        quickFormat: true,
        paragraph: {
            indent: { left: 720, hanging: 360 },
        },
    },
    {
        id: 'DefinitionTerm',
        name: 'Definition Term',
        basedOn: 'Normal',
        next: 'Normal',
        run: { bold: true },
        paragraph: {
            spacing: { before: 120, after: 60 },
        },
    },
    {
        id: 'DefinitionDescription',
        name: 'Definition Description',
        basedOn: 'Normal',
        next: 'Normal',
        paragraph: {
            indent: { left: 720 },
            spacing: { before: 0, after: 120 },
        },
    },
    {
        id: 'CodeBlock',
        name: 'Code Block',
        basedOn: 'Normal',
        run: {
            font: { name: 'Consolas' }, // Better monospace font
            size: 20, // 10pt - more readable
            color: '1E1E1E', // Softer black
        },
        paragraph: {
            spacing: { before: 240, after: 240, line: 300 }, // Better spacing
            indent: { left: 720, right: 720 }, // Indent from both sides
            shading: { type: ShadingType.CLEAR, fill: 'F8F8F8' }, // Lighter background
            border: {
                left: { style: 'single', size: 8, color: '4A90E2' }, // Blue accent border
                top: { style: 'single', size: 2, color: 'E1E1E1' },
                bottom: { style: 'single', size: 2, color: 'E1E1E1' },
                right: { style: 'single', size: 2, color: 'E1E1E1' },
            },
        },
    },
    {
        id: 'FootnoteText',
        name: 'Footnote Text',
        basedOn: 'Normal',
        run: { size: 20 }, // 10pt
        paragraph: {
            spacing: { after: 60, line: 240 },
            indent: { left: 200, hanging: 200 },
        },
    },
    {
        id: 'CustomTableStyle',
        name: 'Custom Table',
        basedOn: 'TableNormal',
        run: {
            size: 22, // 11pt - better readability
            font: { name: 'Calibri' },
        },
        paragraph: {
            spacing: { before: 120, after: 120 },
            alignment: AlignmentType.LEFT,
        },
        table: {
            cellMargin: {
                top: 150, // Increased padding
                bottom: 150,
                left: 200,
                right: 200,
            },
            borders: {
                insideHorizontal: { style: 'single', size: 4, color: 'E5E5E5' },
                insideVertical: { style: 'single', size: 4, color: 'E5E5E5' },
                top: { style: 'single', size: 8, color: '4A90E2' }, // Blue top border
                bottom: { style: 'single', size: 6, color: 'BFBFBF' },
                left: { style: 'single', size: 4, color: 'BFBFBF' },
                right: { style: 'single', size: 4, color: 'BFBFBF' },
            },
        },
        tableRow: {
            cantSplit: true, // Prevent row splitting across pages
        },
        tableCell: {
            verticalAlign: 'center',
        },
        conditionalFormatting: {
            firstRow: {
                run: { bold: true, color: 'FFFFFF', size: 24 },
                paragraph: { alignment: AlignmentType.CENTER },
                tableCell: {
                    shading: { type: 'clear', fill: '4A90E2' }, // Blue header
                    borders: {
                        bottom: { style: 'single', size: 6, color: '2E5C8A' }
                    }
                },
            },
            lastRow: {
                run: { bold: true },
                tableCell: {
                    borders: {
                        bottom: { style: 'double', size: 6, color: '4A90E2' }
                    }
                },
            },
            firstColumn: {
                run: { bold: true, color: '2D2D2D' },
            },
            lastColumn: {
                run: { bold: false },
            },
            oddRowBanding: {
                tableCell: { shading: { type: 'clear', fill: 'F9F9F9' } },
            },
            evenRowBanding: {
                tableCell: { shading: { type: 'clear', fill: 'FFFFFF' } },
            },
        }
    }
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
    {
        id: 'InlineCode',
        name: 'Inline Code',
        basedOn: 'Default Paragraph Font',
        run: {
            font: { name: 'Courier New' },
            size: 18, // 9pt
            shading: { type: ShadingType.CLEAR, fill: 'F2F2F2' },
        },
    },
    {
        id: 'Strong',
        name: 'Strong',
        basedOn: 'Default Paragraph Font',
        run: {
            bold: true,
        },
    },
    {
        id: 'Emphasis',
        name: 'Emphasis',
        basedOn: 'Default Paragraph Font',
        run: {
            italics: true,
        },
    },
    {
        id: 'Strikethrough',
        name: 'Strikethrough',
        basedOn: 'Default Paragraph Font',
        run: {
            strike: true,
        },
    },
    {
        id: 'FootnoteReference',
        name: 'Footnote Reference',
        basedOn: 'Default Paragraph Font',
        run: {
            size: 16, // 8pt
            superScript: true,
        },
    },
];

const modernCustomStyles: CustomStyles = {
    codeBlock: {
        shading: { type: ShadingType.CLEAR, fill: 'F8F8F8' },
        spacing: { before: 240, after: 240, line: 300 },
        indent: { left: 720, right: 720 },
        bidirectional: false,
        alignment: AlignmentType.LEFT,
        border: {
            left: { style: 'single', size: 8, color: '4A90E2' },
            top: { style: 'single', size: 2, color: 'E1E1E1' },
            bottom: { style: 'single', size: 2, color: 'E1E1E1' },
            right: { style: 'single', size: 2, color: 'E1E1E1' },
        },
    },
    imageParagraph: {
        alignment: AlignmentType.CENTER,
        border: {
            top: { style: 'single', size: 6, color: 'D0D0D0' },
            bottom: { style: 'single', size: 6, color: 'D0D0D0' },
            left: { style: 'single', size: 6, color: 'D0D0D0' },
            right: { style: 'single', size: 6, color: 'D0D0D0' },
        },
        spacing: { before: 240, after: 240 },
        shading: { type: ShadingType.CLEAR, fill: 'FCFCFC' }
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
        document: {
            run: {
                font: { name: 'Calibri' },
                size: 24, // Increased from 22 to 24 (12pt) for better readability
                color: '2D2D2D' // Slightly softer black
            }
        },
        heading1: {
            run: {
                font: { name: 'Calibri Light' },
                size: 40, // Increased from 32 (20pt)
                bold: true,
                color: "1F4788" // Deeper professional blue
            },
            paragraph: {
                spacing: { after: 360, before: 480, line: 360 }, // More spacing
                outlineLevel: 1,
                keepNext: true,
                keepLines: true
            }
        },
        heading2: {
            run: {
                font: { name: 'Calibri Light' },
                size: 32, // Increased from 26 (16pt)
                bold: true,
                color: "2E74B5"
            },
            paragraph: {
                spacing: { after: 280, before: 360, line: 320 },
                outlineLevel: 2,
                keepNext: true,
                keepLines: true
            }
        },
        heading3: {
            run: {
                font: { name: 'Calibri' },
                size: 28, // Increased from 24 (14pt)
                bold: true,
                color: "4472C4"
            },
            paragraph: {
                spacing: { after: 240, before: 280, line: 300 },
                outlineLevel: 3,
                keepNext: true
            }
        },
        heading4: {
            run: {
                font: { name: 'Calibri' },
                size: 26, // Increased from 22 (13pt)
                bold: true,
                color: "5B9BD5"
            },
            paragraph: {
                spacing: { after: 200, before: 240, line: 280 },
                outlineLevel: 4,
                keepNext: true
            }
        },
        heading5: {
            run: {
                font: { name: 'Calibri' },
                size: 24, // Same as body (12pt)
                bold: true,
                color: "636363"
            },
            paragraph: {
                spacing: { after: 180, before: 200, line: 276 },
                outlineLevel: 5,
                keepNext: true
            }
        },
        heading6: {
            run: {
                font: { name: 'Calibri' },
                size: 24,
                italics: true,
                color: "737373"
            },
            paragraph: {
                spacing: { after: 160, before: 180, line: 276 },
                outlineLevel: 6,
                keepNext: true
            }
        },
    },
    paragraphStyles: [
        ...commonParagraphStyles,
        {
            id: 'ModernSpecific',
            name: 'Modern Specific',
            basedOn: 'Normal',
            run: { font: { name: 'Calibri' }, size: 24 }
        }
    ],
    characterStyles: commonCharacterStyles,
};

const classicStyles: IStylesOptions = {
    default: {
        document: { run: { font: { name: 'Times New Roman' }, size: 24, color: '000000' } },
        heading1: { run: { font: { name: 'Times New Roman' }, size: 32, bold: true, color: "000000" }, paragraph: { spacing: { after: 240, before: 240 }, outlineLevel: 1, keepNext: true } },
        heading2: { run: { font: { name: 'Times New Roman' }, size: 26, bold: true, color: "000000" }, paragraph: { spacing: { after: 220, before: 220 }, outlineLevel: 2, keepNext: true } },
        heading3: { run: { font: { name: 'Times New Roman' }, size: 24, bold: true, color: "000000" }, paragraph: { spacing: { after: 200, before: 200 }, outlineLevel: 3, keepNext: true } },
        heading4: { run: { font: { name: 'Times New Roman' }, size: 22, bold: true, color: "000000" }, paragraph: { spacing: { after: 180, before: 180 }, outlineLevel: 4, keepNext: true } },
        heading5: { run: { font: { name: 'Times New Roman' }, size: 22, color: "000000" }, paragraph: { spacing: { after: 160, before: 160 }, outlineLevel: 5, keepNext: true } },
        heading6: { run: { font: { name: 'Times New Roman' }, size: 22, italics: true, color: "000000" }, paragraph: { spacing: { after: 140, before: 140 }, outlineLevel: 6, keepNext: true } },
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
        heading1: { run: { font: { name: 'Garamond' }, size: 28, bold: true, color: "000000" }, paragraph: { spacing: { after: 240, before: 240, line: 480 }, outlineLevel: 1, keepNext: true } },
        heading2: { run: { font: { name: 'Garamond' }, size: 24, bold: true, color: "333333" }, paragraph: { spacing: { after: 220, before: 220, line: 480 }, outlineLevel: 2, keepNext: true } },
        heading3: { run: { font: { name: 'Garamond' }, size: 22, bold: true, color: "333333" }, paragraph: { spacing: { after: 200, before: 200 }, outlineLevel: 3, keepNext: true } },
        heading4: { run: { font: { name: 'Garamond' }, size: 22, bold: true, color: "333333" }, paragraph: { spacing: { after: 180, before: 180, line: 480 }, outlineLevel: 4, keepNext: true } },
        heading5: { run: { font: { name: 'Garamond' }, size: 22, color: "333333" }, paragraph: { spacing: { after: 160, before: 160 }, outlineLevel: 5, keepNext: true } },
        heading6: { run: { font: { name: 'Garamond' }, size: 22, italics: true, color: "333333" }, paragraph: { spacing: { after: 140, before: 140 }, outlineLevel: 6, keepNext: true } },
    },
    paragraphStyles: commonParagraphStyles.map(p => ({
        ...p,
        run: { ...p.run, font: { name: 'Garamond' }, size: 24 },
        paragraph: { ...p.paragraph, spacing: { ...p.paragraph?.spacing, line: 480 } }
    })),
    characterStyles: commonCharacterStyles,
};

// Ensure the 'templates' object conforms to the DocxTemplate schema
export const templates: Record<string, Omit<DocxTemplateProperties, 'id'>> = {
    modern: {
        name: 'templates.modern.name',
        styles: modernStyles as IStylesOptions,
        customStyles: modernCustomStyles,
        description: 'templates.modern.description',
        imageUrl: '',
        dataAiHint: 'document template',
    },
    classic: {
        name: 'templates.classic.name',
        styles: classicStyles as IStylesOptions,
        customStyles: classicCustomStyles,
        description: 'templates.classic.description',
        imageUrl: '',
        dataAiHint: 'classic document',
    },
    academic: {
        name: 'templates.academic.name',
        styles: academicStyles as IStylesOptions,
        customStyles: academicCustomStyles,
        description: 'templates.academic.description',
        imageUrl: '',
        dataAiHint: 'academic paper',
    },
};

// Infer DocxTemplateKey dynamically from the 'templates' object
export type DocxTemplateKey = keyof typeof templates;
