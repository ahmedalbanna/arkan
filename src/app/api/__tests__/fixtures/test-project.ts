/**
 * Test Project Fixtures
 * 
 * Provides mock project and section data for testing document generation workflows
 */

export const testProjectData = {
  title: 'Test Project',
  description: 'A test project for integration testing',
  userId: 'test-user-123',
  language: 'en' as const,
  complexity: 3,
  formality: 2,
  tone: 'professional' as const,
};

export const testProjectWithSections = {
  ...testProjectData,
  id: 'test-project-123',
  sections: [
    {
      id: 'section-1',
      title: 'Introduction',
      content: 'This is the introduction section.',
      order: 0,
    },
    {
      id: 'section-2',
      title: 'Main Content',
      content: 'This is the main content section.',
      order: 1,
    },
    {
      id: 'section-3',
      title: 'Conclusion',
      content: 'This is the conclusion section.',
      order: 2,
    },
  ],
};

export const testSectionData = {
  title: 'Test Section',
  prompt: 'Write a comprehensive section about {topic}',
  guidelines: ['Be detailed', 'Use formal language'],
  order: 0,
};

export const testGenerationRequest = {
  projectId: 'test-project-123',
  sectionId: 'section-1',
  prompt: 'Write an introduction about artificial intelligence',
  model: 'gemma:2b',
  temperature: 0.7,
  maxTokens: 1000,
};

export const testGenerationResponse = {
  success: true,
  sectionId: 'section-1',
  content: 'Artificial intelligence (AI) is a rapidly evolving field...',
  tokensUsed: 150,
  creditsUsed: 1.5,
  generatedAt: new Date().toISOString(),
};

export const testProjectMetadata = {
  id: 'test-project-123',
  userId: 'test-user-123',
  title: 'Test Project',
  description: 'A test project',
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date('2024-01-02').toISOString(),
  language: 'en',
  status: 'draft' as const,
  sectionCount: 3,
  totalWords: 500,
};

export const testMultilangProject = {
  ...testProjectData,
  language: 'ar' as const,
  title: 'مشروع اختبار',
  description: 'مشروع اختبار للعمليات التكاملية',
};

export const createMockProject = (overrides = {}) => ({
  ...testProjectWithSections,
  ...overrides,
});

export const createMockSection = (overrides = {}) => ({
  ...testSectionData,
  ...overrides,
});

export const createMockGenerationResponse = (content: string, tokensUsed = 150) => ({
  ...testGenerationResponse,
  content,
  tokensUsed,
  creditsUsed: tokensUsed * 0.01,
});

export const testProjectUpdateData = {
  title: 'Updated Project Title',
  description: 'Updated description',
  language: 'ar' as const,
};

export const testBulkSectionData = [
  { title: 'Chapter 1', order: 0 },
  { title: 'Chapter 2', order: 1 },
  { title: 'Chapter 3', order: 2 },
  { title: 'Chapter 4', order: 3 },
  { title: 'Chapter 5', order: 4 },
];
