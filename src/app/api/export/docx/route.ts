

'use server';


import type { ProjectProperties } from '@/lib/types';
import { container } from '@/infrastructure/di/container';
import { IDocxExportServiceToken } from '@/modules/ai-content/domain/services/IExportService';
import type { ConversionOptions } from '@/modules/ai-content/domain/types/export-types';
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

    const exporter = container.resolve<any>(IDocxExportServiceToken);

    if ('project' in validation.data) {
        // Handle project-based export
        const { project: projectData, selectedContent: selectedContentData, options } = validation.data;
        
        docxBuffer = await exporter.export(
          projectData as any, 
          selectedContentData as any,
          options
        );
        fileName = `${(projectData as ProjectProperties).name?.replace(/\s+/g, '_') || 'document'}.docx`;

    } else {
        // Handle direct markdown export
        const directData = validation.data as { markdown: string; fileName: string; options: ConversionOptions };
        docxBuffer = await exporter.exportFromMarkdown(directData.markdown, directData.fileName, directData.options);
        fileName = `${directData.fileName}.docx`;
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
