
'use server';

import { createApiResponse, handleApiError, withAuth } from '@/lib/utils/api-utils';
import { container } from '@/infrastructure/di/container';
import { AiController } from '@/modules/ai/adapters/controllers/AiController';

export const POST = withAuth(async ({ request, user, params }) => {
  const toolName = (await params).tool as string;

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
        input: validation.data as any
    });

    return createApiResponse(result, 200);

  } catch (error) {
    return handleApiError(error);
  }
});
