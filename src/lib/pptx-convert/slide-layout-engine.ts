import PptxGenJS from 'pptxgenjs';
import { type Root as MdastRoot, type RootContent, type Paragraph, type List, type ListItem, type FootnoteDefinition } from 'mdast';

import type { PptxStyleOptions } from '@/lib/types';
import { POINTS_PER_INCH, DEFAULT_FONT, DEFAULT_CODE_FONT, layout } from './constants';
import { calculateLineCount, calculateCodeLineCount } from './text-measurement';
import { getNodeText } from './ast-utils';
import { renderNodeOnSlide, transformInlinesToPptxText } from './pptx-renderer';

// These types were in the main file, moving them here as they are primarily used by the layout engine.
export interface FontOptions {
    default?: string; // For LTR languages
    rtl?: string;     // For RTL languages like Arabic
    code?: string;    // For code blocks and inline code
}

interface PptxFootnote {
    id: number;
    textRuns: PptxGenJS.TextProps[];
}

/**
 * Extracts font properties from style objects with fallbacks.
 */
function getFontProperties(
    primaryStyle: PptxGenJS.TextPropsOptions | undefined,
    fallbackStyle: PptxGenJS.TextPropsOptions,
) {
    const defaultFontSize = 18;
    const fontFace = primaryStyle?.fontFace || fallbackStyle.fontFace || DEFAULT_FONT;
    const fontSize = typeof primaryStyle?.fontSize === 'number'
        ? primaryStyle.fontSize
        : (typeof fallbackStyle.fontSize === 'number' ? fallbackStyle.fontSize : defaultFontSize);
    const lineSpacing = primaryStyle?.lineSpacing || fallbackStyle.lineSpacing || (fontSize * 1.2);
    const lineHeight = lineSpacing / POINTS_PER_INCH;
    return { fontFace, fontSize, lineHeight };
}

/**
 * Calculates the estimated height of a markdown AST node for PPTX layout purposes.
 */
function calculateElementHeight(node: RootContent, styles: PptxStyleOptions, widthInches: number = layout.CONTENT_WIDTH): number {
    switch (node.type) {
        case 'paragraph': {
            if (node.children.length === 1 && node.children[0].type === 'image') {
                return layout.IMAGE_H + layout.ELEMENT_PADDING;
            }
            const paraText = getNodeText(node);
            const { fontFace, fontSize, lineHeight } = getFontProperties(styles.body, {}); // styles.body is always defined
            const lineCount = calculateLineCount(paraText, fontFace, fontSize, widthInches);
            return (lineCount * lineHeight) + layout.ELEMENT_PADDING;
        }

        case 'list': {
            let totalHeight = 0;
            for (const item of node.children) {
                totalHeight += calculateListItemHeight(item, styles, widthInches);
            }
            return totalHeight + layout.ELEMENT_PADDING;
        }
        case 'blockquote': {
            const bqText = getNodeText(node);
            const { fontFace, fontSize, lineHeight } = getFontProperties(styles.blockquote, styles.body);
            const lineCount = calculateLineCount(bqText, fontFace, fontSize, widthInches);
            return (lineCount * lineHeight) + layout.ELEMENT_PADDING;
        }
        case 'table': {
            let totalTableHeight = 0;
            const tableStyle = styles.table || {};
            const numColumns = node.children[0]?.children.length || 1;
            const columnWidth = widthInches / numColumns;

            for (const [rowIndex, rowNode] of node.children.entries()) {
                let maxLinesInRow = 1;
                const isHeader = rowIndex === 0;
                const cellStyle = isHeader ? styles.tableHeaderStyle : styles.tableCellStyle;

                const fontFace = cellStyle?.fontFace || tableStyle.fontFace || styles.body.fontFace || DEFAULT_FONT;
                const fontSize = cellStyle?.fontSize || tableStyle.fontSize || 14;
                const lineHeight = (fontSize * 1.2) / POINTS_PER_INCH;

                for (const cellNode of rowNode.children) {
                    const cellText = getNodeText(cellNode);
                    const lineCountInCell = calculateLineCount(cellText, fontFace, fontSize, columnWidth);
                    if (lineCountInCell > maxLinesInRow) {
                        maxLinesInRow = lineCountInCell;
                    }
                }
                totalTableHeight += maxLinesInRow * lineHeight * 1.2;
            }
            return totalTableHeight + layout.ELEMENT_PADDING;
        }

        case 'code': {
            const codeText = node.value;
            const codeFontSize = styles.code?.fontSize || 12;
            const codeFontFace = styles.code?.fontFace || DEFAULT_CODE_FONT;
            const codeLineHeight = (codeFontSize * 1.4) / POINTS_PER_INCH;
            const lineCount = calculateCodeLineCount(codeText, codeFontFace, codeFontSize, widthInches);
            return (lineCount * codeLineHeight) + layout.ELEMENT_PADDING;
        }

        default:
            return layout.ELEMENT_PADDING;
    }
}

