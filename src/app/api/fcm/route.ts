import { NextResponse } from 'next/server';
import { z } from 'zod';
import { container } from '@/infrastructure/di/container';
import { UserController } from '@/modules/users/adapters/controllers/UserController';

const deviceTokenSchema = z.object({
  userId: z.string().min(1, 'User ID is required.'),
  token: z.string().min(1, 'Device token is required.'),
});

export async function POST(request: Request) {
  try {
    let body = await request.json();
    let validation = deviceTokenSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    let { userId, token } = validation.data;

    const controller = container.resolve(UserController);
    await controller.saveDeviceToken(userId, token);

    return NextResponse.json({ message: 'Device token saved successfully.' }, { status: 200 });

  } catch (error) {
    console.error('Error saving device token:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
