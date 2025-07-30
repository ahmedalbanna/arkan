
'use client';

import type { AnyProjectProposal } from '@/ai/schemas';

interface GenerateProposalVariables {
    body: {
        projectIdea: string;
        templateId: string;
        customGuidelines: string[];
    };
    token: string;
}

/**
 * Calls the API to generate a new project proposal.
 * @param variables - An object containing the request body and the user's auth token.
 * @returns A promise that resolves to the generated proposal data.
 */
export async function generateProposalApi(variables: GenerateProposalVariables): Promise<AnyProjectProposal> {
    const response = await fetch('/api/generate/proposal', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${variables.token}`
        },
        body: JSON.stringify(variables.body)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate proposal');
    }
    return await response.json();
}
