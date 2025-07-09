
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAllProjects, createProject, getProjectById } from '@/lib/db/queries';

// GET /api/projects
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || undefined;
  const q = searchParams.get('q') || undefined;

  try {
    const projects = await getAllProjects({ category, q });
    return NextResponse.json(projects, { status: 200 });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ message: 'An unexpected error occurred while fetching projects.' }, { status: 500 });
  }
}

// POST /api/projects
const createProjectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  description: z.string().min(10, 'Description must be at least 10 characters long.'),
  category: z.string().min(1, 'Category is required.'),
  tags: z.array(z.string()).min(1, 'At least one tag is required.'),
  liveLink: z.string().url('Invalid URL.').optional().or(z.literal('')),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = createProjectSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    // Hardcoded user for prototype. In a real app, this would come from session/auth.
    const userId = 'user-1';
    const { title, description, category, tags, liveLink } = validation.data;

    const newProjectId = await createProject({
      userId,
      title,
      description,
      category,
      tags,
      liveLink: liveLink || undefined,
      media: [{
        url: 'https://placehold.co/800x600.png',
        alt: `Cover image for ${title}`,
        aiHint: 'report cover',
        type: 'image'
      }],
    });

    const newProject = await getProjectById(newProjectId);

    return NextResponse.json(newProject, { status: 201 });

  } catch (error) {
    console.error('Error creating project:', error);
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred while creating the project.' }, { status: 500 });
  }
}