/**
 * Calculates the estimated height of a list item node.
 */
function calculateListItemHeight(item: ListItem, styles: PptxStyleOptions, widthInches: number = layout.CONTENT_WIDTH): number {
    let totalHeight = 0;
    for (const contentNode of item.children) {
        totalHeight += calculateElementHeight(contentNode, styles, widthInches);
    }
    return totalHeight;
}

/**
 * Splits an array of title runs into title and subtitle parts based on a colon.
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

    const firstNode = bodyNodes[0];
    if (firstNode?.type === 'heading') {
        const rawTitleRuns = await transformInlinesToPptxText(firstNode.children, {}, styles, isRtl, fonts, footnoteIdMap);
        newTitleRuns = splitTitleRuns(rawTitleRuns, styles);

        slide.addText(newTitleRuns, { placeholder: 'title' });
        bodyNodes = bodyNodes.slice(1);
    } else if (lastTitleRuns) {
        slide.addText(lastTitleRuns, { placeholder: 'title' });
    }

    return { newTitleRuns, bodyNodes };
}

/**
 * Extracts footnote definitions from the slide's AST.
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
 */
function processSpeakerNotes(slide: PptxGenJS.Slide, bodyNodes: RootContent[]): RootContent[] {
    const lastNodeIndex = bodyNodes.length - 1;
    const lastNode = bodyNodes[lastNodeIndex];

    if (lastNode?.type === 'blockquote') {
        const firstPara = lastNode.children[0];
        if (firstPara?.type === 'paragraph') {
            const firstParaText = getNodeText(firstPara).trim();

            if (firstParaText.match(/^(Speaker\s*)?Notes:/i)) {
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
    return bodyNodes;
}

/**
 * Calculates the estimated height of an array of PptxGenJS TextProps runs.
 */
function calculateRunsHeight(runs: PptxGenJS.TextProps[], styles: PptxStyleOptions): number {
    const fontFace = styles.body.fontFace || DEFAULT_FONT;
    const fontSize = typeof styles.body.fontSize === 'number' ? styles.body.fontSize : 18;
    const lineHeight = (styles.body.lineSpacing || fontSize * 1.2) / POINTS_PER_INCH;

    const totalText = runs.map(r => r.text || '').join('');
    const lineCount = calculateLineCount(totalText, fontFace, fontSize, layout.CONTENT_WIDTH);
    return (lineCount * lineHeight) + layout.ELEMENT_PADDING;
}

/**
 * Splits an array of TextProps into two parts based on available vertical space.
 */
function splitRunsByHeight(
    allRuns: PptxGenJS.TextProps[],
    availableHeight: number,
    styles: PptxStyleOptions
): { current: PptxGenJS.TextProps[], remaining: PptxGenJS.TextProps[] } {
    const fontFace = styles.body.fontFace || DEFAULT_FONT;
    const fontSize = typeof styles.body.fontSize === 'number' ? styles.body.fontSize : 18;
    const lineHeight = (styles.body.lineSpacing || fontSize * 1.2) / POINTS_PER_INCH;

    const maxLines = Math.floor(availableHeight / lineHeight);
    if (maxLines <= 0) {
        return { current: [], remaining: allRuns };
    }

    const totalText = allRuns.map(r => r.text || '').join('');
    if (calculateLineCount(totalText, fontFace, fontSize, layout.CONTENT_WIDTH) <= maxLines) {
        return { current: allRuns, remaining: [] };
    }

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

    if (splitRunIndex === -1) {
        return { current: allRuns, remaining: [] };
    }

    const runToSplit = allRuns[splitRunIndex];
    const textToSplit = runToSplit.text || '';
    const wordsAndSpaces = textToSplit.split(/(\s+)/);

    const baseText = runsBeforeSplit.map(r => r.text || '').join('');
    let textForCurrentRun = '';

    for (const word of wordsAndSpaces) {
        const testText = baseText + textForCurrentRun + word;
        if (calculateLineCount(testText, fontFace, fontSize, layout.CONTENT_WIDTH) > maxLines && textForCurrentRun.length > 0) {
            break;
        }
        textForCurrentRun += word;
    }

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
    options: { bullet?: PptxGenJS.TextPropsOptions['bullet']; x?: number; w?: number; } = {}
): Promise<{ slide: PptxGenJS.Slide; y: number }> {
    let textRuns = await transformInlinesToPptxText(node.children, styles.body, styles, isRtl, fonts, footnoteIdMap);
    let y = currentY;
    let currentSlide = slide;
    let isFirstChunk = true;

    while (textRuns.length > 0) {
        const availableHeight = bodyEndY - y;
        const lineHeight = (styles.body.lineSpacing || (styles.body.fontSize || 18) * 1.2) / POINTS_PER_INCH;
        if (availableHeight < lineHeight) {
            currentSlide = createNewSlide();
            y = layout.BODY_START_Y;
            continue;
        }

        const { current, remaining } = splitRunsByHeight(textRuns, availableHeight, styles);

        if (current.length === 0 && remaining.length > 0) {
            currentSlide = createNewSlide();
            y = layout.BODY_START_Y;
            continue;
        }

        if (current.length > 0) {
            const heightForTheseRuns = calculateRunsHeight(current, styles);
            const renderHeight = Math.min(heightForTheseRuns - layout.ELEMENT_PADDING, availableHeight);
            const textOptions: PptxGenJS.TextPropsOptions = {
                x: options.x ?? layout.CONTENT_X, y, w: options.w ?? layout.CONTENT_WIDTH, h: renderHeight,
                ...styles.body, rtlMode: isRtl, align: isRtl ? 'right' : styles.body.align
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
 */
async function processListNode(
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

    if (elementHeight > availableBodyHeight || (currentY + elementHeight > bodyEndY && currentY > bodyStartY)) {
        return { slide: createNewSlide(), y: bodyStartY };
    }

    return { slide: currentSlide, y: currentY };
}

/**
 * Creates and populates slides based on the provided content ASTs.
 */
export async function createSlidesWithContent(
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
        const isCover = slideCount === 0 && !slideAst.children.some(node => node.type === 'heading');
        const masterName = isCover ? masterNames.cover : masterNames.content;

        let slide = pptx.addSlide({ masterName });
        slideCount++;

        const { footnoteIdMap, footnotes } = await processFootnotesForPptx(slideAst, styles, isRtl, font);

        let { newTitleRuns, bodyNodes } = await processSlideTitleAndSubtitle(slide, slideAst, lastTitleRuns, styles, isRtl, font, footnoteIdMap);
        lastTitleRuns = newTitleRuns;

        bodyNodes = bodyNodes.filter(node => node.type !== 'footnoteDefinition');
        bodyNodes = processSpeakerNotes(slide, bodyNodes);

        let currentY = layout.BODY_START_Y;

        const FOOTNOTE_AREA_HEIGHT = 0.75;
        const bodyEndY = footnotes.length > 0 ? layout.BODY_END_Y - FOOTNOTE_AREA_HEIGHT : layout.BODY_END_Y;

        const createNewSlideForOverflow = () => {
            const newSlide = pptx.addSlide({ masterName: masterNames.content });
            if (lastTitleRuns) {
                newSlide.addText(lastTitleRuns, { placeholder: 'title' });
            }
            return newSlide;
        };

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
