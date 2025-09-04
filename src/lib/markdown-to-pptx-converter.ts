import PptxGenJS from 'pptxgenjs';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm'; // Import remarkGfm
import { visit } from 'unist-util-visit';
import { type Root as MdastRoot, type RootContent, type Text, type PhrasingContent, type Paragraph, type List, type ListItem, type Blockquote, type Table, type Code, type Image } from 'mdast';
import { templates } from '@/lib/pptx-styles'; // Keep for default styles
import { processPlantUml, arrayBufferToBase64, getProxiedImageBuffer } from '@/lib/utils';
import type { PptxStyleOptions } from '@/lib/types';

// --- LAYOUT CONSTANTS ---
const SLIDE_WIDTH = 10;
const SLIDE_HEIGHT = 5.625; // For a 16:9 aspect ratio slide
const CONTENT_X = 0.5;
const CONTENT_WIDTH = 9.0;
const TITLE_Y = 0.25;
const TITLE_H = 1.0;
const SUBTITLE_Y = 1.2;
const SUBTITLE_H = 0.4;
const BODY_START_Y = 1.5;
const SLIDE_MARGIN_BOTTOM = 0.675; // Vertical margin at the bottom of the slide in inches
const BODY_END_Y = SLIDE_HEIGHT - SLIDE_MARGIN_BOTTOM;
const IMAGE_H = 2.5;
const IMAGE_W = 7.0;
const IMAGE_X = (SLIDE_WIDTH - IMAGE_W) / 2; // Center the image
const ELEMENT_PADDING = 0.2; // Vertical padding between elements in inches

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
 * Transforms inline markdown content (strong, emphasis, links, etc.) into an array of PptxGenJS TextProps runs.
 * This function is intended for PhrasingContent and does not handle block-level elements.
 * @param nodes An array of mdast PhrasingContent nodes.
 * @param baseOptions The base text properties to apply to all runs.
 * @param styles The style options for the presentation.
 * @returns A promise that resolves to an array of PptxGenJS.TextProps.
 */
/**
* @param baseOptions The base text properties to apply to all runs.
 * @param styles The style options for the presentation.
 * @returns A promise that resolves to an array of PptxGenJS.TextProps.
 */
