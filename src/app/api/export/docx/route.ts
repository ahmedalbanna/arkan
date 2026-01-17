

'use server';

import { convertMarkdownToWord } from '@/lib/markdown-to-word-converter';
import { Project, type ProjectProperties, Chapter, type ChapterProperties, Section, type SectionProperties } from '@/lib/models';
import type { ConversionOptions } from '@/lib/word-converter/types';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const projectExportSchema = z.object({
  project: z.any().refine(val => val && typeof val === 'object' && val.id, { message: "Project object is invalid." }),
  selectedContent: z.array(z.any()),
  options: z.custom<ConversionOptions>().optional().default({}),
});

const markdownExportSchema = z.object({
  markdown: z.string().min(1),
  fileName: z.string().min(1),
  options: z.custom<ConversionOptions>().optional().default({}),
});

const exportSchema = z.union([projectExportSchema, markdownExportSchema]);


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = exportSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.flatten()), { status: 400 });
    }

    let docxBuffer: Buffer | Blob;
    let fileName: string;

    if ('project' in validation.data) {
        // Handle project-based export
        const { project: projectData, selectedContent: selectedContentData, options } = validation.data;
        const project = new Project(projectData as ProjectProperties);
        const selectedContent = selectedContentData.map(item => {
            if ('sections' in item) {
                return new Chapter(item as ChapterProperties);
            }
            return new Section(item as SectionProperties);
        });

        docxBuffer = await convertMarkdownToWord(project, { ...options, selectedContent });
        fileName = `${project.name.replace(/\s+/g, '_') || 'document'}.docx`;

    } else {
        // Handle direct markdown export
        const { markdown, fileName: fn, options } = validation.data;
        docxBuffer = await convertMarkdownToWord(markdown, fn, options);
        fileName = `${fn}.docx`;
    }

    if (!docxBuffer) {
      return new NextResponse('Error creating DOCX file buffer.', { status: 500 });
    }

    return new NextResponse(docxBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });

  } catch (error) {
    console.error('DOCX Export API Error:', error);
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
        message: 'Error converting to .docx file.', 
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
