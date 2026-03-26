import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { User } from '@/modules/users/domain/entities/User';
import { userKeys } from '@/infrastructure/api/query-keys';
import { useCreateUser, useUserProfile, useUpdateUser } from '../use-users';

jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/hooks', () => ({
  toast: jest.fn(),
}));

jest.mock('@/infrastructure/api/errorUtils', () => ({
  handleErrorUtility: jest.fn(),
}));

jest.mock('@/infrastructure/api/authenticated-client-call', () => ({
  runAuthenticatedResultCall: jest.fn(),
}));

const { useAuth } = jest.requireMock('@/context/AuthContext') as {
  useAuth: jest.Mock;
};

const { runAuthenticatedResultCall } = jest.requireMock('@/infrastructure/api/authenticated-client-call') as {
  runAuthenticatedResultCall: jest.Mock;
};

describe('use-users hooks', () => {
  const firebaseUser = { uid: 'user-1' } as { uid: string };

  const createWrapper = (queryClient: QueryClient) => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    Wrapper.displayName = 'QueryClientTestWrapper';
    return Wrapper;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ firebaseUser });
  });

  it('loads a user profile and normalizes it into a User entity', async () => {
    runAuthenticatedResultCall.mockResolvedValue({
      id: 'user-1',
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'user',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { result } = renderHook(() => useUserProfile('user-1'), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.data).toBeInstanceOf(User));

    expect(runAuthenticatedResultCall).toHaveBeenCalled();
    expect(result.current.data?.email).toBe('jane@example.com');
    expect(queryClient.getQueryData(userKeys.profile('user-1'))).toBeInstanceOf(User);
  });

  it('invalidates list and profile keys after updating a user', async () => {
    runAuthenticatedResultCall.mockResolvedValue({
      id: 'user-1',
      name: 'Updated Name',
      email: 'jane@example.com',
      role: 'user',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    });

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUpdateUser(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({ id: 'user-1', data: { name: 'Updated Name' } });
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: userKeys.lists() });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: userKeys.profile('user-1') });
  });

  it('invalidates the user list after creating a user', async () => {
    runAuthenticatedResultCall.mockResolvedValue({
      user: {
        uid: 'user-2',
        email: 'new@example.com',
      },
    });

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateUser(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
        role: 'user',
        credits: 10,
      });
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: userKeys.lists() });
  });
});
