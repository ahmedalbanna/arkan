
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
 * This function is now more intelligent, handling hierarchy and preserving existing IDs and content.
 *
 * @param markdown The raw markdown string to parse.
 * @param existingContent The current project content to preserve IDs and properties.
 * @param isToc Only parse structure (headings, lists), ignore other content.
 * @returns An array of Chapter and Section objects.
 */
export function parseMarkdownToContent(markdown: string, existingContent: ProjectContent, isToc: boolean = false): ProjectContent {
  const ast = unified().use(remarkParse).use(remarkGfm).parse(markdown) as MdastRoot;
  const newContent: (Chapter | Section)[] = [];
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
      const sectionMarkdown = isToc ? currentSection.content : unified().use(remarkGfm).use(remarkStringify).stringify({ type: 'root', children: accumulatedContent }).trim();
      
      // Only update content if it has changed and we are not in TOC mode
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
        const existingIndex = newContent.findIndex(item => item.id === currentSection!.id);
        if(existingIndex !== -1) {
          (newContent as (Chapter | Section)[])[existingIndex] = currentSection;
        } else {
          newContent.push(currentSection);
        }
      }
    }
    accumulatedContent = [];
  };

  const flushChapter = () => {
    flushSection();
    if (currentChapter) {
        const chapterIndex = newContent.findIndex(c => c.id === currentChapter!.id);
        if(chapterIndex !== -1) {
            (newContent as (Chapter | Section)[])[chapterIndex] = currentChapter;
        } else {
            newContent.push(currentChapter);
        }
    }
    currentChapter = null;
  };

  // Process all nodes in the AST
  for (const node of ast.children) {
    if (node.type === 'heading') {
      const title = getNodeText(node).trim();
      if (node.depth === 1) { // Chapter
        flushChapter();
        const existingChapter = findExistingChapter(title);
        currentChapter = new Chapter({ 
          id: existingChapter?.id, 
          title: title, 
          sections: existingChapter?.sections ? [...existingChapter.sections] : []
        });
        currentSection = null; // Reset section when a new chapter starts
      } else { // Section
        flushSection();
        const existingSection = findExistingSection(title);
        currentSection = new Section({
            id: existingSection?.id,
            title: title,
            type: existingSection?.type || 'report',
            content: existingSection?.content, // Preserve existing content
            controls: existingSection?.controls,
            prompt: existingSection?.prompt,
            rules: Array.isArray(existingSection?.rules) ? [...existingSection.rules] : [],
            guidelines: Array.isArray(existingSection?.guidelines) ? [...existingSection.guidelines] : [],
            constraints: Array.isArray(existingSection?.constraints) ? [...existingSection.constraints] : [],
            behaviors: Array.isArray(existingSection?.behaviors) ? [...existingSection.behaviors] : [],
            context: existingSection?.context,
        });
      }
    } else if (node.type === 'list' && currentChapter && isToc) {
        // Handle sections listed under a chapter
        for (const listItem of node.children) {
            if (listItem.type === 'listItem') {
                const sectionTitle = getNodeText(listItem).trim();
                flushSection();
                const existingSection = findExistingSection(sectionTitle);
                currentSection = new Section({
                    id: existingSection?.id,
                    title: sectionTitle,
                    type: existingSection?.type || 'report',
                    content: existingSection?.content,
                    controls: existingSection?.controls,
                    prompt: existingSection?.prompt,
                    rules: existingSection?.rules ? [...existingSection.rules] : [],
                    guidelines: existingSection?.guidelines ? [...existingSection.guidelines] : [],
                    constraints: existingSection?.constraints ? [...existingSection.constraints] : [],
                    behaviors: existingSection?.behaviors ? [...existingSection.behaviors] : [],
                    context: existingSection?.context,
                });
                flushSection(); // Immediately add the section
                currentSection = null;
            }
        }
    } else {
      if (currentSection) {
        accumulatedContent.push(node);
      }
    }
  }

  flushChapter();

  return newContent;
}
