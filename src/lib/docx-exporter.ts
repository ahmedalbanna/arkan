
'use client';

import { Document, Packer, Paragraph, HeadingLevel, AlignmentType, TextRun, Table, TableRow, TableCell, WidthType, IStylesOptions, IRunOptions, ImageRun, SectionType, Header, Footer, PageNumber } from 'docx';
import { saveAs } from 'file-saver';
import type { ProjectProposal, DiagramType } from './schemas';
import type { SectionName } from '@/ai/schemas';
import { marked } from 'marked';
import { TableOfContents } from 'docx';

// Helper to recursively process inline tokens (bold, italic, etc.)
const processInlines = (tokens: marked.Token[], options: IRunOptions = {}): TextRun[] => {
    const runs: TextRun[] = [];
    for (const token of tokens) {
        switch (token.type) {
            case 'strong':
                runs.push(...processInlines(token.tokens, { ...options, bold: true }));
                break;
            case 'em':
                runs.push(...processInlines(token.tokens, { ...options, italics: true }));
                break;
            case 'codespan':
                runs.push(new TextRun({ ...options, text: token.text, font: { name: 'Courier New' } }));
                break;
            case 'text':
                // Handle potential undefined tokens by defaulting to an empty array
                if (token.tokens) {
                    runs.push(...processInlines(token.tokens, options));
                } else {
                    runs.push(new TextRun({ ...options, text: token.text }));
                }
                break;
            default:
                if ('raw' in token && token.raw) {
                    runs.push(new TextRun({ ...options, text: token.raw }));
                }
                break;
        }
    }
    return runs;
};

// Helper for lists to handle nesting and numbering
const processList = (listToken: marked.Tokens.List): Paragraph[] => {
    const paragraphs: Paragraph[] = [];
    for (const item of listToken.items) {
        // Each list item can have text and a nested list.
        // Process all tokens inside the list item.
        for (const itemToken of item.tokens) {
             if (itemToken.type === 'text' && itemToken.tokens) {
                paragraphs.push(new Paragraph({
                    children: processInlines(itemToken.tokens),
                    style: 'ListParagraph',
                    bullet: listToken.ordered ? undefined : { level: item.depth || 0 },
                    numbering: listToken.ordered ? { reference: "default-numbering", level: item.depth || 0 } : undefined,
                }));
            } else if (itemToken.type === 'list') {
                // Recursively process the nested list
                paragraphs.push(...processList(itemToken));
            }
        }
    }
    return paragraphs;
}

// Helper to parse markdown for DOCX using the 'marked' library
const parseMarkdownToDocx = (markdown: string): Paragraph[] => {
    if (!markdown) return [];

    const tokens = marked.lexer(markdown);
    const docxObjects: Paragraph[] = [];

    for (const token of tokens) {
        switch (token.type) {
            case 'heading':
                docxObjects.push(new Paragraph({
                    text: token.text,
                    heading: `Heading${token.depth}` as HeadingLevel,
                }));
                break;
            case 'paragraph':
                 if (token.tokens) {
                    docxObjects.push(new Paragraph({
                        children: processInlines(token.tokens),
                        spacing: { after: 120 }
                    }));
                }
                break;
            case 'list':
                docxObjects.push(...processList(token));
                break;
            case 'space':
                // We can ignore empty space tokens to avoid extra empty paragraphs
                break;
            default:
                if ('raw' in token && token.raw.trim()) {
                    docxObjects.push(new Paragraph(token.raw));
                }
                break;
        }
    }

    return docxObjects;
};

