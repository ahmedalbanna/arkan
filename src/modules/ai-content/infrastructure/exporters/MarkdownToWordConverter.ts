// src/lib/markdown-to-word-converter.ts

import { processPlantUml } from '@/lib/utils/processPlantUml';
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
  VerticalAlign,
  TableOfContents,
  ImageRun,
} from 'docx';
import { Root } from 'mdast';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';


import { Project, Chapter, ProjectContent } from './models';
import { convertAstToDocxObjects } from '@/modules/ai-content/infrastructure/exporters/word-converter/ast-converter';
import { ConversionOptions, DocxObject } from '@/modules/ai-content/infrastructure/exporters/word-converter/types';
import { processFootnotes } from '@/modules/ai-content/infrastructure/exporters/word-converter/node-handlers';
import { buildDocumentSections, prepareHeadersAndFooters } from '@/modules/ai-content/infrastructure/exporters/word-converter/document-builder';

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

function generateMarkdownFromContent(content: ProjectContent | any[]): string {
    if (!content || !Array.isArray(content)) return '';
    return content.map(item => {
        // Check if item has sections (Chapter-like)
        if (item.sections && Array.isArray(item.sections)) {
            const chapterContent = `# ${item.title || ''}`;
            const sectionsContent = item.sections.map((section: any) => 
                `## ${section.title || ''}\n\n${section.content || ''}`
            ).join('\n\n');
            return `${chapterContent}\n\n${sectionsContent}`;
        } else { // Section-like
            return `# ${item.title || ''}\n\n${item.content || ''}`;
        }
    }).join('\n\n<!-- slide-break -->\n\n');
}

/**
 * Creates a professional cover page directly using docx API
 * This provides better control over formatting than markdown conversion
 */
async function createProfessionalCoverPage(project: any, options: ConversionOptions): Promise<Paragraph[]> {
    const coverPageElements: Paragraph[] = [];
    const isArabic = /[\u0600-\u06FF]/.test(project.name || '');
    
    // Add top spacing (simulate vertical centering)
    coverPageElements.push(
        new Paragraph({ spacing: { before: 1440, after: 0 } }), // 1 inch
        new Paragraph({ spacing: { before: 720, after: 0 } })   // 0.5 inch
    );
    
    // University Logo (if available)
    if (project.universityLogoUrl) {
        try {
            // Note: Image loading would need to be implemented based on URL
            coverPageElements.push(
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 480 },
                    children: [
                        new TextRun({ text: '[University Logo]', size: 20, color: '999999' })
                    ]
                })
            );
        } catch (error) {
            console.warn('Failed to load university logo:', error);
        }
    }
    
    // Main Title - Large and Bold
    coverPageElements.push(
        new Paragraph({
            text: project.name || 'Untitled Project',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { before: 480, after: 360 },
            border: {
                bottom: {
                    color: '4A90E2',
                    space: 4,
                    style: BorderStyle.SINGLE,
                    size: 24
                }
            },
            shading: {
                type: ShadingType.CLEAR,
                fill: 'F8F9FA'
            },
            bidirectional: isArabic
        })
    );
    
    // Project Description/Subtitle
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
    
    // Decorative line separator
    coverPageElements.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 240 },
            border: {
                top: { color: 'CCCCCC', space: 1, style: BorderStyle.SINGLE, size: 6 }
            }
        })
    );
    
    // Project Metadata Section
    const metadataItems: { label: string; value: string }[] = [];
    
    if (project.projectType) {
        metadataItems.push({ 
            label: isArabic ? 'نوع المشروع' : 'Project Type', 
            value: project.projectType 
        });
    }
    
    if (project.specialization) {
        metadataItems.push({ 
            label: isArabic ? 'التخصص' : 'Specialization', 
            value: project.specialization 
        });
    }
    
    // Add metadata as a styled box
    if (metadataItems.length > 0) {
        metadataItems.forEach(item => {
            coverPageElements.push(
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 120, after: 120 },
                    bidirectional: isArabic,
                    children: [
                        new TextRun({
                            text: `${item.label}: `,
                            bold: true,
                            size: 24,
                            color: '2C3E50'
                        }),
                        new TextRun({
                            text: item.value,
                            size: 24,
                            color: '34495E'
                        })
                    ]
                })
            );
        });
        
        coverPageElements.push(
            new Paragraph({ spacing: { before: 240, after: 240 } })
        );
    }
    
    // Team Members Section with Box Design
    if (project.teamMembers && project.teamMembers.length > 0) {
        coverPageElements.push(
            new Paragraph({
                text: isArabic ? 'إعداد الطلاب' : 'Prepared by',
                alignment: AlignmentType.CENTER,
                spacing: { before: 360, after: 240 },
                bidirectional: isArabic,
                children: [
                    new TextRun({
                        text: isArabic ? 'إعداد الطلاب' : 'Prepared by',
                        bold: true,
                        size: 28,
                        color: '1F4788',
                        underline: { type: 'single' }
                    })
                ]
            })
        );
        
        project.teamMembers.forEach((member: string, index: number) => {
            coverPageElements.push(
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 160, after: 160 },
                    bidirectional: isArabic,
                    shading: {
                        type: ShadingType.CLEAR,
                        fill: index % 2 === 0 ? 'F8F9FA' : 'FFFFFF'
                    },
                    border: {
                        left: { color: '4A90E2', space: 2, style: BorderStyle.SINGLE, size: 12 }
                    },
                    children: [
                        new TextRun({
                            text: member,
                            size: 26,
                            bold: true,
                            color: '2C3E50'
                        })
                    ]
                })
            );
        });
        
        coverPageElements.push(
            new Paragraph({ spacing: { before: 360, after: 240 } })
        );
    }
    
    // Supervisor Section - Highlighted
    if (project.supervisor) {
        coverPageElements.push(
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 480, after: 240 },
                bidirectional: isArabic,
                children: [
                    new TextRun({
                        text: isArabic ? 'إشراف' : 'Supervised by',
                        size: 24,
                        bold: true,
                        color: '7F8C8D'
                    })
                ]
            }),
            new Paragraph({
                text: project.supervisor,
                heading: HeadingLevel.HEADING_3,
                alignment: AlignmentType.CENTER,
                spacing: { before: 120, after: 480 },
                bidirectional: isArabic,
                border: {
                    top: { color: '4A90E2', space: 2, style: BorderStyle.SINGLE, size: 6 },
                    bottom: { color: '4A90E2', space: 2, style: BorderStyle.SINGLE, size: 6 }
                },
                shading: {
                    type: ShadingType.CLEAR,
                    fill: 'E8F4F8'
                }
            })
        );
    }
    
    // Institution Information - Boxed Section
    coverPageElements.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 480, after: 0 },
            border: {
                top: { color: '2C3E50', space: 2, style: BorderStyle.DOUBLE, size: 12 }
            }
        })
    );
    
    if (project.university) {
        coverPageElements.push(
            new Paragraph({
                text: project.university,
                heading: HeadingLevel.HEADING_3,
                alignment: AlignmentType.CENTER,
                spacing: { before: 360, after: 200 },
                bidirectional: isArabic,
                shading: {
                    type: ShadingType.CLEAR,
                    fill: 'F0F3F5'
                }
            })
        );
    }
    
    if (project.course) {
        coverPageElements.push(
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 160, after: 160 },
                bidirectional: isArabic,
                children: [
                    new TextRun({
                        text: project.course,
                        size: 26,
                        bold: true,
                        color: '34495E'
                    })
                ]
            })
        );
    }
    
    if (project.educationalLevel) {
        coverPageElements.push(
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 120, after: 360 },
                bidirectional: isArabic,
                children: [
                    new TextRun({
                        text: project.educationalLevel,
                        size: 22,
                        italics: true,
                        color: '7F8C8D'
                    })
                ]
            })
        );
    }
    
    // Date and Academic Year - Bottom Section
    coverPageElements.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 480, after: 0 },
            border: {
                top: { color: '2C3E50', space: 2, style: BorderStyle.DOUBLE, size: 12 }
            }
        })
    );
    
    const dateLocale = isArabic ? 'ar-SA' : 'en-US';
    const formattedDate = new Date().toLocaleDateString(dateLocale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const currentYear = new Date().getFullYear();
    const academicYear = `${currentYear}-${currentYear + 1}`;
    const yearLabel = isArabic ? 'العام الدراسي' : 'Academic Year';
    
    coverPageElements.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 360, after: 120 },
            bidirectional: isArabic,
            children: [
                new TextRun({
                    text: formattedDate,
                    size: 24,
                    bold: true,
                    color: '2C3E50'
                })
            ]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 120, after: 480 },
            bidirectional: isArabic,
            children: [
                new TextRun({
                    text: `${yearLabel} ${academicYear}`,
                    size: 22,
                    italics: true,
                    color: '7F8C8D'
                })
            ]
        })
    );
    
    return coverPageElements;
}

