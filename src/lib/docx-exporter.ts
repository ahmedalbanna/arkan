
'use client';

import { Document, Packer, Paragraph, HeadingLevel, AlignmentType, TextRun, Table, TableRow, TableCell, WidthType, IStylesOptions, IRunOptions, ImageRun, SectionType, Header, Footer, PageNumber, TableOfContents, INumberingOptions } from 'docx';
import { saveAs } from 'file-saver';
import type { ProjectProposal, DiagramType, SectionName } from '@/ai/schemas';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import type { Root, PhrasingContent, List } from 'mdast';
import { sectionConfig, diagramConfig } from './report-config';
import { templates, type TemplateKey } from './docx-styles';

// Helper to convert mdast inline elements to docx.js TextRun objects
function transformInlines(nodes: PhrasingContent[], options: IRunOptions = {}): TextRun[] {
    const runs: TextRun[] = [];
    for (const node of nodes) {
        switch (node.type) {
            case 'strong':
                runs.push(...transformInlines(node.children, { ...options, bold: true }));
                break;
            case 'emphasis':
                runs.push(...transformInlines(node.children, { ...options, italics: true }));
                break;
            case 'inlineCode':
                runs.push(new TextRun({ ...options, text: node.value, font: { name: 'Courier New' } }));
                break;
            case 'link':
                // For now just process children, can be enhanced to a real hyperlink
                runs.push(...transformInlines(node.children, { ...options, style: 'Hyperlink' }));
                break;
            case 'text':
                runs.push(new TextRun({ ...options, text: node.value }));
                break;
            default:
                break;
        }
    }
    return runs;
}

// Helper to parse markdown for DOCX using remark (unified)
const parseMarkdownToDocx = (markdown: string): (Paragraph | Table)[] => {
    if (!markdown) return [];

    const ast = unified().use(remarkParse).use(remarkGfm).parse(markdown) as Root;
    const docxObjects: (Paragraph | Table)[] = [];

    // Helper to process lists recursively
    const processListItems = (listNode: List, level: number): Paragraph[] => {
        let paragraphs: Paragraph[] = [];
        for (const listItem of listNode.children) {
            for (const itemContent of listItem.children) {
                if (itemContent.type === 'paragraph') {
                    paragraphs.push(new Paragraph({
                        children: transformInlines(itemContent.children),
                        style: 'ListParagraph',
                        bullet: listNode.ordered ? undefined : { level },
                        numbering: listNode.ordered ? { reference: "default-numbering", level } : undefined,
                    }));
                } else if (itemContent.type === 'list') {
                    // Nested list
                    paragraphs.push(...processListItems(itemContent, level + 1));
                }
            }
        }
        return paragraphs;
    }

    for (const node of ast.children) {
        switch (node.type) {
            case 'heading':
                docxObjects.push(new Paragraph({
                    children: transformInlines(node.children),
                    heading: `Heading${node.depth}` as any,
                }));
                break;
            case 'paragraph':
                docxObjects.push(new Paragraph({
                    children: transformInlines(node.children),
                    spacing: { after: 120 },
                }));
                break;
            case 'list':
                docxObjects.push(...processListItems(node, 0));
                break;
            case 'blockquote':
                for (const content of node.children) {
                    if (content.type === 'paragraph') {
                        docxObjects.push(new Paragraph({
                            children: transformInlines(content.children),
                            style: 'Quote',
                        }));
                    }
                }
                break;
            case 'table': {
                const tableRows = node.children.map((row, rowIndex) => {
                    return new TableRow({
                        children: row.children.map(cell => new TableCell({
                            children: [new Paragraph({ children: transformInlines(cell.children) })],
                        })),
                        tableHeader: rowIndex === 0,
                    });
                });

                docxObjects.push(new Table({
                    rows: tableRows,
                    width: { size: 100, type: WidthType.PERCENTAGE },
                }));
                break;
            }
            case 'thematicBreak':
                docxObjects.push(new Paragraph({ border: { bottom: { color: "auto", style: "single", size: 6, space: 1 } } }));
                break;
        }
    }

    return docxObjects;
};

