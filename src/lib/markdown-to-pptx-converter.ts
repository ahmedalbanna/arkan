import PptxGenJS from 'pptxgenjs';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm'; // Import remarkGfm
import { visit } from 'unist-util-visit';
import { type Root as MdastRoot, type RootContent, type Text, type PhrasingContent, type Paragraph, type List, type ListItem, type Blockquote, type Table, type Code, type Image, FootnoteDefinition } from 'mdast';
import { templates } from '@/lib/pptx-styles'; // Keep for default styles
import { processPlantUml, arrayBufferToBase64, getProxiedImageBuffer } from '@/lib/utils';
import type { PptxStyleOptions } from '@/lib/types';

const layout = {
    SLIDE_WIDTH: 10,
    SLIDE_HEIGHT: 5.625, // For a 16:9 aspect ratio slide
    CONTENT_X: 0.5,
    CONTENT_WIDTH: 9.0,
    TITLE_Y: 0.25,
    TITLE_H: 1.0,
    SUBTITLE_Y: 1.2,
    SUBTITLE_H: 0.4,
    BODY_START_Y: 1.5,
    SLIDE_MARGIN_BOTTOM: 0.675, // Vertical margin at the bottom of the slide in inches
    IMAGE_H: 2.5,
    IMAGE_W: 7.0,
    ELEMENT_PADDING: 0.2, // Vertical padding between elements in inches
    get BODY_END_Y() {
        return this.SLIDE_HEIGHT - this.SLIDE_MARGIN_BOTTOM;
    },
    get IMAGE_X() {
        return (this.SLIDE_WIDTH - this.IMAGE_W) / 2; // Center the image
    },
};

// Define font options for different language scripts
interface FontOptions {
    default?: string; // For LTR languages
    rtl?: string;     // For RTL languages like Arabic
    code?: string;    // For code blocks and inline code
}

export interface PptxConversionOptions {
    styles?: PptxStyleOptions;
    author?: string;
    company?: string;
    subject?: string;
    title?: string;
    isRtl?: boolean;
    fonts?: FontOptions;
    includeToc?: boolean;
}

/**
 * A cache for canvas contexts to avoid recreating them for every measurement.
 * The key is a combination of font face and size.
 */
const canvasContextCache: { [key: string]: CanvasRenderingContext2D } = {};

/**
 * Gets a cached or new 2D canvas rendering context for text measurement.
 * @param fontFace The font family.
 * @param fontSize The font size in points.
 * @returns A 2D canvas rendering context.
 */
function getCanvasContext(fontFace: string, fontSize: number): CanvasRenderingContext2D {
    const key = `${fontFace}-${fontSize}`;
    if (canvasContextCache[key]) {
        return canvasContextCache[key];
    }

    // This code is intended for the client-side where document is available.
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
        // Fallback for non-browser environments, though this is client-side code.
        // This is a very rough estimate, similar to the old logic.
        console.warn('Canvas context not available for text measurement. Falling back to rough estimate.');
        return {
            measureText: (text: string) => ({ width: text.length * fontSize * 0.5 })
        } as any;
    }
    context.font = `${fontSize}pt "${fontFace}"`;
    canvasContextCache[key] = context;
    return context;
}

/**
 * Calculates the number of lines a given text will occupy with word wrapping.
 * @param text The text content.
 * @param fontFace The font family.
 * @param fontSize The font size in points.
 * @param maxWidthInches The maximum width available for the text in inches.
 * @returns The number of lines.
 */
