import type {
    Blockquote,
    Code,
    Paragraph,
    PhrasingContent,
    RootContent,
    Table
} from 'mdast';
import PptxGenJS from 'pptxgenjs';

import type { PptxStyleOptions } from '@/lib/types';
import { arrayBufferToBase64 } from '@/lib/utils/arrayBufferToBase64';
import { getProxiedImageBuffer } from '../utils/ProxiedImage';
import { DEFAULT_CODE_FONT, layout } from './constants';
import type { FontOptions } from './slide-layout-engine';

/**
 * Transforms inline markdown content (strong, emphasis, links, etc.) into an array of PptxGenJS TextProps runs.
 * This function is intended for PhrasingContent and does not handle block-level elements.
 * @param nodes An array of mdast PhrasingContent nodes.
 * @param baseOptions The base text properties to apply to all runs.
 * @param styles The style options for the presentation.
 * @returns A promise that resolves to an array of PptxGenJS.TextProps.
 */
export async function transformInlinesToPptxText(
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
                const codeFont = fonts.code || styles.inlineCode?.fontFace || DEFAULT_CODE_FONT;
                const codeBaseOptions: PptxGenJS.TextPropsOptions = { ...baseOptions, ...styles.inlineCode };
                delete codeBaseOptions.fontFace;
                runs.push({ text: node.value, options: { ...codeBaseOptions, fontFace: codeFont, rtlMode: false } });
                break;
            case 'text':
                runs.push({ text: node.value, options: { ...currentBaseOptions, rtlMode: isRtl } });
                break;
            case 'link': {
                const linkStyle: PptxGenJS.TextPropsOptions = { ...currentBaseOptions, ...styles.link, underline: styles.link.underline ? { style: 'sng' } : undefined };
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


/** Renders a paragraph node, handling special cases for images and list-like text. */
async function renderParagraph(slide: PptxGenJS.Slide, node: Paragraph, y: number, h: number, styles: PptxStyleOptions, isRtl = false, fonts: FontOptions = {}, footnoteIdMap: Map<string, number> = new Map(), _x: number = layout.CONTENT_X, _w: number = layout.CONTENT_WIDTH) {
    const imageNode = node.children.length === 1 && node.children[0].type === 'image' ? node.children[0] : null;
    if (imageNode) {
        try {
            const proxiedImage = await getProxiedImageBuffer(imageNode.url);
            if (proxiedImage) {
                const base64Image = arrayBufferToBase64(proxiedImage.buffer);
                slide.addImage({
                    data: `data:${proxiedImage.contentType};base64,${base64Image}`,
                    x: layout.IMAGE_X, y, w: layout.IMAGE_W, h: layout.IMAGE_H
                });
            } else {
                throw new Error("Failed to load or proxy image buffer.");
            }
        } catch (error) {
            console.error('Error processing image:', error);
            // If the image fails to load, add a placeholder with an error message.
            slide.addText(`[Image Failed to Load: ${imageNode.alt || imageNode.url}]`, {
                x: layout.IMAGE_X, y, w: layout.IMAGE_W, h: layout.IMAGE_H,
                align: 'center',
                valign: 'middle',
                color: 'FF0000', // Red color for error
                fontSize: 10,
            });
        }
    } else {
        const textRuns = await transformInlinesToPptxText(node.children, styles.body, styles, isRtl, fonts, footnoteIdMap);
        if (textRuns.length === 0) return;
        slide.addText(textRuns, { x: layout.CONTENT_X, y, w: layout.CONTENT_WIDTH, h, ...styles.body, rtlMode: isRtl, align: isRtl ? 'right' : styles.body.align });
    }
}

/** Renders a blockquote node. */
async function renderBlockquote(slide: PptxGenJS.Slide, node: Blockquote, y: number, h: number, styles: PptxStyleOptions, isRtl = false, fonts: FontOptions = {}, footnoteIdMap: Map<string, number> = new Map(), _x: number = layout.CONTENT_X, _w: number = layout.CONTENT_WIDTH) {
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
    slide.addText(textRuns, { x: layout.CONTENT_X, y, w: layout.CONTENT_WIDTH, h, ...blockquoteStyle, rtlMode: isRtl, align: isRtl ? 'right' : blockquoteStyle.align });
}

/** Renders a table node. */
async function renderTable(slide: PptxGenJS.Slide, node: Table, y: number, h: number, styles: PptxStyleOptions, isRtl = false, fonts: FontOptions = {}, _x: number = layout.CONTENT_X, _w: number = layout.CONTENT_WIDTH, footnoteIdMap: Map<string, number> = new Map()) {
    const tableRows: PptxGenJS.TableRow[] = [];
    for (const [rowIndex, rowNode] of node.children.entries()) {
        const tableCells: PptxGenJS.TableCell[] = [];
        for (const cellNode of rowNode.children) {
            const baseCellStyle = rowIndex === 0 ? styles.tableHeaderStyle : styles.tableCellStyle;
            const cellText = await transformInlinesToPptxText(cellNode.children, baseCellStyle, styles, isRtl, fonts, footnoteIdMap);
            const cellOptions: PptxGenJS.TableCellProps = { ...(rowIndex === 0 ? styles.tableHeaderStyle : styles.tableCellStyle) };
            tableCells.push({ text: cellText, options: { ...cellOptions, align: isRtl ? 'right' : cellOptions?.align || styles.table?.align, valign: cellOptions?.valign || styles.table?.valign } });
        }
        tableRows.push(tableCells);
    }
    slide.addTable(tableRows, { x: layout.CONTENT_X, y, w: layout.CONTENT_WIDTH, h, ...styles.table });
}

/** Renders a code block node. */
async function renderCode(slide: PptxGenJS.Slide, node: Code, y: number, h: number, styles: PptxStyleOptions, isRtl = false, fonts: FontOptions = {}, _x: number = layout.CONTENT_X, _w: number = layout.CONTENT_WIDTH) {
    const codeStyle = { ...styles.code };
    if (fonts.code) codeStyle.fontFace = fonts.code;
    slide.addText(node.value, {
        x: layout.CONTENT_X, y, w: layout.CONTENT_WIDTH, h, ...styles.body,
        ...codeStyle,
        rtlMode: isRtl, // Code is always LTR
        align: 'left'   // Code is always LTR
    });
}

/**
 * Renders a markdown AST node onto a slide by dispatching to the appropriate render function.
 */
export async function renderNodeOnSlide(slide: PptxGenJS.Slide, node: RootContent, y: number, h: number, styles: PptxStyleOptions, isRtl = false, fonts: FontOptions = {}, footnoteIdMap: Map<string, number> = new Map(), x: number = layout.CONTENT_X, w: number = layout.CONTENT_WIDTH) {
    switch (node.type) {
        case 'paragraph':
            await renderParagraph(slide, node, y, h, styles, isRtl, fonts, footnoteIdMap, x, w);
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
