
'use client';

import type { IStylesOptions, IRunOptions, SectionType, INumberingOptions } from 'docx';
import type { ProjectProposal, DiagramType, SectionName } from '@/ai/schemas';
import type { Root, PhrasingContent, List } from 'mdast';
import { sectionConfig, diagramConfig } from './report-config';
import { templates, type TemplateKey } from './docx-styles';

export async function createDocxParagraphs(markdown: string) {
    const { unified } = await import('unified');
    const { default: remarkParse } = await import('remark-parse');
    const { default: remarkGfm } = await import('remark-gfm');
    const { Paragraph, Table, TextRun, TableRow, TableCell, WidthType, AlignmentType } = await import('docx');

    if (!markdown) return [];

    const ast = unified().use(remarkParse).use(remarkGfm).parse(markdown) as Root;
    const docxObjects: (InstanceType<typeof Paragraph> | InstanceType<typeof Table>)[] = [];

    const transformInlines = (nodes: PhrasingContent[], options: IRunOptions = {}): InstanceType<typeof TextRun>[] => {
        const runs: InstanceType<typeof TextRun>[] = [];
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

    const processListItems = (listNode: List, level: number): InstanceType<typeof Paragraph>[] => {
        let paragraphs: InstanceType<typeof Paragraph>[] = [];
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
                { level: 0, format: "decimal", text: "%1.", alignment: "start" },
                { level: 1, format: "lowerLetter", text: "%2)", alignment: "start" },
                { level: 2, format: "lowerRoman", text: "%3.", alignment: "start" },
                { level: 3, format: "upperLetter", text: "%4)", alignment: "start" },
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

async function getStylesFromServer(): Promise<Record<TemplateKey, { styles: IStylesOptions }>> {
    try {
        const response = await fetch('/api/templates/docx');
        if (!response.ok) {
            console.error('Failed to fetch DOCX templates from server, falling back to defaults.');
            return templates;
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching DOCX templates, falling back to defaults:', error);
        return templates;
    }
}


export async function exportSectionAsDocx(title: string, markdownContent: string, templateKey: TemplateKey) {
    const { Document, Packer, Paragraph, HeadingLevel } = await import('docx');
    const { saveAs } = await import('file-saver');
    
    const allTemplates = await getStylesFromServer();
    const styles = allTemplates[templateKey]?.styles || templates.modern.styles;
    const docxContent = await createDocxParagraphs(markdownContent);

    const doc = new Document({
        styles,
        numbering,
        sections: [{
            children: [
                new Paragraph({ text: title, heading: HeadingLevel.HEADING_1 }),
                ...docxContent,
            ]
        }]
    });
    
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${title.replace(/\s+/g, '_')}.docx`);
}


export async function exportProposalAsDocx(proposal: ProjectProposal, templateKey: TemplateKey) {
    const { Document, Packer, Paragraph, HeadingLevel, TextRun, Table, TableRow, TableCell, WidthType, Header, Footer, PageNumber, TableOfContents, AlignmentType } = await import('docx');
    const { saveAs } = await import('file-saver');

    const allTemplates = await getStylesFromServer();
    const styles = allTemplates[templateKey]?.styles || templates.modern.styles;
    
    const { title, category, objective, methodology, timeline, budget, expected_outcome, success_criteria, evaluation, stakeholders, risks } = proposal;
    
    const doc = new Document({
        styles,
        numbering,
        sections: [
            {
                properties: { type: "nextPage" as SectionType },
                children: [
                    new Paragraph({ text: "", spacing: { after: 2000 } }),
                    new Paragraph({ text: title, style: 'Title' }),
                    new Paragraph({ text: category, style: 'SubTitle', spacing: { after: 400 } }),
                ]
            },
            {
                properties: { type: "nextPage" as SectionType },
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
                    ...await createDocxParagraphs(objective),
                    new Paragraph({ text: "Methodology", heading: HeadingLevel.HEADING_1 }),
                    ...await createDocxParagraphs(methodology),
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
                    ...await createDocxParagraphs(evaluation),
                    new Paragraph({ text: "Stakeholders", heading: HeadingLevel.HEADING_1 }),
                    ...(await Promise.all(stakeholders.flatMap(async s => [new Paragraph({ text: `${s.name} (${s.role})`, heading: HeadingLevel.HEADING_2 }), ...await createDocxParagraphs(s.interest)]))).flat(),
                    new Paragraph({ text: "Risks and Mitigations", heading: HeadingLevel.HEADING_1 }),
                    ...(await Promise.all(risks.flatMap(async r => [new Paragraph({ text: r.description, heading: HeadingLevel.HEADING_2 }), ...await createDocxParagraphs(r.mitigation)]))).flat(),
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
    const { Document, Packer, Paragraph, HeadingLevel, AlignmentType, ImageRun, TextRun, TableOfContents, Header, Footer, PageNumber } = await import('docx');
    const { saveAs } = await import('file-saver');

    const allTemplates = await getStylesFromServer();
    const styles = allTemplates[templateKey]?.styles || templates.modern.styles;

    const orderedSections = Object.keys(sectionConfig) as SectionName[];
    const orderedDiagrams = Object.keys(diagramConfig) as DiagramType[];

    const reportBodyPromises = orderedSections.map(async (key) => {
        const content = sections[key];
        if (content) {
            return [
                new Paragraph({ text: sectionConfig[key].title, heading: HeadingLevel.HEADING_1 }),
                ...(await createDocxParagraphs(content)),
            ];
        }
        return [];
    });
    const resolvedReportBody = (await Promise.all(reportBodyPromises)).flat();
    
    const reportBody: (InstanceType<typeof Paragraph> | InstanceType<typeof TableOfContents>)[] = [
        new TableOfContents("Table of Contents", {
            hyperlink: true,
            headingStyleRange: "1-3",
        }),
        ...resolvedReportBody
    ];


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
                reportBody.push(new Paragraph({ text: `[Failed to load image for diagram: ${diagramConfig[result.key as DiagramType].title}]` }));
            }
        }
    }

    const doc = new Document({
        styles,
        numbering,
        sections: [
            {
                properties: { type: "nextPage" as SectionType },
                children: [
                    new Paragraph({ text: "", spacing: { after: 2000 } }),
                    new Paragraph({ text: `Project Report`, style: 'Title' }),
                    new Paragraph({ text: proposalTitle, style: 'SubTitle', spacing: { after: 400 } }),
                ]
            },
            {
                properties: { type: "nextPage" as SectionType },
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
