import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { userKeys } from '@/lib/query-keys';
import { UserApiClient } from '@/modules/users/adapters/api-client/UserApiClient';
import { AuthProvider, useAuth } from '../AuthContext';

jest.mock('@/firebase/provider', () => ({
  useAuth: jest.fn(),
  useFirestore: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
}));

jest.mock('@/hooks', () => ({
  useBuilderStore: jest.fn(),
}));

jest.mock('@/modules/users/infrastructure/services/SessionManager', () => ({
  manageSession: jest.fn(),
}));

jest.mock('@/lib/utils/cookie-management', () => ({
  hasGuestCookie: jest.fn(),
  clearGuestCookie: jest.fn(),
}));

jest.mock('@/infrastructure/api/authenticated-client-call', () => ({
  runAuthenticatedResultCall: jest.fn(),
}));

jest.mock('@/infrastructure/di/container', () => ({
  container: {
    resolve: jest.fn(),
  },
}));

const { useAuth: useFirebaseAuth, useFirestore } = jest.requireMock('@/firebase/provider') as {
  useAuth: jest.Mock;
  useFirestore: jest.Mock;
};

const { onAuthStateChanged } = jest.requireMock('firebase/auth') as {
  onAuthStateChanged: jest.Mock;
};

const { useBuilderStore } = jest.requireMock('@/hooks') as {
  useBuilderStore: jest.Mock;
};

const { manageSession } = jest.requireMock('@/modules/users/infrastructure/services/SessionManager') as {
  manageSession: jest.Mock;
};

const { hasGuestCookie, clearGuestCookie } = jest.requireMock('@/lib/utils/cookie-management') as {
  hasGuestCookie: jest.Mock;
  clearGuestCookie: jest.Mock;
};

const { runAuthenticatedResultCall } = jest.requireMock('@/infrastructure/api/authenticated-client-call') as {
  runAuthenticatedResultCall: jest.Mock;
};

const { container } = jest.requireMock('@/infrastructure/di/container') as {
  container: { resolve: jest.Mock };
};

const Consumer = () => {
  const { userProfile, isLoading, isGuest } = useAuth();

  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="guest">{String(isGuest)}</span>
      <span data-testid="email">{userProfile?.email ?? 'none'}</span>
    </div>
  );
};

describe('AuthProvider', () => {
  const firebaseUser = {
    uid: 'auth-user-1',
    email: 'auth@example.com',
  };

  const setUserProfile = jest.fn();
  const unsubscribe = jest.fn();

  const createWrapper = (queryClient: QueryClient) => ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    useFirebaseAuth.mockReturnValue({});
    useFirestore.mockReturnValue({});
    useBuilderStore.mockReturnValue({ setUserProfile });
    hasGuestCookie.mockReturnValue(false);
    container.resolve.mockReturnValue({
      subscribeToUserProfile: jest.fn(() => unsubscribe),
    });
    runAuthenticatedResultCall.mockResolvedValue({
      id: 'auth-user-1',
      name: 'Auth User',
      email: 'auth@example.com',
      role: 'user',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    });
  });

  it('hydrates the authenticated profile and invalidates the active user cache on login', async () => {
    onAuthStateChanged.mockImplementation((_auth: unknown, callback: (user: typeof firebaseUser) => void) => {
      callback(firebaseUser);
      return unsubscribe;
    });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
      { wrapper: createWrapper(queryClient) },
    );

    await waitFor(() => expect(screen.getByTestId('email').textContent).toBe('auth@example.com'));

    expect(manageSession).toHaveBeenCalledWith(firebaseUser);
    expect(clearGuestCookie).not.toHaveBeenCalled();
    expect(runAuthenticatedResultCall).toHaveBeenCalledWith(firebaseUser, UserApiClient, expect.any(Function));
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: userKeys.profile('auth-user-1') });
  });

  it('clears cached state on logout when no guest cookie exists', async () => {
    onAuthStateChanged.mockImplementation((_auth: unknown, callback: (user: null) => void) => {
      callback(null);
      return unsubscribe;
    });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const clearSpy = jest.spyOn(queryClient, 'clear');

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
      { wrapper: createWrapper(queryClient) },
    );

    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));

    expect(clearSpy).toHaveBeenCalled();
    expect(setUserProfile).toHaveBeenCalledWith(null);
    expect(screen.getByTestId('guest').textContent).toBe('false');
  });
});
