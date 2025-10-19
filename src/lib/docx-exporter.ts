
'use client';

import { Document, Packer, Paragraph, AlignmentType, Table, TextRun, Header, Footer, PageNumber, SectionType } from 'docx';
import { saveAs } from 'file-saver';
import { type ProjectProposal } from '@/ai/schemas';
import { templates, type DocxTemplateKey } from './docx-styles';
import { createDocxContent } from './markdown-to-word-converter';
import { formatKeyToTitle, hasContent } from './proposal-utils';
import { exportComponentAsPDF } from './pdf-exporter';

const defaultStyles = templates.modern.styles;

/**
 * Recursively traverses a proposal data structure and converts it into an array of docx objects.
 * @param data - The data to render (can be string, array, or object).
 * @param level - The current heading level for titles.
 * @returns A promise that resolves to an array of docx Paragraphs and Tables.
 */
async function renderDocxValue(data: any, level: number = 1): Promise<(Paragraph | Table)[]> {
    if (!hasContent(data)) {
        return [];
    }

    if (Array.isArray(data)) {
        const listItems = await Promise.all(data.map(async item => {
            if (typeof item === 'object' && item !== null) {
                return new Paragraph({
                    children: await renderDocxValue(item, level + 1),
                    bullet: { level: 0 },
                });
            }
            return new Paragraph({
                text: String(item),
                bullet: { level: 0 },
            });
        }));
        return listItems.flat();
    }

    if (typeof data === 'object' && data !== null) {
        const objectEntries = await Promise.all(Object.entries(data).map(async ([key, value]) => {
            if (!hasContent(value)) return [];
            const heading = new Paragraph({
                text: formatKeyToTitle(key),
                heading: `Heading${level}` as any,
            });
            const content = await renderDocxValue(value, level + 1);
            return [heading, ...content];
        }));
        return objectEntries.flat();
    }

    if (typeof data === 'string') {
        const { docxObjects } = await createDocxContent(data);
        return docxObjects.filter((obj): obj is Paragraph | Table => !('_type' in obj));
    }

    return [new Paragraph({ text: String(data) })];
}


export async function exportProposalAsPdf(proposal: ProjectProposal) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    await exportComponentAsPDF(container, `${proposal.title.replace(/\s+/g, '_')}_proposal.pdf`);
    document.body.removeChild(container);
}


export async function exportProposalAsDocx(proposal: ProjectProposal) {
    const styles = defaultStyles;

    const { title = 'Untitled Proposal', category = 'General', ...restOfProposal } = proposal;

    const docxContent = await renderDocxValue(restOfProposal, 1);

    const doc = new Document({
        styles,
        sections: [
            {
                properties: { type: SectionType.NEXT_PAGE },
                children: [
                    new Paragraph({ text: "", spacing: { after: 2000 } }),
                    new Paragraph({ text: title, style: 'Title' }),
                    new Paragraph({ text: category, style: 'SubTitle', spacing: { after: 800 } }),
                ]
            },
            {
                properties: { type: SectionType.NEXT_PAGE },
                headers: { default: new Header({ children: [new Paragraph({ text: `Proposal: ${title}`, alignment: AlignmentType.RIGHT })] }) },
                footers: {
                    default: new Footer({
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [new TextRun({ children: [PageNumber.CURRENT, " | ", PageNumber.TOTAL_PAGES] })],
                            }),
                        ],
                    }),
                },
                children: docxContent,
            }],
    });

    try {
        const blob = await Packer.toBlob(doc);
        saveAs(blob, `${title.replace(/ /g, '_')}_proposal.docx`);
    } catch (error) {
        console.error("Error generating DOCX file:", error);
    }
}


export async function exportReportAsDocx(
    sections: { [key in string]?: string; },
    diagrams: { [key in string]?: { plantUmlCode: string; imageUrl: string; } },
    proposalTitle: string,
    translatedTitles: { [key in string]?: string; },
    sectionsToInclude?: string[]
) {
    const styles = defaultStyles;
    const doc = new Document({
        styles,
        sections: [
            {
                properties: {},
                children: [],
            },
        ],
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, "project-report.docx");
}
