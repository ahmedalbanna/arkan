
import 'server-only';
import { db } from './index';
import { users } from './schema';
import { eq, desc } from 'drizzle-orm';

export async function getUserProfile(id: string) {
    const data = await db.query.users.findFirst({
        where: eq(users.id, id),
    });
    return data;
}
export type UserProfile = NonNullable<Awaited<ReturnType<typeof getUserProfile>>>;


export async function getAllUsers() {
    const data = await db.query.users.findMany({
      orderBy: [desc(users.createdAt)]
    });
    return data;
}
export type AllUsers = Awaited<ReturnType<typeof getAllUsers>>;

export async function getPaginatedUsers({ page, limit }: { page: number; limit: number; }) {
    const offset = (page - 1) * limit;
    const data = await db.query.users.findMany({
        orderBy: [desc(users.createdAt)],
        limit: limit,
        offset: offset,
    });
    return data;
}


export async function updateUser(userId: string, data: {
    name: string;
    avatarUrl?: string;
    bio?: string;
}) {
    await db.update(users).set({
        name: data.name,
        avatarUrl: data.avatarUrl,
        bio: data.bio
    }).where(eq(users.id, userId));
}

export async function updateUserCredits(userId: string, creditsToAdd: number): Promise<number> {
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { credits: true }
    });

    if (!user) {
        throw new Error("User not found");
    }

    const newBalance = (user.credits ?? 0) + creditsToAdd;

    await db.update(users)
        .set({ credits: newBalance })
        .where(eq(users.id, userId));

    return newBalance;
}

export async function deductUserCredits(userId: string, creditsToDeduct: number): Promise<number> {
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { credits: true }
    });

    if (!user) {
        throw new Error("User not found");
    }

    if ((user.credits ?? 0) < creditsToDeduct) {
        throw new Error("Insufficient credits");
    }

    const newBalance = (user.credits ?? 0) - creditsToDeduct;

    await db.update(users)
        .set({ credits: newBalance })
        .where(eq(users.id, userId));

    return newBalance;
}


export async function updateUserByAdmin(userId: string, data: {
    name?: string;
    email?: string;
    bio?: string;
    credits?: number;
}) {
  await db.update(users).set(data).where(eq(users.id, userId));
}

export async function deleteUser(userId: string) {
    await db.delete(users).where(eq(users.id, userId));
}
