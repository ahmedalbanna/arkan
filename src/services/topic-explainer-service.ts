
'use client';

import { TopicExplainerOutput } from '@/ai/schemas';
import type { TopicExplainerVariables } from './writing-tools-service';

interface TopicExplainerApiVariables extends TopicExplainerVariables {
    token: string;
}

/**
 * Calls the API for the Topic Explainer tool.
 */
export async function topicExplainerApi(variables: TopicExplainerApiVariables): Promise<TopicExplainerOutput> {
    const { token, ...body } = variables;
    const response = await fetch('/api/ai/writing-tools/topic-explainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error((await response.json()).message || 'Topic Explainer failed.');
    return response.json();
}
