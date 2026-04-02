import { type HumanizeTextInput } from '@/modules/ai/domain/schemas';

// The prompt function is assigned at module-load time, so we must create and
// wire the mock BEFORE importing the flow module.
const mockPromptFn = jest.fn();

jest.mock('@/modules/ai/infrastructure/services/Genkit', () => ({
  ai: {
    definePrompt: jest.fn(() => mockPromptFn),
    defineFlow: jest.fn((_config: any, implementation: any) => implementation),
  },
  MODEL_BY_TASK: {},
}));

// Import AFTER mocks are set up
import { humanizeText } from '../writing/humanize-text';
import { ai } from '@/modules/ai/infrastructure/services/Genkit';

describe('humanizeText Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (ai.definePrompt as jest.Mock).mockReturnValue(mockPromptFn);
  });

  it('should return humanized text from the model', async () => {
    const mockInput: HumanizeTextInput = {
      text: 'The utilization of artificial intelligence has demonstrated significant improvements in operational efficiency metrics.',
    };
    const humanized = "AI has genuinely changed how businesses run—and the results speak for themselves.";
    mockPromptFn.mockResolvedValue({ text: humanized });

    const result = await humanizeText(mockInput);

    expect(mockPromptFn).toHaveBeenCalledWith(expect.objectContaining({ text: mockInput.text }));
    expect(result).toBe(humanized);
  });

  it('should fall back to result.output if result.text is empty', async () => {
    const mockInput: HumanizeTextInput = { text: 'Some robotic text.' };
    mockPromptFn.mockResolvedValue({ text: '', output: 'Some natural text.' });

    const result = await humanizeText(mockInput);

    expect(result).toBe('Some natural text.');
  });

  it('should throw a wrapped error if the model returns empty text', async () => {
    const mockInput: HumanizeTextInput = { text: 'Some text to humanize.' };
    mockPromptFn.mockResolvedValue({ text: '' });

    await expect(humanizeText(mockInput)).rejects.toThrow('Text humanization failed:');
  });

  it('should throw a wrapped error if the model returns only whitespace', async () => {
    const mockInput: HumanizeTextInput = { text: 'Some text.' };
    mockPromptFn.mockResolvedValue({ text: '   \n   ' });

    await expect(humanizeText(mockInput)).rejects.toThrow('Text humanization failed:');
  });

  it('should throw an error for empty input text', async () => {
    await expect(humanizeText({ text: '' } as HumanizeTextInput)).rejects.toThrow();
  });

  it('should trim whitespace from the returned text', async () => {
    const mockInput: HumanizeTextInput = { text: 'Some AI text.' };
    mockPromptFn.mockResolvedValue({ text: '  Human-sounding text here.  ' });

    const result = await humanizeText(mockInput);

    expect(result).toBe('Human-sounding text here.');
  });

  it('should preserve markdown formatting in the output', async () => {
    const mockInput: HumanizeTextInput = { text: '## AI Section\n\nAI generated content here.' };
    const humanized = '## AI Section\n\nHere is naturally written content.';
    mockPromptFn.mockResolvedValue({ text: humanized });

    const result = await humanizeText(mockInput);

    expect(result).toContain('## AI Section');
    expect(result).toBe(humanized);
  });

  it('should wrap the prompt error message in "Text humanization failed:"', async () => {
    const mockInput: HumanizeTextInput = { text: 'Some text.' };
    mockPromptFn.mockRejectedValue(new Error('Model timeout'));

    await expect(humanizeText(mockInput)).rejects.toThrow('Text humanization failed: Model timeout');
  });

  it('should pass the input directly to the prompt function', async () => {
    const mockInput: HumanizeTextInput = { text: 'AI-sounding prose here.' };
    mockPromptFn.mockResolvedValue({ text: 'Natural prose here.' });

    await humanizeText(mockInput);

    expect(mockPromptFn).toHaveBeenCalledWith(expect.objectContaining({ text: 'AI-sounding prose here.' }));
  });
});
