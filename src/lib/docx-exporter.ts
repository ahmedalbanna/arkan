

'use client';

import { type DiagramType, type ProjectProposal, type SectionName } from '@/ai/schemas';
import { saveAs } from 'file-saver';
import type { List, PhrasingContent, Root } from 'mdast';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { templates, type TemplateKey } from './docx-styles';
import { exportComponentAsPDF } from './pdf-exporter';
import { processPlantUml } from './utils';

// Dynamic imports for docx library
let docxLib: any = null;

async function getDocxLib() {
    if (!docxLib) {
        docxLib = await import('docx');
    }
    return docxLib;
}

/**
 * Formats a camelCase or snake_case key into a human-readable title.
 * @param key The key string to format.
 * @returns A formatted title string.
 */
function formatKeyToTitle(key: string): string {
    if (!key) return '';
    return key
        .replace(/([A-Z])/g, ' $1') // Add space before capital letters
        .replace(/_/g, ' ')         // Replace underscores with spaces
        .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize first letter of each word
}


/**
 * Parses a markdown string into an array of docx Paragraph and Table objects.
 * Handles headings, paragraphs, lists, tables, blockquotes, and inline formatting.
 * It also processes PlantUML code blocks into images.
 * @param markdown - The markdown string to parse.
 * @returns A promise that resolves to an array of docx objects.
 */
