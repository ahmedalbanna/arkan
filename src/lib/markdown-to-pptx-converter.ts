import PptxGenJS from 'pptxgenjs';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm'; // Import remarkGfm
import remarkRehype from 'remark-rehype';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import { type Root as MdastRoot, type ListItem } from 'mdast';
import { templates } from '@/lib/pptx-styles'; // Keep for default styles
import { processPlantUml, arrayBufferToBase64, getProxiedImageBuffer } from '@/lib/utils';
import type { PptxStyleOptions } from '@/lib/types';
import { exportComponentAsPDF } from './pdf-exporter';
import { DEFAULT_FONT, DEFAULT_CODE_FONT, layout } from './pptx-convert/constants';
import { getNodeText, splitAstIntoSlides } from './pptx-convert/ast-utils';
import { createSlidesWithContent, type FontOptions } from './pptx-convert/slide-layout-engine';

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
        }, ],
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

export async function convertMarkdownToPdf(
    markdown: string,
    fileName: string,
    options: PptxConversionOptions = {},
) {
    const { styles = templates.modern.styles } = options;

    const processedMarkdown = processPlantUml(markdown);
    const ast = unified().use(remarkParse).use(remarkGfm).parse(processedMarkdown) as MdastRoot;
    const slidesContent = splitAstIntoSlides(ast);

    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '1024px'; // A fixed width for consistent rendering
    document.body.appendChild(container);

    let slidesHtml = '';
    for (const slideAst of slidesContent) {
        // Convert each slide's mdast to HTML
        const file = await unified()
            .use(remarkRehype, { allowDangerousHtml: true })
            .use(rehypeSanitize) // Sanitize HTML to prevent XSS attacks
            .use(rehypeStringify, { allowDangerousHtml: true })
            .run(slideAst);

        const slideHtml = unified().use(rehypeStringify).stringify(file);

        slidesHtml += `<div className="pdf-slide">${slideHtml}</div>`;
    }

    // Basic styling to make it look like slides
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      .pdf-slide {
        background-color: #${styles.background?.color || 'FFFFFF'};
        color: #${styles.body.color || '000000'};
        font-family: ${styles.body.fontFace || DEFAULT_FONT};
        font-size: ${styles.body.fontSize ? `${styles.body.fontSize * 0.75}pt` : '14pt'};
        width: 100%;
        height: 576px; /* 1024 * 9 / 16 */
        padding: 40px;
        margin-bottom: 20px;
        border: 1px solid #ccc;
        box-sizing: border-box;
        page-break-after: always;
        display: flex;
        flex-direction: column;
      }
      .pdf-slide h1 {
        color: #${styles.title.color || '000000'};
        font-family: ${styles.title.fontFace || DEFAULT_FONT};
        font-size: ${styles.title.fontSize ? `${styles.title.fontSize * 1.5}pt` : '28pt'};
        font-weight: ${styles.title.bold ? 'bold' : 'normal'};
        text-align: ${styles.title.align || 'left'};
        margin-bottom: 20px;
        flex-shrink: 0;
      }
      .pdf-slide h2 { font-size: 1.5em; margin-top: 1em; margin-bottom: 0.5em; }
      .pdf-slide p { margin-bottom: 1em; }
      .pdf-slide ul, .pdf-slide ol { margin-left: 2em; margin-bottom: 1em; }
      .pdf-slide blockquote { border-left: 4px solid #${styles.blockquote?.color || 'cccccc'}; padding-left: 1em; margin-left: 0; font-style: italic; color: #${styles.blockquote?.color || '666666'}; }
      .pdf-slide table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
      .pdf-slide th, .pdf-slide td { border: 1px solid #${styles.table?.border?.color || 'dddddd'}; padding: 8px; }
      .pdf-slide th { background-color: #${styles.tableHeaderStyle?.fill?.color || 'f2f2f2'}; }
      .pdf-slide pre { background-color: #${styles.code?.fill?.color || 'f5f5f5'}; padding: 1em; border-radius: 4px; overflow-x: auto; }
      .pdf-slide code { font-family: ${styles.code?.fontFace || DEFAULT_CODE_FONT}, monospace; }
      .pdf-slide img { max-width: 80%; max-height: 250px; height: auto; display: block; margin: 1em auto; }
    `;
    container.appendChild(styleElement);

    const contentDiv = document.createElement('div');
    contentDiv.innerHTML = slidesHtml;
    container.appendChild(contentDiv);

    await exportComponentAsPDF(container, `${fileName}.pdf`);

    document.body.removeChild(container);
}
