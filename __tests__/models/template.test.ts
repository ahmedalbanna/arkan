import { PresentationTemplate } from '@/lib/models/presentationTemplate';
import { ProposalTemplate } from '@/lib/models/proposalTemplate';
import { ReportTemplate } from '@/lib/models/reportTemplate';
import { Template } from '@/lib/models/template';

describe('Template Models', () => {
    describe('Base Template', () => {
        let template: Template;

        beforeEach(() => {
            template = new Template({
                id: 'test-template',
                name: 'Test Template',
                description: 'A test template',
                category: 'general',
                version: '1.0.0',
                content: 'Template content',
                configuration: {},
            });
        });

        it('should create template with all properties', () => {
            expect(template.id).toBe('test-template');
            expect(template.name).toBe('Test Template');
            expect(template.description).toBe('A test template');
            expect(template.category).toBe('general');
            expect(template.version).toBe('1.0.0');
            expect(template.content).toBe('Template content');
            expect(template.configuration).toEqual({});
        });

        it('should generate default values when not provided', () => {
            const minimalTemplate = new Template({
                name: 'Minimal',
                description: '',
                category: 'general',
                content: '',
                configuration: {},
            });

            expect(minimalTemplate.version).toBe('1.0.0');
            expect(minimalTemplate.createdAt).toBeInstanceOf(Date);
            expect(minimalTemplate.updatedAt).toBeInstanceOf(Date);
        });

        it('should update configurations correctly', () => {
            template.updateConfiguration({ theme: 'dark', language: 'en' });

            expect(template.configuration).toEqual({
                theme: 'dark',
                language: 'en',
            });
        });

        it('should increment version when updated', () => {
            const originalVersion = template.version;
            template.updateConfiguration({ theme: 'light' });

            expect(template.version).toBe('1.0.1');
            expect(template.updatedAt.getTime()).toBeGreaterThan(template.createdAt.getTime());
        });
    });

    describe('Proposal Template', () => {
        let proposalTemplate: ProposalTemplate;

        beforeEach(() => {
            proposalTemplate = new ProposalTemplate({
                name: 'Business Proposal',
                description: 'Professional business proposal template',
                category: 'business',
                content: 'Proposal content',
                prompt: {
                    system: 'Generate professional proposals',
                    user: 'Create a proposal for {{topic}}',
                    context: 'Business context',
                },
                configuration: {},
                isDefault: true,
            });
        });

        it('should create proposal template with prompt', () => {
            expect(proposalTemplate.prompt).toBeDefined();
            expect(proposalTemplate.prompt.system).toBe('Generate professional proposals');
            expect(proposalTemplate.prompt.user).toBe('Create a proposal for(): {{topic}}');
            expect(proposalTemplate.isDefault).toBe(true);
        });

        it('should update prompt correctly', () => {
            const newPrompt = {
                system: 'Updated system prompt',
                user: 'Updated user prompt',
                context: 'Updated context',
            };

            proposalTemplate.updatePrompt(newPrompt);

            expect(proposalTemplate.prompt).toEqual(newPrompt);
        });

        it('should validate prompt structure', () => {
            expect(() => {
                proposalTemplate.updatePrompt({} as any);
            }).toThrow();
        });
    });

    describe('Report Template', () => {
        let reportTemplate: ReportTemplate;

        beforeEach(() => {
            reportTemplate = new ReportTemplate({
                name: 'Technical Report',
                description: 'Technical documentation template',
                category: 'technical',
                content: 'Report content',
                configuration: {},
                sections: ['executive-summary', 'methodology', 'results'],
                primaryAgentId: 'report-agent-1',
                isDefault: false,
            });
        });

        it('should create report template with sections', () => {
            expect(reportTemplate.sections).toEqual(['executive-summary', 'methodology', 'results']);
            expect(reportTemplate.primaryAgentId).toBe('report-agent-1');
            expect(reportTemplate.isDefault).toBe(false);
        });

        it('should add and remove sections', () => {
            reportTemplate.addSection('conclusion');
            expect(reportTemplate.sections).toContain('conclusion');

            reportTemplate.removeSection('methodology');
            expect(reportTemplate.sections).not.toContain('methodology');
        });

        it('should validate section IDs', () => {
            expect(() => {
                reportTemplate.addSection('');
            }).toThrow();

            expect(() => {
                reportTemplate.addSection('invalid-section-id-with-spaces');
            }).toThrow();
        });
    });

    describe('Presentation Template', () => {
        let presentationTemplate: PresentationTemplate;

        beforeEach(() => {
            presentationTemplate = new PresentationTemplate({
                name: 'Business Presentation',
                description: 'Professional presentation template',
                category: 'business',
                content: 'Presentation content',
                configuration: {},
                primaryAgentId: 'presentation-agent-1',
                relevantReportSectionIds: ['summary', 'analysis'],
                isDefault: false,
            });
        });

        it('should create presentation template with agent and sections', () => {
            expect(presentationTemplate.primaryAgentId).toBe('presentation-agent-1');
            expect(presentationTemplate.relevantReportSectionIds).toEqual(['summary', 'analysis']);
        });

        it('should update relevant section IDs', () => {
            const newSections = ['summary', 'analysis', 'recommendations'];
            presentationTemplate.updateRelevantSections(newSections);

            expect(presentationTemplate.relevantReportSectionIds).toEqual(newSections);
        });

        it('should validate section IDs format', () => {
            expect(() => {
                presentationTemplate.updateRelevantSections(['invalid-id_with_spaces']);
            }).toThrow();
        });
    });

    describe('Template Serialization', () => {
        it('should serialize and deserialize templates correctly', () => {
            const template = new Template({
                name: 'Serialization Test',
                description: 'Test serialization',
                category: 'test',
                content: 'Test content',
                configuration: { test: true },
            });

            const json = template.toJSON();
            const recovered = Template.fromJSON(json);

            expect(recovered.name).toBe(template.name);
            expect(recovered.description).toBe(template.description);
            expect(recovered.category).toBe(template.category);
            expect(recovered.configuration).toEqual(template.configuration);
        });

        it('should serialize typed templates correctly', () => {
            const proposalTemplate = new ProposalTemplate({
                name: 'Prop Test',
                description: 'Test proposal',
                category: 'test',
                content: 'Proposal content',
                prompt: {
                    system: 'Test system',
                    user: 'Test user',
                    context: 'Test context',
                },
                configuration: {},
            });

            const json = proposalTemplate.toJSON();

            expect(json.type).toBe('proposal');
            expect(json.prompt).toBeDefined();
        });

        it('should deserialize typed templates correctly', () => {
            const proposalTemplate = new ProposalTemplate({
                name: 'Deser Test',
                description: 'Test deserialization',
                category: 'test',
                content: 'Content',
                prompt: {
                    system: 'Test',
                    user: 'Test',
                    context: 'Test',
                },
                configuration: {},
            });

            const json = proposalTemplate.toJSON();
            const recovered = Template.fromJSON(json);

            expect(recovered).toBeInstanceOf(ProposalTemplate);
            expect((recovered as ProposalTemplate).prompt).toBeDefined();
        });
    });

    describe('Template Validation', () => {
        it('should validate template types', () => {
            expect(() => {
                ProposalTemplate.fromJSON({
                    type: 'invalid-type',
                    name: 'Test',
                    description: '',
                    category: 'test',
                    content: '',
                    configuration: {},
                } as any);
            }).toThrow();
        });

        it('should validate template structure', () => {
            expect(() => {
                new Template({
                    name: '',
                    description: '',
                    category: '',
                    content: '',
                    configuration: {},
                });
            }).toThrow();
        });

        it('should validate configuration schema', () => {
            const template = new Template({
                name: 'Config Test',
                description: 'Test configuration',
                category: 'test',
                content: 'Content',
                configuration: {},
            });

            expect(() => {
                template.updateConfiguration({ invalidConfig: null } as any);
            }).toThrow();
        });
    });
});
