
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getProjectById, updateProject, deleteProject } from '@/lib/db/queries';

// GET /api/projects/[id]
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const project = await getProjectById(params.id);
    if (!project) {
      return NextResponse.json({ message: 'Project not found.' }, { status: 404 });
    }
    return NextResponse.json(project, { status: 200 });
  } catch (error) {
    console.error(`Error fetching project ${params.id}:`, error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}

// PUT /api/projects/[id]
const updateProjectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  description: z.string().min(10, 'Description must be at least 10 characters long.'),
  category: z.string().min(1, 'Category is required.'),
  tags: z.array(z.string()).min(1, 'At least one tag is required.'),
  liveLink: z.string().url('Invalid URL.').optional().or(z.literal('')),
  media: z.array(z.object({
    url: z.string().url(),
    alt: z.string().min(1),
    aiHint: z.string().optional(),
    type: z.enum(['image', 'video']),
  })).min(1, 'At least one media item is required.'),
});

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const validation = updateProjectSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const projectId = params.id;
    const { title, description, category, tags, liveLink, media } = validation.data;

    await updateProject(projectId, {
      title,
      description,
      category,
      tags,
      liveLink: liveLink || undefined,
      media,
    });

    const updatedProject = await getProjectById(projectId);

    return NextResponse.json(updatedProject, { status: 200 });

  } catch (error) {
    console.error(`Error updating project ${params.id}:`, error);
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}

// DELETE /api/projects/[id]
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id;
    // Check if project exists first
    const project = await getProjectById(projectId);
    if (!project) {
      return NextResponse.json({ message: 'Project not found.' }, { status: 404 });
    }

    await deleteProject(projectId);

    return new NextResponse(null, { status: 204 }); // No Content

  } catch (error) {
    console.error(`Error deleting project ${params.id}:`, error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
