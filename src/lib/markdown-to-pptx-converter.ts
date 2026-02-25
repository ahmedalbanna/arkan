import { templates } from '@/modules/templates/infrastructure/PptxStyles'; // Keep for default styles
import type { PptxStyleOptions } from '@/lib/types';
import { type ListItem, type Root as MdastRoot } from 'mdast';
import PptxGenJS from 'pptxgenjs';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm'; // Import remarkGfm
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { exportComponentAsPDF } from '@/modules/ai-content/infrastructure/exporters/PdfExporter';
import { getNodeText, splitAstIntoSlides } from './pptx-convert/ast-utils';
import { DEFAULT_CODE_FONT, DEFAULT_FONT, layout } from './pptx-convert/constants';
import { createSlidesWithContent, type FontOptions } from './pptx-convert/slide-layout-engine';
import { processPlantUml } from './utils/processPlantUml';
import { convertMarkdownToPdf } from './utils/pdf-utils'; // Import the moved function

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

export async function convertMarkdownToPptx(
    markdown: string,
    fileName: string,
    options: PptxConversionOptions = {},
): Promise<Buffer | Blob> {
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
                placeholder: { // @ts-ignore
                    options: { name: 'title', type: 'title', x: 0.5, y: 0, w: '90%', h: '100%', ...coverTitleStyle, rtlMode: isRtl }, // @ts-ignore
                },
            },
        ],
    });

    // Define Content Slide Master
    pptx.defineSlideMaster({
        title: CONTENT_MASTER,
        background: styles.background,
        objects: [{
            placeholder: { options: { name: 'title', type: 'title', x: layout.CONTENT_X, y: layout.TITLE_Y, w: layout.CONTENT_WIDTH, h: layout.TITLE_H, margin: 0, ...contentTitleStyle } },
        },],
    });

    pptx.layout = 'LAYOUT_16x9';
    pptx.author = options.author || 'Arkan';
    pptx.company = options.company || 'Arkan';
    pptx.subject = options.subject || 'Markdown Presentation';
    pptx.title = options.title || fileName;

    const processedMarkdown = await processPlantUml(markdown);
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

    if (typeof window === 'undefined') {
        return pptx.write('nodebuffer' as any) as Promise<Buffer>;
    } else {
        return pptx.write('blob' as any) as Promise<Blob>;
    }
}

// Keep the PDF export function here but call the implementation from the new file
export { convertMarkdownToPdf };
