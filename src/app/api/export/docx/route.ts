'use server';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { convertMarkdownToWord } from '@/lib/markdown-to-word-converter';
import type { ConversionOptions } from '@/lib/word-converter/types';
import { templates } from '@/lib/docx-styles';

const exportSchema = z.object({
  markdown: z.string().min(1, "Markdown content is required"),
  fileName: z.string().min(1, "File name is required"),
  options: z.custom<ConversionOptions>().optional().default({}),
});

export async function POST(req: NextRequest) {
  try {
    let body = await req.json();
    let validation = exportSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.flatten()), { status: 400 });
    }

    let { markdown, fileName, options } = validation.data;
    
    // Validate markdown content is not empty
    if (!markdown.trim()) {
      return new NextResponse(JSON.stringify({ message: 'Markdown content cannot be empty' }), { status: 400 });
    }
    
    // The conversion function returns a Buffer/Blob when run on the server
    let docxBuffer = await convertMarkdownToWord(markdown, fileName, options);

    if (!docxBuffer) {
      return new NextResponse('Error creating DOCX file buffer.', { status: 500 });
    }

    // Since Packer.toBuffer is used on server, we get a Buffer.
    // NextResponse can handle Buffer directly.
    return new NextResponse(docxBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${fileName}.docx"`,
      },
    });

  } catch (error) {
    console.error('DOCX Export API Error:', error);
    let errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new NextResponse(JSON.stringify({ message: 'Error converting to .docx file.', error: errorMessage }), { status: 500 });
  }
}