export async function createDocxParagraphs(markdown: string): Promise<any[]> {
    const { Paragraph, Table } = await getDocxLib();

    if (!markdown) return [];

    const processedMarkdown = processPlantUml(markdown);
    const ast = unified().use(remarkParse).use(remarkGfm).parse(processedMarkdown) as Root;
    const docxObjects: any[] = [];

    // Make transformInlines async to handle image fetching
    const transformInlines = async (nodes: PhrasingContent[], options: any = {}): Promise<any[]> => {
        const { TextRun, ImageRun } = await getDocxLib();
        const runs: any[] = [];
        for (const node of nodes) {
            switch (node.type) {
                case 'strong':
                    runs.push(...await transformInlines(node.children, { ...options, bold: true }));
                    break;
                case 'emphasis':
                    runs.push(...await transformInlines(node.children, { ...options, italics: true }));
                    break;
                case 'inlineCode':
                    runs.push(new TextRun({ ...options, text: node.value, font: { name: 'Courier New' } }));
                    break;
                case 'link':
                    runs.push(...await transformInlines(node.children, { ...options, style: 'Hyperlink' }));
                    break;
                case 'image':
                    try {
                        const proxiedUrl = `/api/proxy-image?url=${encodeURIComponent(node.url)}`;
                        const imageBuffer = await getProxiedImageBuffer(proxiedUrl);
                        if (imageBuffer) {
                            // Regular inline images can be smaller
                            const isPlantUML = node.url.includes('plantuml.com');
                            const width = isPlantUML ? 550 : 200;
                            const height = isPlantUML ? 400 : 150;
                            runs.push(new ImageRun({
                                data: imageBuffer,
                                transformation: { width, height }
                            }));
                        }
                    } catch (e) {
                        console.error("Failed to process inline image", e);
                    }
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

    const processListItems = async (listNode: List, level: number): Promise<Paragraph[]> => {
        let paragraphs: Paragraph[] = [];
        for (const listItem of listNode.children) {
            for (const itemContent of listItem.children) {
                if (itemContent.type === 'paragraph') {
                    paragraphs.push(new Paragraph({
                        children: await transformInlines(itemContent.children),
                        style: 'ListParagraph',
                        bullet: listNode.ordered ? undefined : { level },
                        numbering: listNode.ordered ? { reference: "default-numbering", level } : undefined,
                    }));
                } else if (itemContent.type === 'list') {
                    paragraphs.push(...await processListItems(itemContent, level + 1));
                }
            }
        }
        return paragraphs;
    }

    for (const node of ast.children) {
        switch (node.type) {
            case 'heading':
                docxObjects.push(new Paragraph({
                    children: await transformInlines(node.children),
                    heading: `Heading${node.depth}` as any,
                }));
                break;
            case 'paragraph':
                const imageNode = node.children.find(child => child.type === 'image');
                if (imageNode && imageNode.type === 'image') {
                    const proxiedUrl = `/api/proxy-image?url=${encodeURIComponent(imageNode.url)}`;
                    const imageBuffer = await getProxiedImageBuffer(proxiedUrl);
                    if (imageBuffer) {
                        docxObjects.push(new Paragraph({
                            children: [new ImageRun({ data: imageBuffer, transformation: { width: 550, height: 400 } })],
                            alignment: AlignmentType.CENTER,
                        }));
                    } else {
                        docxObjects.push(new Paragraph({ children: [new TextRun(`[Image failed to load: ${imageNode.alt}]`)] }));
                    }
                } else {
                    docxObjects.push(new Paragraph({
                        children: await transformInlines(node.children),
                        spacing: { after: 120 },
                    }));
                }
                break;
            case 'list':
                docxObjects.push(...await processListItems(node, 0));
                break;
            case 'blockquote':
                for (const content of node.children) {
                    if (content.type === 'paragraph') {
                        docxObjects.push(new Paragraph({
                            children: await transformInlines(content.children),
                            style: 'Quote',
                        }));
                    }
                }
                break;
            case 'table': {
                const tableRows = await Promise.all(node.children.map(async (row, rowIndex) => {
                    return new TableRow({
                        children: await Promise.all(row.children.map(async cell => new TableCell({
                            children: [new Paragraph({ children: await transformInlines(cell.children) })],
                        }))),
                        tableHeader: rowIndex === 0,
                    });
                }));
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
        if (response.status !== 200) {
            console.warn(`Failed to fetch proxied image from ${imageUrl}. Status: ${response.status}`);
            return null;
        }
        return response.arrayBuffer();
    } catch (error) {
        console.error(`Error fetching image from ${imageUrl}:`, error);
        return null;
    }
}

async function getStylesFromServer(): Promise<Record<TemplateKey, { styles: any }>> {
    try {
        const response = await fetch('/api/admin/templates/docx');
        if (response.status !== 200) {
            console.error('Failed to fetch DOCX templates from server, falling back to defaults.');
            return templates;
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching DOCX templates, falling back to defaults:', error);
        return templates;
    }
}

/**
 * Converts a markdown string into a downloadable DOCX file.
 * @param markdownContent - The markdown content to export.
 * @param fileName - The desired name of the output file (without extension).
 * @param templateKey - The key of the style template to use.
 */
export async function exportMarkdownAsDocx(markdownContent: string, fileName: string, templateKey: TemplateKey = 'modern') {
    const { Document, Packer } = await getDocxLib();

    const allTemplates = await getStylesFromServer();
    const styles = allTemplates[templateKey]?.styles || templates.modern.styles;
    const docxContent = await createDocxParagraphs(markdownContent);

    const doc = new Document({
        styles,
        numbering,
        sections: [{
            children: docxContent
        }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${fileName}.docx`);
}


/**
 * Converts a single report section into a downloadable DOCX file.
 * @param title - The title of the section.
 * @param markdownContent - The markdown content of the section.
 * @param templateKey - The key of the style template to use.
 */
export async function exportSectionAsDocx(title: string, markdownContent: string, templateKey: TemplateKey) {

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

/**
 * Helper function to apply CSS styles to an HTML element for PDF generation.
 * @param element - The HTMLElement to style.
 * @param styles - The style object from the DOCX template.
 */
function applyStylesToElement(element: HTMLElement, styles: IRunOptions) {
    if (!styles) return;
    if (styles.font) {
        element.style.fontFamily = typeof styles.font === 'string'
            ? styles.font
            : (styles.font as { name: string })?.name ?? 'Calibri';

    }
    if (styles.size) {
        element.style.fontSize = `${Number(styles.size ?? 22) / 2}pt`;
    }
    if (styles.color) {
        element.style.color = `#${styles.color || '333333'}`;
    }
    if (styles.bold) {
        element.style.fontWeight = 'bold';
    }
    if (styles.italics) {
        element.style.fontStyle = 'italic';
    }
}

/**
 * Renders a project proposal into a hidden HTML element, styles it, and exports it as a PDF.
 * @param proposal - The structured ProjectProposal object.
 * @param templateKey - The key of the style template to use.
 */
export async function exportProposalAsPdf(proposal: ProjectProposal, templateKey: TemplateKey) {

    const allTemplates = await getStylesFromServer();
    const styles = allTemplates[templateKey]?.styles || templates.modern.styles;

    // Helper to convert markdown to HTML string
    const markdownToHtml = async (md: string) => {
        if (!md) return '';
        const file = await unified()
            .use(remarkParse)
            .use(remarkGfm)
            .use(rehypeStringify as any)
            .process(md);
        return String(file);
    };

    // Create a hidden element to render the proposal for PDF generation
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px'; // Position off-screen
    container.style.width = '800px';
    container.style.padding = '40px';
    container.style.backgroundColor = 'white';

    let htmlContent = `<div id="pdf-content">`;
    // Apply default document styles to the container
    applyStylesToElement(container, styles.default?.document?.run);

    // Title and Category
    htmlContent += `<h1 style="text-align: center;">${proposal.title}</h1>`;
    htmlContent += `<p style="text-align: center; font-style: italic;">${proposal.category}</p>`;

    const sections: { title: string, content: string | string[] }[] = [
        { title: "Executive Summary", content: await markdownToHtml(proposal.executiveSummary) },
        { title: "Problem Statement", content: await markdownToHtml(proposal.problemStatement) },
        { title: "Proposed Solution", content: await markdownToHtml(proposal.proposedSolution.overview + "\n\n" + proposal.proposedSolution.technicalApproach + "\n\n" + proposal.proposedSolution.keyFeatures) },
        { title: "Project Plan", content: await markdownToHtml(proposal.projectPlan.timeline + "\n\n" + proposal.projectPlan.keyDeliverables) },
        { title: "Budget Breakdown", content: await markdownToHtml(proposal.budgetBreakdown) },
    ];

    for (const section of sections) {
        const content = Array.isArray(section.content) ? section.content.join(' ') : section.content;
        if (content.trim()) {
            htmlContent += `<h2>${section.title}</h2>${content}`;
        }
    }

    htmlContent += `</div>`;
    container.innerHTML = htmlContent;

    // Apply specific styles to headings
    container.querySelectorAll('h1').forEach(h => applyStylesToElement(h, styles.default?.heading1?.run));
    container.querySelectorAll('h2').forEach(h => applyStylesToElement(h, styles.default?.heading2?.run));
    container.querySelectorAll('h3').forEach(h => applyStylesToElement(h, styles.default?.heading3?.run));

    document.body.appendChild(container);
    await exportComponentAsPDF(container, `${proposal.title.replace(/\s+/g, '_')}_proposal.pdf`);
    document.body.removeChild(container);
}


/**
 * Assembles a DOCX document from a structured project proposal.
 * @param proposal - The ProjectProposal object.
 * @param templateKey - The key of the style template to use.
 */
export async function exportProposalAsDocx(proposal: ProjectProposal, templateKey: TemplateKey) {
    const { Document, Packer, Paragraph, HeadingLevel, SectionType, Header, Footer, PageNumber, AlignmentType, Table, TextRun, TableRow, TableCell, WidthType, ImageRun, IStylesOptions, INumberingOptions, IRunOptions, TableOfContents } = await getDocxLib();

    const allTemplates = await getStylesFromServer();
    const styles = allTemplates[templateKey]?.styles || templates.modern.styles;

    // A helper function to create a section with a heading and its content
    const createSection = async (title: string, content: string | string[]) => {
        if (!content || (Array.isArray(content) && content.length === 0)) return [];
        const contentString = Array.isArray(content) ? `- ${content.join('\n- ')}` : content;
        return [
            new Paragraph({ text: title, heading: HeadingLevel.HEADING_1 }),
            ...(await createDocxParagraphs(contentString)),
        ];
    };

    // A helper for nested object sections
    const createNestedSection = async (title: string, data: Record<string, string | string[]>) => {
        const children: any[] = [];
        for (const [key, value] of Object.entries(data)) {
            if (value && value.length > 0) {
                children.push(new Paragraph({ text: formatKeyToTitle(key), heading: HeadingLevel.HEADING_2 }));
                children.push(...await createDocxParagraphs(Array.isArray(value) ? value.join('\n- ') : value));
            }
        }
        if (children.length === 0) return [];
        return [
            new Paragraph({ text: title, heading: HeadingLevel.HEADING_1 }),
            ...children
        ]
    }


    const doc = new Document({
        styles,
        numbering,
        sections: [
            {
                properties: { type: SectionType.NEXT_PAGE },
                children: [
                    new Paragraph({ text: "", spacing: { after: 2000 } }),
                    new Paragraph({ text: proposal.title, style: 'Title' }),
                    new Paragraph({ text: proposal.category, style: 'SubTitle', spacing: { after: 400 } }),
                ]
            },
            {
                properties: { type: SectionType.NEXT_PAGE },
                headers: { default: new Header({ children: [new Paragraph({ text: `Proposal: ${proposal.title}`, alignment: AlignmentType.RIGHT })] }) },
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
                children: [
                    new TableOfContents("Table of Contents", {
                        hyperlink: true,
                        headingStyleRange: "1-3",
                    }),
                    ...(await createSection("Executive Summary", proposal.executiveSummary)),
                    ...(await createSection("Problem Statement", proposal.problemStatement)),
                    ...(await createNestedSection("Proposed Solution", proposal.proposedSolution)),
                    ...(await createNestedSection("Project Plan", proposal.projectPlan)),
                    ...(await createSection("Budget Breakdown", proposal.budgetBreakdown)),
                ].filter(p => p !== undefined).flat() as (Paragraph | Table | TableOfContents)[],
            }],
    });

    try {
        const blob = await Packer.toBlob(doc);
        saveAs(blob, `${proposal.title.replace(/ /g, '_')}_proposal.docx`);
    } catch (error) {
        console.error("Error generating DOCX file:", error);
    }
}

/**
 * Assembles and exports a full project report as a DOCX file.
 * @param sections - An object containing the markdown content of each report section.
 * @param diagrams - An object containing data for generated diagrams.
 * @param proposalTitle - The title of the project proposal.
 * @param templateKey - The key of the style template to use.
 * @param translatedTitles - An object mapping section keys to their display titles.
 * @param sectionsToInclude - An optional array of section keys to include in the export.
 */
export async function exportReportAsDocx(
    sections: { [key in SectionName]?: string; },
    diagrams: { [key in DiagramType]?: { plantUmlCode: string; imageUrl: string; } },
    proposalTitle: string,
    templateKey: TemplateKey,
    translatedTitles: { [key in SectionName]?: string; },
    sectionsToInclude?: SectionName[]
) {
    const { Document, Packer, Paragraph, HeadingLevel, SectionType, Header, Footer, PageNumber, AlignmentType, Table, TextRun, TableRow, TableCell, WidthType, ImageRun, IStylesOptions, INumberingOptions, IRunOptions, TableOfContents } = await getDocxLib();

    const allTemplates = await getStylesFromServer();
    const styles = allTemplates[templateKey]?.styles || templates.modern.styles;

    const orderedSections = sectionsToInclude || Object.keys(sections) as SectionName[];
    const orderedDiagrams = Object.keys(diagrams) as DiagramType[];

    const reportBodyPromises = orderedSections.map(async (key) => {
        const content = sections[key];
        if (content) {
            return [
                new Paragraph({ text: translatedTitles[key] || formatKeyToTitle(key), heading: HeadingLevel.HEADING_1 }),
                ...(await createDocxParagraphs(content)),
            ];
        }
        return [];
    });
    const resolvedReportBody = (await Promise.all(reportBodyPromises)).flat();

    const reportBody: any[] = [
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
                // Since diagramSections is gone, we'll just use the key as the title.
                // A better approach would be to get the title from a dynamic source if available.
                const diagramTitle = key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                reportBody.push(new Paragraph({
                    text: diagramTitle,
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
                const diagramTitle = result.key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                reportBody.push(new Paragraph({ text: `[Failed to load image for diagram: ${diagramTitle}]` }));
            }
        }
    }

    const doc = new Document({
        styles,
        numbering,
        sections: [
            {
                properties: { type: SectionType.NEXT_PAGE },
                children: [
                    new Paragraph({ text: "", spacing: { after: 2000 } }),
                    new Paragraph({ text: `Project Report`, style: 'Title' }),
                    new Paragraph({ text: proposalTitle, style: 'SubTitle', spacing: { after: 400 } }),
                ]
            },
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
