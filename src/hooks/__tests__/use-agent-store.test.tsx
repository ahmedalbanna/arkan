import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';

jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('@/infrastructure/api/authenticated-client-call', () => ({ runAuthenticatedResultCall: jest.fn() }));
jest.mock('@/lib/utils/cache', () => ({ getFromCache: jest.fn(), saveToCache: jest.fn() }));
jest.mock('@/hooks/util/use-toast', () => ({ toast: jest.fn() }));

const { useAuth } = jest.requireMock('@/context/AuthContext') as { useAuth: jest.Mock };
const { runAuthenticatedResultCall } = jest.requireMock('@/infrastructure/api/authenticated-client-call') as { runAuthenticatedResultCall: jest.Mock };
const { getFromCache, saveToCache } = jest.requireMock('@/lib/utils/cache') as { getFromCache: jest.Mock; saveToCache: jest.Mock };

const { useAgentManager } = require('../use-agent-store') as typeof import('../use-agent-store');

describe('useAgentManager', () => {
  const user = { uid: 'agent-user-1' } as { uid: string };

  const createWrapper = (queryClient: QueryClient) => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    Wrapper.displayName = 'AgentStoreQueryClientWrapper';
    return Wrapper;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ user });
    getFromCache.mockReturnValue(undefined);
  });

  it('hydrates agents through the authenticated helper and auto-selects the first agent', async () => {
    runAuthenticatedResultCall.mockResolvedValue([
      { id: 'agent-1', name: 'Agent One', prompt: 'Prompt 1', guidelines: [] },
      { id: 'agent-2', name: 'Agent Two', prompt: 'Prompt 2', guidelines: [] },
    ]);

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useAgentManager(), { wrapper: createWrapper(queryClient) });

    await waitFor(() => expect(result.current.agents).toHaveLength(2));
    expect(runAuthenticatedResultCall).toHaveBeenCalled();
    expect(saveToCache).toHaveBeenCalledWith('agents-list', expect.any(Array));
    expect(result.current.selectedAgent?.id).toBe('agent-1');
  });

  it('creates an agent and selects it after the mutation succeeds', async () => {
    runAuthenticatedResultCall
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce({ id: 'agent-3', name: 'Agent Three', prompt: 'Prompt 3', guidelines: [] });

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 0 }, mutations: { retry: false } } });
    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useAgentManager(), { wrapper: createWrapper(queryClient) });

    await waitFor(() => expect(result.current.agents).toEqual([]));

    act(() => {
      result.current.selectAgent(null);
    });

    let createdAgent: any;
    await act(async () => {
      createdAgent = await result.current.createAgent({ id: 'agent-3', name: 'Agent Three', prompt: 'Prompt 3', guidelines: [] } as any);
    });

    expect(invalidateQueriesSpy).toHaveBeenCalled();
    expect(createdAgent).toEqual(expect.objectContaining({ id: 'agent-3', name: 'Agent Three' }));
  });
});
