
'use client';

import { Document, Packer, Paragraph, HeadingLevel, AlignmentType, TextRun, Table, TableRow, TableCell, WidthType, IStylesOptions, IRunOptions, ImageRun } from 'docx';
import { saveAs } from 'file-saver';
import type { ProjectProposal, DiagramType } from './schemas';
import type { SectionName } from '@/ai/schemas';
import { marked } from 'marked';

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
                if ('raw' in token) {
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
                    spacing: { after: 200, before: 100 }
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
                docxObjects.push(new Paragraph(""));
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

const defaultNumbering = {
    config: [
        {
            reference: "default-numbering",
            levels: [
                { level: 0, format: "decimal", text: "%1.", alignment: AlignmentType.START, style: { paragraph: { indentation: { left: 360, hanging: 360 } } } },
                { level: 1, format: "lowerLetter", text: "%2)", alignment: AlignmentType.START, style: { paragraph: { indentation: { left: 720, hanging: 360 } } } },
                { level: 2, format: "lowerRoman", text: "%3.", alignment: AlignmentType.START, style: { paragraph: { indentation: { left: 1080, hanging: 360 } } } },
            ],
        },
    ],
};

export async function exportProposalAsDocx(proposal: ProjectProposal, styles: IStylesOptions) {
    const { title, category, objective, methodology, timeline, budget, expected_outcome, success_criteria, evaluation, stakeholders, risks } = proposal;
    
    const doc = new Document({
        styles,
        numbering: defaultNumbering,
        sections: [{
            properties: {
                page: {
                    margin: {
                        top: 1440,
                        right: 1440,
                        bottom: 1440,
                        left: 1440,
                    }
                }
            },
            children: [
                new Paragraph({ text: title, heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
                new Paragraph({ text: category, heading: HeadingLevel.HEADING_5, alignment: AlignmentType.CENTER, spacing: { after: 240 } }),
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
                ...stakeholders.flatMap(s => [ new Paragraph({ text: `${s.name} (${s.role})`, heading: HeadingLevel.HEADING_2 }), new Paragraph({ text: s.interest }), ]),
                new Paragraph({ text: "Risks and Mitigations", heading: HeadingLevel.HEADING_1 }),
                ...risks.flatMap(r => [ new Paragraph({ text: r.description, heading: HeadingLevel.HEADING_2 }), new Paragraph({ children: [new TextRun({ text: "Mitigation Strategy: ", bold: true }), new TextRun(r.mitigation)] }), ]),
            ],
        }],
    });
    
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${title.replace(/ /g, '_')}_proposal.docx`);
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
    
    const children: (Paragraph | Table)[] = [];
    children.push(new Paragraph({ text: `Project Report: ${proposalTitle}`, heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }));

    for (const key of orderedSections) {
        const content = sections[key];
        if (content) {
            children.push(new Paragraph({
                text: sectionConfig[key].title,
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 400, after: 200 },
            }));
            children.push(...parseMarkdownToDocx(content));
        }
    }

    if (diagrams && Object.values(diagrams).some(d => !!d)) {
        children.push(new Paragraph({ text: "Appendices: Diagrams", heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 }}));

        for (const key of orderedDiagrams) {
            const diagramData = diagrams[key];
            if (diagramData) {
                try {
                    let imageBuffer: ArrayBuffer;
                    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(diagramData.imageUrl)}`;
                    const response = await fetch(proxyUrl);
                    
                    if (!response.ok) {
                        console.warn(`Failed to fetch diagram image from ${diagramData.imageUrl}. Falling back to placeholder.`);
                        const placeholderUrl = 'https://placehold.co/800x600.png';
                        const placeholderProxyUrl = `/api/proxy-image?url=${encodeURIComponent(placeholderUrl)}`;
                        const placeholderResponse = await fetch(placeholderProxyUrl);
                        if (!placeholderResponse.ok) {
                            throw new Error(`Placeholder image fetch also failed for diagram ${key}.`);
                        }
                        imageBuffer = await placeholderResponse.arrayBuffer();
                    } else {
                        imageBuffer = await response.arrayBuffer();
                    }
                    
                    children.push(new Paragraph({
                        text: diagramConfig[key].title,
                        heading: HeadingLevel.HEADING_2,
                        spacing: { before: 300, after: 150 },
                    }));
                    children.push(new Paragraph({
                        children: [new ImageRun({
                            data: imageBuffer,
                            transformation: { width: 550, height: 400 },
                        })],
                        alignment: AlignmentType.CENTER,
                    }));

                } catch (error) {
                    console.error(`Failed to embed image for ${key}:`, error);
                    children.push(new Paragraph({ text: `[Failed to load image for diagram: ${diagramConfig[key].title}]` }));
                }
            }
        }
    }

    const doc = new Document({
        styles,
        numbering: defaultNumbering,
        sections: [{ properties: {
             page: {
                margin: {
                    top: 1440,
                    right: 1440,
                    bottom: 1440,
                    left: 1440,
                }
            }
        }, children }],
    });
    
    const blob = await Packer.toBlob(doc);
    saveAs(blob, "project-report.docx");
}
