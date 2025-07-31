
'use client';

import type { ProjectPlan } from '@/ai/schemas';
import type { GenerateProjectPlanInput } from '@/ai/flows/generate-project-plan';

interface GeneratePlanVariables extends GenerateProjectPlanInput {
  token: string;
}

/**
 * Calls the API to generate a project plan from a proposal or idea.
 * @param variables - An object containing the project data and auth token.
 * @returns A promise that resolves to the generated ProjectPlan.
 */
export async function generateProjectPlanApi(variables: GeneratePlanVariables): Promise<ProjectPlan> {
  const { token, ...body } = variables;
  const response = await fetch('/api/generate/project-plan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to generate project plan');
  }
  return await response.json();
}
