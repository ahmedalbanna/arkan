/**
 * Template Model Tests
 * 
 * Tests for Template base class
 */

import { Template, BaseTemplateProperties } from '../template';

describe('Template Model', () => {
  // ============================================================================
  // Constructor and Initialization
  // ============================================================================

  describe('Constructor', () => {
    it('should create template with all properties', () => {
      const props: BaseTemplateProperties = {
        id: 'template-123',
        name: 'Test Template',
        description: 'A test template',
        content: { text: 'Template content' },
      };

      const template = new Template(props);

      expect(template.id).toBe('template-123');
      expect(template.name).toBe('Test Template');
      expect(template.description).toBe('A test template');
      expect(template.content).toEqual({ text: 'Template content' });
    });

    it('should create template without content', () => {
      const props: BaseTemplateProperties = {
        id: 'template-123',
        name: 'Test Template',
        description: 'A test template',
      };

      const template = new Template(props);

      expect(template.id).toBe('template-123');
      expect(template.name).toBe('Test Template');
      expect(template.description).toBe('A test template');
      expect(template.content).toBeUndefined();
    });

    it('should handle empty strings', () => {
      const props: BaseTemplateProperties = {
        id: '',
        name: '',
        description: '',
      };

      const template = new Template(props);

      expect(template.id).toBe('');
      expect(template.name).toBe('');
      expect(template.description).toBe('');
    });
  });

  // ============================================================================
  // Content Type Flexibility
  // ============================================================================

  describe('Content type flexibility', () => {
    it('should support string content', () => {
      const template = new Template<string>({
        id: 'temp1',
        name: 'String Template',
        description: 'Template with string content',
        content: 'This is a string',
      });

      expect(template.content).toBe('This is a string');
      expect(typeof template.content).toBe('string');
    });

    it('should support object content', () => {
      interface CustomContent {
        title: string;
        body: string;
        metadata: Record<string, any>;
      }

      const template = new Template<CustomContent>({
        id: 'temp1',
        name: 'Object Template',
        description: 'Template with object content',
        content: {
          title: 'Document Title',
          body: 'Document body',
          metadata: { author: 'John Doe', date: '2024-01-01' },
        },
      });

      expect(template.content?.title).toBe('Document Title');
      expect(template.content?.body).toBe('Document body');
      expect(template.content?.metadata.author).toBe('John Doe');
    });

    it('should support array content', () => {
      const template = new Template<string[]>({
        id: 'temp1',
        name: 'Array Template',
        description: 'Template with array content',
        content: ['Item 1', 'Item 2', 'Item 3'],
      });

      expect(Array.isArray(template.content)).toBe(true);
      expect(template.content).toHaveLength(3);
      expect(template.content?.[0]).toBe('Item 1');
    });

    it('should support number content', () => {
      const template = new Template<number>({
        id: 'temp1',
        name: 'Number Template',
        description: 'Template with number content',
        content: 42,
      });

      expect(template.content).toBe(42);
      expect(typeof template.content).toBe('number');
    });

    it('should support boolean content', () => {
      const template = new Template<boolean>({
        id: 'temp1',
        name: 'Boolean Template',
        description: 'Template with boolean content',
        content: true,
      });

      expect(template.content).toBe(true);
      expect(typeof template.content).toBe('boolean');
    });

    it('should support null content', () => {
      const template = new Template<null>({
        id: 'temp1',
        name: 'Null Template',
        description: 'Template with null content',
        content: null,
      });

      expect(template.content).toBeNull();
    });

    it('should support complex nested content', () => {
      interface NestedContent {
        sections: Array<{
          title: string;
          subsections: Array<{
            name: string;
            content: string;
          }>;
        }>;
      }

      const template = new Template<NestedContent>({
        id: 'temp1',
        name: 'Nested Template',
        description: 'Template with nested content',
        content: {
          sections: [
            {
              title: 'Section 1',
              subsections: [
                { name: 'Sub 1.1', content: 'Content 1.1' },
                { name: 'Sub 1.2', content: 'Content 1.2' },
              ],
            },
          ],
        },
      });

      expect(template.content?.sections).toHaveLength(1);
      expect(template.content?.sections[0].subsections).toHaveLength(2);
    });
  });

  // ============================================================================
  // Property Access
  // ============================================================================

  describe('Property access', () => {
    it('should allow reading all properties', () => {
      const template = new Template({
        id: 'temp1',
        name: 'Test',
        description: 'Description',
        content: 'Content',
      });

      expect(template.id).toBe('temp1');
      expect(template.name).toBe('Test');
      expect(template.description).toBe('Description');
      expect(template.content).toBe('Content');
    });

    it('should be public properties', () => {
      const template = new Template({
        id: 'temp1',
        name: 'Test',
        description: 'Description',
      });

      // These should be accessible without errors
      const id = template.id;
      const name = template.name;
      const description = template.description;
      const content = template.content;

      expect(id).toBeDefined();
      expect(name).toBeDefined();
      expect(description).toBeDefined();
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe('Edge Cases', () => {
    it('should handle very long ID', () => {
      const longId = 'template-' + 'a'.repeat(1000);
      const template = new Template({
        id: longId,
        name: 'Test',
        description: 'Test',
      });

      expect(template.id.length).toBe(1009);
    });

    it('should handle very long name', () => {
      const longName = 'Template Name ' + 'Long '.repeat(500);
      const template = new Template({
        id: 'temp1',
        name: longName,
        description: 'Test',
      });

      expect(template.name.length).toBeGreaterThan(1000);
    });

    it('should handle very long description', () => {
      const longDesc = 'Description: ' + 'Lorem ipsum '.repeat(1000);
      const template = new Template({
        id: 'temp1',
        name: 'Test',
        description: longDesc,
      });

      expect(template.description.length).toBeGreaterThan(1000);
    });

    it('should handle Unicode characters', () => {
      const template = new Template({
        id: 'temp-中文-العربية',
        name: '模板名称 Template Название',
        description: 'Description 描述 وصف 🚀',
        content: { text: '内容 محتوى Content' },
      });

      expect(template.id).toContain('中文');
      expect(template.name).toContain('模板名称');
      expect(template.description).toContain('🚀');
    });

    it('should handle special characters in properties', () => {
      const template = new Template({
        id: 'temp-123!@#$%',
        name: 'Template <Name> & "Quotes"',
        description: "Description with 'single' and \"double\" quotes",
      });

      expect(template.id).toBe('temp-123!@#$%');
      expect(template.name).toBe('Template <Name> & "Quotes"');
      expect(template.description).toContain("'single'");
    });

    it('should handle whitespace in properties', () => {
      const template = new Template({
        id: '  temp1  ',
        name: '  Template Name  ',
        description: '  Description  ',
      });

      expect(template.id).toBe('  temp1  ');
      expect(template.name).toBe('  Template Name  ');
      expect(template.description).toBe('  Description  ');
    });

    it('should handle undefined content correctly', () => {
      const template = new Template({
        id: 'temp1',
        name: 'Test',
        description: 'Test',
        content: undefined,
      });

      expect(template.content).toBeUndefined();
    });

    it('should handle large content objects', () => {
      const largeContent = {
        data: Array.from({ length: 1000 }, (_, i) => ({
          id: `item-${i}`,
          value: `Value ${i}`,
        })),
      };

      const template = new Template({
        id: 'temp1',
        name: 'Large Template',
        description: 'Template with large content',
        content: largeContent,
      });

      expect(template.content?.data).toHaveLength(1000);
    });
  });

  // ============================================================================
  // Type Safety
  // ============================================================================

  describe('Type safety', () => {
    it('should enforce content type in TypeScript', () => {
      interface StrictContent {
        requiredField: string;
        optionalField?: number;
      }

      const template = new Template<StrictContent>({
        id: 'temp1',
        name: 'Strict Template',
        description: 'Template with strict content type',
        content: {
          requiredField: 'Required',
          optionalField: 42,
        },
      });

      expect(template.content?.requiredField).toBe('Required');
      expect(template.content?.optionalField).toBe(42);
    });

    it('should work with union types', () => {
      type UnionContent = string | number | { custom: string };

      const template1 = new Template<UnionContent>({
        id: 'temp1',
        name: 'Union Template 1',
        description: 'String content',
        content: 'String value',
      });

      const template2 = new Template<UnionContent>({
        id: 'temp2',
        name: 'Union Template 2',
        description: 'Number content',
        content: 123,
      });

      const template3 = new Template<UnionContent>({
        id: 'temp3',
        name: 'Union Template 3',
        description: 'Object content',
        content: { custom: 'Custom value' },
      });

      expect(typeof template1.content).toBe('string');
      expect(typeof template2.content).toBe('number');
      expect(typeof template3.content).toBe('object');
    });
  });

  // ============================================================================
  // Real-world Use Cases
  // ============================================================================

  describe('Real-world use cases', () => {
    it('should work as document template', () => {
      interface DocumentTemplate {
        title: string;
        sections: Array<{
          heading: string;
          paragraphs: string[];
        }>;
        footer: string;
      }

      const template = new Template<DocumentTemplate>({
        id: 'doc-template-1',
        name: 'Standard Document Template',
        description: 'Template for standard documents',
        content: {
          title: '{{documentTitle}}',
          sections: [
            {
              heading: 'Introduction',
              paragraphs: ['{{introduction}}'],
            },
            {
              heading: 'Main Content',
              paragraphs: ['{{content}}'],
            },
          ],
          footer: '{{footer}}',
        },
      });

      expect(template.content?.sections).toHaveLength(2);
      expect(template.content?.title).toBe('{{documentTitle}}');
    });

    it('should work as email template', () => {
      interface EmailTemplate {
        subject: string;
        body: string;
        signature: string;
        variables: string[];
      }

      const template = new Template<EmailTemplate>({
        id: 'email-template-1',
        name: 'Welcome Email',
        description: 'Template for welcome emails',
        content: {
          subject: 'Welcome to {{companyName}}!',
          body: 'Dear {{userName}},\n\nWelcome to our platform...',
          signature: 'Best regards,\n{{senderName}}',
          variables: ['companyName', 'userName', 'senderName'],
        },
      });

      expect(template.content?.variables).toContain('userName');
      expect(template.content?.body).toContain('{{userName}}');
    });

    it('should work as form template', () => {
      interface FormTemplate {
        fields: Array<{
          name: string;
          type: 'text' | 'number' | 'email';
          required: boolean;
          placeholder?: string;
        }>;
        submitLabel: string;
      }

      const template = new Template<FormTemplate>({
        id: 'form-template-1',
        name: 'Contact Form',
        description: 'Template for contact forms',
        content: {
          fields: [
            { name: 'name', type: 'text', required: true, placeholder: 'Your name' },
            { name: 'email', type: 'email', required: true, placeholder: 'Your email' },
            { name: 'message', type: 'text', required: true },
          ],
          submitLabel: 'Send Message',
        },
      });

      expect(template.content?.fields).toHaveLength(3);
      expect(template.content?.fields[0].required).toBe(true);
    });

    it('should work as report template', () => {
      interface ReportTemplate {
        coverPage: {
          title: string;
          subtitle?: string;
          author: string;
          date: string;
        };
        chapters: Array<{
          title: string;
          sections: string[];
        }>;
        references: boolean;
      }

      const template = new Template<ReportTemplate>({
        id: 'report-template-1',
        name: 'Academic Report',
        description: 'Template for academic reports',
        content: {
          coverPage: {
            title: '{{reportTitle}}',
            subtitle: '{{reportSubtitle}}',
            author: '{{authorName}}',
            date: '{{date}}',
          },
          chapters: [
            { title: 'Introduction', sections: ['background', 'objectives'] },
            { title: 'Methodology', sections: ['approach', 'tools'] },
            { title: 'Results', sections: ['findings', 'analysis'] },
          ],
          references: true,
        },
      });

      expect(template.content?.chapters).toHaveLength(3);
      expect(template.content?.references).toBe(true);
    });
  });
});
