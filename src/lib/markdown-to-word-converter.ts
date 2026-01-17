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
  try {
    // Input validation
    if (!projectOrMarkdown) {
      throw new Error('Input is required: provide either a Project object or markdown string');
    }

    if (projectOrMarkdown instanceof Project) {
      // Handle Project object
      const project = projectOrMarkdown;
      const options = (optionsOrFileName as (ConversionOptions & { selectedContent?: ProjectContent })) || {};
      const { styles, selectedContent, coverPageMarkdown: explicitCoverPage } = options;

      // Validate project has content
      const contentToExport = selectedContent || project.content;
      if (!contentToExport || contentToExport.length === 0) {
        throw new Error('Project has no content to export');
      }

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
    
    // Generate markdown safely
    let markdown: string;
    try {
      markdown = generateMarkdownFromContent(contentToExport);
      if (!markdown || markdown.trim().length === 0) {
        throw new Error('Generated markdown is empty');
      }
    } catch (error) {
      throw new Error(`Failed to generate markdown from content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    const fullProjectMarkdown = project.fullMarkdownContent || '';

    // Extract footnotes safely
    const footnoteRegex = /^\[\^.+?\]:.+$/gm;
    const footnoteDefinitions = fullProjectMarkdown.match(footnoteRegex);

    let finalMarkdown = markdown;
    if (footnoteDefinitions && footnoteDefinitions.length > 0) {
      finalMarkdown += '\n\n' + footnoteDefinitions.join('\n');
    }

    // Create DOCX content with error handling
    let docxObjects: DocxObject[];
    let docxFootnotes: any;
    try {
      const result = await createDocxContent(finalMarkdown, options);
      docxObjects = result.docxObjects;
      docxFootnotes = result.docxFootnotes;
      
      if (!docxObjects || docxObjects.length === 0) {
        console.warn('No DOCX objects generated from markdown');
      }
    } catch (error) {
      throw new Error(`Failed to create DOCX content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Generate professional cover page with enhanced formatting
    const coverPageParts: string[] = [];
    
    // Add vertical spacing at top for better presentation
    coverPageParts.push('\n\n\n');
    
    // Add university logo if available (centered)
    if (project.universityLogoUrl) {
      coverPageParts.push(`![University Logo](${project.universityLogoUrl})\n<!-- caption: -->\n\n`);
    }
    
    // Add main title with proper spacing - using H1 for prominence
    coverPageParts.push(`# ${project.name || 'Untitled Project'}\n\n`);
    
    // Add project description/subtitle - using H2 for hierarchy
    if (project.projectDescription) {
      coverPageParts.push(`## ${project.projectDescription}\n\n`);
    }
    
    // Add elegant horizontal separator
    coverPageParts.push('\n---\n\n');
    
    // Add project metadata in a structured format
    const metadata: string[] = [];
    
    if (project.projectType) {
      metadata.push(`**نوع المشروع:** ${project.projectType}`);
    }
    if (project.specialization) {
      metadata.push(`**التخصص:** ${project.specialization}`);
    }
    
    if (metadata.length > 0) {
      coverPageParts.push(metadata.join('  \n') + '\n\n');
    }
    
    // Add team members section with better formatting
    if (project.teamMembers && project.teamMembers.length > 0) {
      coverPageParts.push(`\n**إعداد الطلاب:**\n\n`);
      project.teamMembers.forEach(member => {
        coverPageParts.push(`- **${member}**\n`);
      });
      coverPageParts.push('\n');
    }
    
    // Add supervisor with emphasis
    if (project.supervisor) {
      coverPageParts.push(`**إشراف:**\n\n### ${project.supervisor}\n\n`);
    }
    
    // Add another separator before institution info
    coverPageParts.push('\n---\n\n');
    
    // Add institution information in a structured way
    const institutionInfo: string[] = [];
    
    if (project.university) {
      institutionInfo.push(`### ${project.university}`);
    }
    
    if (project.course) {
      institutionInfo.push(`**${project.course}**`);
    }
    
    if (project.educationalLevel) {
      institutionInfo.push(`*${project.educationalLevel}*`);
    }
    
    if (institutionInfo.length > 0) {
      coverPageParts.push(institutionInfo.join('  \n') + '\n\n');
    }
    
    // Add final separator and formatted date
    coverPageParts.push('\n---\n\n');
    
    // Format date in Arabic or English based on content
    const isArabicContent = /[\u0600-\u06FF]/.test(project.name || '');
    const dateLocale = isArabicContent ? 'ar-SA' : 'en-US';
    const formattedDate = new Date().toLocaleDateString(dateLocale, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Determine the year label based on language
    const yearLabel = isArabicContent ? 'العام الدراسي' : 'Academic Year';
    const currentYear = new Date().getFullYear();
    const academicYear = `${currentYear}-${currentYear + 1}`;
    
    coverPageParts.push(`**${formattedDate}**\n\n`);
    coverPageParts.push(`*${yearLabel} ${academicYear}*\n\n`);
    
    const coverPageMarkdown = explicitCoverPage ?? coverPageParts.join('');

    // Generate cover page with error handling
    let coverPageDocxObjects: DocxObject[] = [];
    if (coverPageMarkdown && coverPageMarkdown.trim().length > 0) {
      try {
        const { docxObjects: convertedCoverPageObjects } = await createDocxContent(coverPageMarkdown, options);
        coverPageDocxObjects = convertedCoverPageObjects || [];
      } catch (error) {
        console.error('Failed to generate cover page:', error);
        // Continue without cover page rather than failing completely
        coverPageDocxObjects = [];
      }
    }

    // Prepare headers and footers
    const { headerConfiguration, footerConfiguration } = prepareHeadersAndFooters(options);
    
    // Build document sections
    let sections;
    try {
      sections = await buildDocumentSections(docxObjects, coverPageDocxObjects, options, headerConfiguration, footerConfiguration);
      if (!sections || sections.length === 0) {
        throw new Error('No sections generated for document');
      }
    } catch (error) {
      throw new Error(`Failed to build document sections: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Create final document
    let doc;
    try {
      doc = new Document({
        styles: finalStyles,
        numbering: numbering,
        footnotes: docxFootnotes,
        sections: sections,
      });
    } catch (error) {
      throw new Error(`Failed to create DOCX document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Pack document
    try {
      if (typeof window === 'undefined') {
        return await Packer.toBuffer(doc);
      } else {
        return await Packer.toBlob(doc);
      }
    } catch (error) {
      throw new Error(`Failed to pack DOCX document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  } else {
      // Handle markdown string
      const markdown = projectOrMarkdown;
      
      // Validate markdown
      if (typeof markdown !== 'string' || markdown.trim().length === 0) {
        throw new Error('Invalid markdown: must be a non-empty string');
      }
      
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

      // Create DOCX content with error handling
      let docxObjects: DocxObject[];
      let docxFootnotes: any;
      try {
        const result = await createDocxContent(markdown, options);
        docxObjects = result.docxObjects;
        docxFootnotes = result.docxFootnotes;
        
        if (!docxObjects || docxObjects.length === 0) {
          throw new Error('No content generated from markdown');
        }
      } catch (error) {
        throw new Error(`Failed to create DOCX content from markdown: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      const { headerConfiguration, footerConfiguration } = prepareHeadersAndFooters(options);
      
      // Build document sections
      let sections;
      try {
        sections = await buildDocumentSections(docxObjects, [], options, headerConfiguration, footerConfiguration);
        if (!sections || sections.length === 0) {
          throw new Error('No sections generated for document');
        }
      } catch (error) {
        throw new Error(`Failed to build document sections: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Create final document
      let doc;
      try {
        doc = new Document({
          styles: finalStyles,
          numbering: numbering,
          footnotes: docxFootnotes,
          sections: sections,
        });
      } catch (error) {
        throw new Error(`Failed to create DOCX document: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Pack document
      try {
        if (typeof window === 'undefined') {
          return await Packer.toBuffer(doc);
        } else {
          return await Packer.toBlob(doc);
        }
      } catch (error) {
        throw new Error(`Failed to pack DOCX document: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  } catch (error) {
    // Top-level error handler
    console.error('Error in convertMarkdownToWord:', error);
    throw new Error(`Document conversion failed: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
  }
}
