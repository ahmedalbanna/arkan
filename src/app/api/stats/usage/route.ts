
import { NextResponse } from 'next/server';
import { withAuth, createApiResponse } from '@/infrastructure/api/api-utils';
import { rateLimiter } from '@/infrastructure/security/rate-limiter';
import { headers } from 'next/headers';

export const GET = withAuth(async ({ user }) => {
  const ip = (await headers()).get('x-forwarded-for') || '127.0.0.1';
  const isGuest = user.id === 'guest';
  
  const guestStats = await rateLimiter.getStats('guest-writing-tools', ip, 5, 24 * 60 * 60 * 1000);
  const registeredFreeStats = await rateLimiter.getStats('registered-free-tier', user.id, 10, 24 * 60 * 60 * 1000);

  return createApiResponse({
    remainingFreeGenerations: isGuest ? guestStats.remaining : registeredFreeStats.remaining,
    totalLimit: isGuest ? 5 : 10,
    tier: isGuest ? 'guest' : (user.credits === 0 ? 'free' : 'premium'),
    resetAt: isGuest ? guestStats.resetAt : registeredFreeStats.resetAt
  }, 200);
});
