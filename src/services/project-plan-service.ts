'use client';

import type { ProjectPlan, ProjectProposal } from '@/ai/schemas';

interface GeneratePlanVariables {
  proposal: ProjectProposal;
  token: string;
}

/**
 * Calls the API to generate a project plan from a proposal.
 * @param variables - An object containing the project proposal and auth token.
 * @returns A promise that resolves to the generated ProjectPlan.
 */
export async function generateProjectPlanApi(variables: GeneratePlanVariables): Promise<ProjectPlan> {
  const { proposal, token } = variables;
  const response = await fetch('/api/generate/project-plan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ proposal }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to generate project plan');
  }
  return await response.json();
}
