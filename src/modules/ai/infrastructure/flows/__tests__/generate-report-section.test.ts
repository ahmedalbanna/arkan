// src/ai/flows/__tests__/generate-report-section.test.ts
import { generateReportSection } from '../generation/generate-report-section';
import { ai } from '@/modules/ai/infrastructure/services/Genkit';
import { GenerateSectionInputSchema, GenerateSectionOutputSchema, type GenerateSectionInput } from '@/modules/ai/domain/schemas';

// Mock the entire genkit ai object
jest.mock('@/modules/ai/infrastructure/services/Genkit', () => ({
  ai: {
    definePrompt: jest.fn(),
    defineFlow: jest.fn(),
  },
}));

describe('generateReportSection Flow', () => {
  let mockPrompt: jest.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup a mock implementation for the 'prompt' function returned by definePrompt
    mockPrompt = jest.fn();
    (ai.definePrompt as jest.Mock).mockReturnValue(mockPrompt);
  });

  it('should call the AI prompt with the correct input and return the generated content', async () => {
    const mockInput: GenerateSectionInput = {
      ,
      sectionToGenerate: 'introduction',
      prompt: 'Write an introduction for a report on AI.',
      otherSections: {
        'related-topic': 'This is some related content.'
      },
      guidelines: ['Keep it professional.'],
      instructionText: 'Target audience is beginners.',
      externalContext: [],
    };

    const mockOutput = {
      sectionName: 'introduction',
      content: 'This is a generated introduction about AI.',
    };

    // Make the mock prompt resolve with a mock AI response
    mockPrompt.mockResolvedValue({ output: mockOutput });

    const result = await generateReportSection(mockInput);

    // 1. Verify that definePrompt was called correctly
    expect(ai.definePrompt).toHaveBeenCalledWith(expect.objectContaining({
      name: 'generateReportSectionPrompt',
      input: { schema: GenerateSectionInputSchema },
      output: { schema: GenerateSectionOutputSchema },
    }));

    // 2. Verify the prompt itself was called with the input
    expect(mockPrompt).toHaveBeenCalledWith(mockInput);

    // 3. Verify the final result matches the mock output
    expect(result).toEqual(mockOutput);
  });

  it('should throw an error if the AI fails to generate content', async () => {
    const mockInput: GenerateSectionInput = {
      ,
      sectionToGenerate: 'conclusion',
      prompt: 'Write a conclusion.',
      guidelines: [],
      instructionText: '',
      externalContext: [],
    };

    // Simulate the AI returning no output
    mockPrompt.mockResolvedValue({ output: null });

    // We expect the function to throw an error in this case
    await expect(generateReportSection(mockInput)).rejects.toThrow(
      "The AI failed to generate a response for the 'conclusion' section. Please try again."
    );
  });

  it('should construct the system prompt correctly', async () => {
     const mockInput: GenerateSectionInput = {
      ,
      sectionToGenerate: 'test-section',
      prompt: 'Base prompt for the section.',
      guidelines: [],
      instructionText: '',
      externalContext: [],
    };

    mockPrompt.mockResolvedValue({ output: { sectionName: 'test-section', content: 'test' } });

    await generateReportSection(mockInput);
    
    // Check the structure of the system prompt passed to definePrompt
    const definePromptArgs = (ai.definePrompt as jest.Mock).mock.calls[0][0];
    expect(definePromptArgs.system).toContain('Base prompt for the section.');
    expect(definePromptArgs.system).toContain('You are also an expert analyst.');
  });
});
