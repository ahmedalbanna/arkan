import { act, renderHook, waitFor } from '@testing-library/react';

jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('@/infrastructure/api/ApiService', () => ({ apiService: jest.fn() }));

const { useAuth } = jest.requireMock('@/context/AuthContext') as { useAuth: jest.Mock };
const { apiService } = jest.requireMock('@/infrastructure/api/ApiService') as { apiService: jest.Mock };

const { useRAGRetrieval } = require('../use-rag-retrieval') as typeof import('../use-rag-retrieval');
const { useRAGIndexing } = require('../use-rag-indexing') as typeof import('../use-rag-indexing');

describe('RAG hooks', () => {
  const firebaseUser = { uid: 'rag-user-1' } as { uid: string };

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ firebaseUser });
  });

  it('retrieves context through apiService and stores sources', async () => {
    apiService.mockResolvedValue({ context: 'Retrieved context', sources: [{ content: 'source', score: 0.9, type: 'reference' }] });
    const { result } = renderHook(() => useRAGRetrieval());

    await act(async () => {
      await result.current.retrieveContext('query');
    });

    await waitFor(() => expect(result.current.context).toBe('Retrieved context'));
    expect(apiService).toHaveBeenCalledWith(expect.objectContaining({ endpoint: '/api/rag/retrieve-context', method: 'POST', firebaseUser }));
    expect(result.current.sources).toHaveLength(1);
  });

  it('indexes a document through apiService and records created chunks', async () => {
    apiService.mockResolvedValue({ chunksCreated: 3 });
    const { result } = renderHook(() => useRAGIndexing());

    await act(async () => {
      await result.current.indexDocument('content', 'file.txt');
    });

    await waitFor(() => expect(result.current.success).toBe(true));
    expect(apiService).toHaveBeenCalledWith(expect.objectContaining({ endpoint: '/api/rag/index-document', method: 'POST', firebaseUser }));
    expect(result.current.chunksCreated).toBe(3);
  });
});
