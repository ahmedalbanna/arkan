
'use client';
import type { AgentProperties } from '@/lib/models';

export async function fetchAgentsApi(token: string, category?: string): Promise<AgentProperties[]> {
    const url = new URL('/api/agents', window.location.origin);
    if (category) {
        url.searchParams.append('category', category);
    }
    const response = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch agents');
    }
    return response.json();
}

export async function fetchAgentByIdApi(id: string, token: string): Promise<AgentProperties> {
    const response = await fetch(`/api/agents/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch agent');
    }
    return response.json();
}

export async function createAgentApi(data: Omit<AgentProperties, 'id'>, token: string): Promise<AgentProperties> {
    const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create agent');
    }
    return response.json();
}

export async function updateAgentApi(id: string, data: Partial<AgentProperties>, token: string): Promise<AgentProperties> {
    const response = await fetch(`/api/agents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update agent');
    }
    return response.json();
}

export async function deleteAgentApi(id: string, token: string): Promise<{ message: string }> {
    const response = await fetch(`/api/agents/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete agent');
    }
    return response.json();
}

export async function fetchAgentCategoriesApi(token: string) {
    const response = await fetch('/api/agent-categories', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch agent categories');
    }
    return response.json();
}
