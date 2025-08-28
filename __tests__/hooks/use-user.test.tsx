
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUserProfile, useLogin } from '@/hooks';
import * as authUtils from '@/lib/authUtils';
import * as userService from '@/services';

// Mock dependencies
jest.mock('@/services');
jest.mock('@/lib');
jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    firebaseUser: { uid: 'user-123', getIdToken: jest.fn().mockResolvedValue('fake-token') },
    refetchUser: jest.fn(),
  }),
}));
jest.mock('next/navigation');

const mockedFetchUserProfileApi = userService.fetchUserProfileApi as jest.Mock;
const mockedLoginWithEmail = userService.loginWithEmail as jest.Mock;
const mockedGetAuthenticatedToken = authUtils.getAuthenticatedToken as jest.Mock;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const mockUserProfile = {
  id: 'user-123',
  name: 'Test User',
  email: 'test@example.com',
  credits: 10,
  role: 'user',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('useUserProfile Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
    mockedGetAuthenticatedToken.mockResolvedValue('fake-token');
  });

  it('fetches and returns a user profile', async () => {
    mockedFetchUserProfileApi.mockResolvedValue(mockUserProfile);

    const { result } = renderHook(() => useUserProfile('user-123'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockUserProfile);
    expect(mockedFetchUserProfileApi).toHaveBeenCalledWith('user-123', 'fake-token');
  });

  it('handles errors when fetching a profile fails', async () => {
    const errorMessage = 'User not found';
    mockedFetchUserProfileApi.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useUserProfile('user-123'), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe(errorMessage);
  });

  it('is disabled if no userId is provided', () => {
    renderHook(() => useUserProfile(''), { wrapper });
    expect(mockedFetchUserProfileApi).not.toHaveBeenCalled();
  });
});

describe('useLogin Hook', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      queryClient.clear();
    });

    it('successfully logs in a user', async () => {
        const mockUser = { uid: 'user-123', email: 'test@example.com' };
        mockedLoginWithEmail.mockResolvedValue(mockUser);

        const { result } = renderHook(() => useLogin(), { wrapper });

        act(() => {
            result.current.mutate({ email: 'test@example.com', password: 'password' });
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual(mockUser);
    });

    it('handles login failure', async () => {
        const errorMessage = 'Invalid email or password.';
        mockedLoginWithEmail.mockRejectedValue(new Error(errorMessage));

        const { result } = renderHook(() => useLogin(), { wrapper });

        act(() => {
            result.current.mutate({ email: 'test@example.com', password: 'wrongpassword' });
        });

        await waitFor(() => expect(result.current.isError).toBe(true));

        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.error?.message).toBe(errorMessage);
    });
});