const numbering: INumberingOptions = {
    config: [
        {
            reference: "default-numbering",
            levels: [
                { level: 0, format: "decimal", text: "%1.", alignment: AlignmentType.START },
                { level: 1, format: "lowerLetter", text: "%2)", alignment: AlignmentType.START },
                { level: 2, format: "lowerRoman", text: "%3.", alignment: AlignmentType.START },
                { level: 3, format: "upperLetter", text: "%4)", alignment: AlignmentType.START },
            ],
        },
    ],
};

async function getProxiedImageBuffer(imageUrl: string): Promise<ArrayBuffer | null> {
    try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
            console.warn(`Failed to fetch proxied image from ${imageUrl}. Status: ${response.status}`);
            return null;
        }
        return response.arrayBuffer();
    } catch (error) {
        console.error(`Error fetching image from ${imageUrl}:`, error);
        return null;
    }
}

function getStylesFromStorage(): Record<TemplateKey, { styles: IStylesOptions }> {
    if (typeof window === 'undefined') {
        return templates;
    }
    const stored = localStorage.getItem('arkan-docx-styles');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            return templates;
        }
    }
    return templates;
}

export async function exportProposalAsDocx(proposal: ProjectProposal, templateKey: TemplateKey) {
    const allTemplates = getStylesFromStorage();
    const styles = allTemplates[templateKey]?.styles || templates.modern.styles;
    
    const { title, category, objective, methodology, timeline, budget, expected_outcome, success_criteria, evaluation, stakeholders, risks } = proposal;

    const doc = new Document({
        styles,
        numbering,
        sections: [
            // Cover Page Section
            {
                properties: { type: SectionType.NEXT_PAGE },
                children: [
                    new Paragraph({ text: "", spacing: { after: 2000 } }),
                    new Paragraph({ text: title, style: 'Title' }),
                    new Paragraph({ text: category, style: 'SubTitle', spacing: { after: 400 } }),
                ]
            },
            // Main Content Section
            {
                properties: { type: SectionType.NEXT_PAGE },
                headers: { default: new Header({ children: [new Paragraph({ text: `Proposal: ${title}`, alignment: AlignmentType.RIGHT })] }) },
                footers: {
                    default: new Footer({
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [new TextRun({ children: [PageNumber.CURRENT] })],
                            }),
                        ],
                    }),
                },
                children: [
                    new TableOfContents("Table of Contents", {
                        hyperlink: true,
                        headingStyleRange: "1-3",
                    }),
                    new Paragraph({ text: "Objective", heading: HeadingLevel.HEADING_1 }),
                    ...parseMarkdownToDocx(objective),
                    new Paragraph({ text: "Methodology", heading: HeadingLevel.HEADING_1 }),
                    ...parseMarkdownToDocx(methodology),
                    new Paragraph({ text: "Timeline", heading: HeadingLevel.HEADING_1 }),
                    new Paragraph({ children: [new TextRun({ text: "Start Date: ", bold: true }), new TextRun(timeline.startDate)] }),
                    new Paragraph({ children: [new TextRun({ text: "End Date: ", bold: true }), new TextRun(timeline.endDate)] }),
                    new Paragraph({ text: "Phases:", heading: HeadingLevel.HEADING_2 }),
                    ...timeline.phases.map(p => new Paragraph({ text: `${p.name} (${p.durationWeeks} weeks)`, bullet: { level: 0 } })),
                    new Paragraph({ text: "Budget", heading: HeadingLevel.HEADING_1 }),
                    new Paragraph({ children: [new TextRun({ text: "Total Amount: ", bold: true }), new TextRun(`${budget.totalAmount.toLocaleString()} ${budget.currency}`)] }),
                    new Table({ rows: [new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Item", bold: true })] })] }), new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Cost", bold: true })] })] }),] }), ...budget.breakdown.map(b => new TableRow({ children: [new TableCell({ children: [new Paragraph(b.item)] }), new TableCell({ children: [new Paragraph(`${b.cost.toLocaleString()} ${budget.currency}`)] }),] }))], width: { size: 100, type: WidthType.PERCENTAGE } }),
                    new Paragraph({ text: "Expected Outcomes", heading: HeadingLevel.HEADING_1 }),
                    ...expected_outcome.map(o => new Paragraph({ text: o, bullet: { level: 0 } })),
                    new Paragraph({ text: "Success Criteria", heading: HeadingLevel.HEADING_1 }),
                    ...success_criteria.map(sc => new Paragraph({ text: sc, bullet: { level: 0 } })),
                    new Paragraph({ text: "Evaluation", heading: HeadingLevel.HEADING_1 }),
                    ...parseMarkdownToDocx(evaluation),
                    new Paragraph({ text: "Stakeholders", heading: HeadingLevel.HEADING_1 }),
                    ...stakeholders.flatMap(s => [new Paragraph({ text: `${s.name} (${s.role})`, heading: HeadingLevel.HEADING_2 }), ...parseMarkdownToDocx(s.interest),]),
                    new Paragraph({ text: "Risks and Mitigations", heading: HeadingLevel.HEADING_1 }),
                    ...risks.flatMap(r => [new Paragraph({ text: r.description, heading: HeadingLevel.HEADING_2 }), ...parseMarkdownToDocx(r.mitigation)]),
                ],
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
    sections: { [key in SectionName]?: string; },
    diagrams: { [key in DiagramType]?: { plantUmlCode: string; imageUrl: string; } },
    proposalTitle: string,
    templateKey: TemplateKey
) {
    const allTemplates = getStylesFromStorage();
    const styles = allTemplates[templateKey]?.styles || templates.modern.styles;

    const orderedSections = Object.keys(sectionConfig) as SectionName[];
    const orderedDiagrams = Object.keys(diagramConfig) as DiagramType[];

    const reportBody: (Paragraph | Table | TableOfContents)[] = [];
    reportBody.push(new TableOfContents("Table of Contents", {
        hyperlink: true,
        headingStyleRange: "1-3",
    }));

    for (const key of orderedSections) {
        const content = sections[key];
        if (content) {
            reportBody.push(new Paragraph({
                text: sectionConfig[key].title,
                heading: HeadingLevel.HEADING_1,
            }));
            reportBody.push(...parseMarkdownToDocx(content));
        }
    }

    const diagramEntries = orderedDiagrams.map(key => diagrams[key]).filter(Boolean) as { imageUrl: string; }[];
    const hasDiagrams = diagramEntries.length > 0;

    if (hasDiagrams) {
        reportBody.push(new Paragraph({ text: "Appendices: Diagrams", heading: HeadingLevel.HEADING_1, pageBreakBefore: true }));

        const imagePromises = orderedDiagrams.map(key => {
            const diagramData = diagrams[key];
            if (!diagramData) return Promise.resolve(null);
            return getProxiedImageBuffer(diagramData.imageUrl).then(buffer => ({
                key,
                buffer
            }));
        });
        
        const imageResults = await Promise.all(imagePromises);

        for (const result of imageResults) {
            if (result && result.buffer) {
                const { key, buffer } = result;
                reportBody.push(new Paragraph({
                    text: diagramConfig[key as DiagramType].title,
                    heading: HeadingLevel.HEADING_2,
                }));
                reportBody.push(new Paragraph({
                    children: [new ImageRun({
                        data: buffer,
                        transformation: { width: 550, height: 400 },
                    })],
                    alignment: AlignmentType.CENTER,
                }));
            } else if (result) {
                // Handle cases where image fetching failed
                reportBody.push(new Paragraph({ text: `[Failed to load image for diagram: ${diagramConfig[result.key as DiagramType].title}]` }));
            }
        }
    }

    const doc = new Document({
        styles,
        numbering,
        sections: [
            // Cover Page
            {
                properties: { type: SectionType.NEXT_PAGE },
                children: [
                    new Paragraph({ text: "", spacing: { after: 2000 } }),
                    new Paragraph({ text: `Project Report`, style: 'Title' }),
                    new Paragraph({ text: proposalTitle, style: 'SubTitle', spacing: { after: 400 } }),
                ]
            },
            // Main Content
            {
                properties: { type: SectionType.NEXT_PAGE },
                headers: { default: new Header({ children: [new Paragraph({ text: `Report: ${proposalTitle}`, alignment: AlignmentType.RIGHT })] }) },
                footers: {
                    default: new Footer({
                        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT, " | ", PageNumber.TOTAL_PAGES] })] })],
                    }),
                },
                children: reportBody,
            }
        ],
    });

    try {
        const blob = await Packer.toBlob(doc);
        saveAs(blob, "project-report.docx");
    } catch (error) {
        console.error("Error generating DOCX file:", error);
    }
}
