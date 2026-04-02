import { type ParaphraseInput } from '@/modules/ai/domain/schemas';

// The prompt function is assigned at module-load time, so we must create and
// wire the mock BEFORE importing the flow module.
const mockPromptFn = jest.fn();

jest.mock('@/modules/ai/infrastructure/services/Genkit', () => ({
  ai: {
    // definePrompt runs at module-load and must immediately return the mock fn
    definePrompt: jest.fn(() => mockPromptFn),
    // defineFlow: return the inner implementation so we can call it directly
    defineFlow: jest.fn((_config: any, implementation: any) => implementation),
  },
  MODEL_BY_TASK: {},
}));

// Import AFTER mocks are set up
import { paraphraseText } from '../writing/paraphrase-text';
import { ai } from '@/modules/ai/infrastructure/services/Genkit';

describe('paraphraseText Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Re-wire definePrompt to keep returning the same mockPromptFn after clearAllMocks
    (ai.definePrompt as jest.Mock).mockReturnValue(mockPromptFn);
  });

  it('should return paraphrased text from the model', async () => {
    const mockInput: ParaphraseInput = {
      text: 'The quick brown fox jumps over the lazy dog.',
      mode: 'standard',
    };
    mockPromptFn.mockResolvedValue({ text: 'A swift auburn fox leaps over the idle dog.' });

    const result = await paraphraseText(mockInput);

    expect(mockPromptFn).toHaveBeenCalledWith(
      expect.objectContaining({ text: mockInput.text, mode: 'standard' }),
    );
    expect(result).toBe('A swift auburn fox leaps over the idle dog.');
  });

  it('should pass "formal" mode and its instruction to the prompt', async () => {
    const mockInput: ParaphraseInput = {
      text: 'Hey, can you help me out here?',
      mode: 'formal',
    };
    mockPromptFn.mockResolvedValue({ text: 'Could you please provide your assistance in this matter?' });

    await paraphraseText(mockInput);

    expect(mockPromptFn).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'formal',
        instruction: expect.stringContaining('formal'),
      }),
    );
  });

  it('should pass "fluent" mode and its instruction to the prompt', async () => {
    const mockInput: ParaphraseInput = { text: 'I am going to the store.', mode: 'fluent' };
    mockPromptFn.mockResolvedValue({ text: "I'm heading to the store." });

    await paraphraseText(mockInput);

    expect(mockPromptFn).toHaveBeenCalledWith(
      expect.objectContaining({ instruction: expect.stringContaining('fluent') }),
    );
  });

  it('should pass "creative" mode and its instruction to the prompt', async () => {
    const mockInput: ParaphraseInput = { text: 'The sun is bright today.', mode: 'creative' };
    mockPromptFn.mockResolvedValue({ text: 'Golden rays blazed across the afternoon sky.' });

    await paraphraseText(mockInput);

    expect(mockPromptFn).toHaveBeenCalledWith(
      expect.objectContaining({ instruction: expect.stringContaining('creative') }),
    );
  });

  it('should pass "simplify" mode and its instruction to the prompt', async () => {
    const mockInput: ParaphraseInput = {
      text: 'The utilization of renewable energy sources mitigates environmental degradation.',
      mode: 'simplify',
    };
    mockPromptFn.mockResolvedValue({ text: 'Using clean energy helps the environment.' });

    await paraphraseText(mockInput);

    expect(mockPromptFn).toHaveBeenCalledWith(
      expect.objectContaining({ instruction: expect.stringContaining('simpler') }),
    );
  });

  it('should throw an error for empty input text', async () => {
    await expect(paraphraseText({ text: '', mode: 'standard' } as ParaphraseInput)).rejects.toThrow();
  });

  it('should throw an error for an invalid mode enum', async () => {
    await expect(paraphraseText({ text: 'Some text', mode: 'invalid-mode' } as any)).rejects.toThrow();
  });

  it('should throw "Failed to paraphrase text." when the model returns empty output', async () => {
    mockPromptFn.mockResolvedValue({ text: '' });
    await expect(paraphraseText({ text: 'Some valid text.', mode: 'standard' })).rejects.toThrow(
      'Failed to paraphrase text.',
    );
  });

  it('should strip triple-dash separators from the output', async () => {
    mockPromptFn.mockResolvedValue({ text: '---Paraphrased text here---' });

    const result = await paraphraseText({ text: 'Some text.', mode: 'standard' });

    expect(result).not.toContain('---');
    expect(result).toBe('Paraphrased text here');
  });
});
