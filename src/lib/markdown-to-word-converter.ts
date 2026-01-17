// src/lib/markdown-to-word-converter.ts

import { processPlantUml } from '@/lib/utils/processPlantUml';
import {
  AlignmentType,
  Document,
  INumberingOptions,
  IStylesOptions,
  Packer,
  Paragraph,
  SimpleField,
  Table,
  TableOfContents,
} from 'docx';
import { Root } from 'mdast';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { convertAstToDocxObjects } from './word-converter/ast-converter';
import { buildDocumentSections, prepareHeadersAndFooters } from './word-converter/document-builder';
import { processFootnotes } from './word-converter/node-handlers';
import { ConversionOptions, DocxObject } from './word-converter/types';
import { Project, Chapter, ProjectContent } from './models';

/**
 * Parses markdown, processes it, and creates an array of docx objects and footnotes.
 * @param markdown The markdown string to convert.
 * @param options The conversion options.
 * @returns An object containing the generated docxObjects and docxFootnotes.
 */
export async function createDocxContent(markdown: string, options: ConversionOptions = {}) {
  const processedMarkdown = processPlantUml(markdown);
  const ast = unified().use(remarkParse).use(remarkGfm).parse(await processedMarkdown) as Root;

  const { footnoteIdMap, docxFootnotes } = await processFootnotes(ast, options);
  const docxObjects = await convertAstToDocxObjects(ast, footnoteIdMap, options);

  return { docxObjects, docxFootnotes };
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
    if (!content) return '';
    return content.map(item => {
        if (item instanceof Chapter) { // Chapter
            const chapterContent = `# ${item.title}`;
            const sectionsContent = item.sections.map(section => `## ${section.title}\n\n${section.content || ''}`).join('\n\n');
            return `${chapterContent}\n\n${sectionsContent}`;
        } else { // Section
            return `# ${item.title}\n\n${item.content || ''}`;
        }
    }).join('\n\n<!-- slide-break -->\n\n');
}

// Overload for Project object
export async function convertMarkdownToWord(
  project: Project,
  options?: ConversionOptions & { selectedContent?: ProjectContent }
): Promise<Buffer | Blob>;

// Overload for markdown string
export async function convertMarkdownToWord(
  markdown: string,
  fileName: string,
  options?: ConversionOptions
): Promise<Buffer | Blob>;

/**
 * Converts a Project object or a raw markdown string to a styled .docx file.
 * This is the main server-side function for DOCX generation.
 */
export async function convertMarkdownToWord(
  projectOrMarkdown: Project | string,
  optionsOrFileName?: (ConversionOptions & { selectedContent?: ProjectContent }) | string,
  optionsForMarkdown: ConversionOptions = {}
): Promise<Buffer | Blob> {
  if (projectOrMarkdown instanceof Project) {
    // Handle Project object
    const project = projectOrMarkdown;
    const options = (optionsOrFileName as (ConversionOptions & { selectedContent?: ProjectContent })) || {};
    const { styles, selectedContent, coverPageMarkdown: explicitCoverPage } = options;

    const finalStyles: IStylesOptions = {
      ...styles,
      paragraphStyles: [...(styles?.paragraphStyles || [])],
    };

    const captionStyleExists = finalStyles.paragraphStyles!.some(style => style.id === 'Caption');
    if (!captionStyleExists) {
      (finalStyles.paragraphStyles as any).push({
        id: 'Caption',
        name: 'Caption',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 18, italics: true, color: '595959' },
        paragraph: {
          alignment: AlignmentType.CENTER,
          spacing: { before: 120, after: 240 },
        },
      });
    }

    const contentToExport = selectedContent || project.content;
    const markdown = generateMarkdownFromContent(contentToExport);
    const fullProjectMarkdown = project.fullMarkdownContent;

    const footnoteRegex = /^\[\^.+?\]:.+$/gm;
    const footnoteDefinitions = fullProjectMarkdown.match(footnoteRegex);

    let finalMarkdown = markdown;
    if (footnoteDefinitions) {
      finalMarkdown += '\n\n' + footnoteDefinitions.join('\n');
    }

    const { docxObjects, docxFootnotes } = await createDocxContent(finalMarkdown, options);

    const coverPageMarkdown = explicitCoverPage ?? `
# ${project.name || 'Untitled Project'}
${project.projectDescription ? `\n*${project.projectDescription}*` : ''}
${project.teamMembers && project.teamMembers.length > 0 ? `\n\n**Submitted by:**\n${project.teamMembers.join(', ')}` : ''}
${project.supervisor ? `\n\n**Supervisor:**\n${project.supervisor}` : ''}
${project.university ? `\n\n**${project.university}**` : ''}
\n\n${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
    `.trim();

    let coverPageDocxObjects: DocxObject[] = [];
    if (coverPageMarkdown && coverPageMarkdown.trim().length > 0) {
      const { docxObjects: convertedCoverPageObjects } = await createDocxContent(coverPageMarkdown, options);
      coverPageDocxObjects = convertedCoverPageObjects;
    }

    const { headerConfiguration, footerConfiguration } = prepareHeadersAndFooters(options);
    const sections = await buildDocumentSections(docxObjects, coverPageDocxObjects, options, headerConfiguration, footerConfiguration);

    const doc = new Document({
      styles: finalStyles,
      numbering: numbering,
      footnotes: docxFootnotes,
      sections: sections,
    });

    if (typeof window === 'undefined') {
      return Packer.toBuffer(doc);
    } else {
      return Packer.toBlob(doc);
    }
  } else {
    // Handle markdown string
    const markdown = projectOrMarkdown;
    const options = optionsForMarkdown || {};
    const { styles } = options;

    const finalStyles: IStylesOptions = {
      ...styles,
      paragraphStyles: [...(styles?.paragraphStyles || [])],
    };

    const captionStyleExists = finalStyles.paragraphStyles!.some(style => style.id === 'Caption');
    if (!captionStyleExists) {
        (finalStyles.paragraphStyles as any).push({
            id: 'Caption',
            name: 'Caption',
            basedOn: 'Normal',
            next: 'Normal',
            quickFormat: true,
            run: { size: 18, italics: true, color: '595959' },
            paragraph: {
                alignment: AlignmentType.CENTER,
                spacing: { before: 120, after: 240 },
            },
        });
    }

    const { docxObjects, docxFootnotes } = await createDocxContent(markdown, options);

    const { headerConfiguration, footerConfiguration } = prepareHeadersAndFooters(options);
    // When no project is provided, cover page objects are empty
    const sections = await buildDocumentSections(docxObjects, [], options, headerConfiguration, footerConfiguration);

    const doc = new Document({
      styles: finalStyles,
      numbering: numbering,
      footnotes: docxFootnotes,
      sections: sections,
    });

    if (typeof window === 'undefined') {
      return Packer.toBuffer(doc);
    } else {
      return Packer.toBlob(doc);
    }
  }
}
