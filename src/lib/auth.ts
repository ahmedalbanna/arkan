/**
 * Authentication Utilities
 * Server-side authentication helpers
 */

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db/prisma';

/**
 * Get current session (server-side)
 */
export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * Get current user (server-side)
 */
export async function getCurrentUser() {
  const session = await getSession();
  
  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      fullName: true,
      image: true,
      role: true,
      credits: true,
      phone: true,
      emailVerified: true,
      phoneVerified: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
    },
  });

  return user;
}

/**
 * Require authentication (server-side)
 * Throws error if not authenticated
 */
export async function requireAuth() {
  const session = await getSession();
  
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  return session;
}

/**
 * Require admin role (server-side)
 * Throws error if not admin
 */
export async function requireAdmin() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    throw new Error('Forbidden: Admin access required');
  }

  return user;
}

/**
 * Check if user has credits
 */
export async function hasCredits(userId: string, amount: number = 1) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });

  return (user?.credits || 0) >= amount;
}

/**
 * Deduct credits from user
 */
export async function deductCredits(userId: string, amount: number, reason: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });

  if (!user || user.credits < amount) {
    throw new Error('Insufficient credits');
  }

  // Update user credits (trigger will log to credit_ledger)
  await prisma.user.update({
    where: { id: userId },
    data: { credits: { decrement: amount } },
  });

  return true;
}

/**
 * Add credits to user
 */
export async function addCredits(userId: string, amount: number, reason: string) {
  // Update user credits (trigger will log to credit_ledger)
  await prisma.user.update({
    where: { id: userId },
    data: { credits: { increment: amount } },
  });

  return true;
}
