import type { PptxConversionOptions } from '@/modules/templates/infrastructure/exporters/pptx/markdown-to-pptx-converter';
import { templates } from '@/modules/templates/infrastructure/PptxStyles';
import type { Root as MdastRoot } from 'mdast';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

import { PdfExportService } from '@/modules/ai-content/infrastructure/exporters/PdfExportService';
import { container } from '@/infrastructure/di/container';
import { splitAstIntoSlides } from '@/modules/templates/infrastructure/exporters/pptx/ast-utils';
import { DEFAULT_CODE_FONT, DEFAULT_FONT } from '@/modules/templates/infrastructure/exporters/pptx/constants';
import { processPlantUml } from '@/modules/ai/domain/utils/plantuml-utils';

export async function convertMarkdownToPdf(
    markdown: string,
    fileName: string,
    options: PptxConversionOptions = {},
) {
    const { styles = templates.modern.styles } = options;

    const processedMarkdown = await processPlantUml(markdown);
    const ast = unified().use(remarkParse).use(remarkGfm).parse(processedMarkdown) as MdastRoot;
    const slidesContent = splitAstIntoSlides(ast);

    const pdfContainer = document.createElement('div');
    pdfContainer.style.position = 'absolute';
    pdfContainer.style.left = '-9999px';
    pdfContainer.style.width = '1024px'; // A fixed width for consistent rendering
    document.body.appendChild(pdfContainer);

    let slidesHtml = '';
    for (const slideAst of slidesContent) {
        // Convert each slide's mdast to HTML
        const file = await unified()
            .use(remarkRehype, { allowDangerousHtml: true })
            .use(rehypeSanitize) // Sanitize HTML to prevent XSS attacks
            .use(rehypeStringify, { allowDangerousHtml: true })
            .run(slideAst);

        const slideHtml = unified().use(rehypeStringify).stringify(file);

        slidesHtml += `<div class="pdf-slide">${slideHtml}</div>`;
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
    pdfContainer.appendChild(styleElement);

    const contentDiv = document.createElement('div');
    contentDiv.innerHTML = slidesHtml;
    pdfContainer.appendChild(contentDiv);

    await container.resolve(PdfExportService).exportFromElement(pdfContainer, `${fileName}.pdf`);

    document.body.removeChild(pdfContainer);
}
