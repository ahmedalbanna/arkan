
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { convertMarkdownToWord } from '@/lib/markdown-to-word-converter';
import type { ConversionOptions } from '@/lib/word-converter/types';
import { type ProjectProperties } from '@/lib/models';
import { generateFullMarkdownFromProject } from '@/lib/utils/markdown-generation';

const exportSchema = z.object({
  project: z.any().refine(val => val && typeof val === 'object' && val.id, {
    message: "A valid project object is required.",
  }),
  options: z.custom<ConversionOptions>().optional().default({}),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = exportSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.flatten()), { status: 400 });
    }

    const { project: projectData, options } = validation.data;
    
    // Use the new server-safe utility function to generate markdown
    const markdown = generateFullMarkdownFromProject(projectData as ProjectProperties);
    const fileName = (projectData.name || 'Untitled').replace(/\s+/g, '_');

    if (!markdown.trim()) {
      return new NextResponse(JSON.stringify({ message: 'Project content is empty' }), { status: 400 });
    }
    
    const docxBuffer = await convertMarkdownToWord(markdown, fileName, options);

    if (!docxBuffer) {
      return new NextResponse('Error creating DOCX file buffer.', { status: 500 });
    }

    return new NextResponse(docxBuffer, {
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
