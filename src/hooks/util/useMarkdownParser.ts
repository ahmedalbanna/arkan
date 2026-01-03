

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
        const sectionIndex = currentChapter.sections.findIndex(s => s.id === currentSection!.id);
        if (sectionIndex !== -1) {
            currentChapter = currentChapter.updateSection(currentSection.id, () => currentSection!);
        } else {
            currentChapter = currentChapter.addSection(currentSection);
        }
      } else {
        // This case handles top-level sections that are not under a chapter
        const existingIndex = newContent.findIndex(item => item.id === currentSection!.id);
        if(existingIndex !== -1) {
          newContent[existingIndex] = currentSection;
        } else {
          newContent.push(currentSection);
        }
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
  
  const firstHeadingIndex = ast.children.findIndex(node => node.type === 'heading');
  const contentBeforeFirstHeading = (firstHeadingIndex === -1 ? ast.children : ast.children.slice(0, firstHeadingIndex));
  const introMarkdown = unified().use(remarkGfm).use(remarkStringify).stringify({ type: 'root', children: contentBeforeFirstHeading }).trim();

  if (introMarkdown) {
      let introSection = findExistingSection('Introduction') || new Section({ title: 'Introduction', type: 'report' });
      introSection = introSection.with({ content: introMarkdown });
      newContent.push(introSection);
  }

  if (firstHeadingIndex !== -1) {
    for (let i = firstHeadingIndex; i < ast.children.length; i++) {
      const node = ast.children[i];

      if (node.type === 'heading') {
        const title = getNodeText(node).trim();
        
        if (node.depth === 1) { // It's a Chapter
          flushChapter();
          const existingChapter = findExistingChapter(title);
          currentChapter = new Chapter({ id: existingChapter?.id, title: title, sections: existingChapter?.sections || [] });
          currentSection = null; // Reset section when a new chapter starts
        } else { // It's a Section
          flushSection(); 
          const existingSection = findExistingSection(title);
          
          // If we are not inside a chapter, create a default one for this section
          if (!currentChapter) {
            currentChapter = new Chapter({ title: 'General', sections: [] });
          }
          
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
              content: existingSection?.content,
          });
        }
      } else if (node.type === 'thematicBreak' || (node.type === 'html' && node.value.includes('slide-break'))) {
          // Slide breaks in markdown might signify a new section without a heading.
          // For now, we'll treat them as simple separators within content.
          if (currentSection) {
            accumulatedContent.push(node);
          }
      } else {
        if (currentSection) {
            accumulatedContent.push(node);
        } else if (currentChapter) {
            // Content directly under a chapter, create an implicit section.
            currentSection = new Section({ title: `${currentChapter.title} Content`, type: 'report' });
            accumulatedContent.push(node);
        }
      }
    }
  }

  flushChapter();

  return newContent;
}
