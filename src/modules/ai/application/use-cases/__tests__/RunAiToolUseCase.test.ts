// WritingToolRegistry (imported transitively via RunAiToolUseCase) throws if
// window is defined. Remove it before any imports run.
delete (global as any).window;

import 'reflect-metadata';

// Mock the entire Genkit infrastructure to prevent ESM/YAML parse errors
jest.mock('@/modules/ai/infrastructure/services/Genkit', () => ({
  ai: { defineFlow: jest.fn(), definePrompt: jest.fn() },
  MODEL_BY_TASK: {},
}));

// Mock all flows so tool providers never load real Genkit flows
jest.mock('@/modules/ai/infrastructure/flows', () => ({}));

// Mock WritingToolRegistry so the real server-only module is never evaluated
jest.mock('@/modules/ai/application/services/WritingToolRegistry');

import { RunAiToolUseCase } from '../RunAiToolUseCase';
import { Result } from '@/infrastructure/utils/result';
import { AiError, AiErrorType } from '@/modules/ai/domain/errors/AiErrors';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock the rate-limiter module used inside RunAiToolUseCase
jest.mock('@/infrastructure/security/rate-limiter', () => ({
  rateLimiter: {
    check: jest.fn(),
    getStats: jest.fn(),
  },
}));

import { rateLimiter } from '@/infrastructure/security/rate-limiter';

const mockRateLimiterCheck = rateLimiter.check as jest.Mock;
const mockRateLimiterGetStats = rateLimiter.getStats as jest.Mock;

// ---------------------------------------------------------------------------
// Helper factories
// ---------------------------------------------------------------------------

function makeRegistry(overrides: Partial<{ flow: jest.Mock; creditCost: number; isFreeForGuests: boolean }> = {}) {
  const flow = overrides.flow ?? jest.fn().mockResolvedValue('AI output');
  return {
    getTool: jest.fn().mockReturnValue({
      flow,
      schema: { parse: jest.fn((x: any) => x) },
      creditCost: overrides.creditCost ?? 1,
      isFreeForGuests: overrides.isFreeForGuests ?? true,
    }),
    getAllTools: jest.fn().mockReturnValue(['summarize']),
  };
}

function makeAiService(result: Result<any, AiError> = Result.ok('AI output')) {
  return { runFlow: jest.fn().mockResolvedValue(result) };
}

function makeDeductCredits(success = true) {
  return {
    execute: jest.fn().mockResolvedValue(
      success ? Result.ok(undefined) : Result.fail(AiError.internal('Insufficient credits')),
    ),
  };
}

function makeLogRepo() {
  return { log: jest.fn().mockResolvedValue(undefined) };
}

