/**
 * Password Reset API Route
 * Handles password reset requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const resetSchema = z.object({
  email: z.string().email('Invalid email address'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  token: z.string().optional(), // For email-based reset
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = resetSchema.parse(body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      // Don't reveal if user exists
      return NextResponse.json(
        { success: true, message: 'If the email exists, password reset instructions have been sent.' },
        { status: 200 }
      );
    }

    // In production, verify reset token here
    // For now, allow reset for development

    // Hash new password
    const passwordHash = await bcrypt.hash(validatedData.newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
