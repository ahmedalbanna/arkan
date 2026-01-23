/**
 * Agent Service - API calls for agent management
 */

import type { AgentProperties } from '@/lib/models';

/**
 * Fetch all agents for the current user
 */
export async function fetchAgentsApi(token: string): Promise<AgentProperties[]> {
  const response = await fetch('/api/agents', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch agents: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Create a new agent
 */
export async function createAgentApi(
  data: Omit<AgentProperties, 'id'> | AgentProperties,
  token: string
): Promise<AgentProperties> {
  const response = await fetch('/api/agents', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create agent: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Update an existing agent
 */
export async function updateAgentApi(
  id: string,
  data: Partial<AgentProperties>,
  token: string
): Promise<AgentProperties> {
  const response = await fetch(`/api/agents/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update agent: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Delete an agent
 */
export async function deleteAgentApi(id: string, token: string): Promise<void> {
  const response = await fetch(`/api/agents/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete agent: ${response.statusText}`);
  }
}