async function transformInlinesToPptxText(
    nodes: PhrasingContent[],
    baseOptions: PptxGenJS.TextPropsOptions,
    styles: PptxStyleOptions,
    isRtl = false,
    fonts: FontOptions = {}
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
                runs.push(...(await transformInlinesToPptxText(node.children, { ...currentBaseOptions, bold: true }, styles, isRtl, fonts)));
                break;
            case 'emphasis':
                runs.push(...(await transformInlinesToPptxText(node.children, { ...currentBaseOptions, italic: true }, styles, isRtl, fonts)));
                break;
            case 'delete':
                runs.push(...(await transformInlinesToPptxText(node.children, { ...currentBaseOptions, strike: true }, styles, isRtl, fonts)));
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
                const linkRuns = await transformInlinesToPptxText(node.children, linkStyle, styles, isRtl, fonts);
                linkRuns.forEach(run => {
                    run.options = { ...run.options, hyperlink: { url: node.url, tooltip: node.title || node.url } };
                });
                runs.push(...linkRuns);
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
    const bodyFontSize = typeof styles.body.fontSize === 'number' ? styles.body.fontSize : 18;
    const bodyLineHeight = (styles.body.lineSpacing || bodyFontSize * 1.2) / 72; // in inches

    // A rough estimate of characters per line. This is an approximation.
    // A more accurate method would require precise font metrics for character widths.
    const avgCharWidthInPoints = bodyFontSize * 0.5;
    const charsPerLine = (CONTENT_WIDTH * 72) / avgCharWidthInPoints; // Corrected: Use CONTENT_WIDTH for text width

    switch (node.type) {
        case 'paragraph':
            if (node.children.length === 1 && node.children[0].type === 'image') {
                return IMAGE_H + ELEMENT_PADDING;
            }
            const paraText = getNodeText(node);
            const paraLines = Math.max(1, Math.ceil(paraText.length / charsPerLine));
            return (paraLines * bodyLineHeight) + ELEMENT_PADDING;

        case 'list': {
            let totalHeight = 0;
            for (const item of node.children) {
                // Sum the heights of each list item. `calculateListItemHeight` includes paddings of its children.
                totalHeight += calculateListItemHeight(item, styles);
            }
            // Add padding for the list block itself.
            return totalHeight + ELEMENT_PADDING;
        }
        case 'blockquote': {
            const bqText = getNodeText(node);
            const bqLines = Math.max(1, Math.ceil(bqText.length / charsPerLine));
            return (bqLines * bodyLineHeight) + ELEMENT_PADDING;
        }
        case 'table':
            // Estimate table height: (number of rows) * (line height per row) + padding
            // Assuming each row is about 1.5 lines high to account for cell padding.
            const tableLineHeight = ((typeof styles.table?.fontSize === 'number' ? styles.table.fontSize : 14) * 1.2) / 72;
            return (node.children.length * tableLineHeight * 1.5) + ELEMENT_PADDING;

        case 'code':
            const codeFontSize = styles.code?.fontSize || 12;
            // Monospace fonts are often slightly taller and narrower.
            const codeLineHeight = (codeFontSize * 1.4) / 72;
            const codeLines = node.value.split('\n').length;
            return (codeLines * codeLineHeight) + ELEMENT_PADDING;

        default:
            return ELEMENT_PADDING; // Return padding for unknown elements to ensure some spacing
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
async function renderParagraph(slide: PptxGenJS.Slide, node: Paragraph, y: number, h: number, styles: PptxStyleOptions, isRtl = false, fonts: FontOptions = {}) {
    const imageNode = node.children.length === 1 && node.children[0].type === 'image' ? node.children[0] : null;
    if (imageNode) {
        const proxiedImage = await getProxiedImageBuffer(imageNode.url);
        if (proxiedImage) {
            const base64Image = arrayBufferToBase64(proxiedImage.buffer);
            slide.addImage({
                data: `data:${proxiedImage.contentType};base64,${base64Image}`,
                x: IMAGE_X, y, w: IMAGE_W, h: IMAGE_H
            });
        } else {
            // If the image fails to load, add a placeholder with an error message.
            slide.addText('Failed to load image.', {
                x: IMAGE_X, y, w: IMAGE_W, h: IMAGE_H,
                align: 'center',
                valign: 'middle',
                color: 'FF0000', // Red color for error
            });
        }
    } else {
        const textRuns = await transformInlinesToPptxText(node.children, styles.body, styles, isRtl, fonts);
        if (textRuns.length === 0) return;
        slide.addText(textRuns, { x: CONTENT_X, y, w: CONTENT_WIDTH, h, ...styles.body, rtlMode: isRtl, align: isRtl ? 'right' : styles.body.align });
    }
}

/** Renders a list node. */
async function renderList(slide: PptxGenJS.Slide, node: List, y: number, _h: number, styles: PptxStyleOptions, isRtl = false, fonts: FontOptions = {}, level = 0): Promise<number> {
    let currentY = y;
    const defaultFont = isRtl ? fonts.rtl : fonts.default;
    const bodyStyle = { ...styles.body };
    if (defaultFont) bodyStyle.fontFace = defaultFont;

    for (const item of node.children) {
        let isFirstParaOfItem = true;

        for (const contentNode of item.children) {
            const elementHeight = calculateElementHeight(contentNode, styles);
            const contentHeight = elementHeight > ELEMENT_PADDING ? elementHeight - ELEMENT_PADDING : elementHeight;

            if (contentNode.type === 'paragraph') {
                const paraRuns = await transformInlinesToPptxText(contentNode.children, {}, styles, isRtl, fonts);
                if (paraRuns.length > 0) {
                    const textOptions: PptxGenJS.TextPropsOptions = {
                        x: CONTENT_X, y: currentY, w: CONTENT_WIDTH, h: contentHeight,
                        ...bodyStyle,
                        rtlMode: isRtl,
                        align: isRtl ? 'right' : styles.body.align,
                    };

                    if (isFirstParaOfItem) {
                        textOptions.bullet = { indent: 25 + (level * 25), type: node.ordered ? 'number' : (styles.bullet?.type || 'bullet') };
                        isFirstParaOfItem = false;
                    } else {
                        const INDENT_X = 0.5;
                        textOptions.x += (level + 1) * INDENT_X;
                        textOptions.w -= (level + 1) * INDENT_X;
                    }
                    slide.addText(paraRuns, textOptions);
                }
            } else {
                isFirstParaOfItem = true; // Any block element resets this
                const INDENT_PER_LEVEL = 0.5;
                const blockX = CONTENT_X + ((level + 1) * INDENT_PER_LEVEL);
                const blockW = CONTENT_WIDTH - ((level + 1) * INDENT_PER_LEVEL);

                if (contentNode.type === 'table') {
                    await renderTable(slide, contentNode, currentY, contentHeight, styles, isRtl, fonts, blockX, blockW);
                } else if (contentNode.type === 'code') {
                    await renderCode(slide, contentNode, currentY, contentHeight, styles, isRtl, fonts, level + 1);
                } else if (contentNode.type === 'list') {
                    // The recursive call returns the new Y, so we update our `currentY` and then subtract the
                    // element height because the main loop will add it back.
                    currentY = await renderList(slide, contentNode, currentY, contentHeight, styles, isRtl, fonts, level + 1);
                    currentY -= elementHeight;
                }
            }
            currentY += elementHeight;
        }
    }
    return currentY;
}

/** Renders a blockquote node. */
async function renderBlockquote(slide: PptxGenJS.Slide, node: Blockquote, y: number, h: number, styles: PptxStyleOptions, isRtl = false, fonts: FontOptions = {}) {
    const blockquoteStyle = { ...styles.body, ...styles.blockquote };
    const textRuns: PptxGenJS.TextProps[] = [];
    for (const [i, p] of node.children.entries()) {
        if (p.type === 'paragraph') {
            textRuns.push(...await transformInlinesToPptxText(p.children, blockquoteStyle, styles, isRtl, fonts));
            if (i < node.children.length - 1) {
                textRuns.push({ text: '\n', options: blockquoteStyle });
            }
        }
    }
    slide.addText(textRuns, { x: CONTENT_X, y, w: CONTENT_WIDTH, h, ...blockquoteStyle, rtlMode: isRtl, align: isRtl ? 'right' : blockquoteStyle.align });
}

/** Renders a table node. */
async function renderTable(slide: PptxGenJS.Slide, node: Table, y: number, h: number, styles: PptxStyleOptions, isRtl = false, fonts: FontOptions = {}, x: number = CONTENT_X, w: number = CONTENT_WIDTH) {
    const tableRows: PptxGenJS.TableRow[] = [];
    for (const [rowIndex, rowNode] of node.children.entries()) {
        const tableCells: PptxGenJS.TableCell[] = [];
        for (const cellNode of rowNode.children) {
            const baseCellStyle = rowIndex === 0 ? styles.tableHeaderStyle : styles.tableCellStyle;
            const cellText = await transformInlinesToPptxText(cellNode.children, baseCellStyle, styles, isRtl, fonts);
            const isHeader = rowIndex === 0;
            const cellOptions = isHeader ? styles.tableHeaderStyle : styles.tableCellStyle;
            tableCells.push({ text: cellText, options: { ...cellOptions, rtlMode: isRtl, align: isRtl ? 'right' : cellOptions?.align || styles.table?.align } });
        }
        tableRows.push(tableCells);
    }
    slide.addTable(tableRows, { x: CONTENT_X, y, w: CONTENT_WIDTH, h, ...styles.table });
}

/** Renders a code block node. */
async function renderCode(slide: PptxGenJS.Slide, node: Code, y: number, h: number, styles: PptxStyleOptions, isRtl = false, fonts: FontOptions = {}) {
    const codeStyle = { ...styles.code };
    if (fonts.code) codeStyle.fontFace = fonts.code;
    slide.addText(node.value, {
        x: CONTENT_X, y, w: CONTENT_WIDTH, h, ...styles.body,
        ...codeStyle,
        rtlMode: false, // Code is always LTR
        align: 'left'   // Code is always LTR
    });
}

/**
 * Renders a markdown AST node onto a slide by dispatching to the appropriate render function.
 */
async function renderNodeOnSlide(slide: PptxGenJS.Slide, node: RootContent, y: number, h: number, styles: PptxStyleOptions, isRtl = false, fonts: FontOptions = {}) {
    switch (node.type) {
        case 'paragraph':
            await renderParagraph(slide, node, y, h, styles, isRtl, fonts);
            break;
        case 'list':
            await renderList(slide, node, y, h, styles, isRtl, fonts);
            break;
        case 'blockquote':
            await renderBlockquote(slide, node, y, h, styles, isRtl, fonts);
            break;
        case 'table':
            await renderTable(slide, node, y, h, styles, isRtl, fonts); // This will use default x/w
            break;
        case 'code':
            await renderCode(slide, node, y, h, styles, isRtl, fonts);
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
    fonts: FontOptions = {}
): Promise<{ newTitleRuns: PptxGenJS.TextProps[] | null; bodyNodes: RootContent[] }> {
    let bodyNodes: RootContent[] = slideAst.children;
    let newTitleRuns = lastTitleRuns;

    // Process main title from heading
    const firstNode = bodyNodes[0];
    if (firstNode?.type === 'heading') {
        const titleRuns = await transformInlinesToPptxText(firstNode.children, {}, styles, isRtl, fonts);

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

/**
 * Calculates the estimated height of an array of PptxGenJS TextProps runs.
 * @param runs The array of TextProps.
 * @param styles The style options for the presentation.
 * @returns The calculated height in inches.
 */
function calculateRunsHeight(runs: PptxGenJS.TextProps[], styles: PptxStyleOptions): number {
    const bodyFontSize = typeof styles.body.fontSize === 'number' ? styles.body.fontSize : 18;
    const bodyLineHeight = (styles.body.lineSpacing || bodyFontSize * 1.2) / 72; // in inches
    const avgCharWidthInPoints = bodyFontSize * 0.5;
    const charsPerLine = (CONTENT_WIDTH * 72) / avgCharWidthInPoints;

    const totalText = runs.map(r => r.text || '').join('');
    const paraLines = Math.max(1, Math.ceil(totalText.length / charsPerLine));
    return (paraLines * bodyLineHeight) + ELEMENT_PADDING;
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
    const bodyFontSize = typeof styles.body.fontSize === 'number' ? styles.body.fontSize : 18;
    const bodyLineHeight = (styles.body.lineSpacing || bodyFontSize * 1.2) / 72;
    const avgCharWidthInPoints = bodyFontSize * 0.5;
    const charsPerLine = (CONTENT_WIDTH * 72) / avgCharWidthInPoints;

    const maxLines = Math.floor(availableHeight / bodyLineHeight);
    if (maxLines <= 0) {
        return { current: [], remaining: allRuns };
    }

    const totalText = allRuns.map(r => r.text || '').join('');
    const totalLines = Math.ceil(totalText.length / charsPerLine);

    if (totalLines <= maxLines) {
        return { current: allRuns, remaining: [] };
    }

    const maxChars = maxLines * charsPerLine;
    let currentChars = 0;
    const currentRuns: PptxGenJS.TextProps[] = [];
    const remainingRuns: PptxGenJS.TextProps[] = [];
    let splitOccurred = false;

    for (let i = 0; i < allRuns.length; i++) {
        const run = allRuns[i];
        if (splitOccurred) {
            remainingRuns.push(run);
            continue;
        }

        const runText = run.text || '';
        const runLength = runText.length;

        if (currentChars + runLength <= maxChars) {
            currentRuns.push(run);
            currentChars += runLength;
        } else {
            const charsToTake = maxChars - currentChars;
            let splitIndex = runText.lastIndexOf(' ', charsToTake);
            if (splitIndex === -1 || runText.length - splitIndex < 10) {
                splitIndex = charsToTake;
            }

            const textForCurrent = runText.substring(0, splitIndex).trimEnd();
            const textForNext = runText.substring(splitIndex).trimStart();

            if (textForCurrent) {
                currentRuns.push({ ...run, text: textForCurrent });
            }
            if (textForNext) {
                remainingRuns.push({ ...run, text: textForNext });
            }

            remainingRuns.push(...allRuns.slice(i + 1));
            splitOccurred = true;
        }
    }

    return { current: currentRuns, remaining: remainingRuns };
}

/** Renders an array of TextProps as a paragraph. */
async function renderParagraphRuns(slide: PptxGenJS.Slide, textRuns: PptxGenJS.TextProps[], y: number, h: number, styles: PptxStyleOptions, isRtl = false) {
    if (textRuns.length === 0) return;
    slide.addText(textRuns, { x: CONTENT_X, y, w: CONTENT_WIDTH, h, ...styles.body, rtlMode: isRtl, align: isRtl ? 'right' : styles.body.align });
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

        const { newTitleRuns, bodyNodes } = await processSlideTitleAndSubtitle(slide, slideAst, lastTitleRuns, styles, isRtl, font);
        lastTitleRuns = newTitleRuns;

        let currentY = BODY_START_Y;

        const createNewSlideForOverflow = () => {
            // All overflow slides are content slides
            const newSlide = pptx.addSlide({ masterName: masterNames.content });
            if (lastTitleRuns) {
                newSlide.addText(lastTitleRuns, { placeholder: 'title' });
            }
            return newSlide;
        };

        const availableBodyHeight = BODY_END_Y - BODY_START_Y;

 for (const node of bodyNodes) {
            if (node.type === 'paragraph' && !(node.children.length === 1 && node.children[0].type === 'image')) {
                // Special handling for text paragraphs that can be split across slides
                let textRuns = await transformInlinesToPptxText(node.children, styles.body, styles, isRtl, font);

                while (textRuns.length > 0) {
                    const availableHeight = BODY_END_Y - currentY;
                    const { current, remaining } = splitRunsByHeight(textRuns, availableHeight, styles);

                    if (current.length > 0) {
                        const heightForTheseRuns = calculateRunsHeight(current, styles);
                        // Use the available height for rendering to avoid overflow, even if calculation is slightly off
                        const renderHeight = Math.min(heightForTheseRuns - ELEMENT_PADDING, availableHeight);
                        await renderParagraphRuns(slide, current, currentY, renderHeight, styles, isRtl);
                        currentY += heightForTheseRuns;
                    }

                    textRuns = remaining;

                    if (textRuns.length > 0) {
                        slide = createNewSlideForOverflow();
                        currentY = BODY_START_Y;
                    }
                }
            } else if (node.type === 'list') {
                // Lists are processed item by item to allow breaking across slides.
                const processListItems = async (listNode: List, level: number) => {
                    for (const item of listNode.children) {
                        const itemHeight = calculateListItemHeight(item, styles);

                        if (currentY + itemHeight > BODY_END_Y && currentY > BODY_START_Y) {
                            slide = createNewSlideForOverflow();
                            currentY = BODY_START_Y;
                        }

                        const tempListWithOneItem: List = { type: 'list', ordered: listNode.ordered, children: [item] };
                        // renderList returns the new Y position after rendering the item and its sub-items
                        currentY = await renderList(slide, tempListWithOneItem, currentY, itemHeight, styles, isRtl, font, level);
                    }
                };
                await processListItems(node, 0);
            } else if (node.type === 'table' || node.type === 'code') {
                // Unsplittable large blocks: always start on a new slide if not the first element.
                if (currentY > BODY_START_Y) {
                    slide = createNewSlideForOverflow();
                    currentY = BODY_START_Y;
                }
                const elementHeight = calculateElementHeight(node, styles);
                await renderNodeOnSlide(slide, node, currentY, elementHeight - ELEMENT_PADDING, styles, isRtl, font);
                currentY += elementHeight;
            } else {
                // Other unsplittable blocks (e.g., image-only paragraphs, blockquotes)
                const elementHeight = calculateElementHeight(node, styles);
                if (elementHeight > availableBodyHeight || (currentY + elementHeight > BODY_END_Y && currentY > BODY_START_Y)) {
                    slide = createNewSlideForOverflow();
                    currentY = BODY_START_Y;
                }
                await renderNodeOnSlide(slide, node, currentY, elementHeight - ELEMENT_PADDING, styles, isRtl, font);
                currentY += elementHeight;
            }
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
            { placeholder: { options: { name: 'title', type: 'title', x: CONTENT_X, y: TITLE_Y, w: CONTENT_WIDTH, h: TITLE_H, margin: 0, ...contentTitleStyle, rtlMode: isRtl } } },
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
