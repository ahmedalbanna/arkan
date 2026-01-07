/**
 * @fileOverview Tests for Graduation Project Generator
 */

import { describe, it, expect } from '@jest/globals';

describe('Graduation Project Generator', () => {
  it('should have all required schemas', () => {
    // Test that schemas are properly exported
    const { 
      GraduationProjectInputSchema, 
      GraduationProjectDocumentationSchema 
    } = require('@/ai/schemas/graduation-project');
    
    expect(GraduationProjectInputSchema).toBeDefined();
    expect(GraduationProjectDocumentationSchema).toBeDefined();
  });

  it('should have all chapter prompts', () => {
    const prompts = require('@/ai/prompts/graduation-project');
    
    expect(prompts.abstractPrompt).toBeDefined();
    expect(prompts.introductionPrompt).toBeDefined();
    expect(prompts.literatureReviewPrompt).toBeDefined();
    expect(prompts.methodologyPrompt).toBeDefined();
    expect(prompts.systemAnalysisPrompt).toBeDefined();
    expect(prompts.systemDesignPrompt).toBeDefined();
    expect(prompts.implementationPrompt).toBeDefined();
    expect(prompts.testingPrompt).toBeDefined();
    expect(prompts.resultsPrompt).toBeDefined();
    expect(prompts.discussionPrompt).toBeDefined();
    expect(prompts.conclusionPrompt).toBeDefined();
    expect(prompts.recommendationsPrompt).toBeDefined();
  });

  it('should export graduation project flow', () => {
    const { graduationProjectGenerator } = require('@/ai/flows');
    
    expect(graduationProjectGenerator).toBeDefined();
    expect(graduationProjectGenerator.name).toBe('graduationProjectGenerator');
  });

  it('should validate input schema with all required fields', () => {
    const { GraduationProjectInputSchema } = require('@/ai/schemas/graduation-project');
    
    const validInput = {
      title: 'AI-Powered Learning Platform',
      studentName: 'John Doe',
      studentId: '12345',
      supervisorName: 'Dr. Smith',
      department: 'Computer Science',
      university: 'Test University',
      degree: 'bachelor',
      academicYear: '2023-2024',
      submissionDate: '2024-06-01',
      projectType: 'web_application',
      methodology: 'agile',
      projectDescription: 'An AI-powered platform for learning',
      problemStatement: 'Students need better learning tools',
      objectives: ['Develop AI features', 'Create user-friendly interface'],
      programmingLanguages: ['JavaScript', 'Python'],
      frameworks: ['React', 'FastAPI'],
      tools: ['VS Code', 'Git'],
      functionalRequirements: ['User authentication', 'Course management'],
      keyFeatures: ['AI recommendations', 'Interactive learning'],
      keywords: ['AI', 'Education', 'Machine Learning'],
      detailLevel: 'standard',
      includeArabic: false,
      citationStyle: 'IEEE',
    };

    const result = GraduationProjectInputSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });
});
