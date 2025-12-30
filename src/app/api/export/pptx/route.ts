'use server';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { convertMarkdownToPptx, PptxConversionOptions } from '@/lib/markdown-to-pptx-converter';
import { Project, type ProjectProperties } from '@/lib/models';

const exportSchema = z.object({
  project: z.any().refine(val => val && typeof val === 'object' && val.id, {
    message: "A valid project object is required.",
  }),
  options: z.custom<PptxConversionOptions>().optional().default({}),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = exportSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.flatten()), { status: 400 });
    }

    const { project: projectData, options } = validation.data;
    const project = new Project(projectData as ProjectProperties);
    const markdown = project.fullMarkdownContent;
    const fileName = project.name.replace(/\s+/g, '_');

    if (!markdown.trim()) {
      return new NextResponse(JSON.stringify({ message: 'Project content is empty' }), { status: 400 });
    }

    const pptxBuffer = await convertMarkdownToPptx(markdown, fileName, options);

    if (!pptxBuffer) {
      return new NextResponse('Error creating PPTX file buffer.', { status: 500 });
    }

    return new NextResponse(pptxBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${fileName}.pptx"`,
      },
    });

  } catch (error) {
    console.error('PPTX Export API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new NextResponse(JSON.stringify({ message: 'Error converting to .pptx file.', error: errorMessage }), { status: 500 });
  }
}
