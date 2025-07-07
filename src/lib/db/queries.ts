import 'server-only';
import { db } from './index';
import { users, projects, comments, media, tags, projectTags, skills, userSkills, technologies, summaryTechnologies } from './schema';
import { eq, desc, inArray, or, and, like } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export async function getFeaturedProjects() {
    const data = await db.query.projects.findMany({
        limit: 3,
        orderBy: [desc(projects.createdAt)],
        with: {
            user: true,
            media: {
                limit: 1
            },
        }
    });
    return data;
}
export type ProjectForCard = Awaited<ReturnType<typeof getFeaturedProjects>>[number];


export async function getAllProjects({ category, q }: { category?: string; q?: string }) {
    const conditions = [];

    if (category && category !== 'all') {
        conditions.push(eq(projects.category, category));
    }

    if (q) {
        const searchQuery = `%${q}%`;
        
        const projectsWithMatchingTags = db
            .select({ projectId: projectTags.projectId })
            .from(projectTags)
            .leftJoin(tags, eq(projectTags.tagId, tags.id))
            .where(like(tags.name, searchQuery));

        conditions.push(or(
            like(projects.title, searchQuery),
            like(projects.description, searchQuery),
            inArray(projects.id, projectsWithMatchingTags)
        ));
    }
    
    const data = await db.query.projects.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        orderBy: [desc(projects.createdAt)],
        with: {
            user: true,
            media: {
                limit: 1
            },
        }
    });
    return data;
}

export async function getAllCategories() {
    const data = await db.selectDistinct({ category: projects.category }).from(projects);
    return data.map(item => item.category);
}


export async function getProjectById(id: string) {
    const data = await db.query.projects.findFirst({
        where: eq(projects.id, id),
        with: {
            user: true,
            media: true,
            projectTags: {
                with: {
                    tag: true,
                }
            },
            summaryTechnologies: {
                with: {
                    technology: true,
                }
            },
            comments: {
                with: {
                    user: true,
                },
                orderBy: [desc(comments.createdAt)]
            }
        }
    });
    return data;
}
export type ProjectDetail = Awaited<ReturnType<typeof getProjectById>>;


export async function getUserProfile(id: string) {
    const data = await db.query.users.findFirst({
        where: eq(users.id, id),
        with: {
            userSkills: {
                with: {
                    skill: true
                }
            },
            projects: {
                with: {
                    user: true,
                    media: {
                        limit: 1
                    }
                },
                orderBy: [desc(projects.createdAt)]
            }
        }
    });
    return data;
}
export type UserProfile = Awaited<ReturnType<typeof getUserProfile>>;

export async function addComment({ projectId, userId, content }: { projectId: string; userId: string; content: string; }) {
    const newComment = await db.insert(comments).values({
        id: `comment-${randomUUID()}`,
        projectId,
        userId,
        content,
        createdAt: new Date().toISOString(),
    }).returning();
    return newComment[0];
}

export async function updateComment(id: string, content: string) {
    await db.update(comments).set({ content, createdAt: new Date().toISOString() }).where(eq(comments.id, id));
}

export async function deleteComment(id: string) {
    await db.delete(comments).where(eq(comments.id, id));
}

export async function createProject(data: {
    userId: string;
    title: string;
    description: string;
    category: string;
    liveLink?: string;
    tags: string[];
    media: { url: string; alt: string; aiHint?: string; type: 'image' | 'video' }[];
    proposalData?: string;
}) {
    return await db.transaction(async (tx) => {
        // 1. Create the project
        const newProjectId = `proj-${randomUUID()}`;
        await tx.insert(projects).values({
            id: newProjectId,
            userId: data.userId,
            title: data.title,
            description: data.description,
            category: data.category,
            liveLink: data.liveLink,
            createdAt: new Date().toISOString(),
            proposalData: data.proposalData,
        });

        // 2. Handle tags
        if (data.tags.length > 0) {
            const existingTags = await tx.select().from(tags).where(inArray(tags.name, data.tags));
            const existingTagNames = new Set(existingTags.map(t => t.name));
            const newTagNames = data.tags.filter(t => !existingTagNames.has(t));

            if (newTagNames.length > 0) {
                const newTags = await tx.insert(tags).values(newTagNames.map(name => ({ name }))).returning();
                existingTags.push(...newTags);
            }
            
            const tagMap = new Map(existingTags.map(t => [t.name, t.id]));

            await tx.insert(projectTags).values(data.tags.map(tagName => {
                const tagId = tagMap.get(tagName);
                if (!tagId) throw new Error(`Could not find or create tag: ${tagName}`);
                return { projectId: newProjectId, tagId };
            }));
        }

        // 3. Handle media
        if (data.media.length > 0) {
            await tx.insert(media).values(data.media.map(m => ({
                projectId: newProjectId,
                url: m.url,
                alt: m.alt,
                aiHint: m.aiHint,
                type: m.type,
            })));
        }

        return newProjectId;
    });
}

export async function updateProject(projectId: string, data: {
    title: string;
    description: string;
    category: string;
    liveLink?: string;
    tags: string[];
    media: { url: string; alt: string; aiHint?: string; type: 'image' | 'video' }[];
}) {
    return await db.transaction(async (tx) => {
        // 1. Update the project details
        await tx.update(projects).set({
            title: data.title,
            description: data.description,
            category: data.category,
            liveLink: data.liveLink || null,
        }).where(eq(projects.id, projectId));

        // 2. Handle tags (delete old, add new)
        await tx.delete(projectTags).where(eq(projectTags.projectId, projectId));
        if (data.tags.length > 0) {
            const existingTags = await tx.select().from(tags).where(inArray(tags.name, data.tags));
            const existingTagNames = new Set(existingTags.map(t => t.name));
            const newTagNames = data.tags.filter(t => !existingTagNames.has(t));

            if (newTagNames.length > 0) {
                const newTags = await tx.insert(tags).values(newTagNames.map(name => ({ name }))).returning();
                existingTags.push(...newTags);
            }
            
            const tagMap = new Map(existingTags.map(t => [t.name, t.id]));

            await tx.insert(projectTags).values(data.tags.map(tagName => {
                const tagId = tagMap.get(tagName);
                if (!tagId) throw new Error(`Could not find or create tag: ${tagName}`);
                return { projectId, tagId };
            }));
        }

        // 3. Handle media (delete old, add new)
        await tx.delete(media).where(eq(media.projectId, projectId));
        if (data.media.length > 0) {
            await tx.insert(media).values(data.media.map(m => ({
                projectId,
                url: m.url,
                alt: m.alt,
                aiHint: m.aiHint,
                type: m.type,
            })));
        }

        return projectId;
    });
}

export async function deleteProject(projectId: string) {
    // With 'onDelete: cascade' in the schema, this will also delete related
    // media, comments, projectTags, and summaryTechnologies.
    await db.delete(projects).where(eq(projects.id, projectId));
    return { success: true };
}
