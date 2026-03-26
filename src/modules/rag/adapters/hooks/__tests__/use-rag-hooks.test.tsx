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
    apiService.mockResolvedValue({ context: 'Retrieved context', sources: [{ content: 'source', score: 0.9, type: 'reference' }] });
    const { result } = renderHook(() => useRagRetrieval());

    let response: any;
    await act(async () => {
      response = await result.current.retrieveContext('query');
    });

    await waitFor(() => expect(response.context).toBe('Retrieved context'));
    expect(apiService).toHaveBeenCalledWith(expect.objectContaining({ endpoint: '/api/rag/retrieve-context', method: 'POST' }));
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
