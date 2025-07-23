
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { agentKeys } from '@/lib/query-keys';
import type { Agent, AgentPrompt } from '@/lib/agents';
import { useAuth } from '@/context/AuthContext';
import { UseQueryOptions } from '@tanstack/react-query';
import { handleErrorUtility } from '@/lib/errorUtils';
import { getAuthenticatedToken } from '@/lib/authUtils';


// --- API Service Functions ---

async function fetchAgents(token: string): Promise<Agent[]> {
    const response = await fetch('/api/agents', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch agents');
    }
    return response.json();
}

async function fetchAgent(agentId: string, token: string): Promise<Agent | null> {
    if (!agentId) return null;
    const response = await fetch(`/api/agents/${agentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
        if(response.status === 404) return null;
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch agent');
    }
    return response.json();
}

interface UpdateAgentPayload {
    name?: string;
    prompt?: string;
    isEnabled?: boolean;
}

async function updateAgentApi(
    { agentId, payload }: { agentId: string; payload: UpdateAgentPayload },
    token: string
) {
    const response = await fetch(`/api/agents/${agentId}`, {
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

// Define type for mutation variables
interface UpdateAgentVariables {
    agentId: string;
    payload: UpdateAgentPayload;
}

// --- Custom Hooks ---

export function useAgents() {
    const { firebaseUser } = useAuth();

    const { data: agents, isLoading, isError } = useQuery<Agent[]>({
        queryKey: agentKeys.lists(),
        queryFn: async () => {
            const token = await getAuthenticatedToken(firebaseUser);
            return fetchAgents(token);
        },
        enabled: !!firebaseUser,
    });

    const getAgent = (id: string): Agent | undefined => {
        return agents?.find(agent => agent.id === id);
    };

    return { agents: agents || [], isLoaded: !isLoading, isError, getAgent };
}

type UseAgentOptions = Omit<UseQueryOptions<Agent | null, Error>, 'queryKey' | 'queryFn' | 'enabled'>;

export function useAgent(agentId: string, options?: UseAgentOptions) {
    const { firebaseUser } = useAuth();
    return useQuery<Agent | null, Error>({
        queryKey: agentKeys.detail(agentId),
        queryFn: async () => {
            const token = await getAuthenticatedToken(firebaseUser);
            return fetchAgent(agentId, token);
        },
        enabled: !!firebaseUser && !!agentId,
        ...options, // Spread additional options like `enabled`
    });
}


export function useUpdateAgent() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();

    return useMutation<Agent, Error, UpdateAgentVariables>({
        mutationFn: async (variables) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return updateAgentApi(variables, token);
        },
        onSuccess: (data, variables) => {
            // Invalidate queries to refetch data
            queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
            queryClient.invalidateQueries({ queryKey: agentKeys.detail(variables.agentId) });

            toast({
                title: 'Agent Updated',
                description: `Agent "${data.name}" has been successfully updated.`,
            });
        },
        onError: (error: Error) => {
            handleErrorUtility(error, 'Update Agent Failed');
        }
    });
}
