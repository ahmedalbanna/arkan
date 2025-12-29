import { defaultControls } from '@/lib/models';
import type { ReportTemplateProperties } from '@/lib/types';

export const defaultReportTemplates: ReportTemplateProperties[] = [
    {
        id: 'technical-report',
        name: 'Comprehensive Technical Report',
        description: 'A full-fledged report template including all standard technical sections from abstract to appendices.',
        isDefault: true,
        chapters: [
            {
                id: 'ch-front-matter',
                title: 'Front Matter',
                sections: [
                    {
                        id: 'abstract',
                        title: 'Abstract',
                        type: 'report',
                        content: '[Provide a concise summary of the project\'s objectives, methodology, key findings, and conclusions. This should be a self-contained overview of the entire report.]',
                        prompt: "Based on the provided context, write a concise and informative abstract for a training report. The abstract should summarize the purpose, methods, key experiences, and major conclusions of the training period.",
                        behaviors: [{ name: 'academic writer', type: 'persona' }],
                        guidelines: ["Keep the abstract to a single paragraph and under 250 words.", "Clearly state the main objectives of the training.", "Briefly mention the key areas of the training program and technical skills acquired.", "Conclude with the most significant outcomes and recommendations."],
                        controls: { ...defaultControls, formality: 80, tone: 'academic' },
                        context: { sections: {}, externalContext: {} }
                    },
                    {
                        id: 'acknowledgment',
                        title: 'Acknowledgment',
                        type: 'report',
                        content: '[Thank individuals, supervisors, and organizations that supported the project. Be specific about their contributions.]',
                        prompt: "Based on the provided context, draft a heartfelt and professional 'Acknowledgment' section. Thank the individuals, supervisors, and organizations that supported the training or research.",
                        behaviors: [{ name: 'professional writer', type: 'persona' }],
                        guidelines: ["Maintain a formal and appreciative tone.", "Mention specific roles like supervisors, team members, or company departments if context is available.", "Acknowledge the training institution or company by name."],
                        controls: { ...defaultControls, formality: 90, tone: 'formal' },
                        context: { sections: {}, externalContext: {} }
                    }
                ]
            },
            {
                id: 'ch-main-body',
                title: 'Main Body',
                sections: [
                    {
                        id: 'introduction',
                        title: 'Introduction',
                        type: 'report',
                        content: '[State the project\'s purpose, define the problem, and outline the report structure. This section sets the stage for the rest of the document.]',
                        prompt: "Based on the provided context, write a complete and professional introduction section for a formal report. Synthesize information to create a coherent and engaging introduction.",
                        behaviors: [{ name: 'expert technical writer specializing in project proposals', type: 'persona' }],
                        guidelines: ["Clearly state the purpose of the project.", "Define the problem the project addresses.", "Outline the report structure."],
                        controls: { ...defaultControls, formality: 75, complexity: 60, tone: 'professional', wordCount: "300" },
                        context: { sections: {}, externalContext: {} }
                    },
                    {
                        id: 'literature-review',
                        title: 'Literature Review',
                        type: 'report',
                        content: '[Review existing academic and technical literature relevant to the project. Identify key findings, trends, and research gaps.]',
                        prompt: "Write a comprehensive 'Literature Review' section for the final report. Synthesize information from the entire proposal and the provided context to create a coherent and well-supported literature review.",
                        behaviors: [{ name: 'academic and technical writer', type: 'persona' }],
                        guidelines: ["Review and analyze academic literature.", "Describe relevant technological advancements.", "Identify key findings, trends, and research gaps."],
                        controls: { ...defaultControls, formality: 90, complexity: 80, tone: 'academic', wordCount: "1000" },
                        context: { sections: {}, externalContext: {} }
                    },
                    {
                        id: 'system-analysis',
                        title: 'System Analysis',
                        type: 'report',
                        content: '[Detail the functional, non-functional, data, and user requirements. Analyze stakeholder needs and the problems with existing systems.]',
                        prompt: "Write a thorough 'System Analysis' section, detailing functional and non-functional requirements.",
                        behaviors: [{ name: 'expert systems analyst', type: 'persona' }],
                        guidelines: ["Detail functional and data requirements.", "Describe non-functional requirements (performance, security, usability).", "Analyze stakeholder needs and problem scope."],
                        controls: { ...defaultControls, formality: 70, complexity: 75, tone: 'technical' },
                        context: { sections: {}, externalContext: {} }
                    },
                    {
                        id: 'system-design',
                        title: 'System Design',
                        type: 'report',
                        content: '[Describe the high-level architecture, data models, component breakdown, and technology stack for the proposed system.]',
                        prompt: "Create a comprehensive 'System Design' section, including architecture, data models, and technology stack.",
                        behaviors: [{ name: 'principal software architect', type: 'persona' }],
                        guidelines: ["Describe the high-level architecture.", "Outline the data model/schema.", "Propose and justify a technology stack."],
                        controls: { ...defaultControls, formality: 70, complexity: 85, tone: 'technical' },
                        context: { sections: {}, externalContext: {} }
                    }
                ]
            },
            {
                id: 'ch-conclusion',
                title: 'Conclusion & Appendices',
                sections: [
                    {
                        id: 'conclusion',
                        title: 'Conclusion',
                        type: 'report',
                        content: '[Summarize the key points of the report, reiterate the main findings, and provide a strong concluding statement.]',
                        prompt: "Write a concise and impactful 'Conclusion' section for the report.",
                        behaviors: [{ name: 'expert technical writer', type: 'persona' }],
                        guidelines: ["Summarize key points and outcomes.", "Provide a forward-looking statement.", "Craft a strong, conclusive final statement."],
                        controls: { ...defaultControls, formality: 80, wordCount: "250" },
                        context: { sections: { 'introduction': 'context', 'system-analysis': 'context' }, externalContext: {} }
                    },
                    {
                        id: 'recommendations',
                        title: 'Recommendations',
                        type: 'report',
                        content: '[Provide a set of clear, actionable recommendations based on the findings of the report.]',
                        prompt: "Provide a set of actionable recommendations based on the report's findings.",
                        behaviors: [{ name: 'strategic analyst', type: 'persona' }],
                        guidelines: ["Structure as a numbered list.", "Ensure each recommendation is specific and relevant.", "Provide justification for each point."],
                        controls: { ...defaultControls, formality: 75 },
                        context: { sections: { 'conclusion': 'context' }, externalContext: {} }
                    },
                    {
                        id: 'references',
                        title: 'References',
                        type: 'report',
                        content: '[List all sources cited throughout the report in a consistent format (e.g., APA, MLA).]',
                        prompt: "Generate a 'References' section, listing all sources mentioned in the report.",
                        behaviors: [{ name: 'academic librarian', type: 'persona' }],
                        guidelines: ["Format all citations consistently using APA style.", "Ensure the list is alphabetically sorted."],
                        controls: { ...defaultControls, formality: 100, tone: 'academic' },
                        context: { sections: {}, externalContext: {} }
                    },
                    {
                        id: 'appendices',
                        title: 'Appendices',
                        type: 'report',
                        content: '[Include supplementary materials such as detailed data, code snippets, or user survey results.]',
                        prompt: "Compile supplementary materials like code snippets or large data tables into an 'Appendices' section.",
                        behaviors: [{ name: 'technical editor', type: 'persona' }],
                        guidelines: ["Label each appendix clearly (e.g., 'Appendix A: Source Code')."],
                        controls: { ...defaultControls },
                        context: { sections: {}, externalContext: {} }
                    }
                ]
            }
        ]
    },
    {
        id: 'simple-business-report',
        name: 'Simple Business Report',
        description: 'A concise report structure focused on analysis, conclusions, and key recommendations for business stakeholders.',
        chapters: [
            {
                id: 'ch-summary',
                title: 'Executive Summary & Recommendations',
                sections: [
                    {
                        id: 'introduction',
                        title: 'Introduction',
                        type: 'report',
                        content: '[Briefly state the report\'s purpose and the key problem or question it addresses.]',
                        prompt: "Write a brief introduction that states the report's purpose and the key problem being addressed.",
                        controls: { ...defaultControls, formality: 70, tone: 'professional', wordCount: "150" },
                        context: { sections: {}, externalContext: {} }
                    },
                    {
                        id: 'system-analysis',
                        title: 'Key Analysis',
                        type: 'report',
                        content: '[Summarize the most important findings and data from your analysis, focusing on insights that are relevant to business decisions.]',
                        prompt: "Summarize the most critical findings from the system analysis, focusing on business impact.",
                        controls: { ...defaultControls, formality: 70, complexity: 50 },
                        context: { sections: {}, externalContext: {} }
                    },
                    {
                        id: 'conclusion',
                        title: 'Conclusion',
                        type: 'report',
                        content: '[Provide a short, direct conclusion that summarizes the main takeaways for a business audience.]',
                        prompt: "Write a short conclusion that summarizes the main takeaways for a business audience.",
                        controls: { ...defaultControls, formality: 70, wordCount: "150" },
                        context: { sections: { 'introduction': 'context', 'system-analysis': 'context' }, externalContext: {} }
                    },
                    {
                        id: 'recommendations',
                        title: 'Recommendations',
                        type: 'report',
                        content: '[List 3-5 clear, actionable recommendations based on the analysis. Each recommendation should be direct and targeted.]',
                        prompt: "Provide 3-5 clear, actionable recommendations based on the analysis.",
                        controls: { ...defaultControls, formality: 75 },
                        context: { sections: { 'system-analysis': 'context', 'conclusion': 'context' }, externalContext: {} }
                    }
                ]
            }
        ]
    },
    {
        id: 'graduation-project',
        name: 'Graduation Project',
        description: 'A standard template for university final year or graduation projects.',
        chapters: [
            { id: 'ch-grad-front', title: 'Front Matter', sections: [ { id: 'abstract', title: 'Abstract', type: 'report' }, { id: 'acknowledgment', title: 'Acknowledgment', type: 'report' } ] },
            { id: 'ch-grad-intro', title: 'Chapter 1: Introduction', sections: [ { id: 'introduction', title: 'Introduction', type: 'report' }, { id: 'problem-statement', title: 'Problem Statement', type: 'report' }, { id: 'project-objectives', title: 'Project Objectives', type: 'report' }, { id: 'project-scope', title: 'Project Scope', type: 'report' } ] },
            { id: 'ch-grad-lit-review', title: 'Chapter 2: Literature Review', sections: [ { id: 'literature-review', title: 'Literature Review', type: 'report' } ] },
            { id: 'ch-grad-methodology', title: 'Chapter 3: Methodology & Design', sections: [ { id: 'system-analysis', title: 'System Analysis', type: 'report' }, { id: 'system-design', title: 'System Design', type: 'report' } ] },
            { id: 'ch-grad-implementation', title: 'Chapter 4: Implementation & Testing', sections: [ { id: 'system-programming', title: 'Implementation Details', type: 'report' }, { id: 'system-testing', title: 'System Testing', type: 'report' } ] },
            { id: 'ch-grad-results', title: 'Chapter 5: Results & Discussion', sections: [ { id: 'results', title: 'Results', type: 'report' }, { id: 'discussion', title: 'Discussion', type: 'report' } ] },
            { id: 'ch-grad-conclusion', title: 'Chapter 6: Conclusion & Future Work', sections: [ { id: 'conclusion', title: 'Conclusion', type: 'report' }, { id: 'future-work', title: 'Future Work', type: 'report' } ] },
            { id: 'ch-grad-back-matter', title: 'Back Matter', sections: [ { id: 'references', title: 'References', type: 'report' }, { id: 'appendices', title: 'Appendices', type: 'report' } ] }
        ]
    },
    {
        id: 'research-paper',
        name: 'Research Paper',
        description: 'A template following the standard IMRaD structure for academic research papers.',
        chapters: [
            { id: 'ch-rp-front', title: 'Front Matter', sections: [ { id: 'abstract', title: 'Abstract', type: 'report' } ] },
            { id: 'ch-rp-intro', title: 'Introduction', sections: [ { id: 'introduction', title: 'Introduction', type: 'report' } ] },
            { id: 'ch-rp-methods', title: 'Methods', sections: [ { id: 'methodology', title: 'Methodology', type: 'report' } ] },
            { id: 'ch-rp-results', title: 'Results', sections: [ { id: 'results', title: 'Results', type: 'report' } ] },
            { id: 'ch-rp-discussion', title: 'Discussion', sections: [ { id: 'discussion', title: 'Discussion', type: 'report' }, { id: 'conclusion', title: 'Conclusion', type: 'report' } ] },
            { id: 'ch-rp-back', title: 'Back Matter', sections: [ { id: 'acknowledgment', title: 'Acknowledgments', type: 'report' }, { id: 'references', title: 'References', type: 'report' } ] }
        ]
    },
    {
        id: 'business-proposal',
        name: 'Business Proposal',
        description: 'A persuasive template designed for pitching a new product, service, or project to clients or stakeholders.',
        chapters: [
            { id: 'ch-bp-intro', title: 'Introduction', sections: [ { id: 'executive-summary', title: 'Executive Summary', type: 'report' }, { id: 'problem-statement', title: 'Problem Statement', type: 'report' } ] },
            { id: 'ch-bp-solution', title: 'Proposed Solution', sections: [ { id: 'solution-overview', title: 'Solution Overview', type: 'report' }, { id: 'deliverables', title: 'Deliverables', type: 'report' }, { id: 'timeline', title: 'Timeline & Milestones', type: 'report' } ] },
            { id: 'ch-bp-pricing', title: 'Pricing & Terms', sections: [ { id: 'pricing-structure', title: 'Pricing Structure', type: 'report' }, { id: 'terms-conditions', title: 'Terms & Conditions', type: 'report' } ] },
            { id: 'ch-bp-about', title: 'About Us', sections: [ { id: 'company-overview', title: 'Company Overview', type: 'report' }, { id: 'case-studies', title: 'Case Studies / Testimonials', type: 'report' } ] },
            { id: 'ch-bp-conclusion', title: 'Conclusion', sections: [ { id: 'call-to-action', title: 'Next Steps & Call to Action', type: 'report' } ] }
        ]
    },
    {
        id: 'software-documentation',
        name: 'Software Documentation',
        description: 'A comprehensive template for creating user manuals or technical documentation for a software product.',
        chapters: [
            { id: 'ch-sd-getting-started', title: 'Getting Started', sections: [ { id: 'introduction', title: 'Introduction', type: 'report' }, { id: 'installation-guide', title: 'Installation Guide', type: 'report' }, { id: 'quick-start-tutorial', title: 'Quick Start Tutorial', type: 'report' } ] },
            { id: 'ch-sd-core-features', title: 'Core Features', sections: [ { id: 'feature-one', title: 'Feature A: Description & Usage', type: 'report' }, { id: 'feature-two', title: 'Feature B: Description & Usage', type: 'report' } ] },
            { id: 'ch-sd-api-reference', title: 'API Reference', sections: [ { id: 'authentication-api', title: 'Authentication API', type: 'report' }, { id: 'endpoints-reference', title: 'Endpoints Reference', type: 'report' } ] },
            { id: 'ch-sd-troubleshooting', title: 'Troubleshooting', sections: [ { id: 'faq', title: 'Frequently Asked Questions (FAQ)', type: 'report' }, { id: 'error-codes', title: 'Error Codes Guide', type: 'report' } ] },
            { id: 'ch-sd-support', title: 'Support', sections: [ { id: 'contact-support', title: 'Contacting Support', type: 'report' } ] }
        ]
    }
];
