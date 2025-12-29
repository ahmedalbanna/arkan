
'use client';

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import { type Root as MdastRoot, type RootContent } from 'mdast';
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
  const newContent: (Chapter | Section)[] = [];

  let currentChapter: Chapter | null = null;
  let currentSection: Section | null = null;
  let accumulatedContent: RootContent[] = [];

  const flushSection = () => {
    if (currentSection) {
      const sectionMarkdown = unified().use(remarkGfm).use(remarkStringify).stringify({ type: 'root', children: accumulatedContent }).trim();
      currentSection = currentSection.with({ content: sectionMarkdown });

      if (currentChapter) {
        currentChapter = currentChapter.addSection(currentSection);
      } else {
        newContent.push(currentSection);
      }
    }
    accumulatedContent = [];
  };

  const flushChapter = () => {
    flushSection();
    if (currentChapter) {
      newContent.push(currentChapter);
    }
  };

  for (const node of ast.children) {
    if (node.type === 'heading') {
      const title = getNodeText(node).trim();
      if (node.depth === 1) { // New Chapter
        flushChapter();
        const existingChapter = existingContent.find(c => c instanceof Chapter && c.title === title) as Chapter | undefined;
        currentChapter = new Chapter({ id: existingChapter?.id, title, sections: [] });
        currentSection = null; // Reset current section
      } else if (node.depth === 2) { // New Section
        flushSection();
        const existingSection = existingContent.flatMap(c => (c instanceof Chapter ? c.sections : [c])).find(s => s.title === title);
        currentSection = new Section({
          id: existingSection?.id,
          title,
          type: existingSection?.type || 'report',
          controls: existingSection?.controls,
          prompt: existingSection?.prompt,
        });
      } else {
        // Lower-level headings are treated as content within the current section
        accumulatedContent.push(node);
      }
    } else {
      accumulatedContent.push(node);
    }
  }

  // Flush any remaining content
  flushChapter();

  // The final content should only be chapters now.
  return newContent.filter(item => item instanceof Chapter) as Chapter[];
}
