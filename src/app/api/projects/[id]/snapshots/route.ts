import { withAuth, handleApiError, handleProjectResult } from '@/infrastructure/api/api-utils';
import { container } from '@/infrastructure/di/container';
import { ProjectController } from '@/modules/projects/adapters/controllers/ProjectController';
import { Result } from '@/infrastructure/utils/result';

export const GET = withAuth(async ({ params }) => {
  try {
    const { id } = await params;
    const controller = container.resolve(ProjectController);
    const result = await controller.getSnapshots(id);
    
    if (result.isSuccess) {
      return Response.json(result.getValue().map((s: any) => s.toJSON()));
    }
    return handleProjectResult(result);
  } catch (error) {
    return handleApiError(error);
  }
});

export const POST = withAuth(async ({ params, request }) => {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, snapshotData } = body;
    
    const controller = container.resolve(ProjectController);
    const result = await controller.createSnapshot(id, name, snapshotData);
    
    if (result.isSuccess) {
        return Response.json(result.getValue().toJSON());
    }
    return handleProjectResult(result);
  } catch (error) {
    return handleApiError(error);
  }
});
