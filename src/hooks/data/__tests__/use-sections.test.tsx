import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { sectionKeys } from '@/lib/query-keys';

jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('@/hooks/util/use-toast', () => ({ toast: jest.fn() }));
jest.mock('@/hooks/data/authenticated-client-call', () => ({ runAuthenticatedResultCall: jest.fn() }));
jest.mock('@/lib/types', () => ({
  Section: class MockSection {
    id?: string;
    title?: string;
    constructor(props: { id?: string; title?: string }) {
      this.id = props.id;
      this.title = props.title;
    }
  },
}));

const { useAuth } = jest.requireMock('@/context/AuthContext') as { useAuth: jest.Mock };
const { runAuthenticatedResultCall } = jest.requireMock('@/hooks/data/authenticated-client-call') as { runAuthenticatedResultCall: jest.Mock };

const { useSections, useCreateSection, useUpdateSection, useDeleteSection } = require('../use-sections') as typeof import('../use-sections');

describe('use-sections hooks', () => {
  const firebaseUser = { uid: 'admin-1' } as { uid: string };

  const createWrapper = (queryClient: QueryClient) => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    Wrapper.displayName = 'SectionsQueryClientWrapper';
    return Wrapper;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ firebaseUser });
  });

  it('loads and normalizes sections through the authenticated helper', async () => {
    runAuthenticatedResultCall.mockResolvedValue([{ id: 's1', title: 'Intro' }]);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => useSections(), { wrapper: createWrapper(queryClient) });

    await waitFor(() => expect(Array.isArray(result.current.data)).toBe(true));
    expect(runAuthenticatedResultCall).toHaveBeenCalled();
  });

  it('invalidates the list after creating a section', async () => {
    runAuthenticatedResultCall.mockResolvedValue({ id: 's1', title: 'Intro' });
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateSection(), { wrapper: createWrapper(queryClient) });

    await act(async () => {
      await result.current.mutateAsync({ id: 's1', title: 'Intro', type: 'report' });
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: sectionKeys.lists() });
  });

  it('invalidates both list and detail after updating a section', async () => {
    runAuthenticatedResultCall.mockResolvedValue({ id: 's1', title: 'Updated Intro' });
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUpdateSection(), { wrapper: createWrapper(queryClient) });

    await act(async () => {
      await result.current.mutateAsync({ sectionId: 's1', data: { title: 'Updated Intro' } });
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: sectionKeys.lists() });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: sectionKeys.detail('s1') });
  });

  it('invalidates the list after deleting a section', async () => {
    runAuthenticatedResultCall.mockResolvedValue(undefined);
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useDeleteSection(), { wrapper: createWrapper(queryClient) });

    await act(async () => {
      await result.current.mutateAsync('s1');
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: sectionKeys.lists() });
  });
});