const numbering = {
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

export async function exportProposalAsDocx(proposal: ProjectProposal, styles: IStylesOptions) {
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
                            children: [ new TextRun({ children: [PageNumber.CURRENT] }) ],
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
                new Table({ rows: [ new TableRow({ children: [ new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Item", bold: true })]})] }), new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Cost", bold: true })]})] }), ] }), ...budget.breakdown.map(b => new TableRow({ children: [ new TableCell({ children: [new Paragraph(b.item)] }), new TableCell({ children: [new Paragraph(`${b.cost.toLocaleString()} ${b.currency}`)] }), ] })) ], width: { size: 100, type: WidthType.PERCENTAGE } }),
                new Paragraph({ text: "Expected Outcomes", heading: HeadingLevel.HEADING_1 }),
                ...expected_outcome.map(o => new Paragraph({ text: o, bullet: { level: 0 } })),
                new Paragraph({ text: "Success Criteria", heading: HeadingLevel.HEADING_1 }),
                ...success_criteria.map(sc => new Paragraph({ text: sc, bullet: { level: 0 } })),
                new Paragraph({ text: "Evaluation", heading: HeadingLevel.HEADING_1 }),
                ...parseMarkdownToDocx(evaluation),
                new Paragraph({ text: "Stakeholders", heading: HeadingLevel.HEADING_1 }),
                ...stakeholders.flatMap(s => [ new Paragraph({ text: `${s.name} (${s.role})`, heading: HeadingLevel.HEADING_2 }), ...parseMarkdownToDocx(s.interest), ]),
                new Paragraph({ text: "Risks and Mitigations", heading: HeadingLevel.HEADING_1 }),
                ...risks.flatMap(r => [ new Paragraph({ text: r.description, heading: HeadingLevel.HEADING_2 }), ...parseMarkdownToDocx(r.mitigation) ]),
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
    styles: IStylesOptions
) {
    const sectionConfig: { [key in SectionName]: { title: string } } = {
        introduction: { title: "Introduction" },
        literatureReview: { title: "Literature Review" },
        systemAnalysis: { title: "System Analysis" },
        designStrategy: { title: "Design Strategy" },
        systemDesign: { title: "System Design" },
        systemProgramming: { title: "System Programming" },
        systemTesting: { title: "System Testing" },
        conclusion: { title: "Conclusion" },
    };
    
    const diagramConfig: { [key in DiagramType]: { title: string } } = {
        useCase: { title: "Use Case Diagram" },
        class: { title: "Class Diagram" },
        sequence: { title: "Sequence Diagram" },
        activity: { title: "Activity Diagram" },
        component: { title: "Component Diagram" },
        archimate: { title: "ArchiMate Diagram" },
    };
    
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

    const hasDiagrams = diagrams && Object.values(diagrams).some(d => !!d);

    if (hasDiagrams) {
        reportBody.push(new Paragraph({ text: "Appendices: Diagrams", heading: HeadingLevel.HEADING_1, pageBreakBefore: true }));

        for (const key of orderedDiagrams) {
            const diagramData = diagrams[key];
            if (diagramData) {
                try {
                    let imageBuffer: ArrayBuffer;
                    // The imageUrl is a relative path to our own proxy, so we can fetch it directly.
                    const response = await fetch(diagramData.imageUrl);
                    
                    if (!response.ok) {
                        console.warn(`Failed to fetch diagram image from ${diagramData.imageUrl}. Falling back to placeholder.`);
                        const placeholderUrl = 'https://placehold.co/800x600.png';
                        const placeholderProxyUrl = `/api/proxy-image?url=${encodeURIComponent(placeholderUrl)}`;
                        const placeholderResponse = await fetch(placeholderProxyUrl);
                        imageBuffer = await placeholderResponse.arrayBuffer();
                    } else {
                        imageBuffer = await response.arrayBuffer();
                    }
                    
                    reportBody.push(new Paragraph({
                        text: diagramConfig[key].title,
                        heading: HeadingLevel.HEADING_2,
                    }));
                    reportBody.push(new Paragraph({
                        children: [new ImageRun({
                            data: imageBuffer,
                            transformation: { width: 550, height: 400 },
                        })],
                        alignment: AlignmentType.CENTER,
                    }));

                } catch (error) {
                    console.error(`Failed to embed image for ${key}:`, error);
                    reportBody.push(new Paragraph({ text: `[Failed to load image for diagram: ${diagramConfig[key].title}]` }));
                }
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
                        children: [ new Paragraph({ alignment: AlignmentType.CENTER, children: [ new TextRun({ children: [PageNumber.CURRENT, " | ", PageNumber.TOTAL_PAGES] }) ] })],
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
