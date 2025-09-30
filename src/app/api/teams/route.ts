

'use server';

import { createApiResponseEnhanced, handleApiErrorEnhanced, withEnhancedAuth } from '@/lib/core/api';
import { createTeamForUser, getUserTeams } from '@/lib/db/queries';
import { z } from 'zod';

// GET /api/teams - Fetches all teams for the authenticated user
export const GET = withEnhancedAuth(async ({ user }) => {
  try {
    const teams = await getUserTeams(user.id);
    return createApiResponseEnhanced(teams, 200);
  } catch (error) {
    return handleApiErrorEnhanced(error);
  }
});


// POST /api/teams - Creates a new team
const createTeamSchema = z.object({
  name: z.string().min(3, "Team name must be at least 3 characters").max(50, "Team name cannot exceed 50 characters"),
});

export const POST = withEnhancedAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = createTeamSchema.safeParse(body);
    if (!validation.success) {
      return handleApiErrorEnhanced(validation.error);
    }

    const { name } = validation.data;
    const newTeam = await createTeamForUser(user.id, name);

    return createApiResponseEnhanced(newTeam, 201);
  } catch (error) {
    return handleApiErrorEnhanced(error);
  }
});
