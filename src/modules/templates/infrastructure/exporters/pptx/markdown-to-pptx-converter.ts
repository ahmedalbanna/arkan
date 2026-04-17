import { templates } from '@/modules/templates/infrastructure/PptxStyles';
import { type ListItem, type Root as MdastRoot } from 'mdast';
import PptxGenJS from 'pptxgenjs';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { getNodeText, splitAstIntoSlides } from '@/modules/templates/infrastructure/exporters/pptx/ast-utils';
import { layout } from '@/modules/templates/infrastructure/exporters/pptx/constants';
import { createSlidesWithContent, type FontOptions } from '@/modules/templates/infrastructure/exporters/pptx/slide-layout-engine';
import { processPlantUml } from '@/infrastructure/services/plantuml/plantuml-utils';
import { PptxStyleOptions } from '@/modules/ai/domain/schemas';
import { cleanAiOutput } from '@/infrastructure/utils/sanitizer';

/**
 * markdown-to-pptx-converter — Production-grade slide-deck synthesis engine.
 * Converts neural markdown into professional PowerPoint presentation blobs.
 * 
 * DEFENSIVE MEASURES:
 * 1. Spectral Sanitization: Enforces cleanAiOutput on all incoming markdown.
 * 2. AST Containment: Wraps unified/pptxgen pipeline in try-catch blocks.
 * 3. Style Existence Guards: Safe fallback logic for missing template parameters.
 * 4. Layout Stability: Ensures TOC generation handles malformed AST headings safely.
 */

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
    try {
        const pptx = new PptxGenJS();
        
        // 1. DATA VALIDATION — Guarded style and font resolution
        const { styles = templates.modern.styles, isRtl = false, fonts = {}, includeToc = false } = options;
        if (!styles || !styles.title) {
            throw new Error('Production styles manifest is corrupted or unavailable.');
        }

        pptx.rtlMode = isRtl;
        pptx.layout = 'LAYOUT_16x9';
        const COVER_MASTER = 'COVER_MASTER';
        const CONTENT_MASTER = 'CONTENT_MASTER';

        const titleStyle = { ...styles.title };
        const defaultFont = isRtl ? fonts.rtl : fonts.default;
        if (defaultFont) titleStyle.fontFace = defaultFont;

        const coverTitleStyle = { ...titleStyle, align: 'center', valign: 'middle', fontSize: 44 };
        const contentTitleStyle = { ...titleStyle, align: isRtl ? 'right' : styles.title.align };

        // 2. MASTER DEFINITION — Safe configuration
        pptx.defineSlideMaster({
            title: COVER_MASTER,
            background: styles.background,
            objects: [
                {
                    placeholder: { // @ts-ignore
                        options: { name: 'title', type: 'title', x: 0.5, y: 0, w: '90%', h: '100%', ...coverTitleStyle, rtlMode: isRtl }, 
                    },
                },
            ],
        });

        pptx.defineSlideMaster({
            title: CONTENT_MASTER,
            background: styles.background,
            objects: [{
                placeholder: { options: { name: 'title', type: 'title', x: layout.CONTENT_X, y: layout.TITLE_Y, w: layout.CONTENT_WIDTH, h: layout.TITLE_H, margin: 0, ...contentTitleStyle } },
            },],
        });

        pptx.author = options.author || 'Arkan';
        pptx.company = options.company || 'Arkan';
        pptx.subject = options.subject || 'Intelligence Manifest';
        pptx.title = options.title || fileName;

        // 3. SPECTRAL TRANSFORMATION — Guarded AST pipeline
        const cleanMarkdown = cleanAiOutput(markdown);
        const processedMarkdown = await processPlantUml(cleanMarkdown);
        
        let ast: MdastRoot;
        try {
            ast = unified().use(remarkParse).use(remarkGfm).parse(processedMarkdown) as MdastRoot;
        } catch (astError) {
            console.error('[Converter:PPTX] Unified parser failure:', astError);
            throw new Error('Failed to decompose markdown into structural slide nodes.');
        }

        let slidesContent = splitAstIntoSlides(ast);

        // 4. TOC SYNTHESIS — Defensive heading extraction
        if (includeToc && slidesContent.length > 0) {
            const tocItems: ListItem[] = [];
            for (const slideAst of slidesContent) {
                const firstNode = slideAst.children.find(node => node.type === 'heading');
                if (firstNode && firstNode.type === 'heading') {
                    let titleText = getNodeText(firstNode) || 'Untitled Segment';
                    if (titleText.includes(':')) titleText = titleText.split(':')[1].trim();

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
                        { type: 'heading', depth: 1, children: [{ type: 'text', value: isRtl ? 'فهرس المحتويات' : 'Table of Contents' }] },
                        { type: 'list', ordered: true, start: 1, spread: false, children: tocItems }
                    ]
                };
                slidesContent.splice(1, 0, tocSlideAst);
            }
        }

        // 5. PRODUCTION RENDER
        await createSlidesWithContent(pptx, slidesContent, styles, { cover: COVER_MASTER, content: CONTENT_MASTER }, isRtl, fonts);

        if (typeof window === 'undefined') {
            return await pptx.write('nodebuffer' as any) as Buffer;
        } else {
            return await pptx.write('blob' as any) as Blob;
        }
    } catch (error) {
        console.error('[Converter:PPTX] Critical generation crash:', error);
        throw new Error(`Slide synthesis pipeline halted: ${error instanceof Error ? error.message : 'Unknown neural error'}`);
    }
}
