
'use client';

import type { UpdateAgentVariables, CreateAgentVariables, Agent, AgentCategory } from '@/hooks/use-agents';
import type { UploadedFile } from '@/components/admin/agent-editor/GenerateAgentView';

/**
 * Fetches the full list of agent categories from the API.
 * Requires admin authentication.
 * @param token The admin user's authentication token.
 * @returns A promise that resolves to an array of AgentCategory objects.
 */
export async function fetchAgentCategories(token: string): Promise<AgentCategory[]> {
    const response = await fetch('/api/admin/agent-categories', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch agent categories');
    }
    return response.json();
}

/**
 * Creates a new agent category via the API.
 * Requires admin authentication.
 * @param data An object containing the new category's id and name.
 * @param token The admin user's authentication token.
 * @returns A promise that resolves to the newly created AgentCategory object.
 */
export async function createAgentCategory(data: { id: string; name: string }, token: string): Promise<AgentCategory> {
    const response = await fetch('/api/admin/agent-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw error;
    }
    return response.json();
}


/**
 * Fetches the full list of agents from the API.
 * Requires admin authentication.
 * @param token The admin user's authentication token.
 * @returns A promise that resolves to an array of Agent objects.
 */
export async function fetchAgents(token: string): Promise<Agent[]> {
    const response = await fetch('/api/admin/agents', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch agents');
    }
    return response.json();
}


/**
 * Fetches the configuration for a single agent by its ID.
 * Requires admin authentication.
 * @param agentId The ID of the agent to fetch.
 * @param token The admin user's authentication token.
 * @returns A promise that resolves to the Agent object, or null if not found.
 */
export async function fetchAgent(agentId: string, token: string): Promise<Agent | null> {
    if (!agentId) return null;
    const response = await fetch(`/api/admin/agents/${agentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
        if(response.status === 404) return null;
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch agent');
    }
    return response.json();
}

/**
 * Updates an agent's configuration via the API.
 * Requires admin authentication.
 * @param variables An object containing the agentId and the payload to update.
 * @param token The admin user's authentication token.
 * @returns A promise that resolves to the updated Agent object.
 */
export async function updateAgent(
    variables: UpdateAgentVariables,
    token: string
): Promise<Agent> {
    const { agentId, payload } = variables;
    const response = await fetch(`/api/admin/agents/${agentId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update agent.');
    }
    return response.json();
}

/**
 * Creates a new agent via the API.
 * Requires admin authentication.
 * @param data The data for the new agent.
 * @param token The admin user's authentication token.
 * @returns A promise that resolves to the newly created Agent object.
 */
export async function createAgent(data: CreateAgentVariables, token: string): Promise<Agent> {
    const response = await fetch('/api/admin/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        // The error from the API might already contain structured validation errors
        // Throwing it allows useMutation's onError to catch it.
        throw error;
    }
    return response.json();
}


/**
 * Deletes an agent via the API.
 * Requires admin authentication.
 * @param agentId The ID of the agent to delete.
 * @param token The admin user's authentication token.
 * @returns A promise that resolves when the deletion is successful.
 */
export async function deleteAgent(agentId: string, token: string): Promise<{ message: string }> {
    const response = await fetch(`/api/admin/agents/${agentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete agent');
    }
    return response.json();
}


/**
 * Calls the API to generate a configuration for a new agent.
 * @param prompt The user's description of the agent to create.
 * @param token The admin user's authentication token.
 * @returns A promise that resolves to the generated agent configuration.
 */
export async function generateAgentConfigApi(prompt: string, includeJsonOutput: boolean, contextFiles: UploadedFile[], token: string): Promise<any> {
    const response = await fetch('/api/admin/agents/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ prompt, includeJsonOutput, contextFiles }),
    });
     if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate agent configuration');
    }
    return response.json();
}
