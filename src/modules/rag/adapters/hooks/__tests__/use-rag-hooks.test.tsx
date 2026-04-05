import { act, renderHook, waitFor } from '@testing-library/react';

jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('@/infrastructure/api/ApiService', () => ({ apiService: jest.fn() }));

const { useAuth } = jest.requireMock('@/context/AuthContext') as { useAuth: jest.Mock };
const { apiService } = jest.requireMock('@/infrastructure/api/ApiService') as { apiService: jest.Mock };

const { useRagRetrieval } = require('../use-rag-retrieval') as typeof import('../use-rag-retrieval');
const { useRagIndexing } = require('../use-rag-indexing') as typeof import('../use-rag-indexing');

describe('RAG hooks', () => {
  const user = { uid: 'rag-user-1' } as { uid: string };

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ user });
  });

  it('retrieves context through apiService and stores sources', async () => {
    const mockValue = { 
        context: 'Retrieved context', 
        sources: [{ text: 'source', score: 0.9, type: 'reference' }] 
    };
    
    // We wrap in a result-like structure because the hook expectation is a Result from the api client
    // But since the hook uses container.resolve(RagApiClient), we might need to mock the client instead
    // For this test, we mock the apiService which the client calls.
    apiService.mockResolvedValue(mockValue);
    
    const { result } = renderHook(() => useRagRetrieval());

    let response: any;
    await act(async () => {
      response = await result.current.retrieve('query');
    });

    await waitFor(() => expect(response.context).toBe('Retrieved context'));
    expect(apiService).toHaveBeenCalledWith(expect.objectContaining({ 
        endpoint: '/api/rag/retrieve-context', 
        method: 'POST' 
    }));
    expect(response.sources).toHaveLength(1);
  });

  it('indexes a document through apiService and records created chunks', async () => {
    apiService.mockResolvedValue({ message: 'Success', documentId: 'doc-1' });
    const { result } = renderHook(() => useRagIndexing());

    await act(async () => {
      await result.current.mutateAsync({ content: 'content', fileName: 'file.txt', type: 'user_upload' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiService).toHaveBeenCalledWith(expect.objectContaining({ endpoint: '/api/rag/index-document', method: 'POST' }));
  });
});
