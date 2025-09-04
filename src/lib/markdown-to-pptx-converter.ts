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
            let listLines = 0;
            for (const item of node.children) {
                const itemText = getNodeText(item);
                // Each list item is at least one line, plus wrapped lines.
                listLines += Math.max(1, Math.ceil(itemText.length / charsPerLine));
            }
            return (listLines * bodyLineHeight) + ELEMENT_PADDING;
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
async function renderList(slide: PptxGenJS.Slide, node: List, y: number, h: number, styles: PptxStyleOptions, isRtl = false, fonts: FontOptions = {}) {
    let currentY = y;
    let accumulatedRuns: PptxGenJS.TextProps[] = [];
    let accumulatedParaNodes: Paragraph[] = [];

    const defaultFont = isRtl ? fonts.rtl : fonts.default;
    const bodyStyle = { ...styles.body };
    if (defaultFont) bodyStyle.fontFace = defaultFont;

    const renderAccumulatedRuns = () => {
        if (accumulatedRuns.length > 0) {
            let height = 0;
            for (const pNode of accumulatedParaNodes) {
                height += calculateElementHeight(pNode, styles) - ELEMENT_PADDING;
            }

            slide.addText(accumulatedRuns, {
                x: CONTENT_X, y: currentY, w: CONTENT_WIDTH, h: height,
                ...bodyStyle,
                bullet: { type: node.ordered ? 'number' : (styles.bullet?.type || 'bullet') },
                rtlMode: isRtl,
                align: isRtl ? 'right' : styles.body.align,
            });

            currentY += height;
            accumulatedRuns = [];
            accumulatedParaNodes = [];
        }
    };

    const processList = async (listNode: List, level: number) => {
        for (const [i, item] of listNode.children.entries()) {
            for (const [contentIndex, contentNode] of item.children.entries()) {
                if (contentNode.type === 'paragraph') {
                    const paraRuns = await transformInlinesToPptxText(contentNode.children, {}, styles, isRtl, fonts);
                    if (paraRuns.length > 0) {
                        if (contentIndex === 0) {
                            const cleanedText = (paraRuns[0].text || '').replace(/^\s*([*+-]|\d+[.)])\s*/, '');
                            paraRuns[0].text = '\t'.repeat(level) + cleanedText;
                        } else {
                            accumulatedRuns.push({ text: '\n' });
                        }
                        accumulatedRuns.push(...paraRuns);
                        accumulatedParaNodes.push(contentNode);
                    }
                } else if (contentNode.type === 'table' || contentNode.type === 'list') {
                    renderAccumulatedRuns();
                    const elementHeight = calculateElementHeight(contentNode, styles);
                    if (contentNode.type === 'table') {
                        await renderTable(slide, contentNode, currentY, elementHeight - ELEMENT_PADDING, styles, isRtl, fonts);
                    } else { // it's a list
                        await renderList(slide, contentNode, currentY, elementHeight - ELEMENT_PADDING, styles, isRtl, fonts);
                    }
                    currentY += elementHeight;
                }
            }
            if (i < listNode.children.length - 1) {
                const lastChild = item.children[item.children.length - 1];
                if (lastChild.type === 'paragraph') {
                    accumulatedRuns.push({ text: '\n' });
                }
            }
        }
    };

    await processList(node, 0);

    renderAccumulatedRuns();
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
async function renderTable(slide: PptxGenJS.Slide, node: Table, y: number, h: number, styles: PptxStyleOptions, isRtl = false, fonts: FontOptions = {}) {
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
            await renderTable(slide, node, y, h, styles, isRtl, fonts);
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

        // don't remove this logic
        // New logic to add a line break after a colon
        const runsWithBreaks: PptxGenJS.TextProps[] = [];
        let colonFoundAndHandled = false;

        for (let i = 0; i < titleRuns.length; i++) {
            const run = titleRuns[i];

            if (!colonFoundAndHandled && run.text?.includes(':')) {
                const splitIndex = run.text.indexOf(':');
                const beforeColon = run.text.substring(0, splitIndex);
                const afterColon = run.text.substring(splitIndex + 1);

                if (beforeColon) {
                    runsWithBreaks.push({ text: beforeColon, options: run.options });
                }
                runsWithBreaks.push({ text: '\n', options: run.options }); // Add new line after colon
                if (afterColon.trim()) {
                    runsWithBreaks.push({ text: afterColon.trim(), options: { ...run.options, ...styles.subtitle } });
                } else if (i + 1 < titleRuns.length) { // If there's content after the colon in the next run
                    const nextRun = titleRuns[i + 1];
                    if (nextRun.text) nextRun.text = nextRun.text.trimStart();
                    nextRun.options = { ...(nextRun.options || {}), breakLine: true };
                }
                colonFoundAndHandled = true;
            } else {
                runsWithBreaks.push(run);
            }
        }

        newTitleRuns = colonFoundAndHandled ? runsWithBreaks : titleRuns;
        slide.addText(newTitleRuns, { placeholder: 'title' });
        bodyNodes = bodyNodes.slice(1);
    } else if (lastTitleRuns) {
        slide.addText(lastTitleRuns, { placeholder: 'title' });
    }

    // Process subtitle from '**Text:**' paragraph
    const firstBodyNode = bodyNodes[0];
    if (firstBodyNode?.type === 'paragraph' && firstBodyNode.children[0]?.type === 'strong' && getNodeText(firstBodyNode.children[0]).trim() === 'Text:') {
        const subtitleNodes = firstBodyNode.children.slice(1);
        if (subtitleNodes.length > 0 && subtitleNodes[0].type === 'text') {
            subtitleNodes[0].value = subtitleNodes[0].value.trimStart();
        }
        const subtitleStyle: PptxGenJS.TextPropsOptions = { ...styles.body, ...styles.subtitle };
        const subtitleRuns = await transformInlinesToPptxText(subtitleNodes, subtitleStyle, styles, isRtl, fonts);
        if (subtitleRuns.length > 0) {
            slide.addText(subtitleRuns, { x: CONTENT_X, y: SUBTITLE_Y, w: CONTENT_WIDTH, h: SUBTITLE_H, ...subtitleStyle, rtlMode: isRtl, align: isRtl ? 'right' : subtitleStyle.align });
        }
        bodyNodes = bodyNodes.slice(1);
    }

    return { newTitleRuns, bodyNodes };
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
    masterName: string,
    isRtl = false,
    font: FontOptions = {}
) {
    let lastTitleRuns: PptxGenJS.TextProps[] | null = null;

    for (const slideAst of slidesContent) {
        let slide = pptx.addSlide({ masterName });

        const { newTitleRuns, bodyNodes } = await processSlideTitleAndSubtitle(slide, slideAst, lastTitleRuns, styles, isRtl, font);
        lastTitleRuns = newTitleRuns;

        let currentY = BODY_START_Y;

        const createNewSlideForOverflow = () => {
            const newSlide = pptx.addSlide({ masterName: masterName });
            if (lastTitleRuns) {
                newSlide.addText(lastTitleRuns, { placeholder: 'title' });
            }
            return newSlide;
        };

        const availableBodyHeight = BODY_END_Y - BODY_START_Y;

        for (const node of bodyNodes) {
            if (node.type === 'list') {
                // Lists are processed item by item to allow breaking across slides.
                // This logic is an adaptation of `renderList` with overflow handling.
                const processListItems = async (listNode: List, level: number) => {
                    for (const item of listNode.children) {
                        for (const contentNode of item.children) {
                            const elementHeight = calculateElementHeight(contentNode, styles);

                            if (currentY + elementHeight > BODY_END_Y && currentY > BODY_START_Y) {
                                slide = createNewSlideForOverflow();
                                currentY = BODY_START_Y;
                            }

                            // To render a single list item's content with the correct bullet,
                            // we create a temporary list node containing only that content.
                            const tempListWithOneItem: List = {
                                type: 'list',
                                ordered: listNode.ordered,
                                children: [{ type: 'listItem', children: [contentNode] }],
                            };
                            await renderList(slide, tempListWithOneItem, currentY, elementHeight - ELEMENT_PADDING, styles, isRtl, font);
                            currentY += elementHeight;
                        }
                    }
                };
                await processListItems(node, 0);
            } else {
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
    const masterName = 'ARKAN_MASTER';

    const titleStyle = { ...styles.title };
    const defaultFont = isRtl ? fonts.rtl : fonts.default;
    if (defaultFont) titleStyle.fontFace = defaultFont;

    pptx.defineSlideMaster({
        title: masterName,
        background: styles.background,
        objects: [
            { placeholder: { options: { name: 'title', type: 'title', x: CONTENT_X, y: TITLE_Y, w: CONTENT_WIDTH, h: TITLE_H, margin: 0, ...titleStyle, rtlMode: isRtl, align: isRtl ? 'right' : styles.title.align } } },
            // Body placeholder is removed to allow manual placement of mixed content types.
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

    await createSlidesWithContent(pptx, slidesContent, styles, masterName, isRtl, fonts);

    await pptx.writeFile({ fileName: `${fileName}.pptx` });
}
