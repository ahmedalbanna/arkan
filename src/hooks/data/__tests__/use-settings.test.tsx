import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { settingsKeys } from '@/lib/query-keys';
import { usePublicSettings } from '../use-settings';

jest.mock('@/hooks/data/authenticated-client-call', () => ({ unwrapResult: jest.fn() }));

const { unwrapResult } = jest.requireMock('@/hooks/data/authenticated-client-call') as { unwrapResult: jest.Mock };

describe('usePublicSettings', () => {
  const createWrapper = (queryClient: QueryClient) => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    Wrapper.displayName = 'SettingsQueryClientWrapper';
    return Wrapper;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses the public settings query key and unwraps the API result', async () => {
    unwrapResult.mockReturnValue({ newUserCredits: 10, paymentMethods: [] });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => usePublicSettings(), { wrapper: createWrapper(queryClient) });

    await waitFor(() => expect(result.current.data).toEqual({ newUserCredits: 10, paymentMethods: [] }));
    expect(queryClient.getQueryData(settingsKeys.public())).toEqual({ newUserCredits: 10, paymentMethods: [] });
  });
});
