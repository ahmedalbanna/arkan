import { fireEvent, render, screen, waitFor } from '@testing-library/react';

jest.mock('lucide-react', () => ({ RefreshCw: () => null, Trash2: () => null, Search: () => null, FileText: () => null }));
jest.mock('@/infrastructure/api/ApiService', () => ({ apiService: jest.fn() }));
const { apiService } = jest.requireMock('@/infrastructure/api/ApiService') as { apiService: jest.Mock };

import { IndexedDocumentsList } from '../IndexedDocumentsList';

describe('IndexedDocumentsList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads indexed documents through apiService', async () => {
    apiService.mockResolvedValue({ documents: [{ id: 'd1', projectId: 'proj-1', sourceFile: 'doc.pdf', chunksCount: 4, timestamp: Date.now(), type: 'pdf' }] });
    render(<IndexedDocumentsList />);
    await waitFor(() => screen.getByText('doc.pdf'));
    expect(apiService).toHaveBeenCalledWith(expect.objectContaining({ endpoint: '/api/admin/rag/documents' }));
  });

  it('deletes a document through apiService', async () => {
    apiService
      .mockResolvedValueOnce({ documents: [{ id: 'd1', projectId: 'proj-1', sourceFile: 'doc.pdf', chunksCount: 4, timestamp: Date.now(), type: 'pdf' }] })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ documents: [] });

    render(<IndexedDocumentsList />);
    await waitFor(() => screen.getByText('doc.pdf'));
    fireEvent.click(screen.getAllByRole('button')[1]);
    fireEvent.click(screen.getByText('Delete'));
    await waitFor(() => expect(apiService).toHaveBeenCalledWith(expect.objectContaining({ endpoint: '/api/admin/rag/documents?projectId=proj-1', method: 'DELETE' })));
  });
});
