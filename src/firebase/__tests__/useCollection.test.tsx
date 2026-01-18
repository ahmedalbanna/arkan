
import { renderHook, waitFor, act } from '@testing-library/react';
import { useCollection } from '../firestore/use-collection';
import { onSnapshot } from 'firebase/firestore';

jest.mock('firebase/firestore', () => ({
  ...jest.requireActual('firebase/firestore'),
  onSnapshot: jest.fn(),
}));

const mockOnSnapshot = onSnapshot as jest.Mock;

describe('useCollection Hook', () => {
  beforeEach(() => {
    mockOnSnapshot.mockClear();
  });

  it('should return loading state initially', () => {
    const mockQuery = { type: 'collection', path: 'test', __memo: true, _query: { path: { canonicalString: () => 'test'} }};
    const { result } = renderHook(() => useCollection(mockQuery as any));
    
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });
  
  it('should return data when snapshot has documents', async () => {
    const mockDocs = [
      { id: 'doc1', data: () => ({ name: 'Doc 1' }) },
      { id: 'doc2', data: () => ({ name: 'Doc 2' }) },
    ];
    const mockSnapshot = {
      docs: mockDocs.map(doc => ({ ...doc, exists: true })),
    };
    
    mockOnSnapshot.mockImplementation((query, callback) => {
      act(() => {
        callback(mockSnapshot);
      });
      return () => {}; // unsubscribe function
    });
    
    const mockQuery = { type: 'collection', path: 'test', __memo: true, _query: { path: { canonicalString: () => 'test'} }};
    const { result } = renderHook(() => useCollection(mockQuery as any));
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0]).toEqual({ id: 'doc1', name: 'Doc 1' });
    expect(result.current.error).toBeNull();
  });

  it('should return an empty array when snapshot is empty', async () => {
    const mockSnapshot = {
      docs: [],
    };
    
    mockOnSnapshot.mockImplementation((query, callback) => {
      act(() => {
        callback(mockSnapshot);
      });
      return () => {};
    });
    
    const mockQuery = { type: 'collection', path: 'test', __memo: true, _query: { path: { canonicalString: () => 'test'} }};
    const { result } = renderHook(() => useCollection(mockQuery as any));
    
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should handle Firestore permission errors', async () => {
    const mockError = new Error('Permission denied');
    mockError.name = 'FirebaseError';
    (mockError as any).code = 'permission-denied';

    mockOnSnapshot.mockImplementation((query, successCallback, errorCallback) => {
      act(() => {
        errorCallback(mockError);
      });
      return () => {};
    });

    const mockQuery = { type: 'collection', path: 'test', __memo: true, _query: { path: { canonicalString: () => 'test'} }};
    const { result } = renderHook(() => useCollection(mockQuery as any));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toContain('Missing or insufficient permissions');
    expect(result.current.data).toBeNull();
  });

  it('should not do anything if query is null or undefined', () => {
    const { result } = renderHook(() => useCollection(null));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(mockOnSnapshot).not.toHaveBeenCalled();
  });
  
  it('should throw an error if the query is not memoized', () => {
    const mockQuery = { type: 'collection', path: 'test', _query: { path: { canonicalString: () => 'test'} }};
    // We need to catch the error thrown by the hook
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      renderHook(() => useCollection(mockQuery as any));
    }).toThrow();
    spy.mockRestore();
  });
});
