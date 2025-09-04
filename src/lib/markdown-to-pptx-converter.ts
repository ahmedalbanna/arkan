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
function calculateElementHeight(node: RootContent, styles: PptxStyleOptions): number {
    switch (node.type) {
        case 'paragraph': {
            if (node.children.length === 1 && node.children[0].type === 'image') {
                return layout.IMAGE_H + layout.ELEMENT_PADDING;
            }
            const paraText = getNodeText(node);
            const fontFace = styles.body.fontFace || 'Calibri';
            const fontSize = typeof styles.body.fontSize === 'number' ? styles.body.fontSize : 18;
            const lineHeight = (styles.body.lineSpacing || fontSize * 1.2) / 72; // in inches
            const lineCount = calculateLineCount(paraText, fontFace, fontSize, layout.CONTENT_WIDTH);
            return (lineCount * lineHeight) + layout.ELEMENT_PADDING;
        }

        case 'list': {
            let totalHeight = 0;
            for (const item of node.children) {
                // Sum the heights of each list item. `calculateListItemHeight` includes paddings of its children.
                totalHeight += calculateListItemHeight(item, styles);
            }
            // Add padding for the list block itself.
            return totalHeight + layout.ELEMENT_PADDING;
        }
        case 'blockquote': {
            const bqText = getNodeText(node);
            const fontFace = styles.blockquote?.fontFace || styles.body.fontFace || 'Calibri';
            const fontSize = typeof styles.blockquote?.fontSize === 'number' ? styles.blockquote.fontSize : (typeof styles.body.fontSize === 'number' ? styles.body.fontSize : 18);
            const lineHeight = (styles.blockquote?.lineSpacing || fontSize * 1.2) / 72; // in inches
            const lineCount = calculateLineCount(bqText, fontFace, fontSize, layout.CONTENT_WIDTH);
            return (lineCount * lineHeight) + layout.ELEMENT_PADDING;
        }
        case 'table':
            // Estimate table height: (number of rows) * (line height per row) + padding
            // Assuming each row is about 1.5 lines high to account for cell padding.
            const tableLineHeight = ((typeof styles.table?.fontSize === 'number' ? styles.table.fontSize : 14) * 1.2) / 72;
            return (node.children.length * tableLineHeight * 1.5) + layout.ELEMENT_PADDING;

        case 'code': {
            const codeText = node.value;
            const codeFontSize = styles.code?.fontSize || 12;
            const codeFontFace = styles.code?.fontFace || 'Courier New';
            const codeLineHeight = (codeFontSize * 1.4) / 72;
            const lineCount = calculateLineCount(codeText, codeFontFace, codeFontSize, layout.CONTENT_WIDTH);
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
function calculateListItemHeight(item: ListItem, styles: PptxStyleOptions): number {
    let totalHeight = 0;
    for (const contentNode of item.children) {
        // Sum the heights of the content within the list item.
        // Each element's height already includes its own padding.
        totalHeight += calculateElementHeight(contentNode, styles);
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

/** Helper to render a paragraph with list bullet formatting. */
async function renderBulletedParagraph(
    slide: PptxGenJS.Slide,
    node: Paragraph,
    pos: { y: number; h: number },
    listInfo: {
        level: number;
        ordered: boolean;
        isRtl: boolean;
        styles: PptxStyleOptions;
        fonts: FontOptions;
        footnoteIdMap: Map<string, number>;
    }
) {
    const { y, h } = pos;
    const { level, ordered, isRtl, styles, fonts, footnoteIdMap } = listInfo;

    const paraRuns = await transformInlinesToPptxText(node.children, {}, styles, isRtl, fonts, footnoteIdMap);
    if (paraRuns.length === 0) return;

    const defaultFont = isRtl ? fonts.rtl : fonts.default;
    const bodyStyle = { ...styles.body };
    if (defaultFont) bodyStyle.fontFace = defaultFont;

    slide.addText(paraRuns, {
        x: layout.CONTENT_X, y, w: layout.CONTENT_WIDTH, h,
        ...bodyStyle,
        rtlMode: isRtl,
        align: isRtl ? 'right' : styles.body.align,
        bullet: { indent: 25 + (level * 25), type: ordered ? 'number' : (styles.bullet?.type || 'bullet') },
    });
}

/** Renders a list node, which is expected to contain a single list item for slide-breaking purposes. */
async function renderList(slide: PptxGenJS.Slide, node: List, y: number, h: number, styles: PptxStyleOptions, isRtl = false, fonts: FontOptions = {}, level = 0, footnoteIdMap: Map<string, number> = new Map()): Promise<number> {
    let currentY = y;
    const item = node.children[0];
    if (!item) return y;

    const itemNaturalHeight = calculateListItemHeight(item, styles);
    const extraHeight = h > itemNaturalHeight ? h - itemNaturalHeight : 0;
    let isFirstBlockOfItem = true;

    for (const [contentIndex, contentNode] of item.children.entries()) {
        const isLastContentNode = contentIndex === item.children.length - 1;
        let elementHeight = calculateElementHeight(contentNode, styles);
        let contentRenderHeight = elementHeight > layout.ELEMENT_PADDING ? elementHeight - layout.ELEMENT_PADDING : elementHeight;

        if (isLastContentNode && extraHeight > 0) {
            contentRenderHeight += extraHeight;
            elementHeight += extraHeight;
        }

        if (isFirstBlockOfItem && contentNode.type === 'paragraph') {
            await renderBulletedParagraph(slide, contentNode, { y: currentY, h: contentRenderHeight }, {
                level, ordered: node.ordered, isRtl, styles, fonts, footnoteIdMap
            });
        } else {
            const INDENT_PER_LEVEL = 0.5;
            const blockX = layout.CONTENT_X + ((level + 1) * INDENT_PER_LEVEL);
            const blockW = layout.CONTENT_WIDTH - ((level + 1) * INDENT_PER_LEVEL);

            if (contentNode.type === 'list') {
                currentY = await renderList(slide, contentNode as List, currentY, contentRenderHeight, styles, isRtl, fonts, level + 1, footnoteIdMap);
                currentY -= elementHeight; // Adjust for outer loop increment
            } else {
                await renderNodeOnSlide(slide, contentNode, currentY, contentRenderHeight, styles, isRtl, fonts, footnoteIdMap, blockX, blockW);
            }
        }

        isFirstBlockOfItem = false;
        currentY += elementHeight;
    }

    return currentY;
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

    let currentSlideContent: RootContent[] = [];
    const firstHeadingIndex = ast.children.findIndex(node => node.type === 'heading');

    if (firstHeadingIndex === -1) {
        return ast.children.length > 0 ? [{ type: 'root', children: ast.children }] : [];
    }

    for (let i = firstHeadingIndex; i < ast.children.length; i++) {
        const node = ast.children[i];
        const isSlideBreak = node.type === 'heading' || node.type === 'thematicBreak';

        if (isSlideBreak && currentSlideContent.length > 0) {
            slides.push({ type: 'root', children: currentSlideContent });
            currentSlideContent = [];
        }

        if (node.type !== 'thematicBreak') {
            currentSlideContent.push(node);
        }
    }

    if (currentSlideContent.length > 0) {
        slides.push({ type: 'root', children: currentSlideContent });
    }

    return slides;
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
        const titleRuns = await transformInlinesToPptxText(firstNode.children, {}, styles, isRtl, fonts, footnoteIdMap);

        // Logic to split title into title and subtitle at the first colon
        const colonRunIndex = titleRuns.findIndex(run => run.text?.includes(':'));
        if (colonRunIndex !== -1) {
            const runsWithBreaks: PptxGenJS.TextProps[] = [];
            // Add all runs before the one with the colon
            runsWithBreaks.push(...titleRuns.slice(0, colonRunIndex));

            // Split the run with the colon
            const colonRun = titleRuns[colonRunIndex];
            const [textBefore, textAfter] = (colonRun.text || '').split(':', 2);

            if (textBefore) {
                runsWithBreaks.push({ text: textBefore, options: colonRun.options });
            }

            // Add a line break for the subtitle
            runsWithBreaks.push({ text: '\n', options: { ...colonRun.options } });

            // Add the part after the colon from the same run, styled as subtitle
            if (textAfter.trim()) {
                runsWithBreaks.push({ text: textAfter.trim() + ' ', options: { ...colonRun.options, ...styles.subtitle } });
            }

            // Add all subsequent runs, styled as subtitle
            for (let i = colonRunIndex + 1; i < titleRuns.length; i++) {
                const subsequentRun = titleRuns[i];
                runsWithBreaks.push({
                    text: subsequentRun.text,
                    options: { ...subsequentRun.options, ...styles.subtitle }
                });
            }
            newTitleRuns = runsWithBreaks;
        } else {
            newTitleRuns = titleRuns;
        }

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

/** Renders an array of TextProps as a paragraph. */
async function renderParagraphRuns(slide: PptxGenJS.Slide, textRuns: PptxGenJS.TextProps[], y: number, h: number, styles: PptxStyleOptions, isRtl = false) {
    if (textRuns.length === 0) return;
    slide.addText(textRuns, { x: layout.CONTENT_X, y, w: layout.CONTENT_WIDTH, h, ...styles.body, rtlMode: isRtl, align: isRtl ? 'right' : styles.body.align });
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
        const isFirstSlide = slideCount === 0;
        const masterName = isFirstSlide ? masterNames.cover : masterNames.content;

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
            if (node.type === 'paragraph' && !(node.children.length === 1 && node.children[0].type === 'image')) {
                // Special handling for text paragraphs that can be split across slides
                let textRuns = await transformInlinesToPptxText(node.children, styles.body, styles, isRtl, font, footnoteIdMap);

                while (textRuns.length > 0) {
                    // If the remaining space is not enough for even a tiny element, create a new slide.
                    // This prevents an infinite loop where splitRunsByHeight returns an empty `current` array.
                    if (bodyEndY - currentY < layout.ELEMENT_PADDING) {
                        slide = createNewSlideForOverflow();
                        currentY = layout.BODY_START_Y;
                    }

                    const availableHeight = bodyEndY - currentY;
                    const { current, remaining } = splitRunsByHeight(textRuns, availableHeight, styles);

                    if (current.length > 0) {
                        const heightForTheseRuns = calculateRunsHeight(current, styles);
                        // Use the available height for rendering to avoid overflow, even if calculation is slightly off
                        const renderHeight = Math.min(heightForTheseRuns - layout.ELEMENT_PADDING, availableHeight);
                        await renderParagraphRuns(slide, current, currentY, renderHeight, styles, isRtl);
                        currentY += heightForTheseRuns;
                    }

                    textRuns = remaining;
                }
            } else if (node.type === 'list') {
                // Lists are processed item by item to allow breaking across slides.
                const processListItems = async (listNode: List, level: number) => {
                    for (const [index, item] of listNode.children.entries()) {
                        let itemHeight = calculateListItemHeight(item, styles);
                        const isLastItemOfList = index === listNode.children.length - 1;

                        // If the last item is one of the final two elements on the slide, expand it to occupy the remaining space.
                        // This prevents a list from starting at the very bottom of a slide.
                        const isNearEnd = currentY + itemHeight * 2 > bodyEndY;

                        if (isLastItemOfList && isNearEnd && currentY > layout.BODY_START_Y) {
                            itemHeight = bodyEndY - currentY;
                        } else {
                            const overflowResult = manageUnsplittableElementOverflow(currentY, itemHeight, layout.BODY_START_Y, bodyEndY, slide, createNewSlideForOverflow);
                            slide = overflowResult.slide;
                            currentY = overflowResult.y;
                        }

                        const tempListWithOneItem: List = { type: 'list', ordered: listNode.ordered, children: [item] };
                        currentY = await renderList(slide, tempListWithOneItem, currentY, itemHeight, styles, isRtl, font, level, footnoteIdMap);
                    }
                };
                await processListItems(node, 0);
            } else {
                // Handles all other unsplittable blocks: image-only paragraphs, blockquotes, tables, code blocks
                const elementHeight = calculateElementHeight(node, styles);

                const overflowResult = manageUnsplittableElementOverflow(currentY, elementHeight, layout.BODY_START_Y, bodyEndY, slide, createNewSlideForOverflow);
                slide = overflowResult.slide;
                currentY = overflowResult.y;

                await renderNodeOnSlide(slide, node, currentY, elementHeight - layout.ELEMENT_PADDING, styles, isRtl, font, footnoteIdMap);
                currentY += elementHeight;
            }
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
    const { styles = templates.modern.styles, isRtl = false, fonts = {} } = options;

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
    const slidesContent = splitAstIntoSlides(ast);

    await createSlidesWithContent(pptx, slidesContent, styles, { cover: COVER_MASTER, content: CONTENT_MASTER }, isRtl, fonts);

    await pptx.writeFile({ fileName: `${fileName}.pptx` });
}
