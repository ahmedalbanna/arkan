
'use server';

import { handleAiResult, handleApiError, withAuth } from '@/infrastructure/api/api-utils';
import { container } from '@/infrastructure/di/container';
import { AiController } from '@/modules/ai/adapters/controllers/AiController';
import { headers } from 'next/headers';

export const POST = withAuth(async ({ request, user, params }) => {
  const toolName = (await params).tool as string;
  const ip = (await headers()).get('x-forwarded-for') || '127.0.0.1';

  try {
    const controller = container.resolve(AiController);
    const config = controller.getToolConfig(toolName);
    
    if (!config) {
        return handleApiError({ message: `Invalid tool: ${toolName}` }, 400);
    }

    const body = await request.json();
    const validation = config.schema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const result = await controller.runTool<any, any>({
        userId: user.id,
        toolName,
        input: validation.data as any,
        ip
    });

    return handleAiResult(result);

  } catch (error) {
    return handleApiError(error);
  }
});
