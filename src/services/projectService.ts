
'use server';

import { prisma } from '@/lib/db/prisma';
import type { Project } from '@prisma/client';

export type ProjectProperties = Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'userId'> & {
  id?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * Saves a project to the database. If the project has an ID, it updates it.
 * Otherwise, it creates a new document.
 * @param projectData The project data to save.
 * @param userId The user ID of the project owner.
 * @returns The saved project data with a confirmed ID and updated timestamp.
 */
export async function saveProject(
  projectData: ProjectProperties,
  userId: string
): Promise<ProjectProperties> {
  const now = new Date();

  if (projectData.id) {
    // Update existing project
    const updated = await prisma.project.update({
      where: { id: projectData.id },
      data: {
        name: projectData.name,
        description: projectData.description,
        content: projectData.content,
        status: projectData.status,
        updatedAt: now,
      },
    });

    return {
      id: updated.id,
      userId: updated.userId,
      name: updated.name,
      description: updated.description,
      content: updated.content,
      status: updated.status,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  } else {
    // Create new project
    const created = await prisma.project.create({
      data: {
        userId,
        name: projectData.name || 'Untitled Project',
        description: projectData.description || '',
        content: projectData.content || '',
        status: projectData.status || 'DRAFT',
      },
    });

    return {
      id: created.id,
      userId: created.userId,
      name: created.name,
      description: created.description,
      content: created.content,
      status: created.status,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  }
}

/**
 * Fetches all projects for a given user.
 * @param userId The ID of the user whose projects to fetch.
 * @returns An array of project properties.
 */
export async function getProjects(userId: string): Promise<ProjectProperties[]> {
  const projects = await prisma.project.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  });

  return projects.map((p) => ({
    id: p.id,
    userId: p.userId,
    name: p.name,
    description: p.description,
    content: p.content,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));
}

/**
 * Fetches a single project by its ID.
 * @param projectId The ID of the project to fetch.
 * @param userId The user ID (for security verification).
 * @returns The project properties or null if not found.
 */
export async function getProject(
  projectId: string,
  userId?: string
): Promise<ProjectProperties | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    return null;
  }

  // Verify ownership if userId is provided
  if (userId && project.userId !== userId) {
    return null;
  }

  return {
    id: project.id,
    userId: project.userId,
    name: project.name,
    description: project.description,
    content: project.content,
    status: project.status,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}

/**
 * Deletes a project from the database.
 * @param projectId The ID of the project to delete.
 * @param userId The user ID (for security verification).
 */
export async function deleteProject(projectId: string, userId?: string): Promise<void> {
  if (userId) {
    // Verify ownership before deleting
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { userId: true },
    });

    if (!project || project.userId !== userId) {
      throw new Error('Unauthorized: Cannot delete another user\'s project');
    }
  }

  await prisma.project.delete({
    where: { id: projectId },
  });
}

/**
 * Counts the total number of projects for a user.
 * @param userId The ID of the user.
 * @returns The count of projects.
 */
export async function countUserProjects(userId: string): Promise<number> {
  return await prisma.project.count({
    where: { userId },
  });
}
