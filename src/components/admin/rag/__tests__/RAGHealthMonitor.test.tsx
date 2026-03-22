import { fireEvent, render, screen, waitFor } from '@testing-library/react';

jest.mock('lucide-react', () => ({
  AlertCircle: () => null,
  CheckCircle2: () => null,
  RefreshCw: () => null,
  XCircle: () => null,
}));
jest.mock('@/infrastructure/api/ApiService', () => ({ apiService: jest.fn() }));

const { apiService } = jest.requireMock('@/infrastructure/api/ApiService') as { apiService: jest.Mock };

import { RAGHealthMonitor } from '../RAGHealthMonitor';

const healthyResponse = {
  status: 'healthy',
  timestamp: '2026-03-22T10:00:00.000Z',
  checks: {
    config: { status: 'ok', details: 'Loaded configuration' },
    vectorStore: { status: 'ok', details: 'Qdrant available' },
    ollama: { status: 'unknown', details: 'Slow response' },
  },
  config: {
    provider: 'qdrant',
    embeddingModel: 'nomic-embed-text',
    vectorDimension: 768,
  },
} as const;

describe('RAGHealthMonitor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads and renders health details from apiService', async () => {
    apiService.mockResolvedValue(healthyResponse);

    render(<RAGHealthMonitor />);

    expect(screen.getByText('Loading health status...')).toBeTruthy();
    expect(await screen.findByText('HEALTHY')).toBeTruthy();
    expect(screen.getByText('qdrant')).toBeTruthy();
    expect(screen.getByText('nomic-embed-text')).toBeTruthy();
    expect(screen.getByText('768')).toBeTruthy();
    expect(screen.getByText('Qdrant available')).toBeTruthy();
    expect(apiService).toHaveBeenCalledWith(expect.objectContaining({ endpoint: '/api/rag/health' }));
  });

  it('shows an error state and retries successfully', async () => {
    apiService
      .mockRejectedValueOnce(new Error('health unavailable'))
      .mockResolvedValueOnce(healthyResponse);

    render(<RAGHealthMonitor />);

    expect(await screen.findByText(/Error loading health status: health unavailable/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    await waitFor(() => expect(screen.getByText('HEALTHY')).toBeTruthy());
    expect(apiService).toHaveBeenCalledTimes(2);
  });
});
