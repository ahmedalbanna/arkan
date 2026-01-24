// @ts-nocheck

import { act, render, screen } from '@testing-library/react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth, Firestore } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { initializeFirebase } from '../index';
import { FirebaseProvider, useFirebase, useUser } from '../provider';


// Mock the firebase services
jest.mock('../index', () => ({
  initializeFirebase: jest.fn(() => ({
    firebaseApp: {} as FirebaseApp,
    auth: {
      onAuthStateChanged: jest.fn(),
    } as unknown as Auth,
    firestore: {} as unknown as Firestore,
  })),
}));

// Mock the onAuthStateChanged function
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));


const mockOnAuthStateChanged = onAuthStateChanged as jest.Mock;

const TestComponent = () => {
  const { firebaseApp, firestore, auth, user, isUserLoading, userError } = useFirebase();
  const userHook = useUser();

  if (isUserLoading) return <div>Loading...</div>;
  if (userError) return <div>Error: {userError.message}</div>;

  return (
    <div>
      <div>App: {firebaseApp ? 'Initialized' : 'Not Initialized'}</div>
      <div>Firestore: {firestore ? 'Initialized' : 'Not Initialized'}</div>
      <div>Auth: {auth ? 'Initialized' : 'Not Initialized'}</div>
      <div>User: {user ? user.uid : 'No User'}</div>
      <div>UserHook User: {userHook.user ? userHook.user.uid : 'No User'}</div>
    </div>
  );
};

describe('FirebaseProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the mock to a clean state for each test
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      // Simulate no user logged in initially
      act(() => {
        callback(null);
      });
      return jest.fn(); // Return an unsubscribe function
    });
  });

  it('should provide firebase services and handle no authenticated user', () => {
    const { auth, firestore, firebaseApp } = initializeFirebase();
    render(
      <FirebaseProvider auth={auth} firestore={firestore as any} firebaseApp={firebaseApp}>
        <TestComponent />
      </FirebaseProvider>
    );

    expect(screen.getByText('App: Initialized')).toBeInTheDocument();
    expect(screen.getByText('Firestore: Initialized')).toBeInTheDocument();
    expect(screen.getByText('Auth: Initialized')).toBeInTheDocument();
    expect(screen.getByText('User: No User')).toBeInTheDocument();
  });

  it('should update context when auth state changes', () => {
    const { auth, firestore, firebaseApp } = initializeFirebase();

    const mockUser = { uid: 'test-user-123', email: 'test@example.com' };

    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      act(() => {
        callback(mockUser);
      });
      return () => { }; // Unsubscribe function
    });

    render(
      <FirebaseProvider auth={auth} firestore={firestore as any} firebaseApp={firebaseApp}>
        <TestComponent />
      </FirebaseProvider>
    );

    expect(screen.getByText('User: test-user-123')).toBeInTheDocument();
    expect(screen.getByText('UserHook User: test-user-123')).toBeInTheDocument();
  });

  it('should show loading state initially', () => {
    const { auth, firestore, firebaseApp } = initializeFirebase();

    mockOnAuthStateChanged.mockImplementation(() => {
      // Don't call the callback to simulate loading state
      return () => { };
    });

    render(
      <FirebaseProvider auth={auth} firestore={firestore as any} firebaseApp={firebaseApp}>
        <TestComponent />
      </FirebaseProvider>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should handle auth errors', () => {
    const { auth, firestore, firebaseApp } = initializeFirebase();
    const mockError = new Error('Auth failed');

    mockOnAuthStateChanged.mockImplementation((auth, callback, errorCallback) => {
      act(() => {
        errorCallback(mockError);
      });
      return () => { };
    });

    render(
      <FirebaseProvider auth={auth} firestore={firestore as any} firebaseApp={firebaseApp}>
        <TestComponent />
      </FirebaseProvider>
    );

    expect(screen.getByText('Error: Auth failed')).toBeInTheDocument();
  });
});
