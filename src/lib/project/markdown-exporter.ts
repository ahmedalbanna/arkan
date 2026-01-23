/**
 * Markdown Export Utilities for Project Content
 * 
 * This module provides utilities to convert project content (Chapters and Sections)
 * into Markdown format for various export purposes.
 */

import { Chapter } from '@/lib/models/chapter';
import { Section } from '@/lib/models/section';

export type ExportableContent = readonly (Chapter | Section)[];

export interface MarkdownExportOptions {
  /**
   * Include slide breaks between content items (for PPTX export)
   */
  includeSlideBreaks?: boolean;
  
  /**
   * Custom slide break marker
   * @default "<!-- slide-break -->"
   */
  slideBreakMarker?: string;
  
  /**
   * Escape special markdown characters in titles
   * @default true
   */
  escapeMarkdown?: boolean;
  
  /**
   * Include empty sections
   * @default true
   */
  includeEmptySections?: boolean;
}

const DEFAULT_OPTIONS: Required<MarkdownExportOptions> = {
  includeSlideBreaks: true,
  slideBreakMarker: '<!-- slide-break -->',
  escapeMarkdown: true,
  includeEmptySections: true,
};

/**
 * Escapes special markdown characters in text
 */
function escapeMarkdown(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\*/g, '\\*')
    .replace(/_/g, '\\_')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

/**
 * Exports a single section to markdown
 */
function exportSection(section: Section, options: Required<MarkdownExportOptions>): string {
  if (!options.includeEmptySections && !section.content) {
    return '';
  }
  
  const title = options.escapeMarkdown ? escapeMarkdown(section.title) : section.title;
  const content = section.content || '';
  
  return `## ${title}\n\n${content}`;
}

/**
 * Exports a chapter with its sections to markdown
 */
function exportChapter(chapter: Chapter, options: Required<MarkdownExportOptions>): string {
  const title = options.escapeMarkdown ? escapeMarkdown(chapter.title) : chapter.title;
  const chapterHeading = `# ${title}`;
  
  const sectionsContent = chapter.sections
    .map(section => exportSection(section, options))
    .filter(content => content.length > 0)
    .join('\n\n');
  
  if (!sectionsContent) {
    return chapterHeading;
  }
  
  return `${chapterHeading}\n\n${sectionsContent}`;
}

/**
 * Converts project content to markdown format
 * 
 * @param content - The project content to export (Chapters and Sections)
 * @param options - Export options
 * @returns Markdown string
 * 
 * @example
 * ```typescript
 * const markdown = generateMarkdown(project.content, {
 *   includeSlideBreaks: true,
 *   escapeMarkdown: false
 * });
 * ```
 */
export function generateMarkdown(
  content: ExportableContent,
  options: MarkdownExportOptions = {}
): string {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  
  if (!content || content.length === 0) {
    return '';
  }
  
  const contentParts = content
    .map(item => {
      if (item instanceof Chapter) {
        return exportChapter(item, mergedOptions);
      } else {
        // Standalone section gets top-level heading
        const title = mergedOptions.escapeMarkdown ? escapeMarkdown(item.title) : item.title;
        const sectionContent = item.content || '';
        return `# ${title}\n\n${sectionContent}`;
      }
    })
    .filter(part => part.length > 0);
  
  const separator = mergedOptions.includeSlideBreaks 
    ? `\n\n${mergedOptions.slideBreakMarker}\n\n`
    : '\n\n';
  
  return contentParts.join(separator);
}

/**
 * Generates a table of contents from project content
 * 
 * @param content - The project content
 * @returns Markdown table of contents
 * 
 * @example
 * ```typescript
 * const toc = generateTableOfContents(project.content);
 * // Returns:
 * // ## Table of Contents
 * // 1. **Chapter 1**
 * //    1.1. Section 1
 * //    1.2. Section 2
 * ```
 */
export function generateTableOfContents(content: ExportableContent): string {
  if (!content || content.length === 0) {
    return '';
  }
  
  let toc = '## Table of Contents\n\n';
  let chapterIndex = 0;
  
  content.forEach(item => {
    if (item instanceof Chapter) {
      chapterIndex++;
      toc += `${chapterIndex}. **${item.title}**\n`;
      
      item.sections.forEach((section, sectionIndex) => {
        toc += `   ${chapterIndex}.${sectionIndex + 1}. ${section.title}\n`;
      });
    } else {
      // Standalone section
      chapterIndex++;
      toc += `${chapterIndex}. ${item.title}\n`;
    }
  });
  
  return toc;
}

/**
 * Exports only sections with content (filters empty sections)
 */
export function generateMarkdownWithContent(content: ExportableContent): string {
  return generateMarkdown(content, { includeEmptySections: false });
}

/**
 * Exports markdown without slide breaks (for document export)
 */
export function generateMarkdownForDocument(content: ExportableContent): string {
  return generateMarkdown(content, { includeSlideBreaks: false });
}

/**
 * Exports markdown with slide breaks (for presentation export)
 */
export function generateMarkdownForPresentation(content: ExportableContent): string {
  return generateMarkdown(content, { includeSlideBreaks: true });
}
