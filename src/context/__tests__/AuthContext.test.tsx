import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '../AuthContext';
import * as FirebaseAuth from 'firebase/auth';
import * as UserService from '@/services/userService';
import * as BuilderStore from '@/hooks/core/useBuilderStore';
import { User } from '@/lib/models';

// --- Mocks ---
jest.mock('firebase/auth', () => ({
  ...jest.requireActual('firebase/auth'),
  onAuthStateChanged: jest.fn(),
}));

jest.mock('@/services/userService', () => ({
  fetchUserProfileApi: jest.fn(),
  subscribeToUserProfile: jest.fn(),
}));

jest.mock('@/hooks/core/useBuilderStore', () => ({
  useBuilderStore: jest.fn(() => ({
    setUserProfile: jest.fn(),
  })),
  useInitializeBuilderStore: jest.fn(),
}));

const mockOnAuthStateChanged = FirebaseAuth.onAuthStateChanged as jest.Mock;
const mockSubscribeToUserProfile = UserService.subscribeToUserProfile as jest.Mock;

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const TestComponent = () => {
  const { firebaseUser, userProfile, isLoading, isGuest } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  return (
    <div>
      <div data-testid="user-id">{firebaseUser?.uid || 'null'}</div>
      <div data-testid="profile-name">{userProfile?.name || 'null'}</div>
      <div data-testid="is-guest">{isGuest.toString()}</div>
    </div>
  );
};

describe('AuthContext', () => {
  let authUnsubscribe: jest.Mock;
  let profileUnsubscribe: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    authUnsubscribe = jest.fn();
    profileUnsubscribe = jest.fn();
    mockOnAuthStateChanged.mockReturnValue(authUnsubscribe);
    mockSubscribeToUserProfile.mockReturnValue(profileUnsubscribe);
  });

  it('should show loading state initially', () => {
    mockOnAuthStateChanged.mockImplementation(() => authUnsubscribe);
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
      { wrapper }
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should handle unauthenticated state (not guest)', async () => {
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      act(() => {
        callback(null);
      });
      return authUnsubscribe;
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-id')).toHaveTextContent('null');
      expect(screen.getByTestId('profile-name')).toHaveTextContent('null');
      expect(screen.getByTestId('is-guest')).toHaveTextContent('false');
    });
  });

  it('should handle authenticated state with user profile', async () => {
    const mockFirebaseUser = { uid: 'test-uid', displayName: 'Test User', email: 'test@test.com' };
    const mockUserProfileData = { id: 'test-uid', name: 'Test Profile', email: 'test@test.com', role: 'user', credits: 100, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const mockUserProfile = new User(mockUserProfileData);

    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      act(() => {
        callback(mockFirebaseUser);
      });
      return authUnsubscribe;
    });

    mockSubscribeToUserProfile.mockImplementation((uid, callback) => {
      act(() => {
        callback(mockUserProfileData);
      });
      return profileUnsubscribe;
    });


    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-id')).toHaveTextContent('test-uid');
    });

    await waitFor(() => {
        expect(screen.getByTestId('profile-name')).toHaveTextContent('Test Profile');
    });

    expect(screen.getByTestId('is-guest')).toHaveTextContent('false');
  });

  it('should clear user profile on logout', async () => {
     const mockFirebaseUser = { uid: 'test-uid', displayName: 'Test User', email: 'test@test.com' };
     const mockUserProfileData = { id: 'test-uid', name: 'Test Profile', email: 'test@test.com', role: 'user', credits: 100, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };

    let authCallback: (user: any) => void;

    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        authCallback = callback;
        act(() => {
            callback(mockFirebaseUser);
        });
        return authUnsubscribe;
    });

    mockSubscribeToUserProfile.mockImplementation((uid, callback) => {
      act(() => {
        callback(mockUserProfileData);
      });
      return profileUnsubscribe;
    });


    const { rerender } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
      { wrapper }
    );

    await waitFor(() => {
        expect(screen.getByTestId('profile-name')).toHaveTextContent('Test Profile');
    });

    // Simulate logout
    act(() => {
        authCallback(null);
    });

    rerender(<AuthProvider><TestComponent /></AuthProvider>);

    await waitFor(() => {
        expect(screen.getByTestId('user-id')).toHaveTextContent('null');
        expect(screen.getByTestId('profile-name')).toHaveTextContent('null');
    });
  });
});
