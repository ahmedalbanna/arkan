
import 'server-only';
import { db } from './index';
import { users, projects, comments, media, tags, projectTags, skills, userSkills, technologies, summaryTechnologies } from './schema';
import { eq, desc, inArray, or, and, like, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { summarizeProject } from '@/ai/flows/summarize-project';
import { AGENTS } from '../agents';

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
    reportSections?: string;
    reportDiagrams?: string;
}) {
    // --- Start async operations ---

    const summarizerAgent = AGENTS.find(a => a.id === 'summarize-project');
    if (!summarizerAgent) {
        throw new Error("Summarizer agent not found.");
    }

    // 1. Generate summary and technologies
    const summaryResult = await summarizeProject({
        projectDescription: data.description,
        prompt: summarizerAgent.prompt,
    });

    // 2. Prepare tags
    let allTagIds: number[] = [];
    if (data.tags.length > 0) {
        const existingTags = await db.select().from(tags).where(inArray(tags.name, data.tags));
        const existingTagNames = new Set(existingTags.map(t => t.name));
        const newTagNames = data.tags.filter(t => !existingTagNames.has(t));

        if (newTagNames.length > 0) {
            const newTags = await db.insert(tags).values(newTagNames.map(name => ({ name }))).returning();
            existingTags.push(...newTags);
        }

        const tagMap = new Map(existingTags.map(t => [t.name, t.id]));
        allTagIds = data.tags.map(tagName => tagMap.get(tagName)!).filter(id => id !== undefined);
    }

    // 3. Prepare technologies
    let allTechIds: number[] = [];
    if (summaryResult.technologies.length > 0) {
        const existingTechs = await db.select().from(technologies).where(inArray(technologies.name, summaryResult.technologies));
        const existingTechNames = new Set(existingTechs.map(t => t.name));
        const newTechNames = summaryResult.technologies.filter(t => !existingTechNames.has(t));

        if (newTechNames.length > 0) {
            const newTechs = await db.insert(technologies).values(newTechNames.map(name => ({ name }))).returning();
            existingTechs.push(...newTechs);
        }

        const techMap = new Map(existingTechs.map(t => [t.name, t.id]));
        allTechIds = summaryResult.technologies.map(techName => techMap.get(techName)!).filter(id => id !== undefined);
    }

    // --- End async operations ---

    const newProjectId = `proj-${randomUUID()}`;

    // --- Start synchronous transaction ---
    db.transaction((tx) => {
        // Insert project
        tx.insert(projects).values({
            id: newProjectId,
            userId: data.userId,
            title: data.title,
            description: data.description,
            category: data.category,
            liveLink: data.liveLink,
            summaryShort: summaryResult.summary,
            createdAt: new Date().toISOString(),
            proposalData: data.proposalData,
            reportSections: data.reportSections,
            reportDiagrams: data.reportDiagrams,
        }).run();

        // Insert project tags
        if (allTagIds.length > 0) {
            tx.insert(projectTags).values(allTagIds.map(tagId => ({
                projectId: newProjectId,
                tagId,
            }))).run();
        }

        // Insert summary technologies
        if (allTechIds.length > 0) {
            tx.insert(summaryTechnologies).values(allTechIds.map(technologyId => ({
                projectId: newProjectId,
                technologyId,
            }))).run();
        }

        // Insert media
        if (data.media.length > 0) {
            tx.insert(media).values(data.media.map(m => ({
                projectId: newProjectId,
                url: m.url,
                alt: m.alt,
                aiHint: m.aiHint,
                type: m.type,
            }))).run();
        }
    });
    // --- End synchronous transaction ---

    return newProjectId;
}


export async function updateProject(projectId: string, data: {
    title: string;
    description: string;
    category: string;
    liveLink?: string;
    tags: string[];
    media: { url: string; alt: string; aiHint?: string; type: 'image' | 'video' }[];
}) {
    // 1. Handle tags asynchronously
    let allTagIds: number[] = [];
    if (data.tags.length > 0) {
        const existingTags = await db.select().from(tags).where(inArray(tags.name, data.tags));
        const existingTagNames = new Set(existingTags.map(t => t.name));
        const newTagNames = data.tags.filter(t => !existingTagNames.has(t));

        if (newTagNames.length > 0) {
            const newTags = await db.insert(tags).values(newTagNames.map(name => ({ name }))).returning();
            existingTags.push(...newTags);
        }

        const tagMap = new Map(existingTags.map(t => [t.name, t.id]));
        allTagIds = data.tags.map(tagName => tagMap.get(tagName)!).filter(id => id !== undefined);
    }

    // 2. Perform writes synchronously
    db.transaction((tx) => {
        // Update project details
        tx.update(projects).set({
            title: data.title,
            description: data.description,
            category: data.category,
            liveLink: data.liveLink || null,
        }).where(eq(projects.id, projectId)).run();

        // Handle tags
        tx.delete(projectTags).where(eq(projectTags.projectId, projectId)).run();
        if (allTagIds.length > 0) {
            tx.insert(projectTags).values(allTagIds.map(tagId => ({ projectId, tagId }))).run();
        }

        // Handle media
        tx.delete(media).where(eq(media.projectId, projectId)).run();
        if (data.media.length > 0) {
            tx.insert(media).values(data.media.map(m => ({
                projectId,
                url: m.url,
                alt: m.alt,
                aiHint: m.aiHint,
                type: m.type,
            }))).run();
        }
    });

    return projectId;
}

export async function deleteProject(projectId: string) {
    // With 'onDelete: cascade' in the schema, this will also delete related
    // media, comments, projectTags, and summaryTechnologies.
    await db.delete(projects).where(eq(projects.id, projectId));
    return { success: true };
}

export async function getAllUsers() {
    const data = await db.query.users.findMany();
    return data;
}

export async function updateUser(userId: string, data: {
    name: string;
    avatarUrl?: string;
    bio?: string;
    skills: string[];
}) {
    const allSkillIds: number[] = [];
    if (data.skills.length > 0) {
        const existingSkills = await db.select().from(skills).where(inArray(skills.name, data.skills));
        const existingSkillNames = new Set(existingSkills.map(s => s.name));
        const newSkillNames = data.skills.filter(s => !existingSkillNames.has(s));

        if (newSkillNames.length > 0) {
            const newSkills = await db.insert(skills).values(newSkillNames.map(name => ({ name }))).returning();
            existingSkills.push(...newSkills);
        }

        const skillMap = new Map(existingSkills.map(s => [s.name, s.id]));
        for (const skillName of data.skills) {
            const skillId = skillMap.get(skillName);
            if (skillId) {
                allSkillIds.push(skillId);
            }
        }
    }

    db.transaction((tx) => {
        tx.update(users).set({
            name: data.name,
            avatarUrl: data.avatarUrl,
            bio: data.bio
        }).where(eq(users.id, userId)).run();

        tx.delete(userSkills).where(eq(userSkills.userId, userId)).run();

        if (allSkillIds.length > 0) {
            tx.insert(userSkills).values(allSkillIds.map(skillId => ({
                userId: userId,
                skillId: skillId,
            }))).run();
        }
    });
}

/**
 * Deducts a specified amount of credits from a user's account.
 * @returns true if successful, false if credits are insufficient.
 */
export async function deductUserCredits(userId: string, amount: number): Promise<boolean> {
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { credits: true }
    });

    if (!user || user.credits < amount) {
        return false;
    }

    await db.update(users)
        .set({ credits: sql`${users.credits} - ${amount}` })
        .where(eq(users.id, userId));

    return true;
}
