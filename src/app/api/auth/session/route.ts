import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

/**
 * GET /api/auth/session
 * Returns the current NextAuth session
 */
export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ session: null }, { status: 200 });
    }

    return NextResponse.json({ session }, { status: 200 });
  } catch (error) {
    console.error('Session fetch error:', error);
    return NextResponse.json({ session: null }, { status: 200 });
  }
}
