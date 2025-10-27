
'use client';

import type { UpdateAgentVariables, CreateAgentVariables } from '@/hooks';
import type { UploadedFile } from '@/components/admin/agent-editor/GenerateAgentView';
import { GenerateAgentConfigOutput } from '@/ai/schemas';
import type { AgentProperties, AgentCategoryDetails } from '@/lib/models/agent';


/**
 * Fetches the list of all agent configurations from the API.
 * This is now used by the `useAgents` hook.
 * @param token The user's authentication token.
 * @returns A promise that resolves to an array of AgentProperties.
 */
export async function fetchAgentsApi(token: string): Promise<AgentProperties[]> {
    const response = await fetch('/api/agents', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch agents');
    }
    return response.json();
}


/**
 * Fetches the full list of agent categories from the API.
 * Requires admin authentication.
 * @param token The admin user's authentication token.
 * @returns A promise that resolves to an array of AgentCategory objects.
 */
export async function fetchAgentCategoriesApi(token: string): Promise<AgentCategoryDetails[]> {
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
export async function createAgentCategoryApi(data: { id: string; name: string }, token: string): Promise<AgentCategoryDetails> {
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

export async function updateAgentCategoryApi(data: { id: string; name: string }, token: string): Promise<AgentCategoryDetails> {
    const response = await fetch(`/api/admin/agent-categories/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: data.name }),
    });
     if (!response.ok) {
        const error = await response.json();
        throw error;
    }
    return response.json();
}

export async function deleteAgentCategoryApi(id: string, token: string): Promise<{ message: string }> {
     const response = await fetch(`/api/admin/agent-categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
    });
     if (!response.ok) {
        const error = await response.json();
        throw error;
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
export async function fetchAgentApi(agentId: string, token: string): Promise<AgentProperties | null> {
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
export async function updateAgentApi(
    variables: UpdateAgentVariables,
    token: string
): Promise<AgentProperties> {
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
export async function createAgentApi(data: CreateAgentVariables, token: string): Promise<AgentProperties> {
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
    return await response.json();
}


/**
 * Deletes an agent via the API.
 * Requires admin authentication.
 * @param agentId The ID of the agent to delete.
 * @param token The admin user's authentication token.
 * @returns A promise that resolves when the deletion is successful.
 */
export async function deleteAgentApi(agentId: string, token: string): Promise<{ message: string }> {
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
export async function generateAgentConfigApi(variables: { prompt: string, includeJsonOutput: boolean, contextFiles: UploadedFile[] }, token: string): Promise<GenerateAgentConfigOutput> {
    const response = await fetch('/api/admin/agents/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(variables),
    });
     if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate agent configuration');
    }
    return response.json();
}


/**
 * Imports a list of agents into the database via the API.
 * Requires admin authentication.
 * @param agents An array of AgentProperties to import.
 * @param token The admin user's authentication token.
 * @returns A promise that resolves to a summary of the import.
 */
export async function importAgentsApi(agents: AgentProperties[], token: string): Promise<{ count: number }> {
    const response = await fetch('/api/admin/agents/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ agents }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to import agents');
    }
    return await response.json();
}
