import 'reflect-metadata';
import { WritingToolsApiClient } from '../WritingToolsApiClient';
import { ApiError } from '@/infrastructure/api/ApiService';

// ---------------------------------------------------------------------------
// Mock apiService
// ---------------------------------------------------------------------------
jest.mock('@/infrastructure/api/ApiService', () => {
  const actual = jest.requireActual('@/infrastructure/api/ApiService');
  return {
    ...actual,
    apiService: jest.fn(),
  };
});

import { apiService } from '@/infrastructure/api/ApiService';

const mockApiService = apiService as jest.Mock;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('WritingToolsApiClient', () => {
  let client: WritingToolsApiClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new WritingToolsApiClient();
  });

  // ── executeToolApi ─────────────────────────────────────────────────────────

  describe('executeToolApi', () => {
    it('calls apiService with correct endpoint and method', async () => {
      const responseData = { summarizedText: 'A short summary.' };
      mockApiService.mockResolvedValue(responseData);

      await client.executeToolApi('summarize', { text: 'Long text', length: 'short' });

      expect(mockApiService).toHaveBeenCalledWith({
        endpoint: '/api/writing-tools/summarize',
        method: 'POST',
        data: { text: 'Long text', length: 'short' },
      });
    });

    it('returns Result.ok with the response data on success', async () => {
      const responseData = { summarizedText: 'Summary here.' };
      mockApiService.mockResolvedValue(responseData);

      const result = await client.executeToolApi('summarize', { text: 'Hello' });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toEqual(responseData);
    });

    it('returns Result.fail with ApiError when apiService throws an ApiError', async () => {
      const apiErr = new ApiError('Insufficient credits', 402);
      mockApiService.mockRejectedValue(apiErr);

      const result = await client.executeToolApi('summarize', { text: 'Hello' });

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(ApiError);
      expect(result.error?.message).toBe('Insufficient credits');
      // ApiError uses `.status` (not `.statusCode`)
      expect((result.error as ApiError).status).toBe(402);
    });

    it('wraps a generic Error into ApiError with status 500', async () => {
      mockApiService.mockRejectedValue(new Error('Network failure'));

      const result = await client.executeToolApi('paraphrase', { text: 'Hello', mode: 'formal' });

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(ApiError);
      expect(result.error?.message).toBe('Network failure');
      expect((result.error as ApiError).status).toBe(500);
    });

    it('wraps an unknown thrown value into ApiError with "Unknown error" message', async () => {
      mockApiService.mockRejectedValue('something strange');

      const result = await client.executeToolApi('humanize', { text: 'Hello' });

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(ApiError);
      expect(result.error?.message).toBe('Unknown error');
    });

    it('builds the correct endpoint for different tool names', async () => {
      mockApiService.mockResolvedValue({ text: 'corrected text' });

      await client.executeToolApi('grammar-checker', { text: 'bad grammar' });

      expect(mockApiService).toHaveBeenCalledWith(
        expect.objectContaining({ endpoint: '/api/writing-tools/grammar-checker' }),
      );
    });

    it('returns Result.ok even when response is undefined', async () => {
      mockApiService.mockResolvedValue(undefined);

      const result = await client.executeToolApi('humanize', { text: 'Hello' });

      expect(result.isSuccess).toBe(true);
    });
  });

  // ── writingToolApi (alias) ─────────────────────────────────────────────────

  describe('writingToolApi', () => {
    it('delegates to executeToolApi and returns its result', async () => {
      const responseData = { text: 'Paraphrased output.' };
      mockApiService.mockResolvedValue(responseData);

      const result = await client.writingToolApi('paraphrase', { text: 'Original text', mode: 'standard' });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toEqual(responseData);
      expect(mockApiService).toHaveBeenCalledWith(
        expect.objectContaining({ endpoint: '/api/writing-tools/paraphrase' }),
      );
    });

    it('propagates failures from executeToolApi', async () => {
      mockApiService.mockRejectedValue(new ApiError('Tool not found', 404));

      const result = await client.writingToolApi('nonexistent', {});

      expect(result.isFailure).toBe(true);
      expect((result.error as ApiError).status).toBe(404);
    });
  });
});
