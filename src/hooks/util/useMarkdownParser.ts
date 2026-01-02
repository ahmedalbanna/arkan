

'use client';

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import { type Root as MdastRoot, type RootContent } from 'mdast';
import { Chapter, Section, type ProjectContent, type SectionProperties } from '@/lib/models';
import { getNodeText } from '@/lib/pptx-convert/ast-utils';

/**
 * Parses a markdown string and converts it into a structured array of Chapter and Section objects.
 * This function is now more intelligent, handling hierarchy and preserving existing IDs.
 *
 * @param markdown The raw markdown string to parse.
 * @param existingContent The current project content to preserve IDs and properties.
 * @returns An array of Chapter and Section objects.
 */
export function parseMarkdownToContent(markdown: string, existingContent: ProjectContent): ProjectContent {
  const ast = unified().use(remarkParse).use(remarkGfm).parse(markdown) as MdastRoot;
  const newContent: ProjectContent = [];
  let currentChapter: Chapter | null = null;
  let currentSection: Section | null = null;
  let accumulatedContent: RootContent[] = [];

  const findExistingSection = (title: string): Section | undefined => {
    for (const item of existingContent) {
      if (item instanceof Section && item.title === title) return item;
      if (item instanceof Chapter) {
        const found = item.sections.find(s => s.title === title);
        if (found) return found;
      }
    }
    return undefined;
  };
  
  const findExistingChapter = (title: string): Chapter | undefined => {
    return existingContent.find(item => item instanceof Chapter && item.title === title) as Chapter | undefined;
  };

  const flushSection = () => {
    if (currentSection) {
      const sectionMarkdown = unified().use(remarkGfm).use(remarkStringify).stringify({ type: 'root', children: accumulatedContent }).trim();
      
      // Only update content if it has changed
      if (sectionMarkdown !== currentSection.content) {
        currentSection = currentSection.with({ content: sectionMarkdown });
      }

      if (currentChapter) {
        // This is an update, so we find and replace
        const sectionIndex = currentChapter.sections.findIndex(s => s.id === currentSection!.id);
        if (sectionIndex !== -1) {
            currentChapter = currentChapter.updateSection(currentSection.id, () => currentSection!);
        } else {
            currentChapter = currentChapter.addSection(currentSection);
        }
      } else {
        // This case for top-level sections is now less likely
        newContent.push(currentSection);
      }
    }
    accumulatedContent = [];
  };

  const flushChapter = () => {
    flushSection(); // Finalize the last section of the chapter
    if (currentChapter) {
        const chapterIndex = newContent.findIndex(c => c.id === currentChapter!.id);
        if(chapterIndex !== -1) {
            newContent[chapterIndex] = currentChapter;
        } else {
            newContent.push(currentChapter);
        }
    }
    currentChapter = null;
  };
  
  // Handle content before the first heading as an "Introduction" section if it exists
  const firstHeadingIndex = ast.children.findIndex(node => node.type === 'heading');
  if (firstHeadingIndex > 0 || (firstHeadingIndex === -1 && ast.children.length > 0)) {
    const introContentNodes = ast.children.slice(0, firstHeadingIndex === -1 ? undefined : firstHeadingIndex);
    const introMarkdown = unified().use(remarkGfm).use(remarkStringify).stringify({ type: 'root', children: introContentNodes }).trim();
    
    if (introMarkdown) {
        let introSection = findExistingSection('Introduction') || new Section({ title: 'Introduction', type: 'report' });
        introSection = introSection.with({ content: introMarkdown });
        newContent.push(introSection);
    }
  }


  for (let i = firstHeadingIndex === -1 ? ast.children.length : firstHeadingIndex; i < ast.children.length; i++) {
    const node = ast.children[i];

    if (node.type === 'heading') {
      const title = getNodeText(node).trim();
      
      if (node.depth === 1) { // It's a Chapter
        flushChapter();
        const existingChapter = findExistingChapter(title);
        currentChapter = new Chapter({ id: existingChapter?.id, title: title, sections: existingChapter?.sections || [] });
        currentSection = null; // Reset section when a new chapter starts
      } else { // It's a Section
        flushSection(); // Finalize previous section
        const existingSection = findExistingSection(title);
        
        currentSection = new Section({
            id: existingSection?.id,
            title: title,
            type: existingSection?.type || 'report',
            controls: existingSection?.controls,
            prompt: existingSection?.prompt,
            rules: existingSection?.rules,
            guidelines: existingSection?.guidelines,
            constraints: existingSection?.constraints,
            behaviors: existingSection?.behaviors,
            context: existingSection?.context,
            content: existingSection?.content, // carry over old content until it's updated
        });
      }
    } else if (node.type === 'thematicBreak') {
        // --- is also used for slide breaks, but here we treat it as a section break within a chapter if needed.
        // Or simply ignore it as we structure by headings.
        continue;
    } 
    else {
      // It's content for the current section
      accumulatedContent.push(node);
    }
  }

  flushChapter();

  return newContent;
}
