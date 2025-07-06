import 'server-only';
import { db } from './index';
import { users, projects, comments, media, tags, projectTags, skills, userSkills, technologies, summaryTechnologies } from './schema';
import { eq, desc, inArray, or, and, like } from 'drizzle-orm';

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
