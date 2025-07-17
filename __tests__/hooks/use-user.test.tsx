import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUserProfile, usePurchaseCredits } from '@/hooks/use-user';
import { ReactNode } from 'react';

// Create a query client for the tests, with retries disabled for predictability
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// A wrapper component that provides the QueryClientProvider to the hook
const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Mock the global fetch function
global.fetch = jest.fn();

describe('useUserProfile', () => {
  beforeEach(() => {
    // Clear mocks before each test to ensure isolation
    (fetch as jest.Mock).mockClear();
  });

  it('should return loading state initially and then the user data on success', async () => {
    const mockUser = { id: 'user-1', name: 'Test User', credits: 100 };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    const { result } = renderHook(() => useUserProfile('user-1'), {
      wrapper: createWrapper(),
    });

    // Initially, the query is loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isSuccess).toBe(false);

    // Wait for the hook to finish fetching
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert the final state
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual(mockUser);
  });

  it('should return an error state if the fetch fails', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Server Error' }),
    });

    const { result } = renderHook(() => useUserProfile('user-1'), {
      wrapper: createWrapper(),
    });

    // Wait for the query to fail
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Assert the error state
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error.message).toEqual('Failed to fetch user profile');
  });
});
