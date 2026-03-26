import { fireEvent, render, screen, waitFor } from '@testing-library/react';

jest.mock('lucide-react', () => ({
  Loader2: () => null,
  Search: () => null,
}));
jest.mock('@/infrastructure/api/ApiService', () => ({ apiService: jest.fn() }));

const { apiService } = jest.requireMock('@/infrastructure/api/ApiService') as { apiService: jest.Mock };

import { RAGQueryTester } from '../RAGQueryTester';

describe('RAGQueryTester', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('validates empty queries before calling the API', async () => {
    render(<RAGQueryTester />);

    fireEvent.click(screen.getByRole('button', { name: /run query/i }));

    expect(await screen.findByText('Please enter a query')).toBeTruthy();
    expect(apiService).not.toHaveBeenCalled();
  });

  it('renders successful search results', async () => {
    apiService.mockResolvedValue({
      sources: [
        {
          content: 'Machine learning is a subset of AI.',
          score: 0.91,
          sourceFile: 'intro.pdf',
          projectId: 'project-1',
          chunkIndex: 0,
        },
      ],
    });

    render(<RAGQueryTester />);

    fireEvent.change(screen.getByLabelText('Search Query'), { target: { value: 'machine learning' } });
    fireEvent.click(screen.getByRole('button', { name: /run query/i }));

    expect(await screen.findByText('Result #1')).toBeTruthy();
    expect(screen.getByText('Score: 0.910')).toBeTruthy();
    expect(screen.getByText('intro.pdf')).toBeTruthy();
    expect(screen.getByText('project-1')).toBeTruthy();
    expect(screen.getByText('Machine learning is a subset of AI.')).toBeTruthy();
    expect(apiService).toHaveBeenCalledWith(expect.objectContaining({ endpoint: '/api/rag/retrieve-context', method: 'POST' }));
  });

  it('renders empty and error states from the API', async () => {
    apiService.mockResolvedValueOnce({ sources: [] }).mockRejectedValueOnce(new Error('search failed'));

    render(<RAGQueryTester />);

    fireEvent.change(screen.getByLabelText('Search Query'), { target: { value: 'unknown topic' } });
    fireEvent.click(screen.getByRole('button', { name: /run query/i }));
    expect(await screen.findByText('No results found for this query.')).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Search Query'), { target: { value: 'known topic' } });
    fireEvent.click(screen.getByRole('button', { name: /run query/i }));

    await waitFor(() => expect(screen.getByText('search failed')).toBeTruthy());
  });
});
