// src/ai/flows/__tests__/generate-report-section.test.ts
import { GenerateSectionInputSchema, GenerateSectionOutputSchema, type GenerateSectionInput } from '@/ai/schemas';
import { generateReportSection, executeFlow } from '../index';
import { flowRegistry } from '../flow-registry';

// Mock the universal flow execution
jest.mock('../universal-flow', () => ({
  executeFlow: jest.fn(),
}));

describe('generateReportSection Flow - Universal Flow Architecture', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should call executeFlow with the correct flow name and input', async () => {
    const mockInput: GenerateSectionInput = {
      flow: 'generate-section',
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

    // Mock executeFlow to return the expected output
    (executeFlow as jest.Mock).mockResolvedValue(mockOutput);

    const result = await generateReportSection(mockInput);

    // 1. Verify that executeFlow was called with correct parameters
    expect(executeFlow).toHaveBeenCalledWith('generateReportSection', mockInput, undefined);

    // 2. Verify the final result matches the mock output
    expect(result).toEqual(mockOutput);
  });

  it('should throw an error if executeFlow fails', async () => {
    const mockInput: GenerateSectionInput = {
      flow: 'generate-section',
      sectionToGenerate: 'conclusion',
      prompt: 'Write a conclusion.',
      guidelines: [],
      instructionText: '',
      externalContext: [],
    };

    // Simulate executeFlow throwing an error
    (executeFlow as jest.Mock).mockRejectedValue(new Error('Flow execution failed'));

    // We expect the function to throw an error in this case
    await expect(generateReportSection(mockInput)).rejects.toThrow('Flow execution failed');
  });

  it('should have correct flow metadata in registry', () => {
    const metadata = flowRegistry['generateReportSection'];
    
    expect(metadata).toBeDefined();
    expect(metadata.flowName).toBe('generateReportSection');
    expect(metadata.promptKey).toBe('default');
    expect(metadata.inputSchema).toBe(GenerateSectionInputSchema);
    expect(metadata.outputSchema).toBe(GenerateSectionOutputSchema);
  });

  it('should validate input schema', () => {
    const validInput: GenerateSectionInput = {
      flow: 'generate-section',
      sectionToGenerate: 'test-section',
      prompt: 'Test prompt',
      guidelines: [],
      instructionText: '',
      externalContext: [],
    };

    const result = GenerateSectionInputSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('should reject invalid input', () => {
    const invalidInput = {
      // Missing required fields
      sectionToGenerate: 'test-section',
    };

    const result = GenerateSectionInputSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });
});
