
'use server';

import { convertMarkdownToWord } from '@/lib/markdown-to-word-converter';
import { Project, type ProjectProperties } from '@/lib/models';
import type { ConversionOptions } from '@/lib/word-converter/types';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const exportSchema = z.object({
  project: z.any().refine(val => val && typeof val === 'object' && val.id, {
    message: "A valid project object is required.",
  }),
  markdown: z.string().min(1, "Markdown content cannot be empty."), // Added markdown field
  options: z.custom<ConversionOptions>().optional().default({}),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = exportSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.flatten()), { status: 400 });
    }

    const { project: projectData, markdown, options } = validation.data;

    // Instantiate a Project object for metadata
    const project = new Project(projectData as ProjectProperties);
    const fileName = (project.name || 'Untitled').replace(/\s+/g, '_');

    if (!markdown.trim()) {
      return new NextResponse(JSON.stringify({ message: 'Project content is empty' }), { status: 400 });
    }

    const docxBuffer = await convertMarkdownToWord(markdown, fileName, options);

    if (!docxBuffer) {
      return new NextResponse('Error creating DOCX file buffer.', { status: 500 });
    }

    return new NextResponse(docxBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${fileName}.docx"`,
      },
    });

  } catch (error) {
    console.error('DOCX Export API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new NextResponse(JSON.stringify({ message: 'Error converting to .docx file.', error: errorMessage }), { status: 500 });
  }
}
