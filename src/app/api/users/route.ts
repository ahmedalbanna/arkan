
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getPaginatedUsers } from '@/lib/db/queries';

const userSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = userSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name, email } = validation.data;

    // In a real application, you would hash the password and save the user to a database.
    // For this prototype, we'll just return a success response with the new user data.

    // Don't return the password in the response for security reasons
    const newUser = {
      id: `user-${Date.now()}`, // simple id generation for example
      name,
      email,
    };

    return NextResponse.json(newUser, { status: 201 });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}

const userListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = userListQuerySchema.safeParse({
        page: searchParams.get('page'),
        limit: searchParams.get('limit'),
    });
    
    if (!query.success) {
        return NextResponse.json({ errors: query.error.flatten().fieldErrors }, { status: 400 });
    }

    const { page, limit } = query.data;

    const users = await getPaginatedUsers({ page, limit });
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'An unexpected error occurred while fetching users.' }, { status: 500 });
  }
}
