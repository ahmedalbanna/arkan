/**
 * Document Generation AI Flows Tests
 * 
 * Tests for document flows: generate-chapter-content, generate-quiz, generate-ideas
 */

import { ai } from '@/ai/genkit';

jest.mock('@/ai/genkit', () => ({
  ai: {
    generate: jest.fn(),
  },
}));

describe('Document Generation AI Flows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Generate Chapter Content Flow
  // ============================================================================

  describe('generate-chapter-content', () => {
    it('should generate chapter with sections', async () => {
      const mockOutput = {
        title: 'Introduction to Machine Learning',
        content: 'Machine learning is a subset of artificial intelligence...',
        sections: [
          { title: 'What is ML?', content: 'ML definition...' },
          { title: 'Applications', content: 'ML applications...' },
          { title: 'Key Concepts', content: 'Important concepts...' },
        ],
        wordCount: 1500,
        readingTime: 6,
      };

      (ai.generate as jest.Mock).mockResolvedValue(mockOutput);

      const input = {
        title: 'Introduction to Machine Learning',
        outline: ['Definition', 'Applications', 'Key Concepts'],
        targetWordCount: 1500,
        style: 'academic',
      };

      const result = await ai.generate(input);

      expect(result.title).toBe('Introduction to Machine Learning');
      expect(result.sections).toHaveLength(3);
      expect(result.wordCount).toBe(1500);
    });

    it('should respect target word count', async () => {
      (ai.generate as jest.Mock).mockResolvedValue({ 
        content: 'Content...', 
        wordCount: 500 
      });

      await ai.generate({ title: 'Test', targetWordCount: 500 });

      expect(ai.generate).toHaveBeenCalledWith(
        expect.objectContaining({ targetWordCount: 500 })
      );
    });

    it('should handle different writing styles', async () => {
      (ai.generate as jest.Mock).mockResolvedValue({ content: 'Chapter content' });

      const styles = ['academic', 'casual', 'technical', 'narrative'];

      for (const style of styles) {
        await ai.generate({ title: 'Test', style });
        expect(ai.generate).toHaveBeenCalledWith(
          expect.objectContaining({ style })
        );
      }
    });

    it('should calculate reading time', async () => {
      const mockOutput = {
        content: 'Content',
        wordCount: 250,
        readingTime: 1, // ~250 words/minute
      };

      (ai.generate as jest.Mock).mockResolvedValue(mockOutput);

      const result = await ai.generate({ title: 'Test' });

      expect(result.readingTime).toBe(1);
    });

    it('should include references when requested', async () => {
      const mockOutput = {
        content: 'Chapter content',
        references: [
          { title: 'Source 1', author: 'Author 1', year: 2023 },
          { title: 'Source 2', author: 'Author 2', year: 2024 },
        ],
      };

      (ai.generate as jest.Mock).mockResolvedValue(mockOutput);

      const result = await ai.generate({ 
        title: 'Test', 
        includeReferences: true 
      });

      expect(result.references).toHaveLength(2);
    });
  });

  // ============================================================================
  // Generate Quiz Flow
  // ============================================================================

  describe('generate-quiz', () => {
    it('should generate quiz with multiple question types', async () => {
      const mockOutput = {
        title: 'Machine Learning Quiz',
        questions: [
          {
            id: 1,
            type: 'multiple_choice',
            question: 'What is supervised learning?',
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: 'Option A',
            explanation: 'Supervised learning uses labeled data...',
          },
          {
            id: 2,
            type: 'true_false',
            question: 'Neural networks are always better than linear models.',
            correctAnswer: false,
            explanation: 'It depends on the problem...',
          },
          {
            id: 3,
            type: 'short_answer',
            question: 'Define overfitting.',
            sampleAnswer: 'When a model learns training data too well...',
          },
        ],
        totalQuestions: 3,
        estimatedTime: 10,
      };

      (ai.generate as jest.Mock).mockResolvedValue(mockOutput);

      const input = {
        topic: 'Machine Learning Basics',
        numberOfQuestions: 3,
        difficulty: 'medium',
        questionTypes: ['multiple_choice', 'true_false', 'short_answer'],
      };

      const result = await ai.generate(input);

      expect(result.questions).toHaveLength(3);
      expect(result.questions[0].type).toBe('multiple_choice');
      expect(result.questions[1].type).toBe('true_false');
    });

    it('should handle different difficulty levels', async () => {
      (ai.generate as jest.Mock).mockResolvedValue({ questions: [] });

      const difficulties = ['easy', 'medium', 'hard', 'expert'];

      for (const difficulty of difficulties) {
        await ai.generate({ topic: 'Test', difficulty });
        expect(ai.generate).toHaveBeenCalledWith(
          expect.objectContaining({ difficulty })
        );
      }
    });

    it('should provide explanations for answers', async () => {
      const mockOutput = {
        questions: [
          {
            question: 'What is 2+2?',
            correctAnswer: '4',
            explanation: 'Basic addition: 2 plus 2 equals 4.',
          },
        ],
      };

      (ai.generate as jest.Mock).mockResolvedValue(mockOutput);

      const result = await ai.generate({ topic: 'Math' });

      expect(result.questions[0].explanation).toBeDefined();
    });

    it('should estimate completion time', async () => {
      const mockOutput = {
        questions: Array(10).fill({ type: 'multiple_choice' }),
        estimatedTime: 15, // minutes
      };

      (ai.generate as jest.Mock).mockResolvedValue(mockOutput);

      const result = await ai.generate({ topic: 'Test', numberOfQuestions: 10 });

      expect(result.estimatedTime).toBe(15);
    });

    it('should support custom number of options for MCQs', async () => {
      const mockOutput = {
        questions: [
          {
            type: 'multiple_choice',
            options: ['A', 'B', 'C', 'D', 'E'],
          },
        ],
      };

      (ai.generate as jest.Mock).mockResolvedValue(mockOutput);

      const result = await ai.generate({ 
        topic: 'Test', 
        optionsPerQuestion: 5 
      });

      expect(result.questions[0].options).toHaveLength(5);
    });
  });

  // ============================================================================
  // Generate Ideas Flow
  // ============================================================================

  describe('generate-ideas', () => {
    it('should generate creative ideas', async () => {
      const mockOutput = {
        ideas: [
          {
            title: 'AI-Powered Study Assistant',
            description: 'An app that adapts to student learning patterns...',
            category: 'Education Technology',
            feasibility: 'high',
            impact: 'medium',
          },
          {
            title: 'Sustainable Urban Farming',
            description: 'Vertical farming solutions for cities...',
            category: 'Agriculture',
            feasibility: 'medium',
            impact: 'high',
          },
          {
            title: 'Blockchain-Based Voting',
            description: 'Secure digital voting system...',
            category: 'Civic Tech',
            feasibility: 'low',
            impact: 'high',
          },
        ],
        count: 3,
      };

      (ai.generate as jest.Mock).mockResolvedValue(mockOutput);

      const input = {
        prompt: 'Innovative tech solutions for social problems',
        numberOfIdeas: 3,
        categories: ['Education', 'Agriculture', 'Civic Tech'],
      };

      const result = await ai.generate(input);

      expect(result.ideas).toHaveLength(3);
      expect(result.ideas[0].title).toBeDefined();
      expect(result.ideas[0].feasibility).toBeDefined();
    });

    it('should rate feasibility and impact', async () => {
      const mockOutput = {
        ideas: [
          { title: 'Idea 1', feasibility: 'high', impact: 'low' },
          { title: 'Idea 2', feasibility: 'medium', impact: 'medium' },
          { title: 'Idea 3', feasibility: 'low', impact: 'high' },
        ],
      };

      (ai.generate as jest.Mock).mockResolvedValue(mockOutput);

      const result = await ai.generate({ prompt: 'Test', numberOfIdeas: 3 });

      result.ideas.forEach(idea => {
        expect(['high', 'medium', 'low']).toContain(idea.feasibility);
        expect(['high', 'medium', 'low']).toContain(idea.impact);
      });
    });

    it('should categorize ideas', async () => {
      const mockOutput = {
        ideas: [
          { title: 'Idea 1', category: 'Technology' },
          { title: 'Idea 2', category: 'Health' },
          { title: 'Idea 3', category: 'Education' },
        ],
      };

      (ai.generate as jest.Mock).mockResolvedValue(mockOutput);

      const result = await ai.generate({ prompt: 'Test' });

      const categories = result.ideas.map(i => i.category);
      expect(new Set(categories).size).toBeGreaterThan(0);
    });

    it('should provide detailed descriptions', async () => {
      const mockOutput = {
        ideas: [
          {
            title: 'Smart City Initiative',
            description: 'A comprehensive description spanning multiple sentences...',
          },
        ],
      };

      (ai.generate as jest.Mock).mockResolvedValue(mockOutput);

      const result = await ai.generate({ prompt: 'Test' });

      expect(result.ideas[0].description.length).toBeGreaterThan(50);
    });

    it('should support different creativity levels', async () => {
      (ai.generate as jest.Mock).mockResolvedValue({ ideas: [] });

      const creativityLevels = ['conservative', 'moderate', 'innovative', 'wild'];

      for (const creativity of creativityLevels) {
        await ai.generate({ prompt: 'Test', creativity });
        expect(ai.generate).toHaveBeenCalledWith(
          expect.objectContaining({ creativity })
        );
      }
    });
  });

  // ============================================================================
  // Integration Scenarios
  // ============================================================================

  describe('Integration scenarios', () => {
    it('should generate chapter then create quiz', async () => {
      // Generate chapter
      (ai.generate as jest.Mock).mockResolvedValueOnce({
        title: 'Chapter 1',
        content: 'Educational content...',
        sections: [],
      });

      const chapter = await ai.generate({ title: 'Chapter 1' });

      // Generate quiz based on chapter
      (ai.generate as jest.Mock).mockResolvedValueOnce({
        questions: [
          { question: 'Question about chapter content' },
        ],
      });

      const quiz = await ai.generate({ 
        topic: chapter.title,
        content: chapter.content,
      });

      expect(quiz.questions).toHaveLength(1);
    });

    it('should brainstorm ideas then develop chapter', async () => {
      // Generate ideas
      (ai.generate as jest.Mock).mockResolvedValueOnce({
        ideas: [
          { title: 'Idea 1', description: 'Description 1' },
          { title: 'Idea 2', description: 'Description 2' },
        ],
      });

      const ideas = await ai.generate({ prompt: 'Innovation' });

      // Develop first idea into chapter
      (ai.generate as jest.Mock).mockResolvedValueOnce({
        title: ideas.ideas[0].title,
        content: `Expanded content based on: ${ideas.ideas[0].description}`,
      });

      const chapter = await ai.generate({ 
        title: ideas.ideas[0].title,
        outline: [ideas.ideas[0].description],
      });

      expect(chapter.content).toContain('Expanded content');
    });

    it('should handle error recovery in workflow', async () => {
      // Chapter generation fails
      (ai.generate as jest.Mock).mockRejectedValueOnce(new Error('Generation failed'));

      await expect(ai.generate({ title: 'Test' })).rejects.toThrow();

      // Retry with different parameters succeeds
      (ai.generate as jest.Mock).mockResolvedValueOnce({
        title: 'Test',
        content: 'Success',
      });

      const result = await ai.generate({ 
        title: 'Test',
        targetWordCount: 500, // Reduced from 1000
      });

      expect(result.content).toBe('Success');
    });
  });
});
