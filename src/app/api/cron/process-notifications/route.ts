import { NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { UserController } from '@/modules/users/adapters/controllers/UserController';
import { handleApiError, handleUserResult } from '@/infrastructure/api/api-utils';

/**
 * CRON endpoint to process scheduled notifications.
 * In production, this should be protected by a secret token in the headers.
 */
export async function GET(request: Request) {
  try {
    // Security check: Verify cron secret if provided in environment
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const controller = container.resolve(UserController);
    const result = await controller.processScheduledNotifications();

    if (result.isFailure) {
        return handleUserResult(result);
    }

    return NextResponse.json({ 
        status: 'success', 
        processedCount: result.getValue() 
    }, { status: 200 });

  } catch (error) {
    return handleApiError(error);
  }
}
