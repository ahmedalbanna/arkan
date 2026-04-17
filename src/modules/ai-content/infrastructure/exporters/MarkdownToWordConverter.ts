'use server';

import { processPlantUml } from '@/infrastructure/services/plantuml/plantuml-utils';
import {
  AlignmentType,
  Document,
  INumberingOptions,
  IStylesOptions,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  BorderStyle,
  ShadingType,
} from 'docx';
import { Root } from 'mdast';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

import { Chapter } from '@/modules/ai-content/domain/entities/Chapter';
import { Section } from '@/modules/ai-content/domain/entities/Section';
import type { ProjectContent } from '@/modules/projects/domain/entities/Project';
import { Project } from '@/modules/projects/domain/entities/Project';
import { convertAstToDocxObjects } from '@/modules/ai-content/infrastructure/exporters/word-converter/ast-converter';
import { ConversionOptions, DocxObject } from '@/modules/ai-content/infrastructure/exporters/word-converter/types';
import { processFootnotes } from '@/modules/ai-content/infrastructure/exporters/word-converter/node-handlers';
import { buildDocumentSections, prepareHeadersAndFooters } from '@/modules/ai-content/infrastructure/exporters/word-converter/document-builder';
import { cleanAiOutput } from '@/infrastructure/utils/sanitizer';

/**
 * MarkdownToWordConverter — Production-grade AST transformation engine.
 * Converts markdown and project entities into high-fidelity DOCX structures.
 * 
 * DEFENSIVE MEASURES:
 * 1. Existence Guards: Checks for project metadata and valid content arrays.
 * 2. Spectral Sanitization: Enforces cleanAiOutput on all injected content.
 * 3. Type Safety: Implements explicit instanceof guards for content nodes.
 * 4. AST Containment: Wraps unified/docx pipelines in localized try-catch blocks.
 */

export async function createDocxContent(markdown: string, options: ConversionOptions = {}) {
  try {
    const cleanMarkdown = cleanAiOutput(markdown);
    const processedMarkdown = await processPlantUml(cleanMarkdown as any);
    const ast = unified().use(remarkParse).use(remarkGfm).parse(processedMarkdown as any) as Root;

    const { footnoteIdMap, docxFootnotes } = await processFootnotes(ast, options);
    const docxObjects = await convertAstToDocxObjects(ast, footnoteIdMap, options);

    return { docxObjects, docxFootnotes };
  } catch (e) {
    console.error('[Converter:DOCX] AST transformation failed:', e);
    throw new Error('Neural markdown parsing encountered an unrecoverable structural error.');
  }
}

const numbering: INumberingOptions = {
  config: [
    {
      reference: "default-numbering",
      levels: [
        { level: 0, format: "decimal", text: "%1.", alignment: AlignmentType.START },
        { level: 1, format: "lowerLetter", text: "%2)", alignment: AlignmentType.START },
        { level: 2, format: "lowerRoman", text: "%3.", alignment: AlignmentType.START },
        { level: 3, format: "upperLetter", text: "%4)", alignment: AlignmentType.START },
      ],
    },
  ],
};

function generateMarkdownFromContent(content: ProjectContent): string {
    if (!content || !Array.isArray(content)) return '';
    
    return content.map(item => {
        if (item instanceof Chapter) {
            const chapterTitle = `# ${item.title || 'Untitled Chapter'}`;
            const sectionsContent = item.sections.map(section => {
                const cleanContent = cleanAiOutput(section.content || '');
                return `## ${section.title || 'Untitled Section'}\n\n${cleanContent}`;
            }).join('\n\n');
            return `${chapterTitle}\n\n${sectionsContent}`;
        } else if (item instanceof Section) {
            const cleanContent = cleanAiOutput(item.content || '');
            return `# ${item.title || 'Untitled Section'}\n\n${cleanContent}`;
        }
        return '';
    }).join('\n\n');
}

async function createProfessionalCoverPage(project: any, options: ConversionOptions): Promise<Paragraph[]> {
    const coverPageElements: Paragraph[] = [];
    const isArabic = /[\u0600-\u06FF]/.test(project.name || '');
    
    // Existence Guard for project metadata
    if (!project) return coverPageElements;

    coverPageElements.push(
        new Paragraph({ spacing: { before: 1440, after: 0 } }),
        new Paragraph({ spacing: { before: 720, after: 0 } })
    );
    
    coverPageElements.push(
        new Paragraph({
            text: project.name || 'Untitled Manifest',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { before: 480, after: 360 },
            border: {
                bottom: { color: '4A90E2', space: 4, style: BorderStyle.SINGLE, size: 24 }
            },
            shading: { type: ShadingType.CLEAR, fill: 'F8F9FA' },
            bidirectional: isArabic
        })
    );
    
    if (project.projectDescription) {
        coverPageElements.push(
            new Paragraph({
                text: project.projectDescription,
                heading: HeadingLevel.HEADING_2,
                alignment: AlignmentType.CENTER,
                spacing: { before: 240, after: 480 },
                bidirectional: isArabic
            })
        );
    }
    
    coverPageElements.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 240 },
            border: { top: { color: 'CCCCCC', space: 1, style: BorderStyle.SINGLE, size: 6 } }
        })
    );
    
    return coverPageElements;
}