function calculateLineCount(text: string, fontFace: string, fontSize: number, maxWidthInches: number): number {
    if (!text.trim()) {
        return 1; // An empty paragraph still takes up one line.
    }

    const context = getCanvasContext(fontFace, fontSize);
    const maxWidthPx = maxWidthInches * 72; // Convert inches to points

    const paragraphs = text.split('\n');
    let totalLines = 0;

    for (const paragraph of paragraphs) {
        if (!paragraph.trim()) {
            totalLines++; // Count empty lines between paragraphs
            continue;
        }
        const words = paragraph.split(' ');
        let lineCount = 1;
        let currentLine = '';

        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const metrics = context.measureText(testLine);
            if (metrics.width > maxWidthPx && currentLine) {
                lineCount++;
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        totalLines += lineCount;
    }

    return Math.max(1, totalLines); // A non-empty text should always have at least one line.
}

/**
 * Calculates the number of lines a code block will occupy.
 * It considers both explicit newlines and wrapping of long lines.
 * @param text The text content of the code block.
 * @param fontFace The font family.
 * @param fontSize The font size in points.
 * @param maxWidthInches The maximum width available for the text in inches.
 * @returns The number of lines.
 */
function calculateCodeLineCount(text: string, fontFace: string, fontSize: number, maxWidthInches: number): number {
    if (!text) {
        return 1;
    }

    const context = getCanvasContext(fontFace, fontSize);
    const maxWidthPx = maxWidthInches * 72; // Convert inches to points

    const lines = text.split('\n');
    let totalLines = 0;

    for (const line of lines) {
        // Even an empty line in a code block takes up one line of vertical space.
        if (line === '') {
            totalLines++;
            continue;
        }
        const metrics = context.measureText(line);
        const lineWraps = Math.ceil(metrics.width / maxWidthPx);
        totalLines += Math.max(1, lineWraps); // A line is at least 1 line high.
    }

    return Math.max(1, totalLines);
}

/**
 * Transforms inline markdown content (strong, emphasis, links, etc.) into an array of PptxGenJS TextProps runs.
 * This function is intended for PhrasingContent and does not handle block-level elements.
 * @param nodes An array of mdast PhrasingContent nodes.
 * @param baseOptions The base text properties to apply to all runs.
 * @param styles The style options for the presentation.
 * @returns A promise that resolves to an array of PptxGenJS.TextProps.
 */
async function transformInlinesToPptxText(
    nodes: PhrasingContent[],
    baseOptions: PptxGenJS.TextPropsOptions,
    styles: PptxStyleOptions,
    isRtl = false,
    fonts: FontOptions = {},
    footnoteIdMap: Map<string, number> = new Map()
): Promise<PptxGenJS.TextProps[]> {
    const runs: PptxGenJS.TextProps[] = [];

    for (const node of nodes) {
        // Skip non-phrasing content, which should be handled by block-level renderers.
        if (node.type === 'image') continue;

        const defaultFont = isRtl ? fonts.rtl : fonts.default;
        const currentBaseOptions = { ...baseOptions };
        if (defaultFont) {
            currentBaseOptions.fontFace = defaultFont;
        }

        switch (node.type) {
            case 'strong':
                runs.push(...(await transformInlinesToPptxText(node.children, { ...currentBaseOptions, bold: true }, styles, isRtl, fonts, footnoteIdMap)));
                break;
            case 'emphasis':
                runs.push(...(await transformInlinesToPptxText(node.children, { ...currentBaseOptions, italic: true }, styles, isRtl, fonts, footnoteIdMap)));
                break;
            case 'delete':
                runs.push(...(await transformInlinesToPptxText(node.children, { ...currentBaseOptions, strike: true }, styles, isRtl, fonts, footnoteIdMap)));
                break;
            case 'inlineCode':
                // Inline code should remain LTR
                const codeFont = fonts.code || styles.inlineCode?.fontFace || 'Courier New';
                const codeBaseOptions = { ...baseOptions, ...styles.inlineCode };
                delete codeBaseOptions.fontFace;
                runs.push({ text: node.value, options: { ...codeBaseOptions, fontFace: codeFont, rtlMode: false } });
                break;
            case 'text':
                runs.push({ text: node.value, options: { ...currentBaseOptions, rtlMode: isRtl } });
                break;
            case 'link': {
                const linkStyle = { ...currentBaseOptions, ...styles.link };
                const linkRuns = await transformInlinesToPptxText(node.children, linkStyle, styles, isRtl, fonts, footnoteIdMap);
                linkRuns.forEach(run => {
                    run.options = { ...run.options, hyperlink: { url: node.url, tooltip: node.title || node.url } };
                });
                runs.push(...linkRuns);
                break;
            }
            case 'footnoteReference': {
                const id = footnoteIdMap.get(node.identifier);
                if (id !== undefined) {
                    runs.push({
                        text: String(id),
                        options: { ...currentBaseOptions, superscript: true, fontSize: (currentBaseOptions.fontSize || 18) * 0.75 },
                    });
                }
                break;
            }
        }
    }

    return runs;
}

/**
 * Extracts all text content from an mdast node.
 * @param node The mdast node to extract text from.
 * @returns The concatenated text content.
 */
function getNodeText(node: RootContent | PhrasingContent): string {
    let text = '';
    visit(node, 'text', (textNode: Text) => { text += textNode.value; });
    return text;
}
/**
 * Calculates the estimated height of a markdown AST node for PPTX layout purposes.
 * This version uses font size and line spacing for a more accurate estimation.
 * @param node The mdast node.
 * @param styles The style options for the presentation.
 * @returns The calculated height in inches.
 */
function calculateElementHeight(node: RootContent, styles: PptxStyleOptions, widthInches: number = layout.CONTENT_WIDTH): number {
    switch (node.type) {
        case 'paragraph': {
            if (node.children.length === 1 && node.children[0].type === 'image') {
                return layout.IMAGE_H + layout.ELEMENT_PADDING;
            }
            const paraText = getNodeText(node);
            const fontFace = styles.body.fontFace || 'Calibri';
            const fontSize = typeof styles.body.fontSize === 'number' ? styles.body.fontSize : 18;
            const lineHeight = (styles.body.lineSpacing || fontSize * 1.2) / 72; // in inches
            const lineCount = calculateLineCount(paraText, fontFace, fontSize, widthInches);
            return (lineCount * lineHeight) + layout.ELEMENT_PADDING;
        }

        case 'list': {
            let totalHeight = 0;
            for (const item of node.children) {
                // Sum the heights of each list item. `calculateListItemHeight` includes paddings of its children.
                totalHeight += calculateListItemHeight(item, styles, widthInches);
            }
            // Add padding for the list block itself.
            return totalHeight + layout.ELEMENT_PADDING;
        }
        case 'blockquote': {
            const bqText = getNodeText(node);
            const fontFace = styles.blockquote?.fontFace || styles.body.fontFace || 'Calibri';
            const fontSize = typeof styles.blockquote?.fontSize === 'number' ? styles.blockquote.fontSize : (typeof styles.body.fontSize === 'number' ? styles.body.fontSize : 18);
            const lineHeight = (styles.blockquote?.lineSpacing || fontSize * 1.2) / 72; // in inches
            const lineCount = calculateLineCount(bqText, fontFace, fontSize, widthInches);
            return (lineCount * lineHeight) + layout.ELEMENT_PADDING;
        }
        case 'table': {
            // More accurate table height calculation
            let totalTableHeight = 0;
            const tableStyle = styles.table || {};
            const numColumns = node.children[0]?.children.length || 1;
            const columnWidth = widthInches / numColumns; // Assuming equal column widths

            for (const [rowIndex, rowNode] of node.children.entries()) {
                let maxLinesInRow = 1; // A row is at least one line high.
                const isHeader = rowIndex === 0;
                const cellStyle = isHeader ? styles.tableHeaderStyle : styles.tableCellStyle;

                const fontFace = cellStyle?.fontFace || tableStyle.fontFace || styles.body.fontFace || 'Calibri';
                const fontSize = cellStyle?.fontSize || tableStyle.fontSize || 14;
                const lineHeight = (fontSize * 1.2) / 72; // in inches, with a 1.2 multiplier for line spacing

                for (const cellNode of rowNode.children) {
                    const cellText = getNodeText(cellNode);
                    const lineCountInCell = calculateLineCount(cellText, fontFace, fontSize, columnWidth);
                    if (lineCountInCell > maxLinesInRow) {
                        maxLinesInRow = lineCountInCell;
                    }
                }
                // Add height of this row to total. Add a small multiplier for vertical cell padding.
                totalTableHeight += maxLinesInRow * lineHeight * 1.2;
            }
            return totalTableHeight + layout.ELEMENT_PADDING;
        }

        case 'code': {
            const codeText = node.value;
            const codeFontSize = styles.code?.fontSize || 12;
            const codeFontFace = styles.code?.fontFace || 'Courier New';
            const codeLineHeight = (codeFontSize * 1.4) / 72;
            const lineCount = calculateCodeLineCount(codeText, codeFontFace, codeFontSize, widthInches);
            return (lineCount * codeLineHeight) + layout.ELEMENT_PADDING;
        }

        default:
            return layout.ELEMENT_PADDING; // Return padding for unknown elements to ensure some spacing
    }
}

/**
 * Calculates the estimated height of a list item node.
 * @param item The mdast ListItem node.
 * @param styles The style options for the presentation.
 * @returns The calculated height in inches.
 */
function calculateListItemHeight(item: ListItem, styles: PptxStyleOptions, widthInches: number = layout.CONTENT_WIDTH): number {
    let totalHeight = 0;
    for (const contentNode of item.children) {
        // Sum the heights of the content within the list item.
        // Each element's height already includes its own padding.
        totalHeight += calculateElementHeight(contentNode, styles, widthInches);
    }
    return totalHeight;
}

/** Renders a paragraph node, handling special cases for images and list-like text. */
async function renderParagraph(slide: PptxGenJS.Slide, node: Paragraph, y: number, h: number, styles: PptxStyleOptions, isRtl = false, fonts: FontOptions = {}, footnoteIdMap: Map<string, number> = new Map(), x: number = layout.CONTENT_X, w: number = layout.CONTENT_WIDTH) {
    const imageNode = node.children.length === 1 && node.children[0].type === 'image' ? node.children[0] : null;
    if (imageNode) {
        const proxiedImage = await getProxiedImageBuffer(imageNode.url);
        if (proxiedImage) {
            const base64Image = arrayBufferToBase64(proxiedImage.buffer);
            slide.addImage({
                data: `data:${proxiedImage.contentType};base64,${base64Image}`,
                x: layout.IMAGE_X, y, w: layout.IMAGE_W, h: layout.IMAGE_H
            });
        } else {
            // If the image fails to load, add a placeholder with an error message.
            slide.addText('Failed to load image.', {
                x: layout.IMAGE_X, y, w: layout.IMAGE_W, h: layout.IMAGE_H,
                align: 'center',
                valign: 'middle',
                color: 'FF0000', // Red color for error
            });
        }
    } else {
        const textRuns = await transformInlinesToPptxText(node.children, styles.body, styles, isRtl, fonts, footnoteIdMap);
        if (textRuns.length === 0) return;
        slide.addText(textRuns, { x, y, w, h, ...styles.body, rtlMode: isRtl, align: isRtl ? 'right' : styles.body.align });
    }
}

/** Renders a blockquote node. */
async function renderBlockquote(slide: PptxGenJS.Slide, node: Blockquote, y: number, h: number, styles: PptxStyleOptions, isRtl = false, fonts: FontOptions = {}, footnoteIdMap: Map<string, number> = new Map(), x: number = layout.CONTENT_X, w: number = layout.CONTENT_WIDTH) {
    const blockquoteStyle = { ...styles.body, ...styles.blockquote };
    const textRuns: PptxGenJS.TextProps[] = [];
    for (const [i, p] of node.children.entries()) {
        if (p.type === 'paragraph') {
            textRuns.push(...await transformInlinesToPptxText(p.children, blockquoteStyle, styles, isRtl, fonts, footnoteIdMap));
            if (i < node.children.length - 1) {
                textRuns.push({ text: '\n', options: blockquoteStyle });
            }
        }
    }
    slide.addText(textRuns, { x, y, w, h, ...blockquoteStyle, rtlMode: isRtl, align: isRtl ? 'right' : blockquoteStyle.align });
}

/** Renders a table node. */
async function renderTable(slide: PptxGenJS.Slide, node: Table, y: number, h: number, styles: PptxStyleOptions, isRtl = false, fonts: FontOptions = {}, x: number = layout.CONTENT_X, w: number = layout.CONTENT_WIDTH, footnoteIdMap: Map<string, number> = new Map()) {
    const tableRows: PptxGenJS.TableRow[] = [];
    for (const [rowIndex, rowNode] of node.children.entries()) {
        const tableCells: PptxGenJS.TableCell[] = [];
        for (const cellNode of rowNode.children) {
            const baseCellStyle = rowIndex === 0 ? styles.tableHeaderStyle : styles.tableCellStyle;
            const cellText = await transformInlinesToPptxText(cellNode.children, baseCellStyle, styles, isRtl, fonts, footnoteIdMap);
            const isHeader = rowIndex === 0;
            const cellOptions = isHeader ? styles.tableHeaderStyle : styles.tableCellStyle;
            tableCells.push({ text: cellText, options: { ...cellOptions, rtlMode: isRtl, align: isRtl ? 'right' : cellOptions?.align || styles.table?.align } });
        }
        tableRows.push(tableCells);
    }
    slide.addTable(tableRows, { x: layout.CONTENT_X, y, w: layout.CONTENT_WIDTH, h, ...styles.table });
}

/** Renders a code block node. */
async function renderCode(slide: PptxGenJS.Slide, node: Code, y: number, h: number, styles: PptxStyleOptions, isRtl = false, fonts: FontOptions = {}, x: number = layout.CONTENT_X, w: number = layout.CONTENT_WIDTH) {
    const codeStyle = { ...styles.code };
    if (fonts.code) codeStyle.fontFace = fonts.code;
    slide.addText(node.value, {
        x, y, w, h, ...styles.body,
        ...codeStyle,
        rtlMode: false, // Code is always LTR
        align: 'left'   // Code is always LTR
    });
}

/** Renders a list node by processing its items. This function is now a simple dispatcher to the main `processListNode` logic. */
async function renderList(slide: PptxGenJS.Slide, node: List, y: number, h: number, styles: PptxStyleOptions, isRtl = false, fonts: FontOptions = {}, level = 0, footnoteIdMap: Map<string, number> = new Map()): Promise<number> {
    // This function is now a wrapper. The main logic is in processListNode.
    // It's kept for calls from `renderNodeOnSlide` for nested lists.
    // We'll process each item individually to allow for breaking.
    let currentY = y;
    for (const item of node.children) {
        const itemHeight = calculateListItemHeight(item, styles);
        // Simplified rendering for nested lists. Complex splitting is handled at the top level.
        const itemAsList: List = { type: 'list', ordered: node.ordered, children: [item] };
        await renderNodeOnSlide(slide, itemAsList, currentY, itemHeight, styles, isRtl, fonts, footnoteIdMap);
        currentY += itemHeight;
    }
    return currentY;
}

/**
 * Renders a markdown AST node onto a slide by dispatching to the appropriate render function.
 */
async function renderNodeOnSlide(slide: PptxGenJS.Slide, node: RootContent, y: number, h: number, styles: PptxStyleOptions, isRtl = false, fonts: FontOptions = {}, footnoteIdMap: Map<string, number> = new Map(), x: number = layout.CONTENT_X, w: number = layout.CONTENT_WIDTH) {
    switch (node.type) {
        case 'paragraph':
            await renderParagraph(slide, node, y, h, styles, isRtl, fonts, footnoteIdMap, x, w);
            break;
        case 'list':
            await renderList(slide, node, y, h, styles, isRtl, fonts, 0, footnoteIdMap);
            break;
        case 'blockquote':
            await renderBlockquote(slide, node, y, h, styles, isRtl, fonts, footnoteIdMap, x, w);
            break;
        case 'table':
            await renderTable(slide, node, y, h, styles, isRtl, fonts, x, w, footnoteIdMap);
            break;
        case 'code':
            await renderCode(slide, node, y, h, styles, isRtl, fonts, x, w);
            break;
    }
}

/**
 * Splits the main markdown AST into an array of slide ASTs based on headings and thematic breaks.
 * @param ast The root mdast node.
 * @returns An array of slide-specific mdast roots.
 */
function splitAstIntoSlides(ast: MdastRoot): MdastRoot[] {
    const slides: MdastRoot[] = [];
    if (!ast.children.length) return slides;

    const hasMeaningfulContent = (nodes: RootContent[]): boolean => {
        return nodes.some(node => {
            if (node.type === 'paragraph') {
                return (node.children.length === 1 && node.children[0].type === 'image') || getNodeText(node).trim() !== '';
            }
            // Ignore slide breaks for this check
            return node.type !== 'thematicBreak' && !(node.type === 'html' && node.value.includes('<!-- slide-break -->'));
        });
    };

    let currentSlideContent: RootContent[] = [];
    const firstHeadingIndex = ast.children.findIndex(node => node.type === 'heading');

    // If there's no heading, treat the whole document as one slide if it has content.
    if (firstHeadingIndex === -1) {
        if (hasMeaningfulContent(ast.children)) {
            slides.push({ type: 'root', children: ast.children });
        }
        return slides;
    }

    // If there's content before the first heading, make it the first slide.
    if (firstHeadingIndex > 0) {
        const contentBefore = ast.children.slice(0, firstHeadingIndex);
        if (hasMeaningfulContent(contentBefore)) {
            slides.push({ type: 'root', children: contentBefore });
        }
    }

    // Process from the first heading onwards
    for (let i = firstHeadingIndex; i < ast.children.length; i++) {
        const node = ast.children[i];
        const isHtmlSlideBreak = node.type === 'html' && node.value.includes('<!-- slide-break -->');
        const isSlideBreak = node.type === 'heading' || node.type === 'thematicBreak' || isHtmlSlideBreak;

        if (isSlideBreak && currentSlideContent.length > 0) {
            slides.push({ type: 'root', children: currentSlideContent });
            currentSlideContent = [];
        }

        // Don't add thematic breaks or custom HTML breaks to the slide content
        if (node.type !== 'thematicBreak' && !isHtmlSlideBreak) {
            // Ignore empty paragraph nodes, as they are just newlines in markdown
            if (node.type === 'paragraph') {
                const isImageParagraph = node.children.length === 1 && node.children[0].type === 'image';
                if (isImageParagraph || getNodeText(node).trim() !== '') {
                    currentSlideContent.push(node);
                }
            } else {
                currentSlideContent.push(node);
            }
        }
    }

    if (currentSlideContent.length > 0) {
        slides.push({ type: 'root', children: currentSlideContent });
    }

    return slides;
}

/**
 * Splits an array of title runs into title and subtitle parts based on a colon.
 * @param titleRuns The original array of PptxGenJS.TextProps.
 * @param styles The style options for the presentation.
 * @returns An array of PptxGenJS.TextProps with subtitle styling applied after the colon.
 */
function splitTitleRuns(titleRuns: PptxGenJS.TextProps[], styles: PptxStyleOptions): PptxGenJS.TextProps[] {
    const colonRunIndex = titleRuns.findIndex(run => run.text?.includes(':'));

    if (colonRunIndex === -1) {
        return titleRuns;
    }

    const runsWithBreaks: PptxGenJS.TextProps[] = [];
    runsWithBreaks.push(...titleRuns.slice(0, colonRunIndex));

    const colonRun = titleRuns[colonRunIndex];
    const [textBefore, textAfter] = (colonRun.text || '').split(':', 2);

    if (textBefore) {
        runsWithBreaks.push({ text: textBefore, options: colonRun.options });
    }

    runsWithBreaks.push({ text: '\n', options: { ...colonRun.options } });

    if (textAfter.trim()) {
        runsWithBreaks.push({ text: textAfter.trim() + ' ', options: { ...colonRun.options, ...styles.subtitle } });
    }

    for (let i = colonRunIndex + 1; i < titleRuns.length; i++) {
        const subsequentRun = titleRuns[i];
        runsWithBreaks.push({
            text: subsequentRun.text,
            options: { ...subsequentRun.options, ...styles.subtitle }
        });
    }
    return runsWithBreaks;
}

/**
 * Processes the title and subtitle for a slide.
 * It checks for a heading node for the title and a specially formatted paragraph for the subtitle.
 * @param slide The PptxGenJS slide object.
 * @param slideAst The AST for the current slide's content.
 * @param lastTitleRuns The title from the previous slide, to be reused if no new title is found.
 * @param styles The style options.
 * @returns An object containing the new title runs and the remaining body nodes for the slide.
 */
async function processSlideTitleAndSubtitle(
    slide: PptxGenJS.Slide,
    slideAst: MdastRoot,
    lastTitleRuns: PptxGenJS.TextProps[] | null,
    styles: PptxStyleOptions,
    isRtl = false,
    fonts: FontOptions = {},
    footnoteIdMap: Map<string, number>
): Promise<{ newTitleRuns: PptxGenJS.TextProps[] | null; bodyNodes: RootContent[] }> {
    let bodyNodes: RootContent[] = slideAst.children;
    let newTitleRuns = lastTitleRuns;

    // Process main title from heading
    const firstNode = bodyNodes[0];
    if (firstNode?.type === 'heading') {
        const rawTitleRuns = await transformInlinesToPptxText(firstNode.children, {}, styles, isRtl, fonts, footnoteIdMap);
        newTitleRuns = splitTitleRuns(rawTitleRuns, styles);

        // The correct placeholder will be used based on the master slide assigned when the slide was created.
        slide.addText(newTitleRuns, { placeholder: 'title' });
        bodyNodes = bodyNodes.slice(1);
    } else if (lastTitleRuns) {
        slide.addText(lastTitleRuns, { placeholder: 'title' });
    }

    return { newTitleRuns, bodyNodes };
}

interface PptxFootnote {
    id: number;
    textRuns: PptxGenJS.TextProps[];
}

/**
 * Extracts footnote definitions from the slide's AST.
 * @param slideAst The AST for the current slide's content.
 * @param styles The style options.
 * @param isRtl RTL mode flag.
 * @param fonts Font options.
 * @returns A map of footnote identifiers to their numeric ID and an array of footnote objects.
 */
async function processFootnotesForPptx(
    slideAst: MdastRoot,
    styles: PptxStyleOptions,
    isRtl = false,
    fonts: FontOptions = {}
): Promise<{ footnoteIdMap: Map<string, number>; footnotes: PptxFootnote[] }> {
    const footnoteIdMap = new Map<string, number>();
    const footnotes: PptxFootnote[] = [];
    let footnoteCounter = 1;

    const footnoteDefs = slideAst.children.filter(
        (node): node is FootnoteDefinition => node.type === 'footnoteDefinition'
    );

    for (const node of footnoteDefs) {
        const id = footnoteCounter++;
        footnoteIdMap.set(node.identifier, id);

        const { lineColor, ...footnoteTextStyle } = styles.footnote || { fontSize: 10, color: '6c757d' };
        const baseOptions: PptxGenJS.TextPropsOptions = { ...footnoteTextStyle };

        if (isRtl) baseOptions.rtlMode = true;
        const defaultFont = isRtl ? fonts.rtl : (footnoteTextStyle.fontFace || fonts.default);
        if (defaultFont) baseOptions.fontFace = defaultFont;

        const allRuns: PptxGenJS.TextProps[] = [];
        for (const contentNode of node.children) {
            if (contentNode.type === 'paragraph') {
                const paraRuns = await transformInlinesToPptxText(contentNode.children, baseOptions, styles, isRtl, fonts, footnoteIdMap);
                allRuns.push(...paraRuns, { text: '\n' });
            }
        }
        if (allRuns.length > 0) allRuns.pop();

        footnotes.push({ id, textRuns: allRuns });
    }

    return { footnoteIdMap, footnotes };
}

/**
 * Renders the collected footnotes at the bottom of a slide.
 * @param slide The PptxGenJS slide object.
 * @param footnotes An array of footnote objects to render.
 * @param styles The style options.
 * @param isRtl RTL mode flag.
 */
function renderFootnotesOnSlide(slide: PptxGenJS.Slide, footnotes: PptxFootnote[], styles: PptxStyleOptions, isRtl = false) {
    if (footnotes.length === 0) return;

    const footnoteStyle = styles.footnote || { fontSize: 10, color: '6c757d', lineColor: 'C0C0C0' };
    const { lineColor, ...textStyles } = footnoteStyle;
    const footnoteAreaY = layout.BODY_END_Y - 0.5;
    const footnoteAreaHeight = 0.5;

    slide.addShape(PptxGenJS.ShapeType.line, { x: layout.CONTENT_X, y: footnoteAreaY - 0.1, w: layout.CONTENT_WIDTH, h: 0, line: { color: lineColor || 'C0C0C0', width: 0.5 } });

    const allFootnoteRuns: PptxGenJS.TextProps[] = [];
    footnotes.sort((a, b) => a.id - b.id);

    for (const note of footnotes) {
        allFootnoteRuns.push({ text: String(note.id), options: { ...textStyles, fontSize: (textStyles.fontSize || 10) * 0.8, superscript: true } });
        allFootnoteRuns.push({ text: ' ', options: textStyles });
        allFootnoteRuns.push(...note.textRuns);
        allFootnoteRuns.push({ text: '    ', options: textStyles });
    }
    if (allFootnoteRuns.length > 0) allFootnoteRuns.pop();

    slide.addText(allFootnoteRuns, {
        x: layout.CONTENT_X, y: footnoteAreaY, w: layout.CONTENT_WIDTH, h: footnoteAreaHeight,
        valign: 'top',
        rtlMode: isRtl,
        align: isRtl ? 'right' : 'left',
        ...textStyles,
    });
}

/**
 * Extracts speaker notes from the last blockquote of a slide's content if it's formatted correctly.
 * @param slide The PptxGenJS slide object.
 * @param bodyNodes The array of content nodes for the slide.
 * @returns The array of content nodes with the speaker notes blockquote removed, if found.
 */
function processSpeakerNotes(slide: PptxGenJS.Slide, bodyNodes: RootContent[]): RootContent[] {
    const lastNodeIndex = bodyNodes.length - 1;
    const lastNode = bodyNodes[lastNodeIndex];

    // Check if the last node is a blockquote, which is our convention for speaker notes.
    if (lastNode?.type === 'blockquote') {
        const firstPara = lastNode.children[0];
        if (firstPara?.type === 'paragraph') {
            const firstParaText = getNodeText(firstPara).trim();

            // Check for "Notes:" or "Speaker Notes:" prefix.
            if (firstParaText.match(/^(Speaker\s*)?Notes:/i)) {
                // Reconstruct the notes text, removing the "Notes:" prefix from the first paragraph.
                const notesParts: string[] = [];
                const cleanedFirstPara = firstParaText.replace(/^(Speaker\s*)?Notes:\s*/i, '').trim();
                if (cleanedFirstPara) {
                    notesParts.push(cleanedFirstPara);
                }
                for (let i = 1; i < lastNode.children.length; i++) {
                    notesParts.push(getNodeText(lastNode.children[i]));
                }
                const finalNotes = notesParts.join('\n\n');
                if (finalNotes) {
                    slide.addNotes(finalNotes);
                }
                return bodyNodes.slice(0, lastNodeIndex);
            }
        }
    }
    return bodyNodes; // Return original nodes if no speaker notes are found.
}

/**
 * Calculates the estimated height of an array of PptxGenJS TextProps runs.
 * @param runs The array of TextProps.
 * @param styles The style options for the presentation.
 * @returns The calculated height in inches.
 */
function calculateRunsHeight(runs: PptxGenJS.TextProps[], styles: PptxStyleOptions): number {
    const fontFace = styles.body.fontFace || 'Calibri';
    const fontSize = typeof styles.body.fontSize === 'number' ? styles.body.fontSize : 18;
    const lineHeight = (styles.body.lineSpacing || fontSize * 1.2) / 72; // in inches

    const totalText = runs.map(r => r.text || '').join('');
    const lineCount = calculateLineCount(totalText, fontFace, fontSize, layout.CONTENT_WIDTH);
    return (lineCount * lineHeight) + layout.ELEMENT_PADDING;
}

/**
 * Splits an array of TextProps into two parts based on available vertical space.
 * @param allRuns The full array of TextProps to split.
 * @param availableHeight The available height in inches on the current slide.
 * @param styles The style options for the presentation.
 * @returns An object containing runs for the current slide and the remaining runs.
 */
function splitRunsByHeight(
    allRuns: PptxGenJS.TextProps[],
    availableHeight: number,
    styles: PptxStyleOptions
): { current: PptxGenJS.TextProps[], remaining: PptxGenJS.TextProps[] } {
    const fontFace = styles.body.fontFace || 'Calibri';
    const fontSize = typeof styles.body.fontSize === 'number' ? styles.body.fontSize : 18;
    const lineHeight = (styles.body.lineSpacing || fontSize * 1.2) / 72;

    const maxLines = Math.floor(availableHeight / lineHeight);
    if (maxLines <= 0) {
        return { current: [], remaining: allRuns };
    }
    // Check if any splitting is needed at all
    const totalText = allRuns.map(r => r.text || '').join('');
    if (calculateLineCount(totalText, fontFace, fontSize, layout.CONTENT_WIDTH) <= maxLines) {

        return { current: allRuns, remaining: [] };
    }

    // Find the run that causes the overflow
    let splitRunIndex = -1;
    let runsBeforeSplit: PptxGenJS.TextProps[] = [];
    for (let i = 0; i < allRuns.length; i++) {
        const testRuns = allRuns.slice(0, i + 1);
        const testText = testRuns.map(r => r.text || '').join('');
        if (calculateLineCount(testText, fontFace, fontSize, layout.CONTENT_WIDTH) > maxLines) {
            splitRunIndex = i;
            runsBeforeSplit = allRuns.slice(0, i);
            break;
        }
    }

    // This should not happen if we checked totalLines before, but as a safeguard:
    if (splitRunIndex === -1) {
        return { current: allRuns, remaining: [] };
    }

    const runToSplit = allRuns[splitRunIndex];
    const textToSplit = runToSplit.text || '';
    const wordsAndSpaces = textToSplit.split(/(\s+)/); // Keep spaces for accurate reconstruction

    const baseText = runsBeforeSplit.map(r => r.text || '').join('');
    let textForCurrentRun = '';

    for (const word of wordsAndSpaces) {
        const testText = baseText + textForCurrentRun + word;
        if (calculateLineCount(testText, fontFace, fontSize, layout.CONTENT_WIDTH) > maxLines && textForCurrentRun.length > 0) {
            // The split happens before this word.
            break;
        }
        textForCurrentRun += word;
    }

    // If textForCurrentRun is empty, it means even the first word of the runToSplit overflows.
    // In this case, the current slide gets nothing from this run.
    if (textForCurrentRun.trim().length === 0) {
        return {
            current: runsBeforeSplit,
            remaining: allRuns.slice(splitRunIndex)
        };
    }

    const finalCurrentText = textForCurrentRun.trimEnd();
    const remainingText = textToSplit.substring(finalCurrentText.length).trimStart();

    const currentRuns: PptxGenJS.TextProps[] = [...runsBeforeSplit];
    if (finalCurrentText) {
        currentRuns.push({ ...runToSplit, text: finalCurrentText });
    }

    const remainingRuns: PptxGenJS.TextProps[] = [];
    if (remainingText) {
        remainingRuns.push({ ...runToSplit, text: remainingText });
    }
    remainingRuns.push(...allRuns.slice(splitRunIndex + 1));

    return { current: currentRuns, remaining: remainingRuns };
    }



/**
 * Processes a splittable paragraph node, handling text wrapping and slide overflow.
 * @returns An object with the potentially new slide and the updated Y position.
 */
async function processParagraphNode(
    node: Paragraph,
    slide: PptxGenJS.Slide,
    currentY: number,
    bodyEndY: number,
    styles: PptxStyleOptions,
    isRtl: boolean,
    fonts: FontOptions,
    footnoteIdMap: Map<string, number>,
    createNewSlide: () => PptxGenJS.Slide,
    options: {
        bullet?: PptxGenJS.TextPropsOptions['bullet'];
        x?: number;
        w?: number;
    } = {}
): Promise<{ slide: PptxGenJS.Slide; y: number }> {
    let textRuns = await transformInlinesToPptxText(node.children, styles.body, styles, isRtl, fonts, footnoteIdMap);
    let y = currentY;
    let currentSlide = slide;
    let isFirstChunk = true;

    while (textRuns.length > 0) {
        const availableHeight = bodyEndY - y;

        // If there's not enough space for even a single line, create a new slide.
        const lineHeight = (styles.body.lineSpacing || (styles.body.fontSize || 18) * 1.2) / 72;
        if (availableHeight < lineHeight) {
            currentSlide = createNewSlide();
            y = layout.BODY_START_Y;
            continue; // Retry on the new slide with full height
        }

        const { current, remaining } = splitRunsByHeight(textRuns, availableHeight, styles);

        if (current.length === 0 && remaining.length > 0) {
            // This case should be handled by the check above, but as a safeguard against
            // edge cases in splitting, we force a new slide to prevent an infinite loop.
            currentSlide = createNewSlide();
            y = layout.BODY_START_Y;
            continue;
        }

        if (current.length > 0) {
            const heightForTheseRuns = calculateRunsHeight(current, styles);
            const renderHeight = Math.min(heightForTheseRuns - layout.ELEMENT_PADDING, availableHeight);
            const textOptions: PptxGenJS.TextPropsOptions = {
                x: options.x ?? layout.CONTENT_X,
                y,
                w: options.w ?? layout.CONTENT_WIDTH,
                h: renderHeight,
                ...styles.body,
                rtlMode: isRtl,
                align: isRtl ? 'right' : styles.body.align
            };
            if (isFirstChunk && options.bullet) {
                textOptions.bullet = options.bullet;
            }
            currentSlide.addText(current, textOptions);
            y += heightForTheseRuns;
        }

        textRuns = remaining;
        isFirstChunk = false;
    }
    return { slide: currentSlide, y };
}

/**
 * Processes a list node, handling item-by-item rendering and slide overflow.
 * @returns An object with the potentially new slide and the updated Y position.
 */
async function processListNode( // New function to handle lists with splittable paragraphs
    node: List,
    slide: PptxGenJS.Slide,
    currentY: number,
    bodyEndY: number,
    styles: PptxStyleOptions,
    isRtl: boolean,
    fonts: FontOptions,
    footnoteIdMap: Map<string, number>,
    createNewSlide: () => PptxGenJS.Slide,
    level = 0
): Promise<{ slide: PptxGenJS.Slide; y: number }> {
    let y = currentY;
    let currentSlide = slide;

    for (const item of node.children) {
        let isFirstBlockOfItem = true;

        for (const contentNode of item.children) {
            let result: { slide: PptxGenJS.Slide; y: number };

            if (contentNode.type === 'paragraph') {
                const paraOptions: { bullet?: any; x?: number; w?: number } = {};
                if (isFirstBlockOfItem) {
                    paraOptions.bullet = { indent: 25 + (level * 25), type: node.ordered ? 'number' : (styles.bullet?.type || 'bullet') };
                } else {
                    const INDENT_X = 0.5;
                    paraOptions.x = layout.CONTENT_X + ((level + 1) * INDENT_X);
                    paraOptions.w = layout.CONTENT_WIDTH - ((level + 1) * INDENT_X);
                }
                result = await processParagraphNode(contentNode, currentSlide, y, bodyEndY, styles, isRtl, fonts, footnoteIdMap, createNewSlide, paraOptions);
            } else if (contentNode.type === 'list') {
                result = await processListNode(contentNode, currentSlide, y, bodyEndY, styles, isRtl, fonts, footnoteIdMap, createNewSlide, level + 1);
            } else {
                const INDENT_PER_LEVEL = 0.5;
                const blockX = layout.CONTENT_X + ((level + 1) * INDENT_PER_LEVEL);
                const blockW = layout.CONTENT_WIDTH - ((level + 1) * INDENT_PER_LEVEL);
                result = await processUnsplittableNode(contentNode, currentSlide, y, bodyEndY, styles, isRtl, fonts, footnoteIdMap, createNewSlide, { x: blockX, w: blockW });
            }
            currentSlide = result.slide;
            y = result.y;
            isFirstBlockOfItem = false;
        }
    }

    return { slide: currentSlide, y };
}

/**
 * Processes an unsplittable node (e.g., image, table, code block), handling slide overflow.
 * @returns An object with the potentially new slide and the updated Y position.
 */
async function processUnsplittableNode(
    node: RootContent,
    slide: PptxGenJS.Slide,
    currentY: number,
    bodyEndY: number,
    styles: PptxStyleOptions,
    isRtl: boolean,
    fonts: FontOptions,
    footnoteIdMap: Map<string, number>,
    createNewSlide: () => PptxGenJS.Slide,
    options: { x?: number; w?: number } = {}
): Promise<{ slide: PptxGenJS.Slide; y: number }> {
    const elementHeight = calculateElementHeight(node, styles, options.w);

    const overflowResult = manageUnsplittableElementOverflow(currentY, elementHeight, layout.BODY_START_Y, bodyEndY, slide, createNewSlide);
    const newSlide = overflowResult.slide;
    let y = overflowResult.y;

    await renderNodeOnSlide(newSlide, node, y, elementHeight - layout.ELEMENT_PADDING, styles, isRtl, fonts, footnoteIdMap, options.x, options.w);
    y += elementHeight;

    return { slide: newSlide, y };
}

/**
 * Checks if an unsplittable element will overflow the slide and creates a new slide if necessary.
 * @returns An object with the slide to render on and the new Y position.
 */
function manageUnsplittableElementOverflow(
    currentY: number,
    elementHeight: number,
    bodyStartY: number,
    bodyEndY: number,
    currentSlide: PptxGenJS.Slide,
    createNewSlide: () => PptxGenJS.Slide
): { slide: PptxGenJS.Slide; y: number } {
    const availableBodyHeight = bodyEndY - bodyStartY;

    // An element overflows if it's too large for a slide, or if it doesn't fit in the remaining space
    // (and it's not the very first element on the slide).
    if (elementHeight > availableBodyHeight || (currentY + elementHeight > bodyEndY && currentY > bodyStartY)) {
        return { slide: createNewSlide(), y: bodyStartY };
    }

    return { slide: currentSlide, y: currentY };
}

/**
 * Creates and populates slides based on the provided content ASTs.
 * This function manages slide creation, content layout, and overflow to new slides.
 * @param pptx The PptxGenJS presentation object.
 * @param slidesContent An array of slide-specific mdast roots.
 * @param styles The style options for the presentation.
 * @param masterName The name of the slide master to use.
 */
async function createSlidesWithContent(
    pptx: PptxGenJS,
    slidesContent: MdastRoot[],
    styles: PptxStyleOptions,
    masterNames: { cover: string; content: string },
    isRtl = false,
    font: FontOptions = {}
) {
    let lastTitleRuns: PptxGenJS.TextProps[] | null = null;
    let slideCount = 0;

    for (const slideAst of slidesContent) {
        // The first slide is a "cover" only if it does NOT contain a heading.
        const isCover = slideCount === 0 && !slideAst.children.some(node => node.type === 'heading');
        const masterName = isCover ? masterNames.cover : masterNames.content;

        let slide = pptx.addSlide({ masterName });
        slideCount++;

        const { footnoteIdMap, footnotes } = await processFootnotesForPptx(slideAst, styles, isRtl, font);

        let { newTitleRuns, bodyNodes } = await processSlideTitleAndSubtitle(slide, slideAst, lastTitleRuns, styles, isRtl, font, footnoteIdMap);
        lastTitleRuns = newTitleRuns;

        bodyNodes = bodyNodes.filter(node => node.type !== 'footnoteDefinition');

        // Process speaker notes and update bodyNodes before rendering content
        bodyNodes = processSpeakerNotes(slide, bodyNodes);

        let currentY = layout.BODY_START_Y;

        const FOOTNOTE_AREA_HEIGHT = 0.75;
        const bodyEndY = footnotes.length > 0 ? layout.BODY_END_Y - FOOTNOTE_AREA_HEIGHT : layout.BODY_END_Y;

        const createNewSlideForOverflow = () => {
            // All overflow slides are content slides
            const newSlide = pptx.addSlide({ masterName: masterNames.content });
            if (lastTitleRuns) {
                newSlide.addText(lastTitleRuns, { placeholder: 'title' });
            }
            return newSlide;
        };

        const availableBodyHeight = bodyEndY - layout.BODY_START_Y;

        for (const node of bodyNodes) {
            let result: { slide: PptxGenJS.Slide; y: number };
            if (node.type === 'paragraph' && !(node.children.length === 1 && node.children[0].type === 'image')) {
                result = await processParagraphNode(node, slide, currentY, bodyEndY, styles, isRtl, font, footnoteIdMap, createNewSlideForOverflow);
            } else if (node.type === 'list') {
                result = await processListNode(node, slide, currentY, bodyEndY, styles, isRtl, font, footnoteIdMap, createNewSlideForOverflow, 0);
            } else {
                result = await processUnsplittableNode(node, slide, currentY, bodyEndY, styles, isRtl, font, footnoteIdMap, createNewSlideForOverflow);
            }
            slide = result.slide;
            currentY = result.y;
        }

        if (footnotes.length > 0) {
            renderFootnotesOnSlide(slide, footnotes, styles, isRtl);
        }
    }
}

export async function convertMarkdownToPptx(
    markdown: string,
    fileName: string,
    options: PptxConversionOptions = {},
) {
    const pptx = new PptxGenJS();
    const { styles = templates.modern.styles, isRtl = false, fonts = {}, includeToc = false } = options;

    pptx.rtlMode = isRtl;
    pptx.layout = 'LAYOUT_16x9';
    const COVER_MASTER = 'COVER_MASTER';
    const CONTENT_MASTER = 'CONTENT_MASTER';

    const titleStyle = { ...styles.title };
    const defaultFont = isRtl ? fonts.rtl : fonts.default;
    if (defaultFont) titleStyle.fontFace = defaultFont;

    const coverTitleStyle = { ...titleStyle, align: 'center', valign: 'middle', fontSize: 44 };
    const contentTitleStyle = { ...titleStyle, align: isRtl ? 'right' : styles.title.align };

    // Define Cover Slide Master
    pptx.defineSlideMaster({
        title: COVER_MASTER,
        background: styles.background,
        objects: [
            {
                placeholder: {
                    options: { name: 'title', type: 'title', x: 0.5, y: 0, w: '90%', h: '100%', ...coverTitleStyle, rtlMode: isRtl },
                },
            },
        ],
    });

    // Define Content Slide Master
    pptx.defineSlideMaster({
        title: CONTENT_MASTER,
        background: styles.background,
        objects: [
            { placeholder: { options: { name: 'title', type: 'title', x: layout.CONTENT_X, y: layout.TITLE_Y, w: layout.CONTENT_WIDTH, h: layout.TITLE_H, margin: 0, ...contentTitleStyle, rtlMode: isRtl } } },
        ],
    });

    pptx.layout = 'LAYOUT_16x9';
    pptx.author = options.author || 'Arkan';
    pptx.company = options.company || 'Arkan';
    pptx.subject = options.subject || 'Markdown Presentation';
    pptx.title = options.title || fileName;

    const processedMarkdown = processPlantUml(markdown);
    const ast = unified().use(remarkParse).use(remarkGfm).parse(processedMarkdown) as MdastRoot;
    let slidesContent = splitAstIntoSlides(ast);

    if (includeToc && slidesContent.length > 0) {
        const tocItems: ListItem[] = [];
        // Generate TOC from all slides that have a title.
        for (const slideAst of slidesContent) {
            const firstNode = slideAst.children.find(node => node.type === 'heading');
            if (firstNode && firstNode.type === 'heading') {
                let titleText = getNodeText(firstNode);
                // The title might be split into title and subtitle. We only want the subtitle part.
                if (titleText.includes(':')) {
                    titleText = titleText.split(':')[1];
                }

                tocItems.push({
                    type: 'listItem',
                    spread: false,
                    children: [{
                        type: 'paragraph',
                        children: [{ type: 'text', value: titleText }]
                    }]
                });
            }
        }

        if (tocItems.length > 0) {
            const tocSlideAst: MdastRoot = {
                type: 'root',
                children: [
                    { type: 'heading', depth: 1, children: [{ type: 'text', value: 'Table of Contents' }] },
                    { type: 'list', ordered: true, start: 1, spread: false, children: tocItems }
                ]
            };
            slidesContent.splice(1, 0, tocSlideAst);
        }
    }

    await createSlidesWithContent(pptx, slidesContent, styles, { cover: COVER_MASTER, content: CONTENT_MASTER }, isRtl, fonts);

    await pptx.writeFile({ fileName: `${fileName}.pptx` });
}
