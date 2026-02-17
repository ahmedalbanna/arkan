
'use server';

import { createApiResponse, handleApiError } from '@/lib/utils/api-utils';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';
import bcrypt from 'bcrypt';

const signupSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    name: z.string().min(1, "Name is required"),
});

/**
 * API endpoint for creating a new user in PostgreSQL with Prisma.
 * Hashes password with bcrypt and stores it in the database.
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validation = signupSchema.safeParse(body);
        if (!validation.success) {
            return handleApiError(validation.error);
        }
        
        const { email, password, name } = validation.data;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return handleApiError({ message: "Email address is already in use by another account." }, 409);
        }

        // Hash the password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create the user in PostgreSQL
        const user = await prisma.user.create({
            data: {
                email,
                name,
                passwordHash,
                emailVerified: new Date(), // Mark as verified for signup
                role: 'USER',
                credits: 100, // Default credits for new users
            },
            select: {
                id: true,
                email: true,
                name: true,
            },
        });

        return createApiResponse({ user }, 201);

    } catch (error) {
        // Handle specific error types
        if (error && typeof error === 'object' && 'code' in error) {
            const err = error as any;
            if (err.code === 'P2002') {
                // Unique constraint violation
                return handleApiError({ message: "Email address is already in use by another account." }, 409);
            }
        }
        
        console.error('Signup error:', error);
        return handleApiError(error);
    }
}
