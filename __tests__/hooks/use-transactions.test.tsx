import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useVerifyPayment } from '@/hooks/use-transactions';
import { ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Mock the global fetch function
global.fetch = jest.fn();

const mockedToast = toast as jest.Mock;

describe('useVerifyPayment', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    mockedToast.mockClear();
  });

  it('should call the verify API and handle success', async () => {
    const mockSuccessResponse = { message: 'Transaction verified successfully.' };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessResponse,
    });

    const { result } = renderHook(() => useVerifyPayment(), { wrapper: createWrapper() });

    const variables = {
      transactionId: 'txn_123',
      userId: 'user_123',
      creditsToGrant: 100,
      status: 'verified' as const,
    };

    result.current.mutate(variables);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(variables),
    });

    expect(toast).toHaveBeenCalledWith({
        title: 'Success',
        description: `Transaction has been verified.`,
    });
  });

  it('should handle API errors gracefully', async () => {
    const mockErrorResponse = { message: 'Verification failed' };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => mockErrorResponse,
    });

    const { result } = renderHook(() => useVerifyPayment(), { wrapper: createWrapper() });

    const variables = {
      transactionId: 'txn_456',
      userId: 'user_456',
      creditsToGrant: 50,
      status: 'rejected' as const,
    };

    result.current.mutate(variables);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe(mockErrorResponse.message);
    
    expect(toast).toHaveBeenCalledWith({
        title: 'Verification Failed',
        description: mockErrorResponse.message,
        variant: 'destructive',
    });
  });
});
