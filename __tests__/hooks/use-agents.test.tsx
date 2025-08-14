
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAgents, useAgent } from '@/hooks/use-agents';
import { AGENTS } from '@/lib/agents';
import * as authUtils from '@/lib/authUtils';
import * as agentService from '@/services/agent-service';

// Mock dependencies
jest.mock('@/lib/authUtils');
jest.mock('@/services/agent-service');
const mockedGetAuthenticatedToken = authUtils.getAuthenticatedToken as jest.Mock;
const mockedFetchAgents = agentService.fetchAgent as jest.Mock;
const mockedFetchAgent = agentService.fetchAgent as jest.Mock;


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Prevent retries in tests
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useAgents Hook', () => {
    beforeEach(() => {
        // Clear mocks before each test
        jest.clearAllMocks();
        queryClient.clear();
        mockedGetAuthenticatedToken.mockResolvedValue('fake-token');
    });

    it('fetches agents from the API and returns them', async () => {
        mockedFetchAgents.mockResolvedValue(AGENTS);

        const { result } = renderHook(() => useAgents(), { wrapper });
        
        await waitFor(() => expect(result.current.isLoaded).toBe(true));
        
        expect(result.current.agents).toEqual(AGENTS);
        expect(result.current.isError).toBe(false);
        expect(mockedFetchAgents).toHaveBeenCalledWith('fake-token');
    });
    
    it('handles API errors gracefully', async () => {
        mockedFetchAgents.mockRejectedValue(new Error('API is down'));
        
        const { result } = renderHook(() => useAgents(), { wrapper });

        await waitFor(() => expect(result.current.isLoaded).toBe(true));

        // It should return default agents as a fallback and mark as an error
        expect(result.current.agents).toEqual(AGENTS);
        expect(result.current.isError).toBe(true);
    });
});

describe('useAgent Hook', () => {
    const testAgent = AGENTS[0];
    const agentId = testAgent.id;

    beforeEach(() => {
        jest.clearAllMocks();
        queryClient.clear();
        mockedGetAuthenticatedToken.mockResolvedValue('fake-token');
    });

    it('fetches a single agent by ID', async () => {
        mockedFetchAgent.mockResolvedValue(testAgent);

        const { result } = renderHook(() => useAgent(agentId), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        
        expect(result.current.data).toEqual(testAgent);
        expect(mockedFetchAgent).toHaveBeenCalledWith(agentId, 'fake-token');
    });

    it('returns an error state when fetching a single agent fails', async () => {
        mockedFetchAgent.mockRejectedValue(new Error('Agent not found'));

        const { result } = renderHook(() => useAgent(agentId), { wrapper });

        await waitFor(() => expect(result.current.isError).toBe(true));

        expect(result.current.data).toBeUndefined();
    });
});
