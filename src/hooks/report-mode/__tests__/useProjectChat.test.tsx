import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';

jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../core/useBuilderStore', () => ({ useBuilderStore: jest.fn() }));
jest.mock('@/infrastructure/api/ApiService', () => ({ apiService: jest.fn() }));

const { useAuth } = jest.requireMock('@/context/AuthContext') as { useAuth: jest.Mock };
const { useBuilderStore } = jest.requireMock('../../core/useBuilderStore') as { useBuilderStore: jest.Mock };
const { apiService } = jest.requireMock('@/infrastructure/api/ApiService') as { apiService: jest.Mock };

const { useProjectChat } = require('../useProjectChat') as typeof import('../useProjectChat');

describe('useProjectChat', () => {
  const firebaseUser = { uid: 'chat-user-1' } as { uid: string };
  const project = { fullMarkdownContent: '# Project Context' };

  const createWrapper = (queryClient: QueryClient) => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    Wrapper.displayName = 'ProjectChatQueryClientWrapper';
    return Wrapper;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ firebaseUser });
    useBuilderStore.mockReturnValue({ project });
  });

  it('sends project chat requests through apiService and appends the model response', async () => {
    apiService.mockResolvedValue({ response: 'Generated answer' });
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });

    const { result } = renderHook(() => useProjectChat(), { wrapper: createWrapper(queryClient) });

    await act(async () => {
      result.current.sendMessage('Hello there', '# Project Context');
    });

    await waitFor(() => expect(result.current.messages).toHaveLength(2));
    expect(apiService).toHaveBeenCalledWith(expect.objectContaining({
      endpoint: '/api/chat/project-consultant',
      method: 'POST',
    }));
    expect(result.current.messages[0]).toEqual({ role: 'user', content: 'Hello there' });
    expect(result.current.messages[1]).toEqual({ role: 'assistant', content: 'Generated answer' });
  });

  it('records an error response from the model when the request fails', async () => {
    apiService.mockRejectedValue(new Error('Network failed'));
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });

    const { result } = renderHook(() => useProjectChat(), { wrapper: createWrapper(queryClient) });

    await act(async () => {
      result.current.sendMessage('Need help', '# Project Context');
    });

    await waitFor(() => expect(result.current.messages).toHaveLength(2));
    expect(result.current.messages[1]).toEqual({
      role: 'model',
      content: 'Sorry, an error occurred: Network failed',
    });
  });
});
