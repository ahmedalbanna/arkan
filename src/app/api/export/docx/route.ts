
'use server';

import { convertMarkdownToWord } from '@/lib/markdown-to-word-converter';
import { Project, type ProjectProperties, Chapter, type ChapterProperties, Section, type SectionProperties } from '@/lib/models';
import type { ConversionOptions } from '@/lib/word-converter/types';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const exportSchema = z.object({
  project: z.any().refine(val => val && typeof val === 'object' && val.id, {
    message: "A valid project object is required.",
  }),
  selectedContent: z.array(z.any()), // Array of ChapterProperties or SectionProperties
  options: z.custom<ConversionOptions>().optional().default({}),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = exportSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.flatten()), { status: 400 });
    }

    const { project: projectData, selectedContent: selectedContentData, options } = validation.data;

    // Re-instantiate project and content from plain objects
    const project = new Project(projectData as ProjectProperties);
    const selectedContent = selectedContentData.map(item => {
        if ('sections' in item) {
            return new Chapter(item as ChapterProperties);
        }
        return new Section(item as SectionProperties);
    });

    // The main logic is now inside convertMarkdownToWord, which takes the project object
    const docxBuffer = await convertMarkdownToWord(project, { ...options, selectedContent });

    if (!docxBuffer) {
      return new NextResponse('Error creating DOCX file buffer.', { status: 500 });
    }

    return new NextResponse(docxBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${project.name.replace(/\s+/g, '_') || 'document'}.docx"`,
      },
    });

  } catch (error) {
    console.error('DOCX Export API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new NextResponse(JSON.stringify({ message: 'Error converting to .docx file.', error: errorMessage }), { status: 500 });
  }
}
