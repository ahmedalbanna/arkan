import { summarizeText } from '../document/summarize-text';
import { ai } from '@/modules/ai/infrastructure/services/Genkit';
import { type SummarizeInput } from '@/modules/ai/domain/schemas';

// Mock the genkit `ai` object. The second argument to defineFlow is the implementation.
jest.mock('@/modules/ai/infrastructure/services/Genkit', () => ({
  ai: {
    definePrompt: jest.fn(),
    defineFlow: jest.fn((config, implementation) => implementation),
  },
}));

// Cast the mocked function to jest.Mock for type safety in tests
const mockDefinePrompt = ai.definePrompt as jest.Mock;

describe('summarizeText Flow', () => {
  let mockPromptFn: jest.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // `definePrompt` returns a function that simulates the AI call. We mock this function.
    mockPromptFn = jest.fn();
    mockDefinePrompt.mockReturnValue(mockPromptFn);
  });

  it('should call the summarization prompt with "short" instruction', async () => {
    const mockInput: SummarizeInput = {
      text: 'This is a long text that needs to be summarized into a short paragraph.',
      length: 'short',
    };
    const mockSummary = 'This is a short summary.';
    mockPromptFn.mockResolvedValue({ text: mockSummary });

    const result = await summarizeText(mockInput);

    // Verify that the prompt was defined
    expect(mockDefinePrompt).toHaveBeenCalled();

    // Verify the AI prompt function was called with the correct instruction
    expect(mockPromptFn).toHaveBeenCalledWith(expect.objectContaining({
      text: mockInput.text,
      instruction: expect.stringContaining('a single, concise paragraph'),
    }));

    // Verify the result
    expect(result).toBe(mockSummary);
  });

  it('should call the summarization prompt with "long" instruction', async () => {
    const mockInput: SummarizeInput = {
      text: 'This is another long text that needs a long summary.',
      length: 'long',
    };
    const mockSummary = 'This is a detailed and long summary of the text.';
    mockPromptFn.mockResolvedValue({ text: mockSummary });

    await summarizeText(mockInput);

    expect(mockPromptFn).toHaveBeenCalledWith(expect.objectContaining({
      instruction: expect.stringContaining('a detailed summary'),
    }));
  });

  it('should throw an error for empty input text', async () => {
    const mockInput = {
      text: '', // Invalid empty text
      length: 'short',
    };

    // The Zod validation inside summarizeText should throw an error
    await expect(summarizeText(mockInput as SummarizeInput)).rejects.toThrow();
  });
  
  it('should throw an error for invalid length enum', async () => {
    const mockInput = {
      text: 'Some valid text here.',
      length: 'invalid-size', // Invalid enum value
    };

    // The Zod validation should reject this input
    await expect(summarizeText(mockInput as any)).rejects.toThrow();
  });


  it('should throw an error if the model returns an empty or whitespace summary', async () => {
    const mockInput: SummarizeInput = {
      text: 'Some valid text.',
      length: 'medium',
    };
    mockPromptFn.mockResolvedValue({ text: ' \n ' }); // Simulate empty/whitespace response

    await expect(summarizeText(mockInput)).rejects.toThrow('Model returned empty summary');
  });
  
  it('should throw an error if the model returns no output at all', async () => {
    const mockInput: SummarizeInput = {
      text: 'Some valid text.',
      length: 'medium',
    };
    // Simulate the AI call resolving to null/undefined
    mockPromptFn.mockResolvedValue(null);

    await expect(summarizeText(mockInput)).rejects.toThrow('No output received from the model.');
  });
});
