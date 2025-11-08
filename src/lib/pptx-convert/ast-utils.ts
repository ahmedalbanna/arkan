import type { Root as MdastRoot, PhrasingContent, RootContent, Text } from 'mdast';
import { visit } from 'unist-util-visit';
import { SLIDE_BREAK_COMMENT } from './constants';

/**
 * Extracts all text content from an mdast node.
 * @param node The mdast node to extract text from.
 * @returns The concatenated text content.
 */
export function getNodeText(node: RootContent | PhrasingContent): string {
    let text = '';
    visit(node, 'text', (textNode: Text) => { text += textNode.value; });
    return text;
}

/**
 * Splits the main markdown AST into an array of slide ASTs based on headings and thematic breaks.
 * @param ast The root mdast node.
 * @returns An array of slide-specific mdast roots.
 */
export function splitAstIntoSlides(ast: MdastRoot): MdastRoot[] {
    const slides: MdastRoot[] = [];
    if (!ast.children.length) return slides;

    const hasMeaningfulContent = (nodes: RootContent[]): boolean => {
        return nodes.some(node => {
            if (node.type === 'paragraph') {
                return (node.children.length === 1 && node.children[0].type === 'image') || getNodeText(node).trim() !== '';
            }
            // Ignore slide breaks for this check
            return node.type !== 'thematicBreak' && !(node.type === 'html' && node.value.includes(SLIDE_BREAK_COMMENT));
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
        const isHtmlSlideBreak = node.type === 'html' && node.value.includes(SLIDE_BREAK_COMMENT);
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
