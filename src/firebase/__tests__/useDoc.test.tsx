
import { renderHook, waitFor, act } from '@testing-library/react';
import { useDoc } from '../firestore/use-doc';
import { onSnapshot } from 'firebase/firestore';

// Mock the onSnapshot function from firebase/firestore
jest.mock('firebase/firestore', () => ({
  ...jest.requireActual('firebase/firestore'),
  onSnapshot: jest.fn(),
}));

const mockOnSnapshot = onSnapshot as jest.Mock;

describe('useDoc Hook', () => {
  beforeEach(() => {
    mockOnSnapshot.mockClear();
  });

  it('should return loading state initially', () => {
    const mockDocRef = { path: 'test/1', __memo: true };
    const { result } = renderHook(() => useDoc(mockDocRef as any));
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });
  
  it('should return data when snapshot exists', async () => {
    const mockData = { name: 'Test Document' };
    const mockSnapshot = {
      exists: () => true,
      data: () => mockData,
      id: 'doc1',
    };
    
    mockOnSnapshot.mockImplementation((docRef, callback) => {
      act(() => {
        callback(mockSnapshot);
      });
      return () => {}; // unsubscribe function
    });
    
    const mockDocRef = { path: 'test/1', __memo: true };
    const { result } = renderHook(() => useDoc(mockDocRef as any));
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.data).toEqual({ ...mockData, id: 'doc1' });
    expect(result.current.error).toBeNull();
  });

  it('should return null data when snapshot does not exist', async () => {
    const mockSnapshot = {
      exists: () => false,
    };
    
    mockOnSnapshot.mockImplementation((docRef, callback) => {
      act(() => {
        callback(mockSnapshot);
      });
      return () => {};
    });
    
    const mockDocRef = { path: 'test/1', __memo: true };
    const { result } = renderHook(() => useDoc(mockDocRef as any));
    
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should handle Firestore permission errors', async () => {
    const mockError = new Error('Permission denied');
    mockError.name = 'FirebaseError';
    (mockError as any).code = 'permission-denied';

    mockOnSnapshot.mockImplementation((docRef, successCallback, errorCallback) => {
      act(() => {
          errorCallback(mockError);
      });
      return () => {};
    });

    const mockDocRef = { path: 'test/1', __memo: true };
    const { result } = renderHook(() => useDoc(mockDocRef as any));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toContain('Missing or insufficient permissions');
    expect(result.current.data).toBeNull();
  });

  it('should not do anything if docRef is null or undefined', () => {
    const { result } = renderHook(() => useDoc(null));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(mockOnSnapshot).not.toHaveBeenCalled();
  });
  
  it('should throw an error if the doc ref is not memoized', () => {
    const mockDocRef = { path: 'test/1' }; // No __memo property
    // We need to catch the error thrown by the hook
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      renderHook(() => useDoc(mockDocRef as any));
    }).toThrow();
    spy.mockRestore();
  });
});