function buildUseCase(overrides: {
  registry?: ReturnType<typeof makeRegistry>;
  aiService?: ReturnType<typeof makeAiService>;
  deductCredits?: ReturnType<typeof makeDeductCredits>;
  logRepo?: ReturnType<typeof makeLogRepo>;
} = {}) {
  const registry = overrides.registry ?? makeRegistry();
  const aiService = overrides.aiService ?? makeAiService();
  const deductCredits = overrides.deductCredits ?? makeDeductCredits();
  const logRepo = overrides.logRepo ?? makeLogRepo();

  // Bypass tsyringe injection — pass deps directly to the constructor
  const useCase = new (RunAiToolUseCase as any)(
    aiService,
    logRepo,
    deductCredits,
    registry,
  ) as RunAiToolUseCase;

  return { useCase, registry, aiService, deductCredits, logRepo };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('RunAiToolUseCase', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    // Default: rate limiter allows requests
    mockRateLimiterCheck.mockResolvedValue({ allowed: true });
    mockRateLimiterGetStats.mockResolvedValue({ count: 1, remaining: 4, resetAt: Date.now() + 86400000 });
  });

  // ── Tool resolution ────────────────────────────────────────────────────────

  it('returns NOT_FOUND error when tool is not in the registry', async () => {
    const registry = makeRegistry();
    registry.getTool.mockReturnValue(undefined);
    const { useCase } = buildUseCase({ registry });

    const result = await useCase.execute({ userId: 'user-1', toolName: 'unknown-tool', input: {} });

    expect(result.isFailure).toBe(true);
    expect(result.error?.type).toBe(AiErrorType.NOT_FOUND);
    expect(result.error?.message).toContain('unknown-tool');
  });

  // ── Guest access ───────────────────────────────────────────────────────────

  it('allows guest access when tool is isFreeForGuests and rate limit not exceeded', async () => {
    const { useCase, logRepo } = buildUseCase({
      registry: makeRegistry({ isFreeForGuests: true }),
    });

    const result = await useCase.execute({
      userId: 'guest',
      toolName: 'summarize',
      input: { text: 'Hello world' },
      ip: '1.2.3.4',
    });

    expect(result.isSuccess).toBe(true);
    expect(mockRateLimiterCheck).toHaveBeenCalledWith('guest-writing-tools', '1.2.3.4', 5, expect.any(Number));
    expect(logRepo.log).toHaveBeenCalled();
  });

  it('blocks guest access when tool is NOT isFreeForGuests', async () => {
    const { useCase } = buildUseCase({
      registry: makeRegistry({ isFreeForGuests: false }),
    });

    const result = await useCase.execute({
      userId: 'guest',
      toolName: 'write-document',
      input: { topic: 'Test', documentType: 'Essay' },
    });

    expect(result.isFailure).toBe(true);
    expect(result.error?.type).toBe(AiErrorType.UNAUTHORIZED);
    expect(result.error?.message).toContain('registered account');
  });

  it('blocks guest access when daily rate limit is exceeded', async () => {
    mockRateLimiterCheck.mockResolvedValue({ allowed: false });
    const { useCase } = buildUseCase({
      registry: makeRegistry({ isFreeForGuests: true }),
    });

    const result = await useCase.execute({
      userId: 'guest',
      toolName: 'summarize',
      input: { text: 'Hello' },
      ip: '1.2.3.4',
    });

    expect(result.isFailure).toBe(true);
    expect(result.error?.type).toBe(AiErrorType.UNAUTHORIZED);
    expect(result.error?.message).toContain('Guest daily limit exceeded');
  });

  // ── Credit deduction ───────────────────────────────────────────────────────

  it('deducts credits for a registered user before running the flow', async () => {
    const { useCase, deductCredits, aiService } = buildUseCase({
      registry: makeRegistry({ creditCost: 2, isFreeForGuests: false }),
      deductCredits: makeDeductCredits(true),
    });

    const result = await useCase.execute({
      userId: 'user-abc',
      toolName: 'summarize',
      input: { text: 'Long article' },
    });

    expect(deductCredits.execute).toHaveBeenCalledWith('user-abc', 2);
    expect(aiService.runFlow).toHaveBeenCalled();
    expect(result.isSuccess).toBe(true);
  });

  it('falls back to free-tier rate-limit when user has no credits (isFreeForGuests tool)', async () => {
    const { useCase, deductCredits } = buildUseCase({
      registry: makeRegistry({ creditCost: 1, isFreeForGuests: true }),
      deductCredits: makeDeductCredits(false), // credit deduction fails
    });

    const result = await useCase.execute({
      userId: 'user-broke',
      toolName: 'summarize',
      input: { text: 'Some text' },
    });

    expect(result.isSuccess).toBe(true);
    expect(mockRateLimiterCheck).toHaveBeenCalledWith('registered-free-tier', 'user-broke', 10, expect.any(Number));
  });

  it('returns UNAUTHORIZED when registered user hits daily free-tier limit', async () => {
    mockRateLimiterCheck.mockResolvedValue({ allowed: false });
    const { useCase } = buildUseCase({
      registry: makeRegistry({ creditCost: 1, isFreeForGuests: true }),
      deductCredits: makeDeductCredits(false),
    });

    const result = await useCase.execute({
      userId: 'user-limit-hit',
      toolName: 'summarize',
      input: { text: 'Some text' },
    });

    expect(result.isFailure).toBe(true);
    expect(result.error?.type).toBe(AiErrorType.UNAUTHORIZED);
    expect(result.error?.message).toContain('Daily free tier limit exceeded');
  });

  it('returns INTERNAL error when user has no credits and tool is not free-tier', async () => {
    const { useCase } = buildUseCase({
      registry: makeRegistry({ creditCost: 2, isFreeForGuests: false }),
      deductCredits: makeDeductCredits(false),
    });

    const result = await useCase.execute({
      userId: 'user-broke',
      toolName: 'write-document',
      input: { topic: 'Test', documentType: 'Essay' },
    });

    expect(result.isFailure).toBe(true);
    expect(result.error?.type).toBe(AiErrorType.INTERNAL);
  });

  // ── AI flow execution ──────────────────────────────────────────────────────

  it('runs the AI flow with the validated input', async () => {
    const mockFlow = jest.fn().mockResolvedValue('Summarized content');
    const { useCase, aiService } = buildUseCase({
      registry: makeRegistry({ flow: mockFlow, creditCost: 1 }),
    });

    const input = { text: 'Long text to summarize', length: 'short' };
    await useCase.execute({ userId: 'user-1', toolName: 'summarize', input });

    expect(aiService.runFlow).toHaveBeenCalledWith(mockFlow, input, 'summarize');
  });

  it('returns AI result on success', async () => {
    const { useCase } = buildUseCase({
      aiService: makeAiService(Result.ok('Generated summary')),
    });

    const result = await useCase.execute({
      userId: 'user-1',
      toolName: 'summarize',
      input: { text: 'Hello world' },
    });

    expect(result.isSuccess).toBe(true);
  });

  // ── Credit refund on failure ───────────────────────────────────────────────

  it('refunds credits when the AI flow returns a failure result', async () => {
    const { useCase, deductCredits } = buildUseCase({
      registry: makeRegistry({ creditCost: 2, isFreeForGuests: false }),
      deductCredits: makeDeductCredits(true),
      aiService: makeAiService(Result.fail(AiError.generationFailed('Model timeout'))),
    });

    const result = await useCase.execute({
      userId: 'user-1',
      toolName: 'summarize',
      input: { text: 'Hello world' },
    });

    // Refund: deduct called with negative credit cost
    expect(deductCredits.execute).toHaveBeenCalledWith('user-1', -2);
    expect(result.isFailure).toBe(true);
  });

  it('refunds credits when the AI flow throws an unexpected exception', async () => {
    const aiService = {
      runFlow: jest.fn().mockRejectedValue(new Error('Unexpected crash')),
    };
    const { useCase, deductCredits } = buildUseCase({
      registry: makeRegistry({ creditCost: 1, isFreeForGuests: false }),
      deductCredits: makeDeductCredits(true),
      aiService,
    });

    const result = await useCase.execute({
      userId: 'user-1',
      toolName: 'summarize',
      input: { text: 'Hello' },
    });

    expect(deductCredits.execute).toHaveBeenCalledWith('user-1', -1);
    expect(result.isFailure).toBe(true);
    expect(result.error?.type).toBe(AiErrorType.INTERNAL);
  });

  // ── Generation logging ─────────────────────────────────────────────────────

  it('logs the generation after a successful AI flow', async () => {
    const { useCase, logRepo } = buildUseCase({
      registry: makeRegistry({ creditCost: 1, isFreeForGuests: false }),
    });

    await useCase.execute({
      userId: 'user-1',
      toolName: 'summarize',
      input: { text: 'Hello world' },
    });

    expect(logRepo.log).toHaveBeenCalledWith(
      expect.objectContaining({
        agentId: 'summarize',
        userId: 'user-1',
      }),
    );
  });

  it('logs with creditCost=0 for guest users', async () => {
    const { useCase, logRepo } = buildUseCase({
      registry: makeRegistry({ creditCost: 1, isFreeForGuests: true }),
    });

    await useCase.execute({
      userId: 'guest',
      toolName: 'summarize',
      input: { text: 'Hello' },
      ip: '1.2.3.4',
    });

    expect(logRepo.log).toHaveBeenCalledWith(
      expect.objectContaining({ creditCost: 0 }),
    );
  });

  // ── Usage metadata ─────────────────────────────────────────────────────────

  it('returns usage metadata for guest users', async () => {
    mockRateLimiterGetStats.mockResolvedValue({ count: 2, remaining: 3, resetAt: 9999999 });
    const aiOutput = { summarizedText: 'Short summary' };
    const { useCase } = buildUseCase({
      aiService: makeAiService(Result.ok(aiOutput)),
      registry: makeRegistry({ isFreeForGuests: true }),
    });

    const result = await useCase.execute({
      userId: 'guest',
      toolName: 'summarize',
      input: { text: 'Hello' },
      ip: '1.1.1.1',
    });

    expect(result.isSuccess).toBe(true);
    const value = result.getValue() as any;
    expect(value.usageMetadata).toBeDefined();
    expect(value.usageMetadata.remaining).toBe(3);
  });

  it('returns string output directly without usageMetadata wrapping', async () => {
    const { useCase } = buildUseCase({
      aiService: makeAiService(Result.ok('Plain text output')),
      registry: makeRegistry({ creditCost: 1, isFreeForGuests: false }),
    });

    const result = await useCase.execute({
      userId: 'user-1',
      toolName: 'summarize',
      input: { text: 'Hello' },
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toBe('Plain text output');
  });
});
