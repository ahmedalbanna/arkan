
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Project, type ProjectProperties, Chapter, type ChapterProperties, Section, type SectionProperties } from '@/lib/models';
import { convertMarkdownToPptx } from '@/lib/markdown-to-pptx-converter';
import type { PptxConversionOptions } from '@/lib/markdown-to-pptx-converter';

const projectExportSchema = z.object({
  project: z.any().refine(val => val && typeof val === 'object' && val.id, { message: "Project object is invalid." }),
  selectedContent: z.array(z.any()),
  options: z.custom<PptxConversionOptions>().optional().default({}),
});

const markdownExportSchema = z.object({
  markdown: z.string().min(1),
  fileName: z.string().min(1),
  options: z.custom<PptxConversionOptions>().optional().default({}),
});

const exportSchema = z.union([projectExportSchema, markdownExportSchema]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = exportSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.flatten()), { status: 400 });
    }

    let pptxBuffer: Buffer | Blob;
    let fileName: string;

    if ('project' in validation.data) {
      // Handle project-based export
      const { project: projectData, selectedContent: selectedContentData, options } = validation.data;
      const project = new Project(projectData as ProjectProperties);
      
      const markdownToExport = project.generateMarkdownFromContent(
        selectedContentData.map(item => {
          if ('sections' in item) return new Chapter(item as ChapterProperties);
          return new Section(item as SectionProperties);
        })
      );
      
      // Extract footnotes from the full project content
      const fullProjectMarkdown = project.fullMarkdownContent;
      const footnoteRegex = /^\[\^.+?\]:.+$/gm;
      const footnoteDefinitions = fullProjectMarkdown.match(footnoteRegex);

      let finalMarkdown = markdownToExport;
      if (footnoteDefinitions) {
          finalMarkdown += '\n\n' + footnoteDefinitions.join('\n');
      }

      pptxBuffer = await convertMarkdownToPptx(finalMarkdown, project.name, { ...options, title: project.name });
      fileName = `${project.name.replace(/\s+/g, '_') || 'presentation'}.pptx`;
    } else {
      // Handle direct markdown export
      const { markdown, fileName: fn, options } = validation.data;
      pptxBuffer = await convertMarkdownToPptx(markdown, fn, options);
      fileName = `${fn}.pptx`;
    }

    if (!pptxBuffer) {
      return new NextResponse('Error creating PPTX file buffer.', { status: 500 });
    }

    return new NextResponse(pptxBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });

  } catch (error) {
    console.error('PPTX Export API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    // Log detailed error for debugging
    console.error('Error details:', {
      message: errorMessage,
      stack: errorStack,
      type: error instanceof Error ? error.constructor.name : typeof error
    });
    
    return new NextResponse(
      JSON.stringify({ 
        message: 'Error converting to .pptx file.', 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorStack : undefined
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
