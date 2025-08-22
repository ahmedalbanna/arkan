

'use server';

import { z } from 'zod';
import { getUserTeams, createTeamForUser } from '@/lib/db/queries';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

// GET /api/teams - Fetches all teams for the authenticated user
export const GET = withAuth(async ({ user }) => {
    try {
        const teams = await getUserTeams(user.id);
        return createApiResponse(teams, 200);
    } catch (error) {
        return handleApiError(error);
    }
});


// POST /api/teams - Creates a new team
const createTeamSchema = z.object({
  name: z.string().min(3, "Team name must be at least 3 characters").max(50, "Team name cannot exceed 50 characters"),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = createTeamSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const { name } = validation.data;
    const newTeam = await createTeamForUser(user.id, name);
    
    return createApiResponse(newTeam, 201);
  } catch (error) {
    return handleApiError(error);
  }
});

