

'use client';

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import { type Root as MdastRoot, type RootContent, type Heading } from 'mdast';
import { Chapter, Section, type ProjectContent } from '@/lib/models';
import { getNodeText } from '@/lib/pptx-convert/ast-utils';

/**
 * Parses a markdown string and converts it into a structured array of Chapter and Section objects.
 * This function understands chapter/section hierarchy based on heading levels.
 *
 * @param markdown - The raw markdown string to parse.
 * @param existingContent - The current project content to preserve IDs and properties.
 * @returns An array of Chapter and Section objects.
 */
export function parseMarkdownToContent(markdown: string, existingContent: ProjectContent): ProjectContent {
  const ast = unified().use(remarkParse).use(remarkGfm).parse(markdown) as MdastRoot;
  const newContent: ProjectContent = [];
  let currentChapter: Chapter | null = null;
  let currentSection: Section | null = null;
  let accumulatedContent: RootContent[] = [];

  const findExistingItem = (title: string, isChapter: boolean) => {
    for (const item of existingContent) {
      if (isChapter && item instanceof Chapter && item.title === title) {
        return item;
      }
      if (!isChapter && item instanceof Chapter) {
        const found = item.sections.find(s => s.title === title);
        if (found) return found;
      }
    }
    return undefined;
  };
  
  const flushSection = () => {
    if (currentSection) {
      const sectionMarkdown = unified().use(remarkGfm).use(remarkStringify).stringify({ type: 'root', children: accumulatedContent }).trim();
      currentSection = currentSection.with({ content: sectionMarkdown });

      if (currentChapter) {
        currentChapter = currentChapter.addSection(currentSection);
      } else {
        // This case for top-level sections is now less likely
        // but kept for robustness.
        newContent.push(currentSection);
      }
    }
    accumulatedContent = [];
  };

  const flushChapter = () => {
    flushSection(); // Flush any pending section first
    if (currentChapter) {
      newContent.push(currentChapter);
    }
    currentChapter = null;
  };


  for (const node of ast.children) {
    if (node.type === 'heading') {
      const title = getNodeText(node).trim();
      if (node.depth === 1) { // It's a Chapter
        flushChapter(); // Save the previous chapter
        const existingChapter = findExistingItem(title, true) as Chapter | undefined;
        currentChapter = new Chapter({ id: existingChapter?.id, title: title, sections: [] });
      } else { // It's a Section (or sub-section, treated as content)
        if (currentChapter) { // Sections must belong to a chapter
           flushSection(); // Save the previous section
           const existingSection = findExistingItem(title, false) as Section | undefined;
           currentSection = new Section({
             id: existingSection?.id,
             title: title,
             type: existingSection?.type || 'report',
             controls: existingSection?.controls,
             prompt: existingSection?.prompt,
           });
        } else {
            // If there's no chapter, treat as content of the last section
            accumulatedContent.push(node);
        }
      }
    } else {
      accumulatedContent.push(node);
    }
  }

  // Flush any remaining content at the end
  flushChapter();
  
  return newContent;
}
