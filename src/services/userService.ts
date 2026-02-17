
'use server';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcrypt';
import type { User } from '@prisma/client';

export type UserProfile = Omit<User, 'passwordHash'> & {
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
};

export async function getUserProfile(id: string): Promise<UserProfile | null> {
  if (!id) return null;
  
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      role: true,
      fullName: true,
      phone: true,
      phoneVerified: true,
      credits: true,
      totalSpent: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
    },
  });

  if (!user) {
    return null;
  }

  return user as UserProfile;
}

export async function getPaginatedUsers({ limit, lastVisibleId }: { limit: number; lastVisibleId?: string }) {
  let query = prisma.user.findMany({
    take: limit + 1,
    skip: lastVisibleId ? 1 : 0,
    ...(lastVisibleId && {
      cursor: { id: lastVisibleId },
    }),
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      role: true,
      fullName: true,
      phone: true,
      phoneVerified: true,
      credits: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const users = await query;
  const hasNextPage = users.length > limit;
  const paginatedUsers = users.slice(0, limit) as UserProfile[];
  const newLastVisibleId = hasNextPage ? users[limit].id : null;

  return { users: paginatedUsers, hasNextPage, lastVisibleId: newLastVisibleId };
}

export async function createUser(data: {
  email: string;
  password?: string;
  name?: string;
  role?: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  credits?: number;
}): Promise<{ user: { id: string; email: string | null } }> {
  const { email, password, name, role = 'USER', credits = 0 } = data;

  // Hash password if provided
  let passwordHash: string | null = null;
  if (password) {
    passwordHash = await bcrypt.hash(password, 10);
  }

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      role,
      credits,
      emailVerified: new Date(), // Auto-verify new users
    },
    select: {
      id: true,
      email: true,
    },
  });

  return { user };
}

export async function updateUser(
  userId: string,
  data: Partial<Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<UserProfile> {
  const updateData: any = { ...data };

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      role: true,
      fullName: true,
      phone: true,
      phoneVerified: true,
      credits: true,
      totalSpent: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
    },
  });

  return updatedUser as UserProfile;
}

export async function deleteUser(userId: string) {
  await prisma.user.delete({
    where: { id: userId },
  });
}

export async function resetUserPassword(userId: string, newPassword: string): Promise<void> {
  const passwordHash = await bcrypt.hash(newPassword, 10);
  
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}

export async function deductUserCredits(userId: string, creditsToDeduct: number): Promise<number> {
  // Use a transaction to ensure atomicity
  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const currentCredits = user.credits;

    if (currentCredits < creditsToDeduct) {
      throw {
        status: 402,
        message: 'Insufficient credits. Please purchase more credits to continue.',
      };
    }

    const newBalance = currentCredits - creditsToDeduct;
    await tx.user.update({
      where: { id: userId },
      data: { credits: newBalance },
    });

    return newBalance;
  });
}

export async function addUserCredits(userId: string, creditsToAdd: number): Promise<number> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      credits: {
        increment: creditsToAdd,
      },
    },
    select: { credits: true },
  });

  return user.credits;
}
