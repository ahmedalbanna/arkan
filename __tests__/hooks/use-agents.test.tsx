
import { renderHook, waitFor } from '@testing-library/react';
import { useAgents } from '@/hooks/use-agents';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type Agent, AgentCategory } from '@/lib/agents';
import { Bot } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import fetchMock from 'jest-fetch-mock';


jest.mock('@/context/AuthContext');
const mockedUseAuth = useAuth as jest.Mock;

const mockAgents: Agent[] = [
  { id: 'agent-1', name: 'Test Agent 1', description: 'Desc 1', category: AgentCategory.ProposalGeneration, pageUrl: '/test1', isEnabled: true, prompt: 'Prompt 1', icon: Bot },
  { id: 'agent-2', name: 'Test Agent 2', description: 'Desc 2', category: AgentCategory.ReportGeneration, pageUrl: '/test2', isEnabled: false, prompt: 'Prompt 2', icon: Bot },
];

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Turn off retries for tests
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('useAgents', () => {
  beforeEach(() => {
    // Reset mocks before each test
    fetchMock.resetMocks();
    mockedUseAuth.mockReturnValue({
        firebaseUser: {
            getIdToken: async () => 'test-token',
        },
    });
  });

  it('should return a list of agents on successful fetch', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockAgents));
    
    const { result } = renderHook(() => useAgents(), { wrapper });

    await waitFor(() => expect(result.current.isLoaded).toBe(true));
    
    expect(result.current.agents).toEqual(mockAgents);
    expect(result.current.isError).toBe(false);
  });

  it('should return an error state when fetch fails', async () => {
    fetchMock.mockRejectOnce(new Error('API Error'));
    
    const { result } = renderHook(() => useAgents(), { wrapper });

    await waitFor(() => expect(result.current.isLoaded).toBe(true));
    
    expect(result.current.agents).toEqual([]);
    expect(result.current.isError).toBe(true);
  });
  
  it('should not fetch if user is not authenticated', async () => {
    mockedUseAuth.mockReturnValue({ firebaseUser: null });

    const { result } = renderHook(() => useAgents(), { wrapper });
    
    // Give it a moment to run, but it shouldn't fetch
    await new Promise(res => setTimeout(res, 50));
    
    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.isLoaded).toBe(true); // Should be considered loaded as it won't fetch
    expect(result.current.agents).toEqual([]);
  });
});
