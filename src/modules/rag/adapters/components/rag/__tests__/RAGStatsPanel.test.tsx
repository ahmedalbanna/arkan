import { fireEvent, render, screen, waitFor } from '@testing-library/react';

jest.mock('lucide-react', () => ({
  Database: () => null,
  FileText: () => null,
  RefreshCw: () => null,
  TrendingUp: () => null,
  Zap: () => null,
}));
jest.mock('@/infrastructure/api/ApiService', () => ({ apiService: jest.fn() }));

const { apiService } = jest.requireMock('@/infrastructure/api/ApiService') as { apiService: jest.Mock };

import { RAGStatsPanel } from '../RAGStatsPanel';

const populatedStats = {
  totalChunks: 1234,
  projects: [
    { projectId: 'project-a', count: 734 },
    { projectId: 'project-b', count: 500 },
  ],
  averageChunkSize: 420,
  recentActivity: { indexing: 7, retrieval: 11, avgSearchTime: 88 },
};

describe('RAGStatsPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders populated stats and project distribution', async () => {
    apiService.mockResolvedValue(populatedStats);

    render(<RAGStatsPanel />);

    expect(screen.getByText('Loading statistics...')).toBeTruthy();
    expect(await screen.findByText('1,234')).toBeTruthy();
    expect(screen.getByText('88ms')).toBeTruthy();
    expect(screen.getByText('project-a')).toBeTruthy();
    expect(screen.getByText('734 chunks')).toBeTruthy();
  });

  it('shows the empty distribution fallback when there are no projects', async () => {
    apiService.mockResolvedValue({
      totalChunks: 0,
      projects: [],
      averageChunkSize: 0,
      recentActivity: { indexing: 0, retrieval: 0, avgSearchTime: 0 },
    });

    render(<RAGStatsPanel />);

    expect(await screen.findByText('No project distribution data available.')).toBeTruthy();
  });

  it('shows an error state and retries', async () => {
    apiService
      .mockRejectedValueOnce(new Error('stats unavailable'))
      .mockResolvedValueOnce(populatedStats);

    render(<RAGStatsPanel />);

    expect(await screen.findByText(/Failed to load RAG stats: stats unavailable/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    await waitFor(() => expect(screen.getByText('1,234')).toBeTruthy());
    expect(apiService).toHaveBeenCalledTimes(2);
  });
});