// ── Overload Implementation ──────────────────────────────────────────────────

export async function convertMarkdownToWord(
  projectOrMarkdown: Project | string,
  optionsOrFileName?: (ConversionOptions & { selectedContent?: ProjectContent }) | string,
  optionsForMarkdown: ConversionOptions = {}
): Promise<Buffer | Blob> {
  try {
    if (!projectOrMarkdown) {
      throw new Error('Input required: Provide Project entity or markdown vector.');
    }

    // A. Handle Project Entities
    if (typeof projectOrMarkdown === 'object' && 'content' in projectOrMarkdown) {
      const project = projectOrMarkdown;
      const options = (optionsOrFileName as (ConversionOptions & { selectedContent?: ProjectContent })) || {};
      const { styles, selectedContent, coverPageMarkdown: explicitCoverPage } = options;

      const finalStyles: IStylesOptions = {
        ...styles,
        paragraphStyles: [...(styles?.paragraphStyles || [])],
      };

      const contentToExport = selectedContent || project.content;
      if (!contentToExport || contentToExport.length === 0) {
        throw new Error('Document manifest contains zero nodes for production.');
      }
    
      const isFullExport = !selectedContent || (selectedContent.length === project.content.length);
      let markdown = isFullExport && project.fullMarkdownContent 
        ? cleanAiOutput(project.fullMarkdownContent)
        : generateMarkdownFromContent(contentToExport);

      if (!markdown) throw new Error('Neural markdown synthesis failed.');

      // Extract footnotes safely
      const fullProjectMarkdown = project.fullMarkdownContent || '';
      const footnoteRegex = /^\[\^.+?\]:.+$/gm;
      const footnoteDefinitions = (fullProjectMarkdown.match(footnoteRegex) || []) as string[];

      if (footnoteDefinitions.length > 0) {
        const existingFootnotes = (markdown.match(footnoteRegex) || []) as string[];
        const newFootnotes = footnoteDefinitions.filter((fn: string) => !existingFootnotes.includes(fn));
        if (newFootnotes.length > 0) markdown += '\n\n' + newFootnotes.join('\n');
      }

      const { docxObjects, docxFootnotes } = await createDocxContent(markdown, options);
      
      let coverPageDocxObjects: any[] = [];
      if (!explicitCoverPage) {
        coverPageDocxObjects = await createProfessionalCoverPage(project, options);
      } else {
        const { docxObjects: converted } = await createDocxContent(explicitCoverPage, options);
        coverPageDocxObjects = converted || [];
      }

      const { headerConfiguration, footerConfiguration } = prepareHeadersAndFooters(options);
      const sections = await buildDocumentSections(docxObjects, coverPageDocxObjects, options, headerConfiguration, footerConfiguration);

      const doc = new Document({
        styles: finalStyles,
        numbering: numbering,
        footnotes: docxFootnotes,
        sections: sections,
      });

      return typeof window === 'undefined' ? await Packer.toBuffer(doc) : await Packer.toBlob(doc);
    } 
    
    // B. Handle Raw Markdown Vector
    else {
      const markdown = projectOrMarkdown as string;
      const options = optionsForMarkdown || {};
      
      const { docxObjects, docxFootnotes } = await createDocxContent(markdown, options);
      const { headerConfiguration, footerConfiguration } = prepareHeadersAndFooters(options);
      const sections = await buildDocumentSections(docxObjects, [], options, headerConfiguration, footerConfiguration);

      const doc = new Document({
        styles: options.styles as IStylesOptions,
        numbering: numbering,
        footnotes: docxFootnotes,
        sections: sections,
      });

      return typeof window === 'undefined' ? await Packer.toBuffer(doc) : await Packer.toBlob(doc);
    }
  } catch (error) {
    console.error('[Converter:DOCX] Critical production failure:', error);
    throw new Error(`Production pipeline halted: ${error instanceof Error ? error.message : 'Unknown synthesis error'}`);
  }
}