// Overload for Project object or plain project data
export async function convertMarkdownToWord(
  project: Project | any,
  options?: ConversionOptions & { selectedContent?: ProjectContent }
): Promise<Buffer | Blob>;

// Overload for markdown string
export async function convertMarkdownToWord(
  markdown: string,
  fileName: string,
  options?: ConversionOptions
): Promise<Buffer | Blob>;

/**
 * Converts a Project object (or plain project data) or a raw markdown string to a styled .docx file.
 * This is the main server-side function for DOCX generation.
 * 
 * Note: Accepts both Project instances and plain project data objects to support
 * server-side rendering where client components cannot be instantiated.
 */
export async function convertMarkdownToWord(
  projectOrMarkdown: Project | any | string,
  optionsOrFileName?: (ConversionOptions & { selectedContent?: ProjectContent }) | string,
  optionsForMarkdown: ConversionOptions = {}
): Promise<Buffer | Blob> {
  try {
    // Input validation
    if (!projectOrMarkdown) {
      throw new Error('Input is required: provide either a Project object or markdown string');
    }

    // Check if input is a Project-like object (either instance or plain object)
    if (typeof projectOrMarkdown === 'object' && projectOrMarkdown !== null && 'content' in projectOrMarkdown) {
      // Handle Project object or plain project data
      const project = projectOrMarkdown as any;
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

      // Validate project has content
      const contentToExport = selectedContent || project.content;
      if (!contentToExport || contentToExport.length === 0) {
        throw new Error('Project has no content to export');
      }
    
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

    // Generate professional cover page using direct docx API
    let coverPageDocxObjects: DocxObject[] = [];
    
    if (!explicitCoverPage) {
      // Use the new professional cover page generator
      try {
        const coverPageParagraphs = await createProfessionalCoverPage(project, options);
        coverPageDocxObjects = coverPageParagraphs as any[];
      } catch (error) {
        console.error('Failed to generate professional cover page:', error);
        // Fallback to empty cover page
        coverPageDocxObjects = [];
      }
    } else {
      // Use explicit cover page markdown if provided
      try {
        const { docxObjects: convertedCoverPageObjects } = await createDocxContent(explicitCoverPage, options);
        coverPageDocxObjects = convertedCoverPageObjects || [];
      } catch (error) {
        console.error('Failed to generate cover page from markdown:', error);
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
