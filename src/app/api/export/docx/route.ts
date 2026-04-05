



import { container } from '@/infrastructure/di/container';
import { AIContentController } from '@/modules/ai-content/adapters/controllers/AIContentController';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Project } from '@/modules/projects/domain/entities/Project';

const exportSchema = z.object({
  project: z.any().optional(),
  selectedContent: z.array(z.any()).optional(),
  markdown: z.string().optional(),
  fileName: z.string().optional(),
  options: z.any().optional().default({}),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = exportSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.flatten()), { status: 400 });
    }

    const controller = container.resolve(AIContentController);
    const { project, selectedContent, markdown, fileName, options } = validation.data;

    const result = await controller.exportProject({
      format: 'docx',
      project: project ? new Project(project) : undefined,
      selectedContent,
      markdown,
      fileName,
      options
    });

    if (result.isFailure) {
      return new NextResponse(JSON.stringify({ message: result.error?.message || 'Export failed' }), { status: 500 });
    }

    const buffer = result.getValue();
    const outFileName = fileName || (project?.name ? `${project.name.replace(/\s+/g, '_')}.docx` : 'document.docx');

    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${outFileName}"`,
      },
    });

  } catch (error) {
    console.error('DOCX Export API Error:', error);
    return new NextResponse(JSON.stringify({ message: 'Error converting to .docx file.' }), { status: 500 });
  }
}
