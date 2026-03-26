import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { featureKeys } from '@/infrastructure/api/query-keys';
import { useFeatures, useUpdateFeature } from '../use-features';

jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('@/hooks/util/use-toast', () => ({ toast: jest.fn() }));
jest.mock('@/infrastructure/api/authenticated-client-call', () => ({ runAuthenticatedResultCall: jest.fn() }));

const { useAuth } = jest.requireMock('@/context/AuthContext') as { useAuth: jest.Mock };
const { runAuthenticatedResultCall } = jest.requireMock('@/infrastructure/api/authenticated-client-call') as { runAuthenticatedResultCall: jest.Mock };

describe('use-features hooks', () => {
  const firebaseUser = { uid: 'admin-1' } as { uid: string };

  const createWrapper = (queryClient: QueryClient) => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    Wrapper.displayName = 'FeaturesQueryClientWrapper';
    return Wrapper;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ firebaseUser });
  });

  it('loads features through the authenticated helper', async () => {
    runAuthenticatedResultCall.mockResolvedValue([{ id: 'f1', name: 'Feature 1', isEnabled: true }]);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => useFeatures(), { wrapper: createWrapper(queryClient) });

    await waitFor(() => expect(result.current.data).toHaveLength(1));
    expect(runAuthenticatedResultCall).toHaveBeenCalled();
  });

  it('optimistically updates and invalidates the feature list on mutation', async () => {
    runAuthenticatedResultCall.mockResolvedValue({ id: 'f1', isEnabled: false });
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    queryClient.setQueryData(featureKeys.lists(), [{ id: 'f1', name: 'Feature 1', isEnabled: true }]);
    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUpdateFeature(), { wrapper: createWrapper(queryClient) });

    await act(async () => {
      await result.current.mutateAsync({ featureId: 'f1', payload: { isEnabled: false } });
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: featureKeys.lists() });
    expect((queryClient.getQueryData(featureKeys.lists()) as Array<{ isEnabled: boolean }>)?.[0]?.isEnabled).toBe(false);
  });
});
