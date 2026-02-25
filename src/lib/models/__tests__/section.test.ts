
import { Section, defaultControls } from '@/lib/types';
import { Project } from '@/lib/types';

describe('Section Model', () => {
  it('should initialize with required properties and defaults', () => {
    const section = new Section({ title: 'Test Section', type: 'report' });

    expect(section.title).toBe('Test Section');
    expect(section.type).toBe('report');
    expect(section.content).toBe('');
    expect(section.prompt).toBe('');
    expect(section.guidelines).toEqual([]);
    expect(section.controls).toEqual(defaultControls);
    expect(section.id).toBeDefined();
  });

  it('should create an immutable copy with updated properties using with()', () => {
    const section = new Section({ title: 'Original', type: 'report' });
    const updatedSection = section.with({ title: 'Updated', content: 'New content' });

    expect(section.title).toBe('Original');
    expect(section.content).toBe('');
    expect(updatedSection.title).toBe('Updated');
    expect(updatedSection.content).toBe('New content');
    expect(updatedSection.id).toBe(section.id);
  });

  describe('buildSystemPrompt', () => {
    it('should generate a basic system prompt', () => {
      const section = new Section({ title: 'Test', type: 'report' });
      const prompt = section.buildSystemPrompt();
      expect(prompt).toContain('You are an advanced AI assistant');
    });

    it('should include persona and behaviors', () => {
      const section = new Section({
        title: 'Test',
        type: 'report',
        behaviors: [
          { name: 'Expert Analyst', type: 'persona' },
          { name: 'Use clear language', type: 'behavior' },
        ],
      });
      const prompt = section.buildSystemPrompt();
      expect(prompt).toContain('**ROLE / PERSONA:**\nAdopt the persona of: Expert Analyst');
      expect(prompt).toContain('**MANDATORY RULES:**\n- Use clear language');
    });

    it('should include rules and guidelines', () => {
        const section = new Section({
            title: 'Test',
            type: 'report',
            rules: ['Rule 1'],
            guidelines: ['Guideline 1']
        });
        const prompt = section.buildSystemPrompt();
        expect(prompt).toContain('**MANDATORY RULES:**\n- Rule 1');
        expect(prompt).toContain('**GUIDELINES (Follow these recommendations):**\n- Guideline 1');
    });
  });

  describe('buildActionPrompt', () => {
    it('should generate a basic action prompt', () => {
      const section = new Section({ title: 'Test', type: 'report', prompt: 'Write about testing.' });
      const prompt = section.buildActionPrompt();
      expect(prompt).toContain('Write about testing.');
      expect(prompt).toContain('The formality should be formal and professional');
    });

    it('should include output style instructions', () => {
        const section = new Section({
            title: 'Test',
            type: 'report',
            prompt: 'Test',
            controls: {
                outputStyle: { ...defaultControls.outputStyle, table: true, code: true },
                programmingLanguage: 'TypeScript',
            }
        });
        const prompt = section.buildActionPrompt();
        expect(prompt).toContain('The output should primarily include the following elements: heading, paragraph, table, code.');
        expect(prompt).toContain('The code blocks should be in TypeScript.');
    });
  });

  describe('Context Handling', () => {
    const project = new Project({
      content: [
        new Section({ id: 'sec-context-1', title: 'Context Section 1', type: 'report', content: 'Content for context 1.' }),
        new Section({ id: 'sec-context-2', title: 'Context Section 2', type: 'report', content: 'Content for context 2.' }),
      ],
      externalContext: [
        { id: 'file-1', fileName: 'data.txt', content: 'External file content.', type: 'context' }
      ]
    });

    it('should get context as a record', () => {
      const section = new Section({
        title: 'Test',
        type: 'report',
        context: { sections: { 'sec-context-1': 'context' } }
      });
      const contextRecord = section.getContextAsRecord(project);
      expect(contextRecord).toEqual({ 'Context Section 1': 'Content for context 1.' });
    });

    it('should get external context as an array', () => {
        const section = new Section({
            title: 'Test',
            type: 'report',
            context: { externalContext: { 'file-1': 'example' } }
        });
        const externalContextArray = section.getExternalContextAsArray(project);
        expect(externalContextArray).toEqual([{
            fileName: 'data.txt',
            content: 'External file content.',
            type: 'example',
        }]);
    });
  });
});
